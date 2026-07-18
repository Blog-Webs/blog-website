const express = require('express');
const router = express.Router();
const codingController = require('./codingController');

router.get('/projects', codingController.getProjects);
router.post('/projects', codingController.createProject);

router.get('/projects/:projectId/files', codingController.getFiles);
router.post('/files', codingController.createFile);
router.get('/files/:id', codingController.getFile);
router.put('/files/:id', codingController.updateFile);
router.delete('/files/:id', codingController.deleteFile);

router.post('/execute', codingController.executeCode);

module.exports = router;
