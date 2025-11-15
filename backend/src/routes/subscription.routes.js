/**
 * CropWise - Subscription & Billing Routes
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get available subscription plans
router.get('/plans', subscriptionController.getPlans);

// Get user's current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Create new subscription
router.post('/subscribe', subscriptionController.createSubscription);

// Upgrade/Downgrade subscription
router.post('/change-plan', subscriptionController.changePlan);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Get billing history
router.get('/billing-history', subscriptionController.getBillingHistory);

// Get invoice
router.get('/invoice/:id', subscriptionController.getInvoice);

// Handle payment webhook (Razorpay/Stripe)
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;

