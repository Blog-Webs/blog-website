/**
 * Onion Architecture - Blog Repository Interface Contract
 */
class IBlogRepository {
  async findPublished(queryOptions) {
    throw new Error('Method not implemented');
  }
  async findBySlug(slug) {
    throw new Error('Method not implemented');
  }
  async create(blogData) {
    throw new Error('Method not implemented');
  }
  async update(id, blogData) {
    throw new Error('Method not implemented');
  }
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IBlogRepository;
