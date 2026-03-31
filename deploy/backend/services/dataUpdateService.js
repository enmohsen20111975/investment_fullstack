/**
 * Data Update Service
 * Handles stock data updates with market hours enforcement.
 * Only updates data during Egyptian market hours (Sunday-Tuesday, 8AM-4PM Egypt time).
 */

const logger = require('../logger');
const { Stock, StockPriceHistory, MarketUpdateStatus } = require('../models');
const { shouldAllowUpdate, getCairoTime, getMarketStatus } = require('./marketScheduleService');
const { settings } = require('../config');

/**
 * Update stock data with market hours check
 * @param {Object} stockData - Stock data to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} Update result
 */
async function updateStockData(stockData, options = {}) {
    const { force = false, source = 'api', updateType = 'stocks' } = options;
    
    // Check if update is allowed
    const updateCheck = shouldAllowUpdate(force);
    
    if (!updateCheck.allowed) {
        logger.warn(`Update blocked: ${updateCheck.reason}`);
        return {
            success: false,
            reason: updateCheck.reason,
            market_status: updateCheck.status
        };
    }
    
    // Start update record
    const cairoTime = getCairoTime();
    const tradingDate = cairoTime.toISOString().split('T')[0];
    
    const updateRecord = await MarketUpdateStatus.startUpdate(updateType, source, tradingDate);
    
    try {
        let recordsUpdated = 0;
        
        if (Array.isArray(stockData)) {
            // Bulk update
            for (const stock of stockData) {
                const result = await updateSingleStock(stock);
                if (result) recordsUpdated++;
            }
        } else {
            // Single stock update
            const result = await updateSingleStock(stockData);
            if (result) recordsUpdated++;
        }
        
        // Complete update record
        await updateRecord.complete(recordsUpdated, {
            market_status: updateCheck.status,
            update_time: new Date().toISOString()
        });
        
        logger.info(`Data update completed: ${recordsUpdated} records updated`);
        
        return {
            success: true,
            records_updated: recordsUpdated,
            update_id: updateRecord.id,
            market_status: updateCheck.status
        };
    } catch (error) {
        await updateRecord.fail(error.message);
        logger.error('Data update failed:', error);
        
        return {
            success: false,
            error: error.message,
            update_id: updateRecord.id
        };
    }
}

/**
 * Update a single stock
 * @param {Object} stockData - Stock data
 * @returns {Promise<boolean>} Success status
 */
async function updateSingleStock(stockData) {
    const ticker = stockData.ticker?.toUpperCase();
    if (!ticker) return false;
    
    try {
        const stock = await Stock.findOne({ where: { ticker, is_active: true } });
        
        if (!stock) {
            logger.debug(`Stock ${ticker} not found, skipping`);
            return false;
        }
        
        // Update stock fields
        if (stockData.current_price !== undefined) {
            stock.current_price = stockData.current_price;
        }
        if (stockData.previous_close !== undefined) {
            stock.previous_close = stockData.previous_close;
        }
        if (stockData.open_price !== undefined) {
            stock.open_price = stockData.open_price;
        }
        if (stockData.high_price !== undefined) {
            stock.high_price = stockData.high_price;
        }
        if (stockData.low_price !== undefined) {
            stock.low_price = stockData.low_price;
        }
        if (stockData.volume !== undefined) {
            stock.volume = stockData.volume;
        }
        
        stock.last_update = new Date();
        await stock.save();
        
        // Record price history if we have the data
        if (stockData.current_price && stockData.previous_close) {
            await StockPriceHistory.create({
                stock_id: stock.id,
                date: new Date(),
                open_price: stockData.open_price,
                high_price: stockData.high_price,
                low_price: stockData.low_price,
                close_price: stockData.current_price,
                volume: stockData.volume
            });
        }
        
        return true;
    } catch (error) {
        logger.error(`Failed to update stock ${ticker}:`, error);
        return false;
    }
}

/**
 * Get last update information
 * @param {string} updateType - Type of update
 * @returns {Promise<Object|null>} Last update info
 */
async function getLastUpdate(updateType = 'stocks') {
    const lastUpdate = await MarketUpdateStatus.getLastSuccessfulUpdate(updateType);
    
    if (!lastUpdate) {
        return null;
    }
    
    return {
        id: lastUpdate.id,
        update_type: lastUpdate.update_type,
        status: lastUpdate.status,
        completed_at: lastUpdate.completed_at,
        records_updated: lastUpdate.records_updated,
        trading_date: lastUpdate.trading_date,
        source: lastUpdate.source,
        metadata: lastUpdate.metadata
    };
}

/**
 * Get update history
 * @param {number} days - Number of days to look back
 * @param {string} updateType - Type of update
 * @returns {Promise<Array>} Update history
 */
async function getUpdateHistory(days = 30, updateType = 'stocks') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const history = await MarketUpdateStatus.getHistory(startDate, new Date(), updateType);
    
    return history.map(h => ({
        id: h.id,
        trading_date: h.trading_date,
        status: h.status,
        started_at: h.started_at,
        completed_at: h.completed_at,
        records_updated: h.records_updated,
        source: h.source,
        error_message: h.error_message
    }));
}

/**
 * Check if data needs refresh based on last update
 * @param {number} maxAgeMinutes - Maximum age in minutes
 * @returns {Promise<Object>} Refresh check result
 */
async function checkDataNeedsRefresh(maxAgeMinutes = null) {
    const cacheMinutes = maxAgeMinutes || settings.DATA_CACHE_MINUTES || 5;
    const lastUpdate = await getLastUpdate();
    const marketStatus = getMarketStatus();
    
    if (!lastUpdate) {
        return {
            needs_refresh: true,
            reason: 'No previous update found',
            last_update: null,
            market_status: marketStatus
        };
    }
    
    const lastUpdateTime = new Date(lastUpdate.completed_at);
    const now = new Date();
    const ageMinutes = (now - lastUpdateTime) / (1000 * 60);
    
    if (ageMinutes > cacheMinutes && marketStatus.can_update) {
        return {
            needs_refresh: true,
            reason: `Data is ${Math.round(ageMinutes)} minutes old (max: ${cacheMinutes})`,
            last_update: lastUpdate,
            market_status: marketStatus
        };
    }
    
    return {
        needs_refresh: false,
        reason: 'Data is fresh or outside market hours',
        last_update: lastUpdate,
        age_minutes: Math.round(ageMinutes),
        market_status: marketStatus
    };
}

module.exports = {
    updateStockData,
    updateSingleStock,
    getLastUpdate,
    getUpdateHistory,
    checkDataNeedsRefresh
};
