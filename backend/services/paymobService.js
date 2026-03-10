/**
 * Paymob Payment Service
 * Handles Paymob API integration for subscription payments (Egypt).
 *
 * Flow:
 * 1. authenticate()    -> get auth_token
 * 2. createOrder()     -> get order_id
 * 3. createPaymentKey()-> get payment_key
 * 4. Return iframe URL for the frontend to embed
 * 5. verifyCallback()  -> verify HMAC on webhook/redirect
 */

const https = require('https');
const crypto = require('crypto');
const { settings } = require('../config');
const logger = require('../logger');

const PAYMOB_BASE = 'https://accept.paymob.com/api';

// ─────────────────────────────────────────────
// Internal helper – JSON POST over HTTPS
// ─────────────────────────────────────────────
function jsonPost(url, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let raw = '';
            res.on('data', chunk => { raw += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error('Invalid JSON from Paymob: ' + raw)); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// ─────────────────────────────────────────────
// Step 1 – Authenticate with Paymob
// ─────────────────────────────────────────────
async function authenticate() {
    const result = await jsonPost(`${PAYMOB_BASE}/auth/tokens`, {
        api_key: settings.PAYMOB_API_KEY
    });
    if (!result.token) throw new Error('Paymob auth failed: no token returned');
    return result.token;
}

// ─────────────────────────────────────────────
// Step 2 – Create Paymob Order
// ─────────────────────────────────────────────
async function createOrder(authToken, amountCents, merchantOrderId) {
    const result = await jsonPost(`${PAYMOB_BASE}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId,
        items: []
    });
    if (!result.id) throw new Error('Paymob createOrder failed: ' + JSON.stringify(result));
    return result.id;
}

// ─────────────────────────────────────────────
// Step 3 – Create Payment Key
// ─────────────────────────────────────────────
async function createPaymentKey(authToken, amountCents, orderId, billingData) {
    const result = await jsonPost(`${PAYMOB_BASE}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
            apartment: 'NA',
            email: billingData.email || 'user@invist.m2y.net',
            floor: 'NA',
            first_name: billingData.first_name || 'User',
            street: 'NA',
            building: 'NA',
            phone_number: billingData.phone || '+20000000000',
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'Cairo',
            country: 'EG',
            last_name: billingData.last_name || 'EGX',
            state: 'NA'
        },
        currency: 'EGP',
        integration_id: settings.PAYMOB_INTEGRATION_ID
    });
    if (!result.token) throw new Error('Paymob payment key failed: ' + JSON.stringify(result));
    return result.token;
}

// ─────────────────────────────────────────────
// Build iframe URL
// ─────────────────────────────────────────────
function iframeUrl(paymentToken) {
    return `https://accept.paymob.com/api/acceptance/iframes/${settings.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
}

// ─────────────────────────────────────────────
// Verify Paymob HMAC callback
// ─────────────────────────────────────────────
function verifyHmac(callbackData) {
    const fields = [
        'amount_cents', 'created_at', 'currency', 'error_occured',
        'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
        'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
        'is_voided', 'order', 'owner', 'pending', 'source_data_pan',
        'source_data_sub_type', 'source_data_type', 'success'
    ];
    const str = fields.map(f => String(callbackData[f] ?? '')).join('');
    const hmac = crypto.createHmac('sha512', settings.PAYMOB_HMAC_SECRET)
        .update(str)
        .digest('hex');
    return hmac === callbackData.hmac;
}

// ─────────────────────────────────────────────
// Full flow: initiate a subscription payment
// Returns { iframeUrl, orderId }
// ─────────────────────────────────────────────
async function initiateSubscriptionPayment({ userId, plan, billing, merchantOrderId }) {
    const priceMap = {
        'pro-monthly':     settings.PAYMOB_PLAN_PRO_MONTHLY_PRICE,
        'pro-yearly':      settings.PAYMOB_PLAN_PRO_YEARLY_PRICE,
        'premium-monthly': settings.PAYMOB_PLAN_PREMIUM_MONTHLY_PRICE,
        'premium-yearly':  settings.PAYMOB_PLAN_PREMIUM_YEARLY_PRICE,
    };

    const amountCents = priceMap[plan];
    if (!amountCents) throw new Error(`Unknown plan: ${plan}`);

    logger.info(`Initiating Paymob payment for user ${userId}, plan ${plan}, amount ${amountCents}`);

    const authToken  = await authenticate();
    const orderId    = await createOrder(authToken, amountCents, merchantOrderId);
    const paymentKey = await createPaymentKey(authToken, amountCents, orderId, billing);

    return {
        iframeUrl: iframeUrl(paymentKey),
        paymobOrderId: String(orderId),
        amountCents
    };
}

module.exports = { initiateSubscriptionPayment, verifyHmac };
