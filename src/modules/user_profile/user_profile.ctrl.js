const UserProfileService = require('./user_profile.srv');

class UserProfileController {
  constructor() {
    this.service = new UserProfileService();
    this.as_getUserProfile = this.as_getUserProfile.bind(this);
    this.as_createUserProfile = this.as_createUserProfile.bind(this);
    this.as_updateUserProfile = this.as_updateUserProfile.bind(this);
    this.as_deleteUserProfile = this.as_deleteUserProfile.bind(this);
  }

  // GET USER PROFILE
  async as_getUserProfile(req, res) {
    try {
      const { user_id } = req.params;
      const result = await this.service.getUserProfile({ user_id });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // CREATE USER PROFILE
  async as_createUserProfile(req, res) {
    try {
      const result = await this.service.createUserProfile(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // UPDATE USER PROFILE
  async as_updateUserProfile(req, res) {
    try {
      const { user_id } = req.params;
      const result = await this.service.updateUserProfile(user_id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // DELETE USER PROFILE
  async as_deleteUserProfile(req, res) {
    try {
      const { user_id } = req.params;
      const success = await this.service.deleteUserProfile(user_id);
      if (!success) return res.status(404).json({ message: 'User profile not found' });
      return res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserProfileController();
