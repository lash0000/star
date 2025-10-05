const mdl_userProfile = require('./user_profile.mdl');
const sequelize = require('../../../config/db.config');

class UserProfileService {
  constructor() {
    this.model = mdl_userProfile;
  }

  async getUserProfile({ user_id }) {
    try {
      if (!user_id) throw new Error('User ID is required');

      const profile = await this.model.findOne({
        where: { user_id }
      });

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      throw error;
    }
  }

  async createUserProfile(profileData) {
    const transaction = await sequelize.transaction();
    try {
      const newProfile = await this.model.create(profileData, { transaction });
      await transaction.commit();
      return newProfile;
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating user profile:', error.message);
      throw error;
    }
  }

  async updateUserProfile(user_id, updateData) {
    const transaction = await sequelize.transaction();
    try {
      if (!user_id) throw new Error('User ID is required');

      const [updatedRows] = await this.model.update(updateData, {
        where: { user_id },
        returning: true,
        transaction
      });

      if (updatedRows === 0) throw new Error('User profile not found');

      await transaction.commit();

      return await this.getUserProfile({ user_id });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating user profile:', error.message);
      throw error;
    }
  }

  async deleteUserProfile(user_id) {
    try {
      if (!user_id) throw new Error('User ID is required');

      const deletedRows = await this.model.destroy({
        where: { user_id }
      });

      return deletedRows > 0;
    } catch (error) {
      console.error('Error deleting user profile:', error.message);
      throw error;
    }
  }
}

module.exports = UserProfileService;
