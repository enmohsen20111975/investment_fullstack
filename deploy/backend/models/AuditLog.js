/**
 * Audit Log Model
 * Audit log for tracking API usage and changes.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    api_key_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    resource_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    request_data: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    response_status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
        {
            name: 'ix_audit_logs_user',
            fields: ['user_id']
        },
        {
            name: 'ix_audit_logs_action',
            fields: ['action']
        },
        {
            name: 'ix_audit_logs_created',
            fields: ['created_at']
        }
    ]
});

module.exports = AuditLog;