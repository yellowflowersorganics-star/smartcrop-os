/**
 * Profitability Analytics Controller
 */

const profitabilityService = require('../services/profitability.service');
const logger = require('../utils/logger');

class ProfitabilityController {
  constructor() {
    this.getOverallProfitability = this.getOverallProfitability.bind(this);
    this.getBatchProfitability = this.getBatchProfitability.bind(this);
    this.getProfitabilityTrends = this.getProfitabilityTrends.bind(this);
    this.getCostBreakdown = this.getCostBreakdown.bind(this);
    this.getRevenueBreakdown = this.getRevenueBreakdown.bind(this);
    this.compareBatches = this.compareBatches.bind(this);
  }

  /**
   * Get overall profitability metrics
   */
  async getOverallProfitability(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const metrics = await profitabilityService.calculateOverallProfitability(
        userId,
        organizationId,
        startDate,
        endDate
      );

      res.json(metrics);
    } catch (error) {
      logger.error('Error getting overall profitability:', error);
      res.status(500).json({ error: 'Failed to get profitability metrics' });
    }
  }

  /**
   * Get batch profitability
   */
  async getBatchProfitability(req, res) {
    try {
      const { batchId } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const metrics = await profitabilityService.calculateBatchProfitability(
        batchId,
        userId,
        organizationId
      );

      res.json(metrics);
    } catch (error) {
      logger.error('Error getting batch profitability:', error);
      res.status(500).json({ error: 'Failed to get batch profitability' });
    }
  }

  /**
   * Get profitability trends
   */
  async getProfitabilityTrends(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate, groupBy } = req.query;

      const trends = await profitabilityService.getProfitabilityTrends(
        userId,
        organizationId,
        startDate,
        endDate,
        groupBy
      );

      res.json(trends);
    } catch (error) {
      logger.error('Error getting profitability trends:', error);
      res.status(500).json({ error: 'Failed to get profitability trends' });
    }
  }

  /**
   * Get cost breakdown
   */
  async getCostBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const breakdown = await profitabilityService.getCostBreakdown(
        userId,
        organizationId,
        startDate,
        endDate
      );

      res.json(breakdown);
    } catch (error) {
      logger.error('Error getting cost breakdown:', error);
      res.status(500).json({ error: 'Failed to get cost breakdown' });
    }
  }

  /**
   * Get revenue breakdown
   */
  async getRevenueBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const breakdown = await profitabilityService.getRevenueBreakdown(
        userId,
        organizationId,
        startDate,
        endDate
      );

      res.json(breakdown);
    } catch (error) {
      logger.error('Error getting revenue breakdown:', error);
      res.status(500).json({ error: 'Failed to get revenue breakdown' });
    }
  }

  /**
   * Compare multiple batches
   */
  async compareBatches(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { batchIds } = req.query; // Comma-separated list

      if (!batchIds) {
        return res.status(400).json({ error: 'batchIds parameter is required' });
      }

      const batchIdArray = batchIds.split(',').map(id => id.trim());

      const comparisons = await profitabilityService.compareBatches(
        batchIdArray,
        userId,
        organizationId
      );

      res.json(comparisons);
    } catch (error) {
      logger.error('Error comparing batches:', error);
      res.status(500).json({ error: 'Failed to compare batches' });
    }
  }
}

module.exports = new ProfitabilityController();

