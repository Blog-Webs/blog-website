const AIOfficeProject = require('../models/AIOfficeProject');

/**
 * Get all AI Office projects
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await AIOfficeProject.find()
      .sort({ updatedAt: -1 })
      .limit(10);
    return res.json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single project by ID
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await AIOfficeProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new AI Office project simulation
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description, techStack, requirements } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Project name and description are required.' });
    }

    // Default decomposed task graph generated for the simulation
    const defaultTasks = [
      {
        id: 'TASK-001',
        title: 'Project Architecture & Requirements Analysis',
        description: requirements || description,
        assignedAgentId: 'agent-pm',
        priority: 'HIGH',
        status: 'COMPLETED',
        progress: 100,
        dependencies: [],
        filePath: 'docs/architecture.md',
        codeSnippet: `# Architecture Spec for ${name}\nStack: ${techStack?.join(', ') || 'Node.js, React, MongoDB'}\n\n- API Gateway\n- Microservices & Auth Layer\n- Database Schemas`,
      },
      {
        id: 'TASK-002',
        title: 'Design Database Schemas & Models',
        description: 'Define relational/document schemas and indexes',
        assignedAgentId: 'agent-db',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        progress: 80,
        dependencies: ['TASK-001'],
        filePath: 'src/models/schema.js',
        codeSnippet: `const mongoose = require('mongoose');\n\nconst UserSchema = new mongoose.Schema({\n  username: { type: String, required: true, unique: true },\n  email: { type: String, required: true },\n  role: { type: String, default: 'user' }\n});`,
      },
      {
        id: 'TASK-003',
        title: 'Implement Authentication & REST Endpoints',
        description: 'JWT middleware, login/signup API controllers',
        assignedAgentId: 'agent-backend',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        progress: 65,
        dependencies: ['TASK-002'],
        filePath: 'src/controllers/authController.js',
        codeSnippet: `exports.login = async (req, res) => {\n  const { email, password } = req.body;\n  const user = await User.findOne({ email });\n  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);\n  res.json({ token, user });\n};`,
      },
      {
        id: 'TASK-004',
        title: 'Build Interactive Dashboard UI & State',
        description: 'React components, Tailwind layouts, state management',
        assignedAgentId: 'agent-frontend',
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        progress: 30,
        dependencies: ['TASK-003'],
        filePath: 'src/components/Dashboard.jsx',
        codeSnippet: `export default function Dashboard() {\n  const { user } = useAuth();\n  return (\n    <div className="p-6 bg-slate-900 text-white">\n      <h1>Welcome, {user?.name}</h1>\n    </div>\n  );\n}`,
      },
      {
        id: 'TASK-005',
        title: 'Configure CI/CD Pipelines & Containerization',
        description: 'Dockerfiles, GitHub Actions workflows, Kubernetes manifests',
        assignedAgentId: 'agent-devops',
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        progress: 25,
        dependencies: ['TASK-003'],
        filePath: '.github/workflows/deploy.yml',
        codeSnippet: `name: CI/CD Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm test`,
      },
      {
        id: 'TASK-006',
        title: 'Automated Integration & E2E Testing',
        description: 'Jest, Supertest API testing, Cypress workflow verification',
        assignedAgentId: 'agent-qa',
        priority: 'MEDIUM',
        status: 'BACKLOG',
        progress: 0,
        dependencies: ['TASK-004', 'TASK-005'],
        filePath: 'tests/integration.spec.js',
        codeSnippet: `describe('Auth API', () => {\n  it('should login successfully', async () => {\n    const res = await request(app).post('/api/login').send({ email: 'test@example.com' });\n    expect(res.status).toBe(200);\n  });\n});`,
      },
      {
        id: 'TASK-007',
        title: 'Security Vulnerability Audit & Rate Limiting',
        description: 'OWASP top 10 check, CORS enforcement, sanitization',
        assignedAgentId: 'agent-security',
        priority: 'HIGH',
        status: 'BACKLOG',
        progress: 0,
        dependencies: ['TASK-003'],
        filePath: 'src/middleware/security.js',
        codeSnippet: `const helmet = require('helmet');\nconst rateLimit = require('express-rate-limit');\n\nmodule.exports = [helmet(), rateLimit({ max: 100 })];`,
      },
    ];

    const newProject = new AIOfficeProject({
      name,
      description,
      techStack: techStack || ['React', 'Node.js', 'MongoDB', 'Docker'],
      progress: 35,
      status: 'running',
      tasks: defaultTasks,
      createdBy: req.user ? req.user._id : null,
      events: [
        {
          agentId: 'agent-pm',
          agentName: 'AI Project Manager',
          type: 'PROJECT_CREATED',
          message: `Project "${name}" initialized. Task graph created with 7 core tasks.`,
        },
      ],
    });

    await newProject.save();
    return res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update project simulation state
 */
exports.updateProject = async (req, res) => {
  try {
    const project = await AIOfficeProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
