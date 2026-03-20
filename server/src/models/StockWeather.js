const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockWeather = sequelize.define('StockWeather', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stock_symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  weather: {
    type: DataTypes.STRING(20),   // 'sunny'|'partly_cloudy'|'cloudy'|'rainy'|'thunderstorm'
    allowNull: false,
  },
  weather_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  rsi_14: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
  },
  macd_signal: {
    type: DataTypes.STRING(10),   // 'bullish'|'bearish'|'neutral'
    allowNull: true,
  },
  bb_position: {
    type: DataTypes.STRING(20),   // 'upper'|'middle'|'lower'|'breakout_up'|'breakout_down'
    allowNull: true,
  },
  volume_ratio: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
  },
  moving_avg_pos: {
    type: DataTypes.STRING(20),   // 'above_20'|'above_60'|'below_60'|'golden_cross'|'dead_cross'
    allowNull: true,
  },
  analyzed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'stock_weather',
  timestamps: false,
  indexes: [
    { fields: ['stock_symbol'], unique: true },
    { fields: ['expires_at'] },
  ],
});

module.exports = StockWeather;
