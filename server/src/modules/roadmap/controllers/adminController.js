const DomainConfig = require('../models/DomainConfig');
const LearningResource = require('../models/LearningResource');
const Roadmap = require('../models/Roadmap');
const DomainRegistry = require('../services/DomainRegistry');

/**
 * Admin Controller — Domain config and resource management.
 * All routes require requireAdmin middleware (existing).
 */
const adminController = {
  // ── Domain Config ─────────────────────────────────────────────────────────

  async getDomains(req, res) {
    const { page = 1, limit = 20, parentDomain, isActive } = req.query;
    const filter = {};
    if (parentDomain) filter.parentDomain = parentDomain;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [domains, total] = await Promise.all([
      DomainConfig.find(filter).sort({ sortOrder: 1, parentDomain: 1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      DomainConfig.countDocuments(filter),
    ]);
    res.json({ domains, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  },

  async getDomainByKey(req, res) {
    const domain = await DomainConfig.findOne({ key: req.params.key }).lean();
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });
    res.json({ domain });
  },

  async createDomain(req, res) {
    const { key, displayName, parentDomain, icon, description, careerGoals, requiredSkills,
      learningPaths, certifications, examPattern, industryKeywords, sortOrder } = req.body;
    if (!key?.trim() || !displayName?.trim() || !parentDomain?.trim()) {
      return res.status(400).json({ message: 'key, displayName, and parentDomain are required.' });
    }
    const exists = await DomainConfig.findOne({ key });
    if (exists) return res.status(409).json({ message: `Domain key "${key}" already exists.` });

    const domain = await DomainConfig.create({
      key: key.trim().toLowerCase(),
      displayName: displayName.trim(),
      parentDomain: parentDomain.trim().toLowerCase(),
      icon: icon || '🎓',
      description: description || '',
      careerGoals: careerGoals || [],
      requiredSkills: requiredSkills || [],
      learningPaths: learningPaths || [],
      certifications: certifications || [],
      examPattern: examPattern || {},
      industryKeywords: industryKeywords || [],
      sortOrder: sortOrder || 0,
    });
    DomainRegistry.invalidate();
    res.status(201).json({ domain });
  },

  async updateDomain(req, res) {
    const updates = req.body;
    delete updates.key; // key is immutable
    const domain = await DomainConfig.findOneAndUpdate(
      { key: req.params.key }, updates, { new: true }
    );
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });
    DomainRegistry.invalidate();
    res.json({ domain });
  },

  async deleteDomain(req, res) {
    const domain = await DomainConfig.findOneAndDelete({ key: req.params.key });
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });
    DomainRegistry.invalidate();
    res.json({ success: true });
  },

  // ── Learning Resources ────────────────────────────────────────────────────

  async getResources(req, res) {
    const { domain, skill, type, difficulty, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (domain) filter.domain = domain;
    if (skill) filter.skill = skill;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const [resources, total] = await Promise.all([
      LearningResource.find(filter).sort({ isVerified: -1, rating: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      LearningResource.countDocuments(filter),
    ]);
    res.json({ resources, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  },

  async createResource(req, res) {
    const { domain, skill, title, type, url, platform, author, difficulty, learningStyles, tags, description, isFree } = req.body;
    if (!domain || !skill || !title || !type) {
      return res.status(400).json({ message: 'domain, skill, title, and type are required.' });
    }
    const resource = await LearningResource.create({
      domain, skill, title, type, url: url || '', platform: platform || '',
      author: author || '', difficulty: difficulty || 'beginner',
      learningStyles: learningStyles || ['mixed'], tags: tags || [],
      description: description || '', isFree: isFree !== false, isVerified: false,
    });
    res.status(201).json({ resource });
  },

  async updateResource(req, res) {
    const resource = await LearningResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ resource });
  },

  async deleteResource(req, res) {
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  },

  // ── Roadmap overview (read-only admin view) ───────────────────────────────

  async getRoadmaps(req, res) {
    const { domain, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (domain) filter.domain = domain;
    if (status) filter.status = status;

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filter)
        .populate('user', 'name email')
        .select('title type domain careerGoal status completionPercent createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(parseInt(limit)).lean(),
      Roadmap.countDocuments(filter),
    ]);
    res.json({ roadmaps, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  },
};

module.exports = adminController;
