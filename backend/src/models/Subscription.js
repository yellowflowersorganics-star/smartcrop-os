/**
 * Yellow Flowers SmartFarm Cloud - Subscription Model
 * Tracks subscription history and billing cycles
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Organization this subscription belongs to'
    },
    planType: {
      type: DataTypes.ENUM('starter', 'growth', 'enterprise'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'past_due', 'paused'),
      defaultValue: 'active'
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'annual'),
      defaultValue: 'monthly'
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Amount in rupees (₹)'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Will cancel at end of current period'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Razorpay fields
    razorpaySubscriptionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    razorpayPlanId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Discount/coupon
    discountPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['status'] },
      { fields: ['razorpaySubscriptionId'] }
    ]
  });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Subscription.hasMany(models.Invoice, {
      foreignKey: 'subscriptionId',
      as: 'invoices'
    });
  };

  return Subscription;
};

