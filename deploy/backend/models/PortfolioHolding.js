/**
 * Portfolio Holding Model
 * Individual stock holding within a portfolio.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const PortfolioHolding = sequelize.define('PortfolioHolding', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portfolio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    average_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    current_value: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gain_loss: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gain_loss_percent: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    purchase_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'portfolio_holdings',
    timestamps: false,
    indexes: [
        {
            name: 'uq_portfolio_stock',
            unique: true,
            fields: ['portfolio_id', 'stock_id']
        }
    ],
    hooks: {
        beforeUpdate: (holding) => {
            holding.updated_at = new Date();
        }
    }
});

module.exports = PortfolioHolding;