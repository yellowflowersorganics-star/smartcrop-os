/**
 * Labor Tracking Controller
 * Handles work logs, clock in/out, and labor cost tracking
 */

const { WorkLog, User, Zone, Batch, Farm, Task } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class LaborController {
  constructor() {
    // Bind methods
    this.clockIn = this.clockIn.bind(this);
    this.clockOut = this.clockOut.bind(this);
    this.getAllWorkLogs = this.getAllWorkLogs.bind(this);
    this.getWorkLogById = this.getWorkLogById.bind(this);
    this.createWorkLog = this.createWorkLog.bind(this);
    this.updateWorkLog = this.updateWorkLog.bind(this);
    this.deleteWorkLog = this.deleteWorkLog.bind(this);
    this.approveWorkLog = this.approveWorkLog.bind(this);
    this.getLaborStats = this.getLaborStats.bind(this);
    this.getLaborCosts = this.getLaborCosts.bind(this);
    this.getMyWorkLogs = this.getMyWorkLogs.bind(this);
    this.getCurrentShift = this.getCurrentShift.bind(this);
  }

  /**
   * Clock in to start work
   */
  async clockIn(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        zoneId,
        batchId,
        farmId,
        taskId,
        category,
        description,
        hourlyRate,
        gpsLocation
      } = req.body;

      // Check if user already has an active shift
      const activeShift = await WorkLog.findOne({
        where: {
          userId,
          clockOut: null,
          status: 'active'
        }
      });

      if (activeShift) {
        return res.status(400).json({
          error: 'Already clocked in',
          activeShift
        });
      }

      const now = new Date();
      const workLog = await WorkLog.create({
        userId,
        organizationId: organizationId || null,
        workDate: now.toISOString().split('T')[0],
        clockIn: now,
        zoneId: zoneId || null,
        batchId: batchId || null,
        farmId: farmId || null,
        taskId: taskId || null,
        category: category || 'other',
        description,
        hourlyRate: hourlyRate || null,
        gpsLocation: gpsLocation || null,
        status: 'active'
      });

      logger.info(`User ${userId} clocked in - WorkLog ${workLog.id}`);

      res.status(201).json({
        success: true,
        data: workLog,
        message: 'Clocked in successfully'
      });
    } catch (error) {
      logger.error('Error clocking in:', error);
      res.status(500).json({ error: 'Failed to clock in' });
    }
  }

  /**
   * Clock out to end work
   */
  async clockOut(req, res) {
    try {
      const userId = req.user.id;
      const {
        workLogId,
        breakMinutes,
        description,
        gpsLocation
      } = req.body;

      let workLog;

      if (workLogId) {
        // Clock out specific work log
        workLog = await WorkLog.findOne({
          where: {
            id: workLogId,
            userId,
            clockOut: null
          }
        });
      } else {
        // Clock out the latest active shift
        workLog = await WorkLog.findOne({
          where: {
            userId,
            clockOut: null,
            status: 'active'
          },
          order: [['clockIn', 'DESC']]
        });
      }

      if (!workLog) {
        return res.status(404).json({ error: 'No active shift found' });
      }

      const now = new Date();
      await workLog.update({
        clockOut: now,
        breakMinutes: breakMinutes || workLog.breakMinutes || 0,
        description: description || workLog.description,
        gpsLocation: gpsLocation || workLog.gpsLocation,
        status: 'completed'
      });

      // Reload to get calculated values
      await workLog.reload();

      logger.info(`User ${userId} clocked out - WorkLog ${workLog.id}`);

      res.json({
        success: true,
        data: workLog,
        message: 'Clocked out successfully'
      });
    } catch (error) {
      logger.error('Error clocking out:', error);
      res.status(500).json({ error: 'Failed to clock out' });
    }
  }

  /**
   * Get current active shift
   */
  async getCurrentShift(req, res) {
    try {
      const userId = req.user.id;

      const activeShift = await WorkLog.findOne({
        where: {
          userId,
          clockOut: null,
          status: 'active'
        },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: Task, as: 'task', required: false }
        ]
      });

      res.json({
        success: true,
        data: activeShift
      });
    } catch (error) {
      logger.error('Error getting current shift:', error);
      res.status(500).json({ error: 'Failed to get current shift' });
    }
  }

  /**
   * Get all work logs
   */
  async getAllWorkLogs(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        startDate,
        endDate,
        workerId,
        status,
        category,
        zoneId,
        batchId,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate) where.workDate = { [Op.gte]: startDate };
      if (endDate) where.workDate = { ...where.workDate, [Op.lte]: endDate };
      if (workerId) where.userId = workerId;
      if (status) where.status = status;
      if (category) where.category = category;
      if (zoneId) where.zoneId = zoneId;
      if (batchId) where.batchId = batchId;

      const offset = (page - 1) * limit;

      const { rows: workLogs, count: total } = await WorkLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'worker',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: Task, as: 'task', required: false }
        ],
        order: [['workDate', 'DESC'], ['clockIn', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        workLogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching work logs:', error);
      res.status(500).json({ error: 'Failed to fetch work logs' });
    }
  }

  /**
   * Get my work logs
   */
  async getMyWorkLogs(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, status } = req.query;

      const where = { userId };

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate[Op.gte] = startDate;
        if (endDate) where.workDate[Op.lte] = endDate;
      }

      if (status) where.status = status;

      const workLogs = await WorkLog.findAll({
        where,
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Task, as: 'task', required: false }
        ],
        order: [['workDate', 'DESC'], ['clockIn', 'DESC']]
      });

      res.json(workLogs);
    } catch (error) {
      logger.error('Error fetching my work logs:', error);
      res.status(500).json({ error: 'Failed to fetch work logs' });
    }
  }

  /**
   * Get single work log
   */
  async getWorkLogById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const workLog = await WorkLog.findOne({
        where: {
          id,
          [Op.or]: [
            { userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: User, as: 'worker', required: false },
          { model: User, as: 'approver', required: false },
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: Task, as: 'task', required: false }
        ]
      });

      if (!workLog) {
        return res.status(404).json({ error: 'Work log not found' });
      }

      res.json(workLog);
    } catch (error) {
      logger.error('Error fetching work log:', error);
      res.status(500).json({ error: 'Failed to fetch work log' });
    }
  }

  /**
   * Create work log manually
   */
  async createWorkLog(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const workLogData = {
        ...req.body,
        organizationId: organizationId || null
      };

      const workLog = await WorkLog.create(workLogData);

      logger.info(`Created work log ${workLog.id}`);

      res.status(201).json(workLog);
    } catch (error) {
      logger.error('Error creating work log:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create work log' });
    }
  }

  /**
   * Update work log
   */
  async updateWorkLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const workLog = await WorkLog.findOne({
        where: {
          id,
          [Op.or]: [
            { userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!workLog) {
        return res.status(404).json({ error: 'Work log not found' });
      }

      await workLog.update(req.body);
      await workLog.reload();

      logger.info(`Updated work log ${id}`);

      res.json(workLog);
    } catch (error) {
      logger.error('Error updating work log:', error);
      res.status(500).json({ error: 'Failed to update work log' });
    }
  }

  /**
   * Delete work log
   */
  async deleteWorkLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const workLog = await WorkLog.findOne({
        where: {
          id,
          [Op.or]: [
            { userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!workLog) {
        return res.status(404).json({ error: 'Work log not found' });
      }

      await workLog.destroy();

      logger.info(`Deleted work log ${id}`);

      res.json({ message: 'Work log deleted successfully' });
    } catch (error) {
      logger.error('Error deleting work log:', error);
      res.status(500).json({ error: 'Failed to delete work log' });
    }
  }

  /**
   * Approve work log
   */
  async approveWorkLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { approved } = req.body;

      const workLog = await WorkLog.findByPk(id);

      if (!workLog) {
        return res.status(404).json({ error: 'Work log not found' });
      }

      await workLog.update({
        status: approved ? 'approved' : 'rejected',
        approvedBy: userId,
        approvedAt: new Date()
      });

      logger.info(`Work log ${id} ${approved ? 'approved' : 'rejected'} by ${userId}`);

      res.json(workLog);
    } catch (error) {
      logger.error('Error approving work log:', error);
      res.status(500).json({ error: 'Failed to approve work log' });
    }
  }

  /**
   * Get labor statistics
   */
  async getLaborStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const where = {
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate[Op.gte] = startDate;
        if (endDate) where.workDate[Op.lte] = endDate;
      }

      const [total, active, completed, totalHours, totalCost] = await Promise.all([
        WorkLog.count({ where }),
        WorkLog.count({ where: { ...where, status: 'active' } }),
        WorkLog.count({ where: { ...where, status: 'completed' } }),
        WorkLog.sum('totalHours', { where: { ...where, clockOut: { [Op.not]: null } } }),
        WorkLog.sum('totalCost', { where: { ...where, clockOut: { [Op.not]: null } } })
      ]);

      // Category distribution
      const categoryStats = await WorkLog.findAll({
        where,
        attributes: [
          'category',
          [WorkLog.sequelize.fn('COUNT', '*'), 'count'],
          [WorkLog.sequelize.fn('SUM', WorkLog.sequelize.col('totalHours')), 'hours'],
          [WorkLog.sequelize.fn('SUM', WorkLog.sequelize.col('totalCost')), 'cost']
        ],
        group: ['category']
      });

      res.json({
        total,
        active,
        completed,
        totalHours: parseFloat(totalHours || 0).toFixed(2),
        totalCost: parseFloat(totalCost || 0).toFixed(2),
        categoryDistribution: categoryStats.map(stat => ({
          category: stat.category,
          count: parseInt(stat.get('count')),
          hours: parseFloat(stat.get('hours') || 0).toFixed(2),
          cost: parseFloat(stat.get('cost') || 0).toFixed(2)
        }))
      });
    } catch (error) {
      logger.error('Error fetching labor stats:', error);
      res.status(500).json({ error: 'Failed to fetch labor stats' });
    }
  }

  /**
   * Get labor costs breakdown
   */
  async getLaborCosts(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const where = {
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        clockOut: { [Op.not]: null }
      };

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate[Op.gte] = startDate;
        if (endDate) where.workDate[Op.lte] = endDate;
      }

      const groupByField = groupBy === 'month' ? 'workDate' : 'workDate';

      const costs = await WorkLog.findAll({
        where,
        attributes: [
          'workDate',
          [WorkLog.sequelize.fn('SUM', WorkLog.sequelize.col('totalHours')), 'totalHours'],
          [WorkLog.sequelize.fn('SUM', WorkLog.sequelize.col('totalCost')), 'totalCost'],
          [WorkLog.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: [groupByField],
        order: [[groupByField, 'ASC']]
      });

      res.json(costs.map(c => ({
        date: c.workDate,
        totalHours: parseFloat(c.get('totalHours') || 0).toFixed(2),
        totalCost: parseFloat(c.get('totalCost') || 0).toFixed(2),
        count: parseInt(c.get('count'))
      })));
    } catch (error) {
      logger.error('Error fetching labor costs:', error);
      res.status(500).json({ error: 'Failed to fetch labor costs' });
    }
  }
}

module.exports = new LaborController();
