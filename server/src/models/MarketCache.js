const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketCache = sequelize.define('MarketCache', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  data_type: {
    type: DataTypes.ENUM('index', 'fx', 'commodity', 'stock'),
    allowNull: false,
  },
  symbol: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: 'KOSPI, KOSDAQ, NASDAQ, SPX, USD_KRW, GOLD_USD, SILVER_USD 등',
  },
  current_val: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true,
  },
  prev_close: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true,
  },
  change_val: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true,
  },
  change_pct: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
  },
  high_52w: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true,
  },
  low_52w: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true,
  },
  raw_json: {
    type: DataTypes.JSONB,
    allowNull: true,    // 원본 API 응답 전체 보관
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ttl_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
}, {
  tableName: 'market_cache',
  timestamps: false,
  indexes: [
    { fields: ['symbol'], unique: true },
    { fields: ['data_type'] },
  ],
});

module.exports = MarketCache;
