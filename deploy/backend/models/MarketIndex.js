/**
 * Market Index Model
 * Market index data (EGX30, EGX70, EGX33 Shariah, etc.).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const MarketIndex = sequelize.define('MarketIndex', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    symbol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    current_value: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    previous_close: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    change: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    change_percent: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    is_shariah: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'market_indices',
    timestamps: false
});

module.exports = MarketIndex;