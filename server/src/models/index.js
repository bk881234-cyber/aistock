const { sequelize } = require('../config/database');

const User = require('./User');
const UserProfile = require('./UserProfile');
const Watchlist = require('./Watchlist');
const Portfolio = require('./Portfolio');
const Transaction = require('./Transaction');
const Alert = require('./Alert');
const AlertHistory = require('./AlertHistory');
const MarketCache = require('./MarketCache');
const StockWeather = require('./StockWeather');
const AIReport = require('./AIReport');
const Curation = require('./Curation');
const SharedCard = require('./SharedCard');

// ── 1:1 ──────────────────────────────────────────────────
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── 1:N ──────────────────────────────────────────────────
User.hasMany(Watchlist,    { foreignKey: 'user_id', as: 'watchlists',   onDelete: 'CASCADE' });
User.hasMany(Portfolio,    { foreignKey: 'user_id', as: 'portfolios',   onDelete: 'CASCADE' });
User.hasMany(Alert,        { foreignKey: 'user_id', as: 'alerts',       onDelete: 'CASCADE' });
User.hasMany(AlertHistory, { foreignKey: 'user_id', as: 'alertHistory', onDelete: 'CASCADE' });
User.hasMany(SharedCard,   { foreignKey: 'user_id', as: 'sharedCards',  onDelete: 'CASCADE' });

Watchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Portfolio.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Portfolio.hasMany(Transaction, { foreignKey: 'portfolio_id', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(Portfolio, { foreignKey: 'portfolio_id', as: 'portfolio' });
Transaction.belongsTo(User,      { foreignKey: 'user_id',      as: 'user' });

Alert.belongsTo(User,      { foreignKey: 'user_id',      as: 'user' });
Alert.belongsTo(Portfolio, { foreignKey: 'portfolio_id', as: 'portfolio' });
Alert.hasMany(AlertHistory, { foreignKey: 'alert_id', as: 'history', onDelete: 'CASCADE' });
AlertHistory.belongsTo(Alert, { foreignKey: 'alert_id', as: 'alert' });
AlertHistory.belongsTo(User,  { foreignKey: 'user_id',  as: 'user' });

SharedCard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  UserProfile,
  Watchlist,
  Portfolio,
  Transaction,
  Alert,
  AlertHistory,
  MarketCache,
  StockWeather,
  AIReport,
  Curation,
  SharedCard,
};
