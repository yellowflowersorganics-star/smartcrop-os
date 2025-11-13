/**
 * Profitability Analytics Service
 * Calculate ROI, profit margins, and financial metrics
 */

const { CostEntry, Revenue, WorkLog, Batch, Harvest } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ProfitabilityService {
  /**
   * Calculate overall profitability
   */
  async calculateOverallProfitability(userId, organizationId, startDate, endDate) {
    try {
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

      // Get total revenue
      const totalRevenue = await Revenue.sum('finalAmount', { where }) || 0;

      // Get total costs
      const totalCosts = await CostEntry.sum('amount', { where }) || 0;

      // Get total labor costs
      const laborWhere = {
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        clockOut: { [Op.not]: null }
      };

      if (startDate || endDate) {
        laborWhere.workDate = {};
        if (startDate) laborWhere.workDate[Op.gte] = startDate;
        if (endDate) laborWhere.workDate[Op.lte] = endDate;
      }

      const totalLaborCosts = await WorkLog.sum('totalCost', { where: laborWhere }) || 0;

      // Calculate metrics
      const totalExpenses = parseFloat(totalCosts) + parseFloat(totalLaborCosts);
      const profit = parseFloat(totalRevenue) - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

      return {
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        totalCosts: parseFloat(totalCosts).toFixed(2),
        totalLaborCosts: parseFloat(totalLaborCosts).toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        grossProfit: profit.toFixed(2),
        profitMargin: profitMargin.toFixed(2),
        roi: roi.toFixed(2)
      };
    } catch (error) {
      logger.error('Error calculating overall profitability:', error);
      throw error;
    }
  }

  /**
   * Calculate batch profitability
   */
  async calculateBatchProfitability(batchId, userId, organizationId) {
    try {
      const batch = await Batch.findOne({
        where: { batchNumber: batchId }
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Get batch revenue
      const revenueWhere = {
        batchId,
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const batchRevenue = await Revenue.sum('finalAmount', { where: revenueWhere }) || 0;

      // Get batch costs
      const costWhere = {
        batchId,
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const batchCosts = await CostEntry.sum('amount', { where: costWhere }) || 0;

      // Get batch labor costs
      const laborWhere = {
        batchId,
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        clockOut: { [Op.not]: null }
      };

      const batchLaborCosts = await WorkLog.sum('totalCost', { where: laborWhere }) || 0;

      // Get batch harvest data
      const harvests = await Harvest.findAll({
        where: { batchId }
      });

      const totalYield = harvests.reduce((sum, h) => sum + parseFloat(h.totalWeightKg || 0), 0);
      const flushCount = harvests.length;

      // Calculate metrics
      const totalExpenses = parseFloat(batchCosts) + parseFloat(batchLaborCosts);
      const profit = parseFloat(batchRevenue) - totalExpenses;
      const profitMargin = batchRevenue > 0 ? (profit / batchRevenue) * 100 : 0;
      const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;
      const revenuePerKg = totalYield > 0 ? batchRevenue / totalYield : 0;
      const costPerKg = totalYield > 0 ? totalExpenses / totalYield : 0;

      return {
        batchId,
        cropName: batch.cropName,
        status: batch.status,
        startDate: batch.startDate,
        endDate: batch.actualEndDate || batch.expectedEndDate,
        totalRevenue: parseFloat(batchRevenue).toFixed(2),
        totalCosts: parseFloat(batchCosts).toFixed(2),
        totalLaborCosts: parseFloat(batchLaborCosts).toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        grossProfit: profit.toFixed(2),
        profitMargin: profitMargin.toFixed(2),
        roi: roi.toFixed(2),
        totalYield: totalYield.toFixed(2),
        flushCount,
        revenuePerKg: revenuePerKg.toFixed(2),
        costPerKg: costPerKg.toFixed(2),
        profitPerKg: (revenuePerKg - costPerKg).toFixed(2)
      };
    } catch (error) {
      logger.error('Error calculating batch profitability:', error);
      throw error;
    }
  }

  /**
   * Get profitability trends over time
   */
  async getProfitabilityTrends(userId, organizationId, startDate, endDate, groupBy = 'day') {
    try {
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

      // Get revenue by date
      const revenues = await Revenue.findAll({
        where,
        attributes: [
          'date',
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'total']
        ],
        group: ['date'],
        order: [['date', 'ASC']],
        raw: true
      });

      // Get costs by date
      const costs = await CostEntry.findAll({
        where,
        attributes: [
          'date',
          [CostEntry.sequelize.fn('SUM', CostEntry.sequelize.col('amount')), 'total']
        ],
        group: ['date'],
        order: [['date', 'ASC']],
        raw: true
      });

      // Get labor costs by date
      const laborWhere = {
        [Op.or]: [
          { userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        clockOut: { [Op.not]: null }
      };

      if (startDate || endDate) {
        laborWhere.workDate = {};
        if (startDate) laborWhere.workDate[Op.gte] = startDate;
        if (endDate) laborWhere.workDate[Op.lte] = endDate;
      }

      const laborCosts = await WorkLog.findAll({
        where: laborWhere,
        attributes: [
          'workDate',
          [WorkLog.sequelize.fn('SUM', WorkLog.sequelize.col('totalCost')), 'total']
        ],
        group: ['workDate'],
        order: [['workDate', 'ASC']],
        raw: true
      });

      // Merge data by date
      const dateMap = new Map();

      revenues.forEach(r => {
        const date = r.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, revenue: 0, costs: 0, laborCosts: 0 });
        }
        dateMap.get(date).revenue = parseFloat(r.total || 0);
      });

      costs.forEach(c => {
        const date = c.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, revenue: 0, costs: 0, laborCosts: 0 });
        }
        dateMap.get(date).costs = parseFloat(c.total || 0);
      });

      laborCosts.forEach(l => {
        const date = l.workDate;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, revenue: 0, costs: 0, laborCosts: 0 });
        }
        dateMap.get(date).laborCosts = parseFloat(l.total || 0);
      });

      // Calculate profit for each date
      const trends = Array.from(dateMap.values()).map(day => {
        const totalExpenses = day.costs + day.laborCosts;
        const profit = day.revenue - totalExpenses;
        const profitMargin = day.revenue > 0 ? (profit / day.revenue) * 100 : 0;

        return {
          date: day.date,
          revenue: day.revenue.toFixed(2),
          costs: day.costs.toFixed(2),
          laborCosts: day.laborCosts.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          profit: profit.toFixed(2),
          profitMargin: profitMargin.toFixed(2)
        };
      });

      return trends.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      logger.error('Error getting profitability trends:', error);
      throw error;
    }
  }

  /**
   * Get cost breakdown by category
   */
  async getCostBreakdown(userId, organizationId, startDate, endDate) {
    try {
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
          'category',
          [CostEntry.sequelize.fn('COUNT', '*'), 'count'],
          [CostEntry.sequelize.fn('SUM', CostEntry.sequelize.col('amount')), 'total']
        ],
        group: ['category'],
        order: [[CostEntry.sequelize.literal('total'), 'DESC']]
      });

      return breakdown.map(item => ({
        category: item.category,
        count: parseInt(item.get('count')),
        total: parseFloat(item.get('total') || 0).toFixed(2)
      }));
    } catch (error) {
      logger.error('Error getting cost breakdown:', error);
      throw error;
    }
  }

  /**
   * Get revenue breakdown by type
   */
  async getRevenueBreakdown(userId, organizationId, startDate, endDate) {
    try {
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

      const breakdown = await Revenue.findAll({
        where,
        attributes: [
          'revenueType',
          [Revenue.sequelize.fn('COUNT', '*'), 'count'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('finalAmount')), 'total'],
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('quantity')), 'quantity']
        ],
        group: ['revenueType'],
        order: [[Revenue.sequelize.literal('total'), 'DESC']]
      });

      return breakdown.map(item => ({
        type: item.revenueType,
        count: parseInt(item.get('count')),
        total: parseFloat(item.get('total') || 0).toFixed(2),
        quantity: parseFloat(item.get('quantity') || 0).toFixed(2)
      }));
    } catch (error) {
      logger.error('Error getting revenue breakdown:', error);
      throw error;
    }
  }

  /**
   * Compare multiple batches
   */
  async compareBatches(batchIds, userId, organizationId) {
    try {
      const comparisons = await Promise.all(
        batchIds.map(batchId => 
          this.calculateBatchProfitability(batchId, userId, organizationId)
        )
      );

      return comparisons;
    } catch (error) {
      logger.error('Error comparing batches:', error);
      throw error;
    }
  }
}

module.exports = new ProfitabilityService();

