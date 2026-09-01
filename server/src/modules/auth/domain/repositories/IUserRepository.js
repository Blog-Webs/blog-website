/**
 * Onion Architecture - User Repository Interface Contract
 */
class IUserRepository {
  async findByGoogleIdOrEmail(googleId, email) {
    throw new Error('Method not implemented');
  }
  async findById(id) {
    throw new Error('Method not implemented');
  }
  async create(userData) {
    throw new Error('Method not implemented');
  }
  async update(id, userData) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;
