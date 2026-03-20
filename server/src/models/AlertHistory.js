const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertHistory = sequelize.define('AlertHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  alert_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  triggered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  trigger_value: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,   // 알림 발동 시점의 실제 주가/지표값
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'alert_history',
  timestamps: false,   // alert_history 테이블에 created_at/updated_at 컬럼 없음
  indexes: [
    { fields: ['user_id', 'is_read'] },
    { fields: ['alert_id'] },
  ],
});

module.exports = AlertHistory;
