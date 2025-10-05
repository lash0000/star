const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const UserCredentials = require('../user_creds/user_creds.mdl');

const UserSessions = sequelize.define('UserSessions', {
  session_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserCredentials,
      key: 'user_id'
    },
  },
  login_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  logout_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Stores JSON: { ip_address, country, region, city, lat, long, loginAt }'
  },
  logout_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Stores JSON: { ip_address, country, region, city, lat, long, loginAt, logoutAt }'
  },
  device_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent, browser, and device info'
  }
}, {
  tableName: 'user_sessions',
  timestamps: true
});

// cardinality: one to many
UserSessions.belongsTo(UserCredentials, { foreignKey: 'user_id' });
UserCredentials.hasMany(UserSessions, { foreignKey: 'user_id' });

module.exports = UserSessions;
