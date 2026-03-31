/**
 * Authentication Middleware
 * Handles API key validation and user authentication.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { settings } = require('../config');
const logger = require('../logger');
const { APIKey, User } = require('../models');

/**
 * Generate a random API key
 * @param {number} length - Length of the key
 * @returns {string} Generated API key
 */
const generateApiKey = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash an API key for storage
 * @param {string} key - API key to hash
 * @returns {string} Hashed key
 */
const hashApiKey = (key) => {
    return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Hash a password
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

/**
 * Verify a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} Whether password matches
 */
const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, settings.SECRET_KEY, {
        expiresIn: `${settings.ACCESS_TOKEN_EXPIRE_MINUTES}m`
    });
};

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {Object|null} Decoded payload or null
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, settings.SECRET_KEY);
    } catch (error) {
        return null;
    }
};

/**
 * Middleware to authenticate requests using API key
 */
const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers[settings.API_KEY_HEADER.toLowerCase()];

        if (!apiKey) {
            return res.status(401).json({
                detail: 'API key is required',
                error: 'missing_api_key'
            });
        }

        // Check against static API keys first
        if (settings.API_KEYS.includes(apiKey)) {
            req.user = { id: null, is_static_key: true };
            return next();
        }

        // Check against database API keys
        const keyHash = hashApiKey(apiKey);
        const apiKeyRecord = await APIKey.findOne({
            where: { key_hash: keyHash, is_active: true },
            include: [{ model: User, as: 'user' }]
        });

        if (!apiKeyRecord) {
            return res.status(401).json({
                detail: 'Invalid API key',
                error: 'invalid_api_key'
            });
        }

        // Check expiration
        if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
            return res.status(401).json({
                detail: 'API key has expired',
                error: 'expired_api_key'
            });
        }

        // Update last used
        await apiKeyRecord.update({ last_used: new Date() });

        // Attach user to request
        req.user = apiKeyRecord.user;
        req.apiKey = apiKeyRecord;

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(500).json({
            detail: 'Authentication failed',
            error: 'auth_error'
        });
    }
};

/**
 * Optional authentication - doesn't fail if no API key provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers[settings.API_KEY_HEADER.toLowerCase()];

        if (!apiKey) {
            req.user = null;
            return next();
        }

        // Use regular auth if key is provided
        return authenticateApiKey(req, res, next);
    } catch (error) {
        req.user = null;
        next();
    }
};

/**
 * Middleware to require authenticated user (not just static key)
 */
const requireUser = (req, res, next) => {
    if (!req.user || req.user.is_static_key) {
        return res.status(401).json({
            detail: 'User authentication required',
            error: 'user_auth_required'
        });
    }
    next();
};

module.exports = {
    generateApiKey,
    hashApiKey,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    authenticateApiKey,
    optionalAuth,
    requireUser
};