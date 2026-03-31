/**
 * Configuration module for EGX Investment API
 * Handles environment variables, database settings, and API configuration.
 */

require('dotenv').config();

const { NODE_ENV = 'production' } = process.env;

const settings = {
    // Application
    APP_NAME: process.env.APP_NAME || 'EGX Investment API',
    APP_VERSION: process.env.APP_VERSION || '1.0.0',
    DEBUG: process.env.DEBUG === 'true',
    ENVIRONMENT: NODE_ENV,

    // Database - SQLite for development (no PostgreSQL required)
    // For production with PostgreSQL, use: postgresql://user:pass@host:5432/db
    DATABASE_URL: process.env.DATABASE_URL || 'sqlite://./egx_investment.db',

    // Security
    API_KEY_HEADER: process.env.API_KEY_HEADER || 'X-API-Key',
    API_KEYS: (process.env.API_KEYS || 'default-api-key-change-in-production').split(',').map(key => key.trim()),
    SECRET_KEY: process.env.SECRET_KEY || 'your-secret-key-change-in-production',
    ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 30,

    // CORS
    CORS_ORIGINS: (process.env.CORS_ORIGINS || '*').split(',').map(origin => origin.trim()),
    CORS_ALLOW_CREDENTIALS: process.env.CORS_ALLOW_CREDENTIALS === 'true',
    CORS_ALLOW_METHODS: (process.env.CORS_ALLOW_METHODS || '*').split(',').map(method => method.trim()),
    CORS_ALLOW_HEADERS: (process.env.CORS_ALLOW_HEADERS || '*').split(',').map(header => header.trim()),

    // Scheduler
    SCHEDULER_ENABLED: process.env.SCHEDULER_ENABLED !== 'false',
    DATA_UPDATE_INTERVAL_MINUTES: parseInt(process.env.DATA_UPDATE_INTERVAL_MINUTES) || 15,
    TRADING_START_HOUR: parseInt(process.env.TRADING_START_HOUR) || 8,   // 8 AM Cairo time
    TRADING_END_HOUR: parseInt(process.env.TRADING_END_HOUR) || 16,      // 4 PM Cairo time
    TRADING_DAYS: (process.env.TRADING_DAYS || '0,1,2').split(',').map(Number),  // Sunday=0, Monday=1, Tuesday=2

    // Data Sources
    YFINANCE_ENABLED: process.env.YFINANCE_ENABLED !== 'false',
    EGXPY_ENABLED: process.env.EGXPY_ENABLED === 'true',  // Enable when EGXPY is available
    DATA_CACHE_MINUTES: parseInt(process.env.DATA_CACHE_MINUTES) || 5,

    // External APIs
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY || '821e4b4a88874941af581ad4d3141d93',
    EODHD_API_KEY: process.env.EODHD_API_KEY || '6990ef9ee966c5.41761316',

    // Together.ai for AI-powered features
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || 'key_CUJoQk5chstN2WCQmjzJT',
    TOGETHER_MODEL: process.env.TOGETHER_MODEL || 'Qwen3-Next-80B-A3B-Instruct',

    // User API Key for authentication
    USER_API_KEY: process.env.USER_API_KEY || '2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e',

    // Paymob Payment Gateway
    PAYMOB_API_KEY: process.env.PAYMOB_API_KEY || '',
    PAYMOB_SECRET_KEY: process.env.PAYMOB_SECRET_KEY || '',
    PAYMOB_PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY || '',
    PAYMOB_INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || '',
    PAYMOB_IFRAME_ID: process.env.PAYMOB_IFRAME_ID || '',
    PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',
    PAYMOB_PLAN_PRO_MONTHLY_PRICE: parseInt(process.env.PAYMOB_PLAN_PRO_MONTHLY_PRICE) || 9900,
    PAYMOB_PLAN_PRO_YEARLY_PRICE: parseInt(process.env.PAYMOB_PLAN_PRO_YEARLY_PRICE) || 79000,
    PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE: parseInt(process.env.PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE) || 19900,
    PAYMOB_PLAN_PREMIUM_YEARLY_PRICE: parseInt(process.env.PAYMOB_PLAN_PREMIUM_YEARLY_PRICE) || 149000,

    // Google OAuth (Web)
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log'
};

// Constants for Shariah compliance
const HALAL_STOCKS = [
    "ETEL",  // Telecom Egypt
    "ABUK",  // Abu Qir Fertilizers
    "JUFO",  // Juhayna Food
    "ESRS",  // Ezz Steel Rebar
    "MFPC",  // Misr Fertilizers
    "SKPC",  // Sidi Kerir Petrochemicals
    "APRI",  // Alexandria Mineral Oils
    "ETRS",  // Egyptian Transport
    "SWDY",  // Elsewedy Electric
    "ORHD",  // Orascom Development
    "AMER",  // Amer Group
    "PIONEER",  // Pioneer Holding
    "HELI",  // Heliopolis Housing
    "MNHD",  // Madinet Nasr Housing
    "OCDI",  // Orascom Construction
    "ODIL",  // Orascom Development
    "ESPH",  // Egyptian Starch & Yeast
];

const HARAM_STOCKS = [
    "COMI",  // Commercial International Bank (riba-based)
    "CIEB",  // Credit Agricole Egypt (riba-based)
    "ETAL",  // Arab Banking Corp (riba-based)
    "FWRY",  // Fawry (controversial - digital payments with interest)
    "BTFH",  // B-Tech (consumer financing with interest)
];

// EGX 33 Shariah Compliant Index constituents
const EGX_33_SHARIAH = [
    "ETEL", "ABUK", "JUFO", "ESRS", "MFPC", "SKPC", "APRI",
    "ETRS", "SWDY", "ORHD", "AMER", "PIONEER", "HELI", "MNHD"
];

// Compliance notes
const COMPLIANCE_NOTES = {
    "halal": "This investment is halal according to Shariah standards (EGX 33 Shariah Compliant).",
    "haram": "This investment is haram due to riba (interest) or non-compliant business activities.",
    "unknown": "Shariah compliance status is unknown. Please consult a qualified Islamic scholar.",
    "controversial": "This investment has controversial Shariah status. Some scholars consider it halal while others consider it haram."
};

// Investment types and their default compliance
const INVESTMENT_TYPES = {
    "stock": { "default_compliance": "unknown" },
    "gold": { "default_compliance": "halal" },
    "crypto": { "default_compliance": "haram" },
    "bond": { "default_compliance": "haram" },
    "sukuk": { "default_compliance": "halal" },
    "reit": { "default_compliance": "unknown" },  // Depends on the REIT's activities
    "fund": { "default_compliance": "unknown" },  // Depends on fund composition
};

module.exports = {
    settings,
    HALAL_STOCKS,
    HARAM_STOCKS,
    EGX_33_SHARIAH,
    COMPLIANCE_NOTES,
    INVESTMENT_TYPES
};