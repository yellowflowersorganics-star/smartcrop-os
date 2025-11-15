/**
 * CropWise - Subscription Controller (Stub)
 */

class SubscriptionController {
  async getPlans(req, res) {
    const plans = [
      { id: 'basic', name: 'Mushroom Basic', price: 1500, features: ['Climate Control', 'CO₂ Monitoring', 'Basic Light Control'] },
      { id: 'standard', name: 'Vegetable Standard', price: 2500, features: ['All Basic', 'Irrigation', 'EC Sensors', 'Nutrient Control'] },
      { id: 'pro', name: 'Hydroponic Pro', price: 3500, features: ['All Standard', 'pH Control', 'Advanced Analytics'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['All Pro', 'Multi-zone', 'AI Optimization', 'Priority Support'] }
    ];
    res.json({ success: true, data: plans });
  }
  async getCurrentSubscription(req, res) {
    res.json({ success: true, data: {}, message: 'Subscription controller - to be implemented' });
  }
  async createSubscription(req, res) {
    res.json({ success: true, message: 'Subscription controller - to be implemented' });
  }
  async changePlan(req, res) {
    res.json({ success: true, message: 'Subscription controller - to be implemented' });
  }
  async cancelSubscription(req, res) {
    res.json({ success: true, message: 'Subscription controller - to be implemented' });
  }
  async getBillingHistory(req, res) {
    res.json({ success: true, data: [], message: 'Subscription controller - to be implemented' });
  }
  async getInvoice(req, res) {
    res.json({ success: true, data: {}, message: 'Subscription controller - to be implemented' });
  }
  async handleWebhook(req, res) {
    res.json({ success: true, message: 'Webhook received' });
  }
}

module.exports = new SubscriptionController();

