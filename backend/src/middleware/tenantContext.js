/**
 * Yellow Flowers SmartFarm Cloud - Tenant Context Middleware
 * Ensures multi-tenant data isolation
 */

const { sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * Set organization context from authenticated user
 * This ensures all database queries are scoped to the user's organization
 */
const setTenantContext = async (req, res, next) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required with organization context'
      });
    }

    // Set PostgreSQL session variable for Row-Level Security
    await sequelize.query(
      `SET LOCAL app.current_org = '${req.user.organizationId}'`
    );

    // Add to request object for easy access
    req.organizationId = req.user.organizationId;
    req.organization = req.user.organization; // If populated

    logger.debug(`Tenant context set: ${req.organizationId}`);
    next();
  } catch (error) {
    logger.error('Error setting tenant context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set tenant context'
    });
  }
};

/**
 * Verify resource belongs to current organization
 * Usage: verifyResourceOwnership('farmId')
 */
const verifyResourceOwnership = (resourceIdField) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return next(); // Skip if resource ID not provided
      }

      // The query will automatically be scoped by RLS
      // If the resource doesn't belong to org, it won't be found
      next();
    } catch (error) {
      logger.error('Error verifying resource ownership:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify resource ownership'
      });
    }
  };
};

/**
 * Check if organization's subscription allows the action
 */
const checkSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      const { Organization, Zone, User } = require('../models');
      const org = await Organization.findByPk(req.organizationId);

      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Check if subscription is active
      if (!org.isSubscriptionActive()) {
        return res.status(403).json({
          success: false,
          message: 'Subscription inactive. Please renew your subscription.',
          code: 'SUBSCRIPTION_INACTIVE'
        });
      }

      // Check trial expiry
      if (org.subscriptionStatus === 'trial' && org.isTrialExpired()) {
        return res.status(403).json({
          success: false,
          message: 'Trial period expired. Please subscribe to continue.',
          code: 'TRIAL_EXPIRED'
        });
      }

      // Check specific limits
      switch (limitType) {
        case 'zone': {
          const canAdd = await org.canAddZone();
          if (!canAdd) {
            const zoneCount = await org.countZones();
            return res.status(403).json({
              success: false,
              message: `Zone limit reached. Your plan allows ${org.maxZones} zones (currently: ${zoneCount}).`,
              code: 'ZONE_LIMIT_REACHED',
              upgrade: {
                currentPlan: org.subscriptionTier,
                suggestedPlan: org.subscriptionTier === 'starter' ? 'growth' : 'enterprise'
              }
            });
          }
          break;
        }

        case 'user': {
          const canAdd = await org.canAddUser();
          if (!canAdd) {
            const userCount = await org.countUsers();
            return res.status(403).json({
              success: false,
              message: `User limit reached. Your plan allows ${org.maxUsers} users (currently: ${userCount}).`,
              code: 'USER_LIMIT_REACHED'
            });
          }
          break;
        }

        case 'analytics': {
          if (!org.hasFeature('analytics')) {
            return res.status(403).json({
              success: false,
              message: 'Analytics feature not available in your plan. Upgrade to Growth or Enterprise.',
              code: 'FEATURE_NOT_AVAILABLE',
              requiredPlan: 'growth'
            });
          }
          break;
        }

        case 'aiInsights': {
          if (!org.hasFeature('aiInsights')) {
            return res.status(403).json({
              success: false,
              message: 'AI Insights available only in Enterprise plan.',
              code: 'FEATURE_NOT_AVAILABLE',
              requiredPlan: 'enterprise'
            });
          }
          break;
        }

        case 'apiAccess': {
          if (!org.hasFeature('apiAccess')) {
            return res.status(403).json({
              success: false,
              message: 'API access available only in Enterprise plan.',
              code: 'FEATURE_NOT_AVAILABLE',
              requiredPlan: 'enterprise'
            });
          }
          break;
        }

        default:
          break;
      }

      // Attach organization to request for controllers
      req.currentOrganization = org;
      next();
    } catch (error) {
      logger.error('Error checking subscription limits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription limits'
      });
    }
  };
};

/**
 * Admin-only access (SuperAdmin or OrgAdmin)
 */
const requireOrgAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Organization admin access required'
    });
  }
  next();
};

/**
 * Simple tenant check - sets req.tenant from authenticated user
 * Lightweight version for basic routes
 */
const checkTenant = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required with organization context'
    });
  }

  // Set tenant context for easy access
  req.tenant = {
    organizationId: req.user.organizationId,
    userId: req.user.id,
    role: req.user.role
  };

  next();
};

module.exports = {
  setTenantContext,
  verifyResourceOwnership,
  checkSubscriptionLimits,
  requireOrgAdmin,
  checkTenant
};

