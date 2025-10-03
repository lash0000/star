const { Sequelize, DataTypes, NOW } = require('sequelize');
const sequelize = require('../../../config/db.config');
const mdl_UserCredentials = require('../user_creds/user_creds.mdl');

const mdl_UserSessions = sequelize.define('UserSessions', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: mdl_UserCredentials,
      key: 'user_id'
    }
  },
  login_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('NOW()')
  },
  logout_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.VARCHAR(45),
    allowNull: true
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  device_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'user_sessions',
  timestamps: true
});

mdl_UserSessions.hasMany(mdl_UserCredentials, { foreignKey: 'user_id' })

module.exports = mdl_UserSessions;
