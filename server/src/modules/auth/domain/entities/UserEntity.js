const BaseEntity = require('../../../../shared/domain/BaseEntity');

class UserEntity extends BaseEntity {
  constructor({ id, googleId, name, email, avatar, role, theme, lastLoginAt, createdAt, updatedAt }) {
    super(id, createdAt, updatedAt);
    this.googleId = googleId;
    this.name = name;
    this.email = email;
    this.avatar = avatar || '';
    this.role = role || 'user';
    this.theme = theme || 'dark';
    this.lastLoginAt = lastLoginAt || new Date();
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = UserEntity;
