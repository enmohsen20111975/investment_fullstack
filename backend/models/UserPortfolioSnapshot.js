/**
 * User Portfolio Snapshot Model
 * Historical snapshots of user portfolio for tracking performance over time.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const UserPortfolioSnapshot = sequelize.define('UserPortfolioSnapshot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Snapshot data
    snapshot_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    snapshot_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'daily'  // 'daily', 'weekly', 'monthly', 'manual'
    },
    // Values at snapshot time
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    gain_loss: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gain_loss_percent: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Market context
    market_value_change: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    market_percent_change: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Metadata
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_portfolio_snapshots',
    timestamps: false,
    indexes: [
        {
            name: 'ix_portfolio_snapshot_user_date',
            fields: ['user_id', 'snapshot_date']
        },
        {
            name: 'ix_portfolio_snapshot_asset',
            fields: ['asset_id']
        },
        {
            name: 'uq_asset_snapshot_date_type',
            unique: true,
            fields: ['asset_id', 'snapshot_date', 'snapshot_type']
        }
    ]
});

module.exports = UserPortfolioSnapshot;