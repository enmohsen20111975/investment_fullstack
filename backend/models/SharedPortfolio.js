/**
 * Shared Portfolio Model
 * Shared portfolios for sharing investment data with others.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const SharedPortfolio = sequelize.define('SharedPortfolio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portfolio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Sharing settings
    share_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    allow_copy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    show_values: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    show_gain_loss: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Access control
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    max_views: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    current_views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Tracking
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_accessed: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'shared_portfolios',
    timestamps: false,
    indexes: [
        {
            name: 'ix_shared_portfolio_code',
            fields: ['share_code']
        }
    ]
});

module.exports = SharedPortfolio;