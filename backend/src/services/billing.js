/**
 * Yellow Flowers SmartFarm Cloud - Billing Service
 * Handles Razorpay integration and subscription management
 */

const Razorpay = require('razorpay');
const { Organization, Subscription, Invoice } = require('../models');
const logger = require('../utils/logger');

class BillingService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    this.plans = {
      starter: {
        name: 'Starter Plan',
        amount: 150000, // ₹1,500 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1
      },
      growth: {
        name: 'Growth Plan',
        amount: 300000, // ₹3,000 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1
      },
      enterprise: {
        name: 'Enterprise Plan',
        amount: 600000, // ₹6,000 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1
      }
    };
  }

  /**
   * Create Razorpay customer
   */
  async createCustomer(organization, user) {
    try {
      const customer = await this.razorpay.customers.create({
        name: organization.name,
        email: organization.billingEmail || user.email,
        contact: user.phone || '',
        notes: {
          organization_id: organization.id,
          organization_name: organization.name
        }
      });

      await organization.update({
        razorpayCustomerId: customer.id
      });

      logger.info(`Razorpay customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Razorpay customer:', error);
      throw error;
    }
  }

  /**
   * Create subscription plan in Razorpay (if not exists)
   */
  async ensurePlanExists(planType) {
    try {
      const planConfig = this.plans[planType];
      
      // Check if plan already exists
      const existingPlans = await this.razorpay.plans.all();
      const existingPlan = existingPlans.items.find(p => 
        p.notes && p.notes.plan_type === planType
      );

      if (existingPlan) {
        return existingPlan;
      }

      // Create new plan
      const plan = await this.razorpay.plans.create({
        period: planConfig.period,
        interval: planConfig.interval,
        item: {
          name: planConfig.name,
          amount: planConfig.amount,
          currency: planConfig.currency,
          description: `${planConfig.name} - SmartFarm Cloud`
        },
        notes: {
          plan_type: planType
        }
      });

      logger.info(`Razorpay plan created: ${plan.id} (${planType})`);
      return plan;
    } catch (error) {
      logger.error('Error ensuring plan exists:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(organizationId, planType, billingCycle = 'monthly') {
    try {
      const organization = await Organization.findByPk(organizationId);
      
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Ensure customer exists in Razorpay
      if (!organization.razorpayCustomerId) {
        const user = await organization.getUsers({ limit: 1 });
        await this.createCustomer(organization, user[0]);
      }

      // Ensure plan exists
      const plan = await this.ensurePlanExists(planType);

      // Create subscription in Razorpay
      const totalCount = billingCycle === 'annual' ? 12 : 1;
      const razorpaySubscription = await this.razorpay.subscriptions.create({
        plan_id: plan.id,
        customer_id: organization.razorpayCustomerId,
        total_count: totalCount,
        quantity: 1,
        notes: {
          organization_id: organizationId,
          plan_type: planType
        }
      });

      // Create subscription record in database
      const planLimits = Organization.getPlanLimits(planType);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (billingCycle === 'annual' ? 12 : 1));

      const subscription = await Subscription.create({
        organizationId,
        planType,
        status: 'active',
        billingCycle,
        amount: planLimits.price,
        currency: 'INR',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: plan.id
      });

      // Update organization
      await organization.update({
        subscriptionTier: planType,
        subscriptionStatus: 'active',
        maxZones: planLimits.maxZones,
        maxUsers: planLimits.maxUsers,
        features: planLimits.features,
        razorpaySubscriptionId: razorpaySubscription.id,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate
      });

      logger.info(`Subscription created for org ${organizationId}: ${planType}`);
      
      return {
        subscription,
        razorpaySubscription
      };
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook
   */
  async handleWebhook(event, payload) {
    try {
      logger.info(`Razorpay webhook received: ${event}`);

      switch (event) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;

        case 'subscription.charged':
          await this.handleSubscriptionCharged(payload);
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;

        case 'subscription.paused':
          await this.handleSubscriptionPaused(payload);
          break;

        case 'subscription.resumed':
          await this.handleSubscriptionResumed(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        default:
          logger.warn(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handleSubscriptionActivated(payload) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id }
    });

    if (subscription) {
      await subscription.update({ status: 'active' });
      await Organization.update(
        { subscriptionStatus: 'active' },
        { where: { id: subscription.organizationId } }
      );
    }
  }

  async handleSubscriptionCharged(payload) {
    const payment = payload.payment;
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id }
    });

    if (subscription) {
      // Create invoice
      const invoiceNumber = await Invoice.generateInvoiceNumber();
      await Invoice.create({
        invoiceNumber,
        organizationId: subscription.organizationId,
        subscriptionId: subscription.id,
        amount: payment.amount / 100, // Convert paise to rupees
        tax: 0, // Calculate GST if needed
        total: payment.amount / 100,
        status: 'paid',
        dueDate: new Date(),
        paidAt: new Date(),
        razorpayPaymentId: payment.id,
        paymentMethod: payment.method
      });

      logger.info(`Invoice created: ${invoiceNumber}`);
    }
  }

  async handleSubscriptionCancelled(payload) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id }
    });

    if (subscription) {
      await subscription.update({
        status: 'cancelled',
        cancelledAt: new Date()
      });

      await Organization.update(
        { subscriptionStatus: 'cancelled' },
        { where: { id: subscription.organizationId } }
      );
    }
  }

  async handleSubscriptionPaused(payload) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id }
    });

    if (subscription) {
      await subscription.update({ status: 'paused' });
      await Organization.update(
        { subscriptionStatus: 'suspended' },
        { where: { id: subscription.organizationId } }
      );
    }
  }

  async handleSubscriptionResumed(payload) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id }
    });

    if (subscription) {
      await subscription.update({ status: 'active' });
      await Organization.update(
        { subscriptionStatus: 'active' },
        { where: { id: subscription.organizationId } }
      );
    }
  }

  async handlePaymentFailed(payload) {
    const payment = payload.payment;
    // Mark subscription as past_due
    // Send notification to customer
    logger.warn(`Payment failed: ${payment.id}`);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(organizationId, cancelAtPeriodEnd = true) {
    try {
      const organization = await Organization.findByPk(organizationId);
      const subscription = await Subscription.findOne({
        where: {
          organizationId,
          status: 'active'
        }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (cancelAtPeriodEnd) {
        // Cancel at period end
        await this.razorpay.subscriptions.update(
          subscription.razorpaySubscriptionId,
          { cancel_at_cycle_end: 1 }
        );

        await subscription.update({ cancelAtPeriodEnd: true });
      } else {
        // Cancel immediately
        await this.razorpay.subscriptions.cancel(
          subscription.razorpaySubscriptionId
        );

        await subscription.update({
          status: 'cancelled',
          cancelledAt: new Date()
        });

        await organization.update({
          subscriptionStatus: 'cancelled'
        });
      }

      logger.info(`Subscription cancelled for org ${organizationId}`);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Upgrade/downgrade subscription
   */
  async changePlan(organizationId, newPlanType) {
    try {
      // Cancel current subscription
      await this.cancelSubscription(organizationId, false);

      // Create new subscription
      return await this.createSubscription(organizationId, newPlanType);
    } catch (error) {
      logger.error('Error changing plan:', error);
      throw error;
    }
  }
}

module.exports = new BillingService();

