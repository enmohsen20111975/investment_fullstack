/**
 * User Stock Watchlist Model
 * User's custom stock watchlist for monitoring specific stocks.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const UserStockWatchlist = sequelize.define('UserStockWatchlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Custom settings
    alert_price_above: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    alert_price_below: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    alert_change_percent: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Tracking
    added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_viewed: {
        type: DataTypes.DATE,
        allowNull: true
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'user_stock_watchlists',
    timestamps: false,
    indexes: [
        {
            name: 'uq_user_watchlist_stock',
            unique: true,
            fields: ['user_id', 'stock_id']
        },
        {
            name: 'ix_watchlist_user',
            fields: ['user_id']
        }
    ]
});

module.exports = UserStockWatchlist;