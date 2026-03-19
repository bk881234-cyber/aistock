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
    type: DataTypes.ENUM('sunny', 'partly_cloudy', 'cloudy', 'rainy', 'thunderstorm'),
    allowNull: false,
    comment: '맑음 / 구름조금 / 흐림 / 비 / 뇌우',
  },
  weather_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0(최악) ~ 100(최상) 종합 점수',
    validate: { min: 0, max: 100 },
  },
  rsi_14: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
    comment: 'RSI(14): >70 과매수, <30 과매도',
  },
  macd_signal: {
    type: DataTypes.ENUM('bullish', 'bearish', 'neutral'),
    allowNull: true,
  },
  bb_position: {
    type: DataTypes.ENUM('upper', 'middle', 'lower', 'breakout_up', 'breakout_down'),
    allowNull: true,
    comment: '볼린저 밴드 위치',
  },
  volume_ratio: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
    comment: '현재 거래량 / 20일 평균 거래량',
  },
  moving_avg_pos: {
    type: DataTypes.ENUM('above_20', 'above_60', 'below_60', 'golden_cross', 'dead_cross'),
    allowNull: true,
    comment: '이동평균선 상대 위치',
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
