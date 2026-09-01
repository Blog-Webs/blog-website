/**
 * Onion Architecture - Shared Base Domain Entity
 * Pure JS domain object representation.
 */
class BaseEntity {
  constructor(id, createdAt = new Date(), updatedAt = new Date()) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = BaseEntity;
