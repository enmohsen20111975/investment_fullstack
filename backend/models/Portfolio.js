/**
 * Portfolio Model
 * User portfolio for tracking investments.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Portfolio = sequelize.define('Portfolio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    total_value: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    total_gain_loss: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    halal_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'portfolios',
    timestamps: false,
    indexes: [
        {
            name: 'ix_portfolios_user',
            fields: ['user_id']
        }
    ],
    hooks: {
        beforeUpdate: (portfolio) => {
            portfolio.updated_at = new Date();
        }
    }
});

module.exports = Portfolio;