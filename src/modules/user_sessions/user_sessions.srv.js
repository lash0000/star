const jwt = require('jsonwebtoken');
const UserSessions = require('./UserSession.model');
const UserCredentials = require('../user_creds/UserCreds.model');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

class UserSessionsService {
  constructor() {
    this.ACCESS_TOKEN_EXPIRY = '15m';
    this.REFRESH_TOKEN_EXPIRY = '15d';
  }

  async createSession(user_id, req) {
    try {
      const user = await UserCredentials.findByPk(user_id);
      if (!user) throw new Error('User not found.');

      const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const location = ip_address ? geoip.lookup(ip_address) : null;

      const parser = new UAParser(req.headers['user-agent']);
      const device_info = parser.getResult();

      const access_token = jwt.sign(
        { user_id },
        process.env.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      const refresh_token = jwt.sign(
        { user_id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: this.REFRESH_TOKEN_EXPIRY }
      );

      const session = await UserSessions.upsert({
        user_id,
        ip_address,
        location,
        device_info,
        login_at: new Date(),
        logout_at: null
      });

      return {
        message: 'Login successful',
        access_token,
        refresh_token,
        session
      };
    } catch (error) {
      throw new Error(`Session creation failed: ${err.message}`);
    }
  }

  async refreshAccessToken(refresh_token) {
    try {
      const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
      const user = await UserCredentials.findByPk(decoded.user_id);
      if (!user) throw new Error('Invalid refresh token.');

      const new_access_token = jwt.sign(
        { user_id: decoded.user_id },
        process.env.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      return { access_token: new_access_token };
    } catch (error) {
      throw new Error(`Token refresh failed: ${err.message}`);
    }
  }

  async logout(user_id) {
    try {
      const session = await UserSessions.findOne({ where: { user_id } });
      if (!session) throw new Error('No active session found.');

      await session.update({ logout_at: new Date() });
      return { message: 'Logout successful' };
    } catch (err) {
      throw new Error(`Logout failed: ${err.message}`);
    }
  }

  async cleanupExpiredSessions() {
    try {
      const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      await UserSessions.destroy({
        where: {
          logout_at: { [require('sequelize').Op.lt]: cutoff }
        }
      });
    } catch (err) {
      console.error('Session cleanup failed:', err.message);
    }
  }
}

module.exports = new UserSessionsService();
