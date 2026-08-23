const { Project, CodeFile, CodeVersion } = require('../../models');

// GET /api/coding/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/coding/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      userId: req.user._id,
      name,
      description,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/coding/projects/:projectId/files
exports.getFiles = async (req, res) => {
  try {
    const files = await CodeFile.find({
      projectId: req.params.projectId,
      userId: req.user._id,
    }).sort({ updatedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/coding/files
exports.createFile = async (req, res) => {
  try {
    const { projectId, name, language, content, type, folderPath } = req.body;
    const file = new CodeFile({
      projectId,
      userId: req.user._id,
      name,
      type: type || 'file',
      folderPath: folderPath || '/',
      language: language || (type === 'folder' ? 'none' : 'java'),
      content: content || '',
    });
    await file.save();
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/coding/files/:id
exports.getFile = async (req, res) => {
  try {
    const file = await CodeFile.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/coding/files/:id (Auto-save or Rename)
exports.updateFile = async (req, res) => {
  try {
    const { content, name } = req.body;
    const updateData = { lastSavedAt: Date.now() };
    if (content !== undefined) updateData.content = content;
    if (name !== undefined) updateData.name = name;

    const file = await CodeFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Optional: save to CodeVersion periodically or on every Nth save
    // For now we'll save a version if the last version was more than 5 minutes ago
    const lastVersion = await CodeVersion.findOne({ fileId: file._id }).sort({ savedAt: -1 });
    if (!lastVersion || Date.now() - new Date(lastVersion.savedAt).getTime() > 5 * 60 * 1000) {
      await CodeVersion.create({
        fileId: file._id,
        content: file.content,
      });
    }

    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/coding/files/:id
exports.deleteFile = async (req, res) => {
  try {
    const file = await CodeFile.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.type === 'folder') {
      const folderPathPrefix = file.folderPath === '/' ? `/${file.name}` : `${file.folderPath}/${file.name}`;
      // Find all files inside this folder (and subfolders)
      const children = await CodeFile.find({ 
        userId: req.user._id, 
        projectId: file.projectId,
        folderPath: new RegExp(`^${folderPathPrefix}(/|$)`)
      });
      
      const childIds = children.map(c => c._id);
      await CodeFile.deleteMany({ _id: { $in: childIds } });
      await CodeVersion.deleteMany({ fileId: { $in: childIds } });
    }

    await CodeFile.findByIdAndDelete(file._id);
    await CodeVersion.deleteMany({ fileId: file._id });
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/coding/execute
exports.executeCode = async (req, res) => {
  try {
    const { language, fileName, content, stdin } = req.body;

    const pistonLangMap = {
      'java': { lang: 'java', version: '15.0.2', file: 'Main.java' },
      'python': { lang: 'python', version: '3.10.0', file: 'main.py' },
      'javascript': { lang: 'javascript', version: '18.15.0', file: 'index.js' },
      'typescript': { lang: 'typescript', version: '5.0.3', file: 'index.ts' },
      'cpp': { lang: 'c++', version: '10.2.0', file: 'main.cpp' },
      'c': { lang: 'c', version: '10.2.0', file: 'main.c' },
      'go': { lang: 'go', version: '1.16.2', file: 'main.go' },
      'rust': { lang: 'rust', version: '1.68.2', file: 'main.rs' },
    };

    let targetLang = (language || 'javascript').toLowerCase();
    if (targetLang === 'js') targetLang = 'javascript';
    if (targetLang === 'py') targetLang = 'python';
    if (targetLang === 'c++') targetLang = 'cpp';

    const pConfig = pistonLangMap[targetLang] || pistonLangMap['javascript'];

    let sourceCode = content || '';
    if (targetLang === 'java' && !sourceCode.includes('class Main')) {
      sourceCode = sourceCode.replace(/public\s+class\s+[A-Za-z0-9_]+/g, 'public class Main');
    }

    const startMs = Date.now();

    // 1. Try Piston API (fast & supports all requested languages)
    try {
      const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: pConfig.lang,
          version: pConfig.version,
          files: [{ name: fileName || pConfig.file, content: sourceCode }],
          stdin: stdin || '',
        }),
      });

      if (pistonRes.ok) {
        const pData = await pistonRes.json();
        const execTime = `${Date.now() - startMs}ms`;
        const stdout = pData.run?.stdout || (pData.run?.code === 0 && !pData.run?.stderr ? pData.run?.output : '');
        const stderr = pData.run?.stderr || pData.compile?.stderr || (pData.run?.code !== 0 ? pData.run?.output : '');

        return res.json({
          run: {
            output: stdout || pData.run?.output || '',
            stdout: stdout || '',
            stderr: stderr || '',
            code: pData.run?.code ?? 0,
            execTime,
          },
          compile: {
            stderr: pData.compile?.stderr || pData.compile?.output || '',
          },
        });
      }
    } catch (pistonErr) {
      console.warn('[Piston API fallback]', pistonErr.message);
    }

    // 2. Fallback to Judge0 CE
    const judge0Map = {
      'python': 71,
      'java': 62,
      'javascript': 63,
      'cpp': 54,
      'c': 50,
      'go': 60,
      'rust': 73,
    };

    const judge0Id = judge0Map[targetLang] || 63;
    const j0Res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: judge0Id,
        source_code: sourceCode,
        stdin: stdin || '',
      }),
    });

    const j0Data = await j0Res.json();
    const execTime = `${Date.now() - startMs}ms`;

    return res.json({
      run: {
        output: j0Data.stdout || j0Data.stderr || '',
        stdout: j0Data.stdout || '',
        stderr: j0Data.stderr || '',
        code: j0Data.status?.id === 3 ? 0 : 1,
        execTime,
      },
      compile: {
        stderr: j0Data.compile_output || '',
      },
    });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ message: 'Failed to execute code', error: err.message });
  }
};
