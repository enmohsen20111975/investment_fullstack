/**
 * Stock Model
 * Stock model representing EGX stocks and other investment instruments.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const InvestmentType = require('./enums/InvestmentType');

const Stock = sequelize.define('Stock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Basic info
    ticker: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    name_ar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Price data
    current_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    previous_close: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    open_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    high_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    low_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    volume: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    market_cap: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Financial metrics
    pe_ratio: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    pb_ratio: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    dividend_yield: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    eps: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    roe: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    debt_to_equity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Technical indicators
    support_level: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    resistance_level: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    ma_50: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    ma_200: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    rsi: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Classification
    investment_type: {
        type: DataTypes.ENUM(...Object.values(InvestmentType)),
        defaultValue: InvestmentType.STOCK
    },
    sector: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // EGX Index Membership
    egx30_member: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    egx70_member: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    egx100_member: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Metadata
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_egx: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_update: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'stocks',
    timestamps: false,
    indexes: [
        {
            name: 'ix_stocks_ticker_active',
            fields: ['ticker', 'is_active']
        }
    ]
});

// Instance methods
Stock.prototype.getPriceChange = function () {
    if (this.current_price && this.previous_close && this.previous_close !== 0) {
        return ((this.current_price - this.previous_close) / this.previous_close) * 100;
    }
    return null;
};


module.exports = Stock;