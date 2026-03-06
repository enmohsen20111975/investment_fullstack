/**
 * Dividend Model
 * Dividend history for stocks.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Dividend = sequelize.define('Dividend', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ex_dividend_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    dividend_amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dividend_yield: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    declaration_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'dividends',
    timestamps: false,
    indexes: [
        {
            name: 'ix_dividends_stock_date',
            fields: ['stock_id', 'ex_dividend_date']
        }
    ]
});

module.exports = Dividend;