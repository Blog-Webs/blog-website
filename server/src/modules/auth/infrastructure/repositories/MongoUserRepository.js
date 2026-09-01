const IUserRepository = require('../../domain/repositories/IUserRepository');
const UserModel = require('../models/UserModel');
const UserEntity = require('../../domain/entities/UserEntity');

class MongoUserRepository extends IUserRepository {
  _toEntity(doc) {
    if (!doc) return null;
    return new UserEntity({
      id: doc._id,
      googleId: doc.googleId,
      name: doc.name,
      email: doc.email,
      avatar: doc.avatar,
      role: doc.role,
      theme: doc.theme,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByGoogleIdOrEmail(googleId, email) {
    const doc = await UserModel.findOne({ $or: [{ googleId }, { email }] });
    return doc;
  }

  async findById(id) {
    const doc = await UserModel.findById(id);
    return doc;
  }

  async create(userData) {
    const doc = await UserModel.create(userData);
    return doc;
  }

  async update(id, userData) {
    const doc = await UserModel.findByIdAndUpdate(id, userData, { new: true });
    return doc;
  }
}

module.exports = new MongoUserRepository();
