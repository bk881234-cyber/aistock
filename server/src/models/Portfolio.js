const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
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
    type: DataTypes.ENUM('KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
    defaultValue: 0,
  },
  avg_buy_price: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
    comment: '거래 체결 시 자동 재계산되는 평균 매수가',
  },
  target_sell_price: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,    // 목표 매도가
  },
  stop_loss_price: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,    // 손절가
  },
  trailing_stop_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,    // 트레일링 스탑 % (예: 5.00 = 고점 대비 -5%)
  },
  realized_gain: {
    type: DataTypes.DECIMAL(15, 4),
    defaultValue: 0,    // 부분 매도 후 누적 실현 손익
  },
  status: {
    type: DataTypes.ENUM('active', 'closed'),
    defaultValue: 'active',
  },
}, {
  tableName: 'portfolios',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['user_id', 'stock_symbol', 'status'] },
  ],
});

module.exports = Portfolio;
