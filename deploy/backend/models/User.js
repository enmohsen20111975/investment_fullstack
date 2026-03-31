/**
 * User Model
 * User model for API authentication and portfolio management.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    hashed_password: {
        type: DataTypes.STRING(255),
        allowNull: true  // Nullable for API-only users
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_superuser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Preferences
    default_risk_tolerance: {
        type: DataTypes.STRING(20),
        defaultValue: 'medium'  // low, medium, high
    },
    halal_only_preference: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Subscription
    subscription_plan: {
        type: DataTypes.STRING(20),
        defaultValue: 'free'   // free | pro | premium
    },
    subscription_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active' // active | expired | cancelled
    },
    subscription_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paymob_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: false,
    hooks: {
        beforeUpdate: (user) => {
            user.updated_at = new Date();
        }
    }
});

module.exports = User;