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
    
    // Judge0 CE language IDs
    const languageMap = {
      'python': { id: 71 },
      'java': { id: 62 },
      'javascript': { id: 63 },
      'cpp': { id: 54 },
    };

    const runConfig = languageMap[language] || languageMap['python'];

    let finalContent = content;
    if (language === 'java') {
      // Judge0 saves as Main.java, so any public class must be named Main
      finalContent = finalContent.replace(/public\s+class\s+[A-Za-z0-9_]+/g, 'public class Main');
    }

    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id: runConfig.id,
        source_code: finalContent,
        stdin: stdin || '',
      })
    });

    const data = await response.json();
    
    // Map Judge0 output back to what the frontend expects
    res.json({
      run: {
        output: data.stdout || '',
        stderr: data.stderr || ''
      },
      compile: {
        stderr: data.compile_output || ''
      }
    });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ message: 'Failed to execute code' });
  }
};
