const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Curation = sequelize.define('Curation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  keyword: {
    type: DataTypes.STRING(100),
    allowNull: false,   // 검색 트렌드 키워드 (예: "AI반도체")
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: false,   // 연관 섹터
  },
  related_stocks: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: '[{"symbol":"005930","name":"삼성전자","market":"KOSPI"}]',
  },
  trend_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  curated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'curations',
  timestamps: false,
  indexes: [
    { fields: ['keyword'] },
    { fields: ['trend_score'] },
  ],
});

module.exports = Curation;
