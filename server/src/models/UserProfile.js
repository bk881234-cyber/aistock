const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  risk_tolerance: {
    type: DataTypes.ENUM('conservative', 'moderate', 'aggressive'),
    defaultValue: 'moderate',
  },
  investment_style: {
    type: DataTypes.ENUM('value', 'growth', 'momentum', 'mixed'),
    defaultValue: 'mixed',
  },
  target_return_pct: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,  // 연 10% 기본값
  },
  preferred_sectors: {
    type: DataTypes.JSONB,
    defaultValue: [],     // ["반도체", "2차전지", ...]
  },
  notif_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notif_push: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notif_sms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'user_profiles',
});

module.exports = UserProfile;
