/**
 * SmartCrop OS - Harvest Routes
 * API endpoints for harvest tracking, yield analytics, and batch reports
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkTenant } = require('../middleware/tenantContext');
const { Harvest, Zone, Unit, Organization, CropRecipe } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/harvests
 * @desc    Get all harvests for organization (with filters)
 * @access  Private
 */
router.get('/', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { 
      unitId, 
      zoneId, 
      batchId, 
      flushNumber,
      qualityGrade,
      startDate, 
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    // Build where clause
    const where = { organizationId };
    
    if (unitId) where.unitId = unitId;
    if (zoneId) where.zoneId = zoneId;
    if (batchId) where.batchId = batchId;
    if (flushNumber) where.flushNumber = parseInt(flushNumber);
    if (qualityGrade) where.qualityGrade = qualityGrade;
    
    if (startDate || endDate) {
      where.harvestDate = {};
      if (startDate) where.harvestDate[Op.gte] = new Date(startDate);
      if (endDate) where.harvestDate[Op.lte] = new Date(endDate);
    }

    const harvests = await Harvest.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['harvestDate', 'DESC']],
      include: [
        {
          model: Zone,
          as: 'zone',
          attributes: ['id', 'name', 'zoneNumber']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'unitCode']
        }
      ]
    });

    res.json({
      success: true,
      data: harvests.rows,
      pagination: {
        total: harvests.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < harvests.count
      }
    });
  } catch (error) {
    console.error('Error fetching harvests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch harvests'
    });
  }
});

/**
 * @route   GET /api/harvests/:id
 * @desc    Get single harvest by ID
 * @access  Private
 */
router.get('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const harvest = await Harvest.findOne({
      where: { 
        id,
        organizationId
      },
      include: [
        {
          model: Zone,
          as: 'zone',
          attributes: ['id', 'name', 'zoneNumber', 'area']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'unitCode', 'location']
        }
      ]
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        error: 'Harvest not found'
      });
    }

    res.json({
      success: true,
      data: harvest
    });
  } catch (error) {
    console.error('Error fetching harvest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch harvest'
    });
  }
});

/**
 * @route   POST /api/harvests
 * @desc    Create new harvest record
 * @access  Private
 */
router.post('/', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const {
      unitId,
      zoneId,
      batchId,
      recipeId,
      stageId,
      flushNumber,
      totalWeightKg,
      bagsHarvested,
      bagsDiscarded,
      avgMushroomWeightG,
      qualityGrade,
      qualityDistribution,
      defectNotes,
      harvesterName,
      marketDestination,
      pricePerKg,
      photoUrls,
      harvestNotes,
      substrateWeightKg,
      substrateType,
      envSnapshot
    } = req.body;

    // Validate required fields
    if (!zoneId || !batchId || !totalWeightKg || totalWeightKg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'zoneId, batchId, and valid totalWeightKg are required'
      });
    }

    // Verify zone belongs to organization
    const zone = await Zone.findOne({
      where: { id: zoneId, organizationId }
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    // Create harvest record
    const harvest = await Harvest.create({
      organizationId,
      unitId: unitId || zone.unitId,
      zoneId,
      batchId,
      recipeId,
      stageId,
      flushNumber: flushNumber || 1,
      totalWeightKg,
      bagsHarvested,
      bagsDiscarded: bagsDiscarded || 0,
      avgMushroomWeightG,
      qualityGrade,
      qualityDistribution,
      defectNotes: defectNotes || [],
      harvesterName,
      harvesterUserId: req.user.id,
      marketDestination,
      pricePerKg,
      photoUrls: photoUrls || [],
      harvestDate: new Date(),
      harvestNotes,
      substrateWeightKg,
      substrateType,
      envSnapshot,
      status: 'completed'
    });

    // Calculate metrics
    const expectedYieldKg = substrateWeightKg ? substrateWeightKg * 0.25 : null; // 25% BE target
    harvest.calculateMetrics(substrateWeightKg, expectedYieldKg);
    await harvest.save();

    res.status(201).json({
      success: true,
      data: harvest,
      message: 'Harvest recorded successfully'
    });
  } catch (error) {
    console.error('Error creating harvest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create harvest record'
    });
  }
});

/**
 * @route   PUT /api/harvests/:id
 * @desc    Update harvest record
 * @access  Private
 */
router.put('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const harvest = await Harvest.findOne({
      where: { id, organizationId }
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        error: 'Harvest not found'
      });
    }

    const {
      totalWeightKg,
      bagsHarvested,
      bagsDiscarded,
      avgMushroomWeightG,
      qualityGrade,
      qualityDistribution,
      defectNotes,
      harvesterName,
      marketDestination,
      pricePerKg,
      photoUrls,
      harvestNotes,
      substrateWeightKg
    } = req.body;

    // Update fields
    await harvest.update({
      totalWeightKg: totalWeightKg !== undefined ? totalWeightKg : harvest.totalWeightKg,
      bagsHarvested: bagsHarvested !== undefined ? bagsHarvested : harvest.bagsHarvested,
      bagsDiscarded: bagsDiscarded !== undefined ? bagsDiscarded : harvest.bagsDiscarded,
      avgMushroomWeightG: avgMushroomWeightG !== undefined ? avgMushroomWeightG : harvest.avgMushroomWeightG,
      qualityGrade: qualityGrade || harvest.qualityGrade,
      qualityDistribution: qualityDistribution || harvest.qualityDistribution,
      defectNotes: defectNotes || harvest.defectNotes,
      harvesterName: harvesterName || harvest.harvesterName,
      marketDestination: marketDestination || harvest.marketDestination,
      pricePerKg: pricePerKg !== undefined ? pricePerKg : harvest.pricePerKg,
      photoUrls: photoUrls || harvest.photoUrls,
      harvestNotes: harvestNotes !== undefined ? harvestNotes : harvest.harvestNotes,
      substrateWeightKg: substrateWeightKg !== undefined ? substrateWeightKg : harvest.substrateWeightKg
    });

    // Recalculate metrics
    const expectedYieldKg = harvest.substrateWeightKg ? harvest.substrateWeightKg * 0.25 : null;
    harvest.calculateMetrics(harvest.substrateWeightKg, expectedYieldKg);
    await harvest.save();

    res.json({
      success: true,
      data: harvest,
      message: 'Harvest updated successfully'
    });
  } catch (error) {
    console.error('Error updating harvest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update harvest'
    });
  }
});

/**
 * @route   DELETE /api/harvests/:id
 * @desc    Delete harvest record
 * @access  Private
 */
router.delete('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const harvest = await Harvest.findOne({
      where: { id, organizationId }
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        error: 'Harvest not found'
      });
    }

    await harvest.destroy();

    res.json({
      success: true,
      message: 'Harvest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting harvest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete harvest'
    });
  }
});

/**
 * @route   GET /api/harvests/batch/:batchId/summary
 * @desc    Get batch summary (all flushes combined)
 * @access  Private
 */
router.get('/batch/:batchId/summary', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { batchId } = req.params;

    // Verify at least one harvest exists for this batch in this org
    const firstHarvest = await Harvest.findOne({
      where: { batchId, organizationId }
    });

    if (!firstHarvest) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    const summary = await Harvest.getBatchSummary(batchId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching batch summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch summary'
    });
  }
});

/**
 * @route   GET /api/harvests/zone/:zoneId/analytics
 * @desc    Get zone analytics (yield trends, quality, etc.)
 * @access  Private
 */
router.get('/zone/:zoneId/analytics', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { zoneId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify zone belongs to organization
    const zone = await Zone.findOne({
      where: { id: zoneId, organizationId }
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    const analytics = await Harvest.getZoneAnalytics(
      zoneId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching zone analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zone analytics'
    });
  }
});

/**
 * @route   GET /api/harvests/organization/summary
 * @desc    Get organization-wide harvest summary
 * @access  Private
 */
router.get('/organization/summary', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { startDate, endDate, period = 'all' } = req.query;

    // Build date filter
    const where = { organizationId, status: 'completed' };
    
    if (period !== 'all') {
      const now = new Date();
      let fromDate;
      
      switch (period) {
        case 'today':
          fromDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          fromDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          fromDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (fromDate) {
        where.harvestDate = { [Op.gte]: fromDate };
      }
    } else if (startDate || endDate) {
      where.harvestDate = {};
      if (startDate) where.harvestDate[Op.gte] = new Date(startDate);
      if (endDate) where.harvestDate[Op.lte] = new Date(endDate);
    }

    const harvests = await Harvest.findAll({
      where,
      attributes: [
        'totalWeightKg',
        'biologicalEfficiency',
        'totalRevenue',
        'qualityGrade',
        'flushNumber',
        'harvestDate'
      ]
    });

    // Calculate summary statistics
    const summary = {
      totalHarvests: harvests.length,
      totalYieldKg: 0,
      totalRevenue: 0,
      avgBiologicalEfficiency: 0,
      qualityBreakdown: {
        premium: 0,
        grade_a: 0,
        grade_b: 0,
        rejected: 0
      },
      flushBreakdown: {},
      yieldByDate: {}
    };

    let beSum = 0;
    let beCount = 0;

    for (const harvest of harvests) {
      summary.totalYieldKg += harvest.totalWeightKg;
      
      if (harvest.totalRevenue) {
        summary.totalRevenue += harvest.totalRevenue;
      }
      
      if (harvest.biologicalEfficiency) {
        beSum += harvest.biologicalEfficiency;
        beCount++;
      }
      
      if (harvest.qualityGrade) {
        summary.qualityBreakdown[harvest.qualityGrade]++;
      }
      
      // Count flushes
      const flush = `flush_${harvest.flushNumber}`;
      summary.flushBreakdown[flush] = (summary.flushBreakdown[flush] || 0) + 1;
      
      // Yield by date
      const date = harvest.harvestDate.toISOString().split('T')[0];
      summary.yieldByDate[date] = (summary.yieldByDate[date] || 0) + harvest.totalWeightKg;
    }

    if (beCount > 0) {
      summary.avgBiologicalEfficiency = beSum / beCount;
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching organization summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization summary'
    });
  }
});

/**
 * @route   POST /api/harvests/:id/upload-photo
 * @desc    Upload harvest photo
 * @access  Private
 */
router.post('/:id/upload-photo', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        error: 'photoUrl is required'
      });
    }

    const harvest = await Harvest.findOne({
      where: { id, organizationId }
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        error: 'Harvest not found'
      });
    }

    // Add photo URL to array
    const photoUrls = harvest.photoUrls || [];
    photoUrls.push(photoUrl);
    
    await harvest.update({ photoUrls });

    res.json({
      success: true,
      data: { photoUrls },
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

module.exports = router;

