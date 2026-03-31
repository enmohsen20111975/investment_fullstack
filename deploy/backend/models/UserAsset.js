/**
 * User Asset Model
 * User's assets including stocks, cash, gold, and other investments.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const UserAsset = sequelize.define('UserAsset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Asset identification
    asset_type: {
        type: DataTypes.STRING(50),
        allowNull: false  // 'stock', 'cash', 'gold', 'silver', 'realestate', 'crypto', 'bond', 'sukuk', 'fund'
    },
    asset_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    asset_ticker: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Quantity and value
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    purchase_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    current_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    current_value: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Performance
    gain_loss: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gain_loss_percent: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Dates
    purchase_date: {
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
    },
    // Additional info
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_halal: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Enhanced tracking fields
    target_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    stop_loss_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'EGP'
    },
    exchange_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    auto_sync: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'user_assets',
    timestamps: false,
    indexes: [
        {
            name: 'ix_assets_user',
            fields: ['user_id']
        },
        {
            name: 'ix_assets_type',
            fields: ['asset_type']
        },
        {
            name: 'ix_assets_ticker',
            fields: ['asset_ticker']
        }
    ],
    hooks: {
        beforeUpdate: (asset) => {
            asset.last_updated = new Date();
        }
    }
});

module.exports = UserAsset;