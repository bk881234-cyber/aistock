const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SharedCard = sequelize.define('SharedCard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  card_type: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,    // S3 업로드 후 URL 채워짐
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},   // 카드 생성 시점의 데이터 스냅샷
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'shared_cards',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
  ],
});

module.exports = SharedCard;
