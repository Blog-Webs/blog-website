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
    const { projectId, name, language, content } = req.body;
    const file = new CodeFile({
      projectId,
      userId: req.user._id,
      name,
      language: language || 'java',
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

// PUT /api/coding/files/:id (Auto-save)
exports.updateFile = async (req, res) => {
  try {
    const { content } = req.body;
    const file = await CodeFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { content, lastSavedAt: Date.now() },
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
    await CodeFile.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await CodeVersion.deleteMany({ fileId: req.params.id });
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/coding/execute
exports.executeCode = async (req, res) => {
  try {
    const { language, content, stdin } = req.body;
    
    // Map languages to piston versions
    // To be robust, one should fetch runtimes from https://emkc.org/api/v2/piston/runtimes and cache them.
    const languageMap = {
      'python': { language: 'python', version: '3.10.0' },
      'java': { language: 'java', version: '15.0.2' },
      'javascript': { language: 'javascript', version: '18.15.0' },
      'cpp': { language: 'cpp', version: '10.2.0' },
    };

    const runConfig = languageMap[language] || languageMap['python'];

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: runConfig.language,
        version: runConfig.version,
        files: [
          {
            name: `main.${language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : 'js'}`,
            content: content,
          }
        ],
        stdin: stdin || '',
      })
    });

    const data = await response.json();
    
    // data.run contains stdout, stderr, code, signal, output
    res.json({
      run: data.run,
      compile: data.compile,
      language: data.language,
      version: data.version
    });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ message: 'Failed to execute code' });
  }
};
