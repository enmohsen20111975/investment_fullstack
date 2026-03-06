/**
 * Stock Source Snapshot Model
 * Raw snapshot for each external/open source fetch attempt.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const StockSourceSnapshot = sequelize.define('StockSourceSnapshot', {
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
        allowNull: false
    },
    source_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    source_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    payload: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fetched_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'stock_source_snapshots',
    timestamps: false,
    indexes: [
        {
            name: 'ix_source_snapshots_ticker_time',
            fields: ['ticker', 'fetched_at']
        },
        {
            name: 'ix_source_snapshots_run_source',
            fields: ['run_id', 'source_name']
        }
    ]
});

module.exports = StockSourceSnapshot;