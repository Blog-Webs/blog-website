const { OAuth2Client } = require('google-auth-library');
const userRepository = require('../../infrastructure/repositories/MongoUserRepository');
const { signToken } = require('../../../../utils/jwt');
const eventBus = require('../../../../events/EventBus');
const { logUserActivity } = require('../../../../shared/infrastructure/logging/mysqlLogger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAdminEmailList = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

class GoogleLoginUseCase {
  async execute(credential) {
    if (!credential) {
      const err = new Error('Missing Google credential.');
      err.status = 400;
      throw err;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      const err = new Error('Google account email is not verified.');
      err.status = 401;
      throw err;
    }

    const { sub: googleId, email, name, picture } = payload;
    const adminEmails = getAdminEmailList();
    const shouldBeAdmin = adminEmails.includes(email.toLowerCase());

    let user = await userRepository.findByGoogleIdOrEmail(googleId, email);

    if (user) {
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
      user.lastLoginAt = new Date();
      if (shouldBeAdmin && user.role !== 'admin') user.role = 'admin';
      if (!shouldBeAdmin && user.role === 'admin') user.role = 'user';
      await user.save();
    } else {
      user = await userRepository.create({
        googleId,
        email,
        name: name || email.split('@')[0],
        avatar: picture || '',
        role: shouldBeAdmin ? 'admin' : 'user',
      });
      eventBus.emit('UserRegistered', user);
    }

    const token = signToken(user);

    // Log explicit Google Login event into MySQL
    logUserActivity({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      authProvider: 'google',
      actionType: 'GOOGLE_LOGIN',
      method: 'POST',
      url: '/api/auth/google',
      statusCode: 200,
      extraMetadata: { googleId, avatar: picture, role: user.role }
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        theme: user.theme,
      },
    };
  }
}

module.exports = new GoogleLoginUseCase();
