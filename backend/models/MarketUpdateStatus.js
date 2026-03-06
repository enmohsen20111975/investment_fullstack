/**
 * Market Update Status Model
 * Tracks when market data was last updated and update history.
 * Used to enforce market hours restrictions (Sunday-Tuesday, 8AM-4PM Egypt time).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const MarketUpdateStatus = sequelize.define('MarketUpdateStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Type of update (stocks, indices, all, etc.)
    update_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'stocks'
    },
    // Status of the update
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'skipped'),
        allowNull: false,
        defaultValue: 'completed'
    },
    // When the update started
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // When the update completed
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Number of records updated
    records_updated: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Any error message if failed
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Source of the update (manual, scheduled, api, etc.)
    source: {
        type: DataTypes.STRING(50),
        defaultValue: 'scheduled'
    },
    // Additional metadata as JSON
    metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('metadata');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('metadata', value ? JSON.stringify(value) : null);
        }
    },
    // Trading date (the market trading day this update belongs to)
    trading_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'market_update_status',
    timestamps: false,
    indexes: [
        {
            name: 'ix_update_status_type_date',
            fields: ['update_type', 'trading_date']
        },
        {
            name: 'ix_update_status_completed',
            fields: ['completed_at']
        }
    ]
});

/**
 * Get the last successful update
 * @param {string} updateType - Type of update to check
 * @returns {Promise<MarketUpdateStatus|null>}
 */
MarketUpdateStatus.getLastSuccessfulUpdate = async function(updateType = 'stocks') {
    return await this.findOne({
        where: {
            update_type: updateType,
            status: 'completed'
        },
        order: [['completed_at', 'DESC']]
    });
};

/**
 * Get update history for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} updateType - Type of update
 * @returns {Promise<MarketUpdateStatus[]>}
 */
MarketUpdateStatus.getHistory = async function(startDate, endDate, updateType = 'stocks') {
    const { Op } = require('sequelize');
    return await this.findAll({
        where: {
            update_type: updateType,
            trading_date: {
                [Op.between]: [startDate, endDate]
            }
        },
        order: [['trading_date', 'DESC'], ['completed_at', 'DESC']]
    });
};

/**
 * Record a new update attempt
 * @param {string} updateType - Type of update
 * @param {string} source - Source of update
 * @param {Date} tradingDate - Trading date
 * @returns {Promise<MarketUpdateStatus>}
 */
MarketUpdateStatus.startUpdate = async function(updateType = 'stocks', source = 'scheduled', tradingDate = null) {
    return await this.create({
        update_type: updateType,
        status: 'in_progress',
        started_at: new Date(),
        source: source,
        trading_date: tradingDate || new Date()
    });
};

/**
 * Complete an update
 * @param {number} recordsUpdated - Number of records updated
 * @param {object} metadata - Additional metadata
 */
MarketUpdateStatus.prototype.complete = async function(recordsUpdated = 0, metadata = null) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.records_updated = recordsUpdated;
    if (metadata) {
        this.metadata = metadata;
    }
    await this.save();
};

/**
 * Fail an update
 * @param {string} errorMessage - Error message
 */
MarketUpdateStatus.prototype.fail = async function(errorMessage) {
    this.status = 'failed';
    this.completed_at = new Date();
    this.error_message = errorMessage;
    await this.save();
};

module.exports = MarketUpdateStatus;
