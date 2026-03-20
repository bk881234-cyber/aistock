const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIReport = sequelize.define('AIReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stock_symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  report_type: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  positives: {
    type: DataTypes.JSONB,
    defaultValue: [],   // ["호재 요인 1", "호재 요인 2"]
  },
  negatives: {
    type: DataTypes.JSONB,
    defaultValue: [],   // ["악재 요인 1"]
  },
  one_liner: {
    type: DataTypes.STRING(500),
    allowNull: true,    // 한 줄 시황
  },
  full_text: {
    type: DataTypes.TEXT,
    allowNull: false,   // 3줄 요약 전문
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,    // AI 신뢰도 0~100%
  },
  source_urls: {
    type: DataTypes.JSONB,
    defaultValue: [],   // 참조 뉴스 URL 배열
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,   // 보통 4시간 TTL
  },
}, {
  tableName: 'ai_reports',
  timestamps: false,
  indexes: [
    { fields: ['stock_symbol', 'report_type'] },
    { fields: ['expires_at'] },
  ],
});

module.exports = AIReport;
