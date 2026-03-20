const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  portfolio_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  price_per_share: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
    comment: 'quantity * price_per_share (수수료 포함 최종 금액)',
  },
  fee: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'transactions',
  timestamps: false,   // transactions 테이블에 created_at/updated_at 컬럼 없음
  indexes: [
    { fields: ['portfolio_id'] },
    { fields: ['user_id', 'transaction_date'] },
  ],
});

module.exports = Transaction;
