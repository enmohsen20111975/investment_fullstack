/**
 * Stock Deep Insight Snapshot Model
 * Aggregated deep insights snapshot used by frontend as data source.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const StockDeepInsightSnapshot = sequelize.define('StockDeepInsightSnapshot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ticker: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    run_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    sources_available_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    insights_payload: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fetched_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'stock_deep_insight_snapshots',
    timestamps: false,
    indexes: [
        {
            name: 'ix_deep_snapshots_ticker_time',
            fields: ['ticker', 'fetched_at']
        }
    ]
});

module.exports = StockDeepInsightSnapshot;