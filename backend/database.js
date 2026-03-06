/**
 * Database module for EGX Investment API
 * Handles Sequelize connection and initialization.
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { settings } = require('./config');
const logger = require('./logger');

// Determine database path for SQLite
const dbPath = path.join(__dirname, '..', 'egx_investment.db');

// Create Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
        timestamps: false
    }
});

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database: Connection authenticated');
    } catch (error) {
        console.error('Database: Connection failed:', error.message);
        throw error;
    }
};

// Initialize database
const initDb = async () => {
    try {
        console.log('Database: Testing connection...');
        await testConnection();
        console.log('Database: Connection OK, syncing tables...');
        // Use 'force: false' to prevent dropping tables with foreign key constraints
        // This will create new tables if they don't exist, but won't alter existing ones
        await sequelize.sync({ force: false });
        console.log('Database: Sync complete!');
        logger.info('Database synchronization complete');
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        logger.error('Database initialization failed:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    Sequelize,
    testConnection,
    initDb
};