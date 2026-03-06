/**
 * Stock Price History Model
 * Historical price data for stocks.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const StockPriceHistory = sequelize.define('StockPriceHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
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
    close_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    volume: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    adjusted_close: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'stock_price_history',
    timestamps: false,
    indexes: [
        {
            name: 'ix_price_history_stock_date',
            fields: ['stock_id', 'date']
        }
    ]
});

module.exports = StockPriceHistory;