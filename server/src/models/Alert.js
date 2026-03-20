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
    allowNull: true,
  },
  stock_symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alert_type: {
    type: DataTypes.STRING(30),   // 'price_target'|'stop_loss'|'trailing_stop'|'weather_change'|'volume_surge'|'news_break'
    allowNull: false,
  },
  condition: {
    type: DataTypes.STRING(20),   // 'above'|'below'|'pct_change'
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
