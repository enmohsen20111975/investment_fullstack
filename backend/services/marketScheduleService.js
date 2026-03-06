/**
 * Market Schedule Service
 * Handles EGX market hours validation and update scheduling.
 * 
 * EGX Market Hours (Egypt/Cairo Time):
 * - Trading Days: Sunday, Monday, Tuesday (as per user requirement)
 * - Trading Hours: 8:00 AM - 4:00 PM Egypt time
 * - Updates allowed only during these hours
 */

const logger = require('../logger');

// Egyptian market trading days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const TRADING_DAYS = [0, 1, 2]; // Sunday, Monday, Tuesday

// Trading hours in Egypt/Cairo timezone
const MARKET_OPEN_HOUR = 8;  // 8:00 AM
const MARKET_CLOSE_HOUR = 16; // 4:00 PM

/**
 * Get current time in Egypt/Cairo timezone
 * @returns {Date} Current Cairo time
 */
function getCairoTime() {
    const now = new Date();
    // Convert to Cairo time (Africa/Cairo is UTC+2 or UTC+3 during DST)
    const cairoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
    return cairoTime;
}

/**
 * Get detailed market status information
 * @returns {Object} Market status details
 */
function getMarketStatus() {
    const cairoTime = getCairoTime();
    const dayOfWeek = cairoTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = cairoTime.getHours();
    const minute = cairoTime.getMinutes();
    
    // Check if today is a trading day
    const isTradingDay = TRADING_DAYS.includes(dayOfWeek);
    
    // Check if within trading hours
    const isWithinHours = hour >= MARKET_OPEN_HOUR && hour < MARKET_CLOSE_HOUR;
    
    // Determine if updates are allowed
    const canUpdate = isTradingDay && isWithinHours;
    
    // Calculate next trading window
    let nextTradingWindow = null;
    if (!canUpdate) {
        nextTradingWindow = getNextTradingWindow(cairoTime, isTradingDay, isWithinHours);
    }
    
    // Format current time for display
    const currentTimeStr = cairoTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Africa/Cairo'
    });
    
    const currentDateStr = cairoTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Cairo'
    });

    return {
        can_update: canUpdate,
        is_trading_day: isTradingDay,
        is_market_hours: isWithinHours,
        current_time: currentTimeStr,
        current_date: currentDateStr,
        timezone: 'Africa/Cairo',
        trading_days: ['Sunday', 'Monday', 'Tuesday'],
        trading_hours: {
            start: `${MARKET_OPEN_HOUR}:00 AM`,
            end: `${MARKET_CLOSE_HOUR > 12 ? MARKET_CLOSE_HOUR - 12 : MARKET_CLOSE_HOUR}:00 ${MARKET_CLOSE_HOUR >= 12 ? 'PM' : 'AM'}`
        },
        day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        next_trading_window: nextTradingWindow,
        cairo_time_iso: cairoTime.toISOString()
    };
}

/**
 * Calculate the next trading window
 * @param {Date} currentCairoTime - Current Cairo time
 * @param {boolean} isTradingDay - Whether today is a trading day
 * @param {boolean} isWithinHours - Whether currently within trading hours
 * @returns {Object} Next trading window details
 */
function getNextTradingWindow(currentCairoTime, isTradingDay, isWithinHours) {
    const hour = currentCairoTime.getHours();
    
    // If today is a trading day but before market hours
    if (isTradingDay && hour < MARKET_OPEN_HOUR) {
        const today = new Date(currentCairoTime);
        today.setHours(MARKET_OPEN_HOUR, 0, 0, 0);
        return {
            date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            time: `${MARKET_OPEN_HOUR}:00 AM`,
            message: `Market opens today at ${MARKET_OPEN_HOUR}:00 AM Egypt time`
        };
    }
    
    // If today is a trading day but after market hours
    if (isTradingDay && hour >= MARKET_CLOSE_HOUR) {
        // Find next trading day
        return getNextTradingDayWindow(currentCairoTime);
    }
    
    // If not a trading day, find next trading day
    return getNextTradingDayWindow(currentCairoTime);
}

/**
 * Get the next trading day's opening window
 * @param {Date} currentCairoTime - Current Cairo time
 * @returns {Object} Next trading day window
 */
function getNextTradingDayWindow(currentCairoTime) {
    let nextDay = new Date(currentCairoTime);
    let daysChecked = 0;
    
    while (daysChecked < 7) {
        nextDay.setDate(nextDay.getDate() + 1);
        daysChecked++;
        
        if (TRADING_DAYS.includes(nextDay.getDay())) {
            nextDay.setHours(MARKET_OPEN_HOUR, 0, 0, 0);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return {
                date: nextDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                time: `${MARKET_OPEN_HOUR}:00 AM`,
                message: `Next trading window: ${dayNames[nextDay.getDay()]} at ${MARKET_OPEN_HOUR}:00 AM Egypt time`
            };
        }
    }
    
    return {
        date: null,
        time: null,
        message: 'Unable to determine next trading window'
    };
}

/**
 * Check if data update should be allowed based on market schedule
 * @param {boolean} forceUpdate - Force update regardless of schedule
 * @returns {Object} { allowed: boolean, reason: string, status: Object }
 */
function shouldAllowUpdate(forceUpdate = false) {
    const status = getMarketStatus();
    
    if (forceUpdate) {
        logger.info('Force update requested, bypassing market schedule');
        return {
            allowed: true,
            reason: 'Force update requested',
            status
        };
    }
    
    if (!status.is_trading_day) {
        return {
            allowed: false,
            reason: `Not a trading day. Today is ${status.day_of_week}. Trading days are: ${status.trading_days.join(', ')}`,
            status
        };
    }
    
    if (!status.is_market_hours) {
        return {
            allowed: false,
            reason: `Outside market hours. Current time: ${status.current_time}. Market hours: ${status.trading_hours.start} - ${status.trading_hours.end} Egypt time`,
            status
        };
    }
    
    return {
        allowed: true,
        reason: 'Within trading hours',
        status
    };
}

/**
 * Get trading days for a given month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Array<Date>} Array of trading days
 */
function getTradingDaysForMonth(year, month) {
    const tradingDays = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
        if (TRADING_DAYS.includes(date.getDay())) {
            tradingDays.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    
    return tradingDays;
}

/**
 * Check if a specific date is a trading day
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
function isTradingDay(date) {
    // Convert to Cairo timezone for consistent day calculation
    const cairoDate = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
    return TRADING_DAYS.includes(cairoDate.getDay());
}

/**
 * Get market open and close times for a specific date
 * @param {Date} date - Date to get times for
 * @returns {Object} { open: Date, close: Date } in UTC
 */
function getMarketHoursForDate(date) {
    const cairoDate = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
    
    // Create market open time (8:00 AM Cairo)
    const openTime = new Date(cairoDate);
    openTime.setHours(MARKET_OPEN_HOUR, 0, 0, 0);
    
    // Create market close time (4:00 PM Cairo)
    const closeTime = new Date(cairoDate);
    closeTime.setHours(MARKET_CLOSE_HOUR, 0, 0, 0);
    
    return {
        open: openTime,
        close: closeTime
    };
}

module.exports = {
    getCairoTime,
    getMarketStatus,
    shouldAllowUpdate,
    getTradingDaysForMonth,
    isTradingDay,
    getMarketHoursForDate,
    TRADING_DAYS,
    MARKET_OPEN_HOUR,
    MARKET_CLOSE_HOUR
};
