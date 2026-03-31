/**
 * Stock Model
 * Stock model representing EGX stocks and other investment instruments.
 * Contains price data, financial metrics, and Shariah compliance status.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const ComplianceStatus = require('./enums/ComplianceStatus');
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
    // Shariah compliance
    is_halal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
    },
    compliance_status: {
        type: DataTypes.ENUM(...Object.values(ComplianceStatus)),
        defaultValue: ComplianceStatus.UNKNOWN
    },
    compliance_note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    compliance_last_reviewed: {
        type: DataTypes.DATE,
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
        },
        {
            name: 'ix_stocks_compliance',
            fields: ['compliance_status', 'is_active']
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

Stock.prototype.getComplianceDisplay = function () {
    const statusMap = {
        [ComplianceStatus.HALAL]: 'halal',
        [ComplianceStatus.HARAM]: 'haram',
        [ComplianceStatus.UNKNOWN]: 'unknown',
        [ComplianceStatus.CONTROVERSIAL]: 'controversial'
    };
    return statusMap[this.compliance_status] || 'unknown';
};

module.exports = Stock;