/**
 * Yellow Flowers SmartFarm Cloud - Organization Model
 * Multi-tenant customer/organization management
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Organization/Company name'
    },
    subdomain: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      comment: 'Custom subdomain: {subdomain}.yellowflowers.tech'
    },
    subscriptionTier: {
      type: DataTypes.ENUM('trial', 'starter', 'growth', 'enterprise'),
      defaultValue: 'trial',
      comment: 'Current subscription plan'
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('trial', 'active', 'past_due', 'suspended', 'cancelled'),
      defaultValue: 'trial',
      comment: 'Current subscription status'
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '14-day trial period end date'
    },
    maxZones: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Maximum zones allowed per subscription tier'
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      comment: 'Maximum users allowed'
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {
        cloudSync: false,
        analytics: false,
        aiInsights: false,
        apiAccess: false,
        whiteLabel: false
      },
      comment: 'Enabled features per tier'
    },
    billingEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    billingAddress: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'GST number for Indian customers'
    },
    // Razorpay integration
    razorpayCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Razorpay customer ID'
    },
    razorpaySubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Active Razorpay subscription ID'
    },
    // Usage tracking
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Settings
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Kolkata'
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Organization-specific settings'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'organizations',
    timestamps: true,
    indexes: [
      { fields: ['subdomain'] },
      { fields: ['subscriptionStatus'] },
      { fields: ['subscriptionTier'] }
    ]
  });

  // Instance methods
  Organization.prototype.canAddZone = async function() {
    const zoneCount = await this.countZones();
    return zoneCount < this.maxZones;
  };

  Organization.prototype.canAddUser = async function() {
    const userCount = await this.countUsers();
    return userCount < this.maxUsers;
  };

  Organization.prototype.hasFeature = function(featureName) {
    return this.features[featureName] === true;
  };

  Organization.prototype.isSubscriptionActive = function() {
    return ['trial', 'active'].includes(this.subscriptionStatus);
  };

  Organization.prototype.isTrialExpired = function() {
    if (!this.trialEndsAt) return false;
    return new Date() > this.trialEndsAt;
  };

  // Class methods
  Organization.getPlanLimits = (tier) => {
    const limits = {
      trial: {
        maxZones: 1,
        maxUsers: 2,
        features: {
          cloudSync: false,
          analytics: false,
          aiInsights: false,
          apiAccess: false,
          whiteLabel: false
        },
        price: 0,
        duration: 14 // days
      },
      starter: {
        maxZones: 1,
        maxUsers: 3,
        features: {
          cloudSync: false,
          analytics: false,
          aiInsights: false,
          apiAccess: false,
          whiteLabel: false
        },
        price: 1500 // ₹1,500/month
      },
      growth: {
        maxZones: 5,
        maxUsers: 10,
        features: {
          cloudSync: true,
          analytics: true,
          aiInsights: false,
          apiAccess: false,
          whiteLabel: false
        },
        price: 3000 // ₹3,000/month
      },
      enterprise: {
        maxZones: 10,
        maxUsers: 50,
        features: {
          cloudSync: true,
          analytics: true,
          aiInsights: true,
          apiAccess: true,
          whiteLabel: true
        },
        price: 6000 // ₹6,000/month (can be custom)
      }
    };
    
    return limits[tier];
  };

  Organization.associate = (models) => {
    Organization.hasMany(models.User, {
      foreignKey: 'organizationId',
      as: 'users'
    });
    Organization.hasMany(models.Farm, {
      foreignKey: 'organizationId',
      as: 'farms'
    });
    Organization.hasMany(models.Unit, {
      foreignKey: 'organizationId',
      as: 'units'
    });
    Organization.hasMany(models.Zone, {
      foreignKey: 'organizationId',
      as: 'zones'
    });
    Organization.hasMany(models.Device, {
      foreignKey: 'organizationId',
      as: 'devices'
    });
    Organization.hasOne(models.Subscription, {
      foreignKey: 'organizationId',
      as: 'subscription'
    });
  };

  return Organization;
};

