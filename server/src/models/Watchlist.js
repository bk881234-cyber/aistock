const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  stock_symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  stock_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  market: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  alert_price: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,    // 관심 종목 도달 알림가 (선택)
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'watchlists',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['user_id', 'stock_symbol'], unique: true },  // 중복 등록 방지
  ],
});

module.exports = Watchlist;
