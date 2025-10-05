const UserSessionsService = require('./UserSessions.srv');

class UserSessionsController {
  async as_login(req, res) {
    try {
      const { username, email_address, password } = req.body;

      if ((!username && !email_address) || !password) {
        return res.status(400).json({ message: 'Either username or email_address is required along with password.' });
      }

      const result = await UserSessionsService.createSession({ username, email_address, password }, req);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async as_refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ message: 'Refresh token required.' });
      }

      const result = await UserSessionsService.refreshAccessToken(refresh_token);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async as_logout(req, res) {
    try {
      const { user_id } = req.user;
      const result = await UserSessionsService.logout(user_id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async as_cleanup(req, res) {
    try {
      await UserSessionsService.cleanupExpiredSessions();
      return res.status(200).json({ message: 'Expired sessions cleaned up successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserSessionsController();