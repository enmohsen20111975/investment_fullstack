/**
 * Payment & Subscription Routes
 * Integrates with Paymob for Egyptian subscription payments.
 *
 * Routes:
 *   GET  /api/payment/plans            - List available plans + prices
 *   GET  /api/payment/subscription     - Get current user's subscription
 *   POST /api/payment/initiate         - Start a Paymob payment (returns iframe URL)
 *   POST /api/payment/callback         - Paymob processed-callback (HMAC verified)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { settings } = require('../config');
const logger = require('../logger');
const { User } = require('../models');
const { authenticateApiKey, requireUser } = require('../middleware/auth');
const { initiateSubscriptionPayment, verifyHmac } = require('../services/paymobService');

// ─────────────────────────────────────────────
// Plan definitions (Arabic labels for the UI)
// ─────────────────────────────────────────────
const PLANS = [
    {
        id: 'free',
        name: 'مجاني',
        description: 'الوصول الأساسي لبيانات البورصة',
        price_monthly: 0,
        price_yearly: 0,
        features: [
            'عرض أسعار الأسهم الأساسية',
            'مؤشرات السوق الرئيسية',
            'قائمة مراقبة (حتى 5 أسهم)',
            'فحص الامتثال الشرعي'
        ],
        limits: { watchlist: 5, portfolio: 1, ai_analysis: 0 }
    },
    {
        id: 'pro',
        name: 'احترافي',
        description: 'للمستثمر الجاد',
        price_monthly: settings.PAYMOB_PLAN_PRO_MONTHLY_PRICE / 100,
        price_yearly:  settings.PAYMOB_PLAN_PRO_YEARLY_PRICE  / 100,
        original_yearly: (settings.PAYMOB_PLAN_PRO_MONTHLY_PRICE / 100) * 12,
        yearly_discount_pct: Math.round((1 - settings.PAYMOB_PLAN_PRO_YEARLY_PRICE / (settings.PAYMOB_PLAN_PRO_MONTHLY_PRICE * 12)) * 100),
        features: [
            'كل ميزات الخطة المجانية',
            'تحليل متعمق للأسهم بالذكاء الاصطناعي',
            'قائمة مراقبة غير محدودة',
            'توصيات استثمارية ذكية',
            'تنبيهات الأسعار الفورية',
            'بيانات تاريخية كاملة',
            'محافظ متعددة'
        ],
        limits: { watchlist: -1, portfolio: 10, ai_analysis: 50 }
    },
    {
        id: 'premium',
        name: 'بريميوم',
        description: 'للمحترفين والمؤسسات',
        price_monthly: settings.PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE / 100,
        price_yearly:  settings.PAYMOB_PLAN_PREMIUM_YEARLY_PRICE  / 100,
        original_yearly: (settings.PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE / 100) * 12,
        yearly_discount_pct: Math.round((1 - settings.PAYMOB_PLAN_PREMIUM_YEARLY_PRICE / (settings.PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE * 12)) * 100),
        features: [
            'كل ميزات الخطة الاحترافية',
            'تحليل AI بلا حدود',
            'تقارير متقدمة قابلة للتصدير',
            'API مباشر للبيانات',
            'دعم ذو أولوية',
            'وصول مبكر للميزات الجديدة'
        ],
        limits: { watchlist: -1, portfolio: -1, ai_analysis: -1 }
    }
];

// ─────────────────────────────────────────────
// GET /api/payment/plans
// ─────────────────────────────────────────────
router.get('/plans', (req, res) => {
    res.json({ plans: PLANS });
});

// ─────────────────────────────────────────────
// GET /api/payment/subscription
// ─────────────────────────────────────────────
router.get('/subscription', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['subscription_plan', 'subscription_status', 'subscription_expires_at']
        });

        const plan = PLANS.find(p => p.id === (user.subscription_plan || 'free')) || PLANS[0];
        const isActive = user.subscription_status === 'active' &&
            (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date());

        res.json({
            plan: user.subscription_plan || 'free',
            status: isActive ? 'active' : 'expired',
            expires_at: user.subscription_expires_at,
            features: plan.features,
            limits: plan.limits
        });
    } catch (error) {
        logger.error('Get subscription error:', error);
        res.status(500).json({ detail: 'Failed to get subscription info' });
    }
});

// ─────────────────────────────────────────────
// POST /api/payment/initiate
// Body: { plan: 'pro-monthly' | 'pro-yearly' | 'premium-monthly' | 'premium-yearly' }
// ─────────────────────────────────────────────
router.post('/initiate', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { plan } = req.body;
        const validPlans = ['pro-monthly', 'pro-yearly', 'premium-monthly', 'premium-yearly'];
        if (!plan || !validPlans.includes(plan)) {
            return res.status(400).json({ detail: 'Invalid plan. Choose: ' + validPlans.join(', ') });
        }

        // Build a unique merchant order ID
        const merchantOrderId = `egx-${req.user.id}-${plan}-${Date.now()}`;

        // Split username into first/last for billing
        const nameParts = (req.user.username || 'User').split(' ');
        const billing = {
            email:      req.user.email,
            first_name: nameParts[0],
            last_name:  nameParts[1] || 'EGX',
            phone:      '+20000000000'
        };

        const { iframeUrl, paymobOrderId, amountCents } = await initiateSubscriptionPayment({
            userId: req.user.id,
            plan,
            billing,
            merchantOrderId
        });

        // Store the pending order id on the user
        await User.update(
            { paymob_order_id: paymobOrderId },
            { where: { id: req.user.id } }
        );

        res.json({
            iframe_url:    iframeUrl,
            paymob_order_id: paymobOrderId,
            amount_egp:    amountCents / 100,
            plan
        });
    } catch (error) {
        logger.error('Payment initiate error:', error);
        res.status(500).json({ detail: 'Payment initiation failed: ' + error.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/payment/callback
// Called by Paymob after transaction completes (processed callback)
// ─────────────────────────────────────────────
router.post('/callback', async (req, res) => {
    try {
        const data = req.body?.obj || req.body;

        // Verify HMAC
        if (!verifyHmac(data)) {
            logger.warn('Paymob callback: HMAC verification failed');
            return res.status(400).json({ detail: 'Invalid HMAC' });
        }

        const success  = data.success === true || data.success === 'true';
        const orderId  = String(data.order?.id || data.order || '');

        if (!success) {
            logger.info(`Paymob callback: payment not successful for order ${orderId}`);
            return res.json({ received: true });
        }

        // Find user by stored paymob_order_id
        const user = await User.findOne({ where: { paymob_order_id: orderId } });
        if (!user) {
            logger.warn(`Paymob callback: no user found for order ${orderId}`);
            return res.json({ received: true });
        }

        // Decode plan from merchant_order_id  (format: egx-{userId}-{plan}-{ts})
        const merchantId = data.order?.merchant_order_id || '';
        const planMatch  = merchantId.match(/egx-\d+-(pro|premium)-(monthly|yearly)-/);
        if (!planMatch) {
            logger.warn('Paymob callback: could not parse plan from merchant_order_id', merchantId);
            return res.json({ received: true });
        }

        const planName   = planMatch[1];           // pro | premium
        const billing    = planMatch[2];           // monthly | yearly
        const months     = billing === 'yearly' ? 12 : 1;
        const expiresAt  = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + months);

        await user.update({
            subscription_plan:       planName,
            subscription_status:     'active',
            subscription_expires_at: expiresAt
        });

        logger.info(`Subscription activated: user ${user.id} -> ${planName} (${billing}), expires ${expiresAt.toISOString()}`);
        res.json({ received: true });
    } catch (error) {
        logger.error('Payment callback error:', error);
        res.status(500).json({ detail: 'Callback processing failed' });
    }
});

// ─────────────────────────────────────────────
// GET /api/payment/callback  (Paymob redirect after payment)
// Redirects user back to the subscription page with status
// ─────────────────────────────────────────────
router.get('/callback', (req, res) => {
    const success = req.query.success === 'true';
    res.redirect(`/?payment=${success ? 'success' : 'failed'}`);
});

module.exports = router;
