/**
 * Authentication Routes
 * Handles user registration, login, and API key management.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const { settings } = require('../config');
const logger = require('../logger');
const { User, APIKey } = require('../models');
const {
    generateApiKey,
    hashApiKey,
    hashPassword,
    verifyPassword,
    generateToken,
    authenticateApiKey,
    requireUser
} = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, halal_only_preference, default_risk_tolerance } = req.body;

        // Validate input
        if (!email || !username || !password) {
            return res.status(400).json({
                detail: 'Email, username, and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                detail: 'Password must be at least 8 characters'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                detail: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Create user
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email,
            username,
            hashed_password: hashedPassword,
            halal_only_preference: halal_only_preference || false,
            default_risk_tolerance: default_risk_tolerance || 'medium'
        });

        // Generate API key
        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        await APIKey.create({
            user_id: user.id,
            key_hash: keyHash,
            name: 'Default API Key'
        });

        logger.info(`User registered: ${username}`);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            api_key: rawKey  // Only shown once!
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ detail: 'Registration failed' });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Login and get API key
 */
router.post('/login', async (req, res) => {
    try {
        const { username_or_email, password, key_name, expires_in_days } = req.body;

        if (!username_or_email || !password) {
            return res.status(400).json({
                detail: 'Username/email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: username_or_email },
                    { username: username_or_email }
                ]
            }
        });

        if (!user || !(await verifyPassword(password, user.hashed_password))) {
            return res.status(401).json({
                detail: 'Invalid credentials'
            });
        }

        // Generate new API key
        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        const expiresAt = expires_in_days
            ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
            : null;

        await APIKey.create({
            user_id: user.id,
            key_hash: keyHash,
            name: key_name || 'Login API Key',
            expires_at: expiresAt
        });

        // Update last login
        await user.update({ last_login: new Date() });

        logger.info(`User logged in: ${user.username}`);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                halal_only_preference: user.halal_only_preference,
                default_risk_tolerance: user.default_risk_tolerance
            },
            api_key: rawKey
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ detail: 'Login failed' });
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
router.get('/me', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['hashed_password'] }
        });

        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({ detail: 'Failed to get user' });
    }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout (revoke current API key)
 */
router.post('/logout', authenticateApiKey, requireUser, async (req, res) => {
    try {
        if (req.apiKey) {
            await req.apiKey.update({ is_active: false });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ detail: 'Logout failed' });
    }
});

/**
 * @route GET /api/auth/google/config
 * @desc Get Google OAuth configuration
 */
router.get('/google/config', (req, res) => {
    res.json({
        enabled: !!settings.GOOGLE_CLIENT_ID,
        client_id: settings.GOOGLE_CLIENT_ID
    });
});

/**
 * @route POST /api/auth/google
 * @desc Login or register with Google ID token (Google One Tap / Sign-In)
 */
router.post('/google', async (req, res) => {
    try {
        const { id_token } = req.body;

        if (!id_token) {
            return res.status(400).json({ detail: 'ID token is required' });
        }

        if (!settings.GOOGLE_CLIENT_ID) {
            return res.status(400).json({ detail: 'Google OAuth is not configured on this server' });
        }

        // Verify Google ID token
        const client = new OAuth2Client(settings.GOOGLE_CLIENT_ID);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: id_token,
                audience: settings.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            logger.warn('Google token verification failed:', verifyError.message);
            return res.status(401).json({ detail: 'Invalid Google token' });
        }

        const { email, name, sub: googleId, picture } = payload;

        if (!email) {
            return res.status(400).json({ detail: 'Could not retrieve email from Google account' });
        }

        // Find existing user by email, or create a new one
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Auto-generate a username from Google name or email
            const baseUsername = (name || email.split('@')[0])
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .slice(0, 30) || 'user';

            // Ensure username is unique
            let username = baseUsername;
            let suffix = 1;
            while (await User.findOne({ where: { username } })) {
                username = `${baseUsername}${suffix++}`;
            }

            user = await User.create({
                email,
                username,
                hashed_password: null,   // Google users have no password
                is_active: true
            });

            logger.info(`New user registered via Google: ${email}`);
        } else {
            logger.info(`Existing user logged in via Google: ${email}`);
        }

        if (!user.is_active) {
            return res.status(403).json({ detail: 'Account is disabled' });
        }

        // Generate API key for the session
        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        await APIKey.create({
            user_id: user.id,
            key_hash: keyHash,
            name: 'Google Login'
        });

        await user.update({ last_login: new Date() });

        res.json({
            message: 'تم تسجيل الدخول عبر Google بنجاح',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                halal_only_preference: user.halal_only_preference,
                default_risk_tolerance: user.default_risk_tolerance
            },
            api_key: rawKey
        });
    } catch (error) {
        logger.error('Google login error:', error);
        res.status(500).json({ detail: 'Google login failed' });
    }
});

module.exports = router;