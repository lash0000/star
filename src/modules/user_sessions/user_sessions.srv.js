const UserSessions = require('./user_sessions.mdl');

const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');
const useragent = require('useragent');

class UserSessionsService {
  constructor() {
    this.ACCESS_TOKEN_EXPIRY = '15m';
    this.REFRESH_TOKEN_EXPIRY = '15d';

    this.f_generateAccessToken = this.f_generateAccessToken.bind(this);
    this.f_generateRefreshToken = this.f_generateRefreshToken.bind(this);
  }

  f_generateAccessToken(user, expires = "") {
    return jwt.sign(
      user,
      process.env.JWT_SECRET,
      { expiresIn: expires || this.ACCESS_TOKEN_EXPIRY }
    );
  }

  f_generateRefreshToken(user, expires = "") {
    return jwt.sign(
      user,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: expires || this.REFRESH_TOKEN_EXPIRY }
    );
  }

  f_verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async createSession(user_id, req, transaction) {
    try {
      // Parse device info
      const agent = useragent.parse(req.get('User-Agent') || '');

      // Get IP address
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        null;

      // Lookup geo location
      const geo = ip ? geoip.lookup(ip) : null;

      // Structure location JSON
      const location = geo
        ? {
          country: geo.country || null,
          region: geo.region || null,
          city: geo.city || null,
          lat: geo.ll ? geo.ll[0] : null,
          long: geo.ll ? geo.ll[1] : null
        }
        : { country: null, region: null, city: null, lat: null, long: null };

      // Create session record
      const user_session = await UserSessions.create(
        {
          user_id,
          ip_address: ip, // ✅ string only
          location,       // ✅ jsonb field
          device_info: agent.toString()
        },
        { transaction }
      );

      return user_session;
    } catch (error) {
      throw error;
    }
  }

  async endSession(sessionId, transaction) {
    try {
      // Validate input
      if (!sessionId) throw new Error('Session ID is required to end session.');

      // Delete session record
      const session = await UserSessions.findOne({
        where: { session_id: sessionId },
      });
      if (!session) throw new Error('No active session found.');

      // Update logout timestamp
      await UserSessions.update(
        { logout_at: new Date() },
        { where: { session_id: sessionId }, transaction }
      );

      return { message: 'Session ended successfully' };
    }
    catch (error) {
      throw new Error(`Ending session failed: ${error.message}`);
    }
  }
}

module.exports = UserSessionsService;
