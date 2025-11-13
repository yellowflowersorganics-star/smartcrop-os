/**
 * Revenue Tracking Controller
 * Handles sales and revenue management
 */

const { Revenue, Harvest, Batch, Zone, Farm } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class RevenueController {
  constructor() {
    // Bind methods
    this.getAllRevenue = this.getAllRevenue.bind(this);
    this.getRevenueById = this.getRevenueById.bind(this);
    this.createRevenue = this.createRevenue.bind(this);
    this.updateRevenue = this.updateRevenue.bind(this);
    this.deleteRevenue = this.deleteRevenue.bind(this);
    this.getRevenueStats = this.getRevenueStats.bind(this);
    this.getRevenueTrends = this.getRevenueTrends.bind(this);
    this.getBatchRevenue = this.getBatchRevenue.bind(this);
    this.getCustomerRevenue = this.getCustomerRevenue.bind(this);
    this.getPendingPayments = this.getPendingPayments.bind(this);
  }

  /**
   * Get all revenue records
   */
  async getAllRevenue(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        startDate,
        endDate,
        revenueType,
        customerType,
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

      if (revenueType) where.revenueType = revenueType;
      if (customerType) where.customerType = customerType;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (zoneId) where.zoneId = zoneId;
      if (batchId) where.batchId = batchId;

      const offset = (page - 1) * limit;

      const { rows: revenues, count: total } = await Revenue.findAndCountAll({
        where,
        include: [
          { model: Harvest, as: 'harvest', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Zone, as: 'zone', required: false },
          { model: Farm, as: 'farm', required: false }
        ],
        order: [['date', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        revenues,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching revenue:', error);
      res.status(500).json({ error: 'Failed to fetch revenue' });
    }
  }

  /**
   * Get single revenue record
   */
  async getRevenueById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const revenue = await Revenue.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: Harvest, as: 'harvest', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Zone, as: 'zone', required: false },
          { model: Farm, as: 'farm', required: false }
        ]
      });

      if (!revenue) {
        return res.status(404).json({ error: 'Revenue record not found' });
      }

      res.json(revenue);
    } catch (error) {
      logger.error('Error fetching revenue:', error);
      res.status(500).json({ error: 'Failed to fetch revenue' });
    }
  }

  /**
   * Create revenue record
   */
  async createRevenue(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const revenueData = {
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null
      };

      const revenue = await Revenue.create(revenueData);

      logger.info(`Created revenue record ${revenue.id}: ${revenue.productName}`);

      res.status(201).json(revenue);
    } catch (error) {
      logger.error('Error creating revenue:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create revenue' });
    }
  }

  /**
   * Update revenue record
   */
  async updateRevenue(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const revenue = await Revenue.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!revenue) {
        return res.status(404).json({ error: 'Revenue record not found' });
      }

      await revenue.update(req.body);

      logger.info(`Updated revenue record ${id}`);

      res.json(revenue);
    } catch (error) {
      logger.error('Error updating revenue:', error);
      res.status(500).json({ error: 'Failed to update revenue' });
    }
  }

  /**
   * Delete revenue record
   */
  async deleteRevenue(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const revenue = await Revenue.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!revenue) {
        return res.status(404).json({ error: 'Revenue record not found' });
      }

      await revenue.destroy();

      logger.info(`Deleted revenue record ${id}`);

      res.json({ message: 'Revenue record deleted successfully' });
    } catch (error) {
      logger.error('Error deleting revenue:', error);
      res.status(500).json({ error: 'Failed to delete revenue' });
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(req, res) {
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

      const [totalRevenue, paidRevenue, pendingRevenue, partialRevenue, quantitySold] = await Promise.all([
        Revenue.sum('finalAmount', { where }),
        Revenue.sum('paidAmount', { where: { ...where, paymentStatus: 'paid' } }),
        Revenue.sum('dueAmount', { where: { ...where, paymentStatus: { [Op.in]: ['pending', 'partial'] } } }),
        Revenue.count({ where: { ...where, paymentStatus: 'partial' } }),
        Revenue.sum('quantity', { where })
      ]);

      // Revenue by type
      const typeStats = await Revenue.findAll({
        where,
        attributes: [
          'revenueType',
          [Revenue.sequelize.fn('COUNT', '*'), 'count'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'total'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('quantity')), 'quantity']
        ],
        group: ['revenueType']
      });

      // Revenue by customer type
      const customerStats = await Revenue.findAll({
        where: { ...where, customerType: { [Op.not]: null } },
        attributes: [
          'customerType',
          [Revenue.sequelize.fn('COUNT', '*'), 'count'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'total']
        ],
        group: ['customerType']
      });

      res.json({
        totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
        paidRevenue: parseFloat(paidRevenue || 0).toFixed(2),
        pendingRevenue: parseFloat(pendingRevenue || 0).toFixed(2),
        partialPayments: parseInt(partialRevenue),
        quantitySold: parseFloat(quantitySold || 0).toFixed(2),
        revenueByType: typeStats.map(stat => ({
          type: stat.revenueType,
          count: parseInt(stat.get('count')),
          total: parseFloat(stat.get('total') || 0).toFixed(2),
          quantity: parseFloat(stat.get('quantity') || 0).toFixed(2)
        })),
        revenueByCustomer: customerStats.map(stat => ({
          customerType: stat.customerType,
          count: parseInt(stat.get('count')),
          total: parseFloat(stat.get('total') || 0).toFixed(2)
        }))
      });
    } catch (error) {
      logger.error('Error fetching revenue stats:', error);
      res.status(500).json({ error: 'Failed to fetch revenue stats' });
    }
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate, revenueType } = req.query;

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

      if (revenueType) where.revenueType = revenueType;

      const trends = await Revenue.findAll({
        where,
        attributes: [
          'date',
          [Revenue.sequelize.fn('COUNT', '*'), 'count'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'total'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('quantity')), 'quantity']
        ],
        group: ['date'],
        order: [['date', 'ASC']]
      });

      res.json(trends.map(trend => ({
        date: trend.date,
        count: parseInt(trend.get('count')),
        total: parseFloat(trend.get('total') || 0).toFixed(2),
        quantity: parseFloat(trend.get('quantity') || 0).toFixed(2)
      })));
    } catch (error) {
      logger.error('Error fetching revenue trends:', error);
      res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
  }

  /**
   * Get batch revenue
   */
  async getBatchRevenue(req, res) {
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

      const revenues = await Revenue.findAll({
        where,
        order: [['date', 'DESC']]
      });

      const total = await Revenue.sum('finalAmount', { where });
      const quantity = await Revenue.sum('quantity', { where });

      res.json({
        batchId,
        revenues,
        totalRevenue: parseFloat(total || 0).toFixed(2),
        totalQuantity: parseFloat(quantity || 0).toFixed(2)
      });
    } catch (error) {
      logger.error('Error fetching batch revenue:', error);
      res.status(500).json({ error: 'Failed to fetch batch revenue' });
    }
  }

  /**
   * Get customer revenue
   */
  async getCustomerRevenue(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { customerName, startDate, endDate } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (customerName) {
        where.customerName = { [Op.like]: `%${customerName}%` };
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = startDate;
        if (endDate) where.date[Op.lte] = endDate;
      }

      const customerRevenue = await Revenue.findAll({
        where,
        attributes: [
          'customerName',
          'customerType',
          [Revenue.sequelize.fn('COUNT', '*'), 'orderCount'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'totalRevenue'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('quantity')), 'totalQuantity'],
          [Revenue.sequelize.fn('AVG', Revenue.sequelize.col('finalAmount')), 'avgOrderValue']
        ],
        group: ['customerName', 'customerType'],
        order: [[Revenue.sequelize.literal('totalRevenue'), 'DESC']]
      });

      res.json(customerRevenue.map(customer => ({
        customerName: customer.customerName,
        customerType: customer.customerType,
        orderCount: parseInt(customer.get('orderCount')),
        totalRevenue: parseFloat(customer.get('totalRevenue') || 0).toFixed(2),
        totalQuantity: parseFloat(customer.get('totalQuantity') || 0).toFixed(2),
        avgOrderValue: parseFloat(customer.get('avgOrderValue') || 0).toFixed(2)
      })));
    } catch (error) {
      logger.error('Error fetching customer revenue:', error);
      res.status(500).json({ error: 'Failed to fetch customer revenue' });
    }
  }

  /**
   * Get pending payments
   */
  async getPendingPayments(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        paymentStatus: { [Op.in]: ['pending', 'partial', 'overdue'] },
        dueAmount: { [Op.gt]: 0 }
      };

      const pendingPayments = await Revenue.findAll({
        where,
        include: [
          { model: Batch, as: 'batch', required: false }
        ],
        order: [['dueDate', 'ASC'], ['date', 'DESC']]
      });

      const totalDue = await Revenue.sum('dueAmount', { where });

      res.json({
        payments: pendingPayments,
        totalDue: parseFloat(totalDue || 0).toFixed(2)
      });
    } catch (error) {
      logger.error('Error fetching pending payments:', error);
      res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
  }
}

module.exports = new RevenueController();

