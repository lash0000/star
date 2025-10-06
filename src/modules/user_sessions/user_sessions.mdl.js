/***********************************************************************************************************************************************************************
* File Name: user_sessions.mdl.js
* Type of Program: Model
* Description: User Sessions Model
* Module: User Sessions
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/
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
  login_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  logout_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Stores JSON: { ip_address, country, region, city, lat, long, device_info }'
  },
  logout_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Stores JSON: { ip_address, country, region, city, lat, long, device_info }'
  },
}, {
  tableName: 'user_sessions',
  timestamps: true
});

// cardinality: one to many
UserSessions.belongsTo(UserCredentials, { foreignKey: 'user_id' });
UserCredentials.hasMany(UserSessions, { foreignKey: 'user_id' });

module.exports = UserSessions;
