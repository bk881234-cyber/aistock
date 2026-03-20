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
    comment: '투자 성향: conservative(안전), moderate(중립), aggressive(공격)',
  },
  investment_style: {
    type: DataTypes.ENUM('value', 'growth', 'dividend', 'momentum', 'mixed'),
    defaultValue: 'mixed',
    comment: '투자 스타일: value(가치), growth(성장), dividend(배당), momentum(모멘텀), mixed(혼합)',
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
  onboarding_complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '투자 성향 온보딩 완료 여부',
  },
}, {
  tableName: 'user_profiles',
});

module.exports = UserProfile;
