/**
 * Cost Tracking Controller
 * Handles expense tracking and cost management
 */

const { CostEntry, Zone, Batch, Farm, InventoryItem, WorkLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class CostController {
  constructor() {
    // Bind methods
    this.getAllCosts = this.getAllCosts.bind(this);
    this.getCostById = this.getCostById.bind(this);
    this.createCost = this.createCost.bind(this);
    this.updateCost = this.updateCost.bind(this);
    this.deleteCost = this.deleteCost.bind(this);
    this.getCostStats = this.getCostStats.bind(this);
    this.getCostBreakdown = this.getCostBreakdown.bind(this);
    this.getCostTrends = this.getCostTrends.bind(this);
    this.getBatchCosts = this.getBatchCosts.bind(this);
    this.getZoneCosts = this.getZoneCosts.bind(this);
  }

  /**
   * Get all costs
   */
  async getAllCosts(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        startDate,
        endDate,
        category,
        costType,
        paymentStatus,
        zoneId,
        batchId,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      if (category) where.category = category;
      if (costType) where.costType = costType;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (zoneId) where.zoneId = zoneId;
      if (batchId) where.batchId = batchId;

      const offset = (page - 1) * limit;

      const { rows: costs, count: total } = await CostEntry.findAndCountAll({
        where,
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: InventoryItem, as: 'inventoryItem', required: false }
        ],
        order: [['date', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        costs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching costs:', error);
      res.status(500).json({ error: 'Failed to fetch costs' });
    }
  }

  /**
   * Get single cost entry
   */
  async getCostById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const cost = await CostEntry.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: InventoryItem, as: 'inventoryItem', required: false },
          { model: WorkLog, as: 'workLog', required: false }
        ]
      });

      if (!cost) {
        return res.status(404).json({ error: 'Cost entry not found' });
      }

      res.json(cost);
    } catch (error) {
      logger.error('Error fetching cost:', error);
      res.status(500).json({ error: 'Failed to fetch cost' });
    }
  }

  /**
   * Create cost entry
   */
  async createCost(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const costData = {
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null
      };

      const cost = await CostEntry.create(costData);

      logger.info(`Created cost entry ${cost.id}: ${cost.description}`);

      res.status(201).json(cost);
    } catch (error) {
      logger.error('Error creating cost:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create cost' });
    }
  }

  /**
   * Update cost entry
   */
  async updateCost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const cost = await CostEntry.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!cost) {
        return res.status(404).json({ error: 'Cost entry not found' });
      }

      await cost.update(req.body);

      logger.info(`Updated cost entry ${id}`);

      res.json(cost);
    } catch (error) {
      logger.error('Error updating cost:', error);
      res.status(500).json({ error: 'Failed to update cost' });
    }
  }

  /**
   * Delete cost entry
   */
  async deleteCost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const cost = await CostEntry.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!cost) {
        return res.status(404).json({ error: 'Cost entry not found' });
      }

      await cost.destroy();

      logger.info(`Deleted cost entry ${id}`);

      res.json({ message: 'Cost entry deleted successfully' });
    } catch (error) {
      logger.error('Error deleting cost:', error);
      res.status(500).json({ error: 'Failed to delete cost' });
    }
  }

  /**
   * Get cost statistics
   */
  async getCostStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      const [totalCosts, directCosts, indirectCosts, fixedCosts, variableCosts, pendingPayments] = await Promise.all([
        CostEntry.sum('amount', { where }),
        CostEntry.sum('amount', { where: { ...where, costType: 'direct' } }),
        CostEntry.sum('amount', { where: { ...where, costType: 'indirect' } }),
        CostEntry.sum('amount', { where: { ...where, costType: 'fixed' } }),
        CostEntry.sum('amount', { where: { ...where, costType: 'variable' } }),
        CostEntry.sum('amount', { where: { ...where, paymentStatus: { [Op.in]: ['pending', 'partial'] } } })
      ]);

      // Category breakdown
      const categoryStats = await CostEntry.findAll({
        where,
        attributes: [
          'category',
          [CostEntry.sequelize.fn('COUNT', '*'), 'count'],
          [CostEntry.sequelize.fn('SUM', CostEntry.sequelize.col('amount')), 'total']
        ],
        group: ['category']
      });

      res.json({
        totalCosts: parseFloat(totalCosts || 0).toFixed(2),
        directCosts: parseFloat(directCosts || 0).toFixed(2),
        indirectCosts: parseFloat(indirectCosts || 0).toFixed(2),
        fixedCosts: parseFloat(fixedCosts || 0).toFixed(2),
        variableCosts: parseFloat(variableCosts || 0).toFixed(2),
        pendingPayments: parseFloat(pendingPayments || 0).toFixed(2),
        categoryBreakdown: categoryStats.map(stat => ({
          category: stat.category,
          count: parseInt(stat.get('count')),
          total: parseFloat(stat.get('total') || 0).toFixed(2)
        }))
      });
    } catch (error) {
      logger.error('Error fetching cost stats:', error);
      res.status(500).json({ error: 'Failed to fetch cost stats' });
    }
  }

  /**
   * Get cost breakdown by category
   */
  async getCostBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate, groupBy = 'category' } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      const breakdown = await CostEntry.findAll({
        where,
        attributes: [
          groupBy,
          [CostEntry.sequelize.fn('COUNT', '*'), 'count'],
          [CostEntry.sequelize.fn('SUM', CostEntry.sequelize.col('amount')), 'total'],
          [CostEntry.sequelize.fn('AVG', CostEntry.sequelize.col('amount')), 'average']
        ],
        group: [groupBy],
        order: [[CostEntry.sequelize.literal('total'), 'DESC']]
      });

      res.json(breakdown.map(item => ({
        [groupBy]: item[groupBy],
        count: parseInt(item.get('count')),
        total: parseFloat(item.get('total') || 0).toFixed(2),
        average: parseFloat(item.get('average') || 0).toFixed(2)
      })));
    } catch (error) {
      logger.error('Error fetching cost breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch cost breakdown' });
    }
  }

  /**
   * Get cost trends over time
   */
  async getCostTrends(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate, category } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      if (category) where.category = category;

      const trends = await CostEntry.findAll({
        where,
        attributes: [
          'date',
          [CostEntry.sequelize.fn('COUNT', '*'), 'count'],
          [CostEntry.sequelize.fn('SUM', CostEntry.sequelize.col('amount')), 'total']
        ],
        group: ['date'],
        order: [['date', 'ASC']]
      });

      res.json(trends.map(trend => ({
        date: trend.date,
        count: parseInt(trend.get('count')),
        total: parseFloat(trend.get('total') || 0).toFixed(2)
      })));
    } catch (error) {
      logger.error('Error fetching cost trends:', error);
      res.status(500).json({ error: 'Failed to fetch cost trends' });
    }
  }

  /**
   * Get batch costs
   */
  async getBatchCosts(req, res) {
    try {
      const { batchId } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        batchId,
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const costs = await CostEntry.findAll({
        where,
        order: [['date', 'DESC']]
      });

      const total = await CostEntry.sum('amount', { where });

      res.json({
        batchId,
        costs,
        totalCost: parseFloat(total || 0).toFixed(2)
      });
    } catch (error) {
      logger.error('Error fetching batch costs:', error);
      res.status(500).json({ error: 'Failed to fetch batch costs' });
    }
  }

  /**
   * Get zone costs
   */
  async getZoneCosts(req, res) {
    try {
      const { zoneId } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const where = {
        zoneId,
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      const costs = await CostEntry.findAll({
        where,
        order: [['date', 'DESC']]
      });

      const total = await CostEntry.sum('amount', { where });

      res.json({
        zoneId,
        costs,
        totalCost: parseFloat(total || 0).toFixed(2)
      });
    } catch (error) {
      logger.error('Error fetching zone costs:', error);
      res.status(500).json({ error: 'Failed to fetch zone costs' });
    }
  }
}

module.exports = new CostController();

