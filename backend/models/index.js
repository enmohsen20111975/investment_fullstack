/**
 * Models index file
 * Exports all Sequelize models for the application.
 */

const { sequelize } = require('../database');

// Import all models
const ComplianceStatus = require('./enums/ComplianceStatus');
const InvestmentType = require('./enums/InvestmentType');

const Stock = require('./Stock');
const StockPriceHistory = require('./StockPriceHistory');
const Dividend = require('./Dividend');
const User = require('./User');
const APIKey = require('./APIKey');
const Portfolio = require('./Portfolio');
const PortfolioHolding = require('./PortfolioHolding');
const MarketIndex = require('./MarketIndex');
const AuditLog = require('./AuditLog');
const StockSourceSnapshot = require('./StockSourceSnapshot');
const StockDeepInsightSnapshot = require('./StockDeepInsightSnapshot');
const UserStockWatchlist = require('./UserStockWatchlist');
const UserAsset = require('./UserAsset');
const UserPortfolioSnapshot = require('./UserPortfolioSnapshot');
const UserPortfolioSummary = require('./UserPortfolioSummary');
const UserIncomeExpense = require('./UserIncomeExpense');
const SharedPortfolio = require('./SharedPortfolio');
const MarketUpdateStatus = require('./MarketUpdateStatus');

// Define associations
Stock.hasMany(StockPriceHistory, { foreignKey: 'stock_id', as: 'price_history' });
StockPriceHistory.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

Stock.hasMany(Dividend, { foreignKey: 'stock_id', as: 'dividends' });
Dividend.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

User.hasMany(APIKey, { foreignKey: 'user_id', as: 'api_keys' });
APIKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Portfolio, { foreignKey: 'user_id', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Portfolio.hasMany(PortfolioHolding, { foreignKey: 'portfolio_id', as: 'holdings' });
PortfolioHolding.belongsTo(Portfolio, { foreignKey: 'portfolio_id', as: 'portfolio' });

PortfolioHolding.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

APIKey.hasMany(AuditLog, { foreignKey: 'api_key_id', as: 'audit_logs' });
AuditLog.belongsTo(APIKey, { foreignKey: 'api_key_id', as: 'api_key' });

Stock.hasMany(StockSourceSnapshot, { foreignKey: 'stock_id', as: 'source_snapshots' });
StockSourceSnapshot.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

Stock.hasMany(StockDeepInsightSnapshot, { foreignKey: 'stock_id', as: 'deep_insight_snapshots' });
StockDeepInsightSnapshot.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

User.hasMany(UserStockWatchlist, { foreignKey: 'user_id', as: 'watchlist' });
UserStockWatchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserStockWatchlist.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

User.hasMany(UserAsset, { foreignKey: 'user_id', as: 'assets' });
UserAsset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserAsset.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

UserAsset.hasMany(UserPortfolioSnapshot, { foreignKey: 'asset_id', as: 'snapshots' });
UserPortfolioSnapshot.belongsTo(UserAsset, { foreignKey: 'asset_id', as: 'asset' });

UserPortfolioSnapshot.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserPortfolioSummary, { foreignKey: 'user_id', as: 'portfolio_summary' });
UserPortfolioSummary.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserPortfolioSummary.belongsTo(UserAsset, { foreignKey: 'best_performer_id', as: 'best_performer' });
UserPortfolioSummary.belongsTo(UserAsset, { foreignKey: 'worst_performer_id', as: 'worst_performer' });

User.hasMany(UserIncomeExpense, { foreignKey: 'user_id', as: 'transactions' });
UserIncomeExpense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserIncomeExpense.belongsTo(UserAsset, { foreignKey: 'related_asset_id', as: 'related_asset' });
UserIncomeExpense.belongsTo(Stock, { foreignKey: 'related_stock_id', as: 'related_stock' });

Portfolio.hasMany(SharedPortfolio, { foreignKey: 'portfolio_id', as: 'shares' });
SharedPortfolio.belongsTo(Portfolio, { foreignKey: 'portfolio_id', as: 'portfolio' });

SharedPortfolio.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

module.exports = {
    sequelize,
    ComplianceStatus,
    InvestmentType,
    Stock,
    StockPriceHistory,
    Dividend,
    User,
    APIKey,
    Portfolio,
    PortfolioHolding,
    MarketIndex,
    AuditLog,
    StockSourceSnapshot,
    StockDeepInsightSnapshot,
    UserStockWatchlist,
    UserAsset,
    UserPortfolioSnapshot,
    UserPortfolioSummary,
    UserIncomeExpense,
    SharedPortfolio,
    MarketUpdateStatus
};