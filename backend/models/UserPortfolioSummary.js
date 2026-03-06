/**
 * User Portfolio Summary Model
 * Aggregated portfolio summary for quick access to total performance.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const UserPortfolioSummary = sequelize.define('UserPortfolioSummary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    // Total values
    total_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    total_cost: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    total_gain_loss: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    total_gain_loss_percent: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    // Asset breakdown
    stocks_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    cash_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    gold_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    silver_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    crypto_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    realestate_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    bonds_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    sukuk_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    funds_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    other_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    // Performance metrics
    best_performer_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    worst_performer_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Halal compliance
    halal_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    non_halal_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    halal_percent: {
        type: DataTypes.FLOAT,
        defaultValue: 100.0
    },
    // Tracking
    asset_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_snapshot_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_portfolio_summaries',
    timestamps: false,
    indexes: [
        {
            name: 'ix_portfolio_summary_user',
            fields: ['user_id']
        }
    ],
    hooks: {
        beforeUpdate: (summary) => {
            summary.last_updated = new Date();
        }
    }
});

module.exports = UserPortfolioSummary;