const express = require('express');
const router = express.Router();
const aiOfficeController = require('../controllers/aiOfficeController');

router.get('/projects', aiOfficeController.getProjects);
router.get('/projects/:id', aiOfficeController.getProjectById);
router.post('/projects', aiOfficeController.createProject);
router.put('/projects/:id', aiOfficeController.updateProject);

module.exports = router;
