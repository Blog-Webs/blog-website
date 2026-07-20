const DomainConfig = require('../models/DomainConfig');

/**
 * DomainRegistry — In-memory cached domain config loader.
 * Cache TTL: 1 hour. New admin-added domains appear without server restart.
 */
let cache = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DomainRegistry = {
  /**
   * Returns all active domain configs (from cache or DB).
   */
  async getAll() {
    if (cache && Date.now() < cacheExpiry) return cache;
    const domains = await DomainConfig.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    cache = domains;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return domains;
  },

  /**
   * Find a domain config by key (e.g. "engineering.cse").
   */
  async findByKey(key) {
    const all = await this.getAll();
    return all.find((d) => d.key === key) || null;
  },

  /**
   * Return all career goals for a given domain key.
   */
  async getCareerGoals(domainKey) {
    const domain = await this.findByKey(domainKey);
    return domain ? domain.careerGoals : [];
  },

  /**
   * Return assessable skills for a domain.
   */
  async getAssessableSkills(domainKey) {
    const domain = await this.findByKey(domainKey);
    if (!domain) return [];
    return domain.requiredSkills.filter((s) => s.assessable);
  },

  /**
   * Return all required skills for a domain.
   */
  async getRequiredSkills(domainKey) {
    const domain = await this.findByKey(domainKey);
    return domain ? domain.requiredSkills : [];
  },

  /**
   * Get all unique parent domains (for onboarding Step 2 categories).
   */
  async getParentDomains() {
    const all = await this.getAll();
    const seen = new Set();
    const parents = [];
    for (const d of all) {
      if (!seen.has(d.parentDomain)) {
        seen.add(d.parentDomain);
        parents.push(d.parentDomain);
      }
    }
    return parents;
  },

  /**
   * Get sub-domains for a given parent (e.g. all "engineering" sub-domains).
   */
  async getSubDomains(parentDomain) {
    const all = await this.getAll();
    return all.filter((d) => d.parentDomain === parentDomain);
  },

  /** Invalidate cache (call after admin CRUD on DomainConfig). */
  invalidate() {
    cache = null;
    cacheExpiry = 0;
  },
};

module.exports = DomainRegistry;
