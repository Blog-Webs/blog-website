const DomainConfig = require('../models/DomainConfig');
const DEFAULT_DOMAINS = require('../data/defaultDomains');

/**
 * DomainRegistry — In-memory cached domain config loader.
 * Cache TTL: 1 hour. Auto-seeds default domains if collection is empty.
 */
let cache = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DomainRegistry = {
  /**
   * Returns all active domain configs (from cache, DB, or default seed).
   */
  async getAll() {
    if (cache && Date.now() < cacheExpiry && cache.length > 0) return cache;
    
    let domains = await DomainConfig.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    
    // Auto-seed if database collection is empty
    if (!domains || domains.length === 0) {
      try {
        console.log('[DomainRegistry] No domains found in DB. Auto-seeding default domains...');
        const docs = await DomainConfig.insertMany(DEFAULT_DOMAINS);
        domains = docs.map((d) => d.toObject());
      } catch (err) {
        console.error('[DomainRegistry] Auto-seed failed, falling back to static default domains:', err.message);
        domains = DEFAULT_DOMAINS;
      }
    }

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
    return domain ? domain.careerGoals || [] : [];
  },

  /**
   * Return assessable skills for a domain.
   */
  async getAssessableSkills(domainKey) {
    const domain = await this.findByKey(domainKey);
    if (!domain || !domain.requiredSkills) return [];
    return domain.requiredSkills.filter((s) => s.assessable);
  },

  /**
   * Return all required skills for a domain.
   */
  async getRequiredSkills(domainKey) {
    const domain = await this.findByKey(domainKey);
    return domain ? domain.requiredSkills || [] : [];
  },

  /**
   * Get all unique parent domains (for onboarding Step 2 categories).
   */
  async getParentDomains() {
    const all = await this.getAll();
    const seen = new Set();
    const parents = [];
    for (const d of all) {
      if (d.parentDomain && !seen.has(d.parentDomain)) {
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
