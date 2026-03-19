const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  portfolio_id: {
    type: DataTypes.UUID,
    allowNull: true,   // NULL = 관심종목 기반 알림
  },
  stock_symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alert_type: {
    type: DataTypes.ENUM(
      'price_target',     // 목표가 도달
      'stop_loss',        // 손절가 도달
      'trailing_stop',    // 트레일링 스탑 발동
      'weather_change',   // 날씨 등급 변화 (맑음→뇌우 등)
      'volume_surge',     // 거래량 급증
      'news_break'        // 주요 뉴스 감지
    ),
    allowNull: false,
  },
  condition: {
    type: DataTypes.ENUM('above', 'below', 'pct_change'),
    allowNull: false,
  },
  threshold: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'alerts',
  indexes: [
    { fields: ['user_id', 'is_active'] },
    { fields: ['stock_symbol', 'is_active'] },
  ],
});

module.exports = Alert;
