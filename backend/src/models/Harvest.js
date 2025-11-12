/**
 * SmartCrop OS - Harvest Model
 * Tracks harvest data, yield, quality, and metrics per flush/batch
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Harvest = sequelize.define('Harvest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Organization for multi-tenant isolation'
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Unit where harvest occurred'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Zone where harvest occurred'
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Batch identifier (e.g., 20251112-zone-a)'
    },
    recipeId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Recipe used for this batch'
    },
    stageId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stage ID from recipe (e.g., harvest_flush_1)'
    },
    flushNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Flush/harvest number (1, 2, 3, etc.)'
    },
    // Yield data
    totalWeightKg: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Total harvest weight in kilograms'
    },
    bagsHarvested: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of bags/containers harvested'
    },
    bagsDiscarded: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of bags discarded due to contamination'
    },
    avgMushroomWeightG: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average weight per mushroom in grams'
    },
    // Quality data
    qualityGrade: {
      type: DataTypes.ENUM('premium', 'grade_a', 'grade_b', 'rejected'),
      allowNull: true,
      comment: 'Overall quality grade for this harvest'
    },
    qualityDistribution: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Weight distribution by quality grade: {premium: 10.5, grade_a: 1.5, ...}'
    },
    defectNotes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'List of quality issues observed'
    },
    // People
    harvesterName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name of person who performed harvest'
    },
    harvesterUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User ID if harvester is a system user'
    },
    // Market data
    marketDestination: {
      type: DataTypes.ENUM('local_market', 'wholesale', 'restaurant', 'direct_consumer', 'export', 'self_consumption', 'other'),
      allowNull: true,
      comment: 'Where the harvest is being sold/used'
    },
    pricePerKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Sale price per kg (in local currency)'
    },
    totalRevenue: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total revenue from this harvest'
    },
    // Calculated metrics
    biologicalEfficiency: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'BE% = (harvest weight / substrate weight) * 100'
    },
    yieldPerBag: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average yield per bag in kg'
    },
    yieldVsExpected: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Actual yield as percentage of expected yield'
    },
    // Photos
    photoUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'URLs of uploaded harvest photos'
    },
    // Timestamps
    harvestDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date/time when harvest occurred'
    },
    harvestDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration of harvest operation in minutes'
    },
    // Notes
    harvestNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Free-form notes about this harvest'
    },
    // Substrate info (for BE calculation)
    substrateWeightKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total substrate weight for BE calculation'
    },
    substrateType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of substrate used'
    },
    // Environmental conditions during harvest
    envSnapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Environmental conditions at harvest time'
    },
    // Status
    status: {
      type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'planned',
      comment: 'Harvest status'
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'harvests',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['unitId'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['flushNumber'] },
      { fields: ['harvestDate'] },
      { fields: ['qualityGrade'] },
      { fields: ['status'] },
      { fields: ['recipeId'] }
    ]
  });

  Harvest.associate = (models) => {
    Harvest.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Harvest.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit'
    });
    Harvest.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
    Harvest.belongsTo(models.User, {
      foreignKey: 'harvesterUserId',
      as: 'harvester'
    });
  };

  // Instance methods
  Harvest.prototype.calculateMetrics = function(substrateWeightKg, expectedYieldKg) {
    // Calculate biological efficiency
    if (substrateWeightKg && substrateWeightKg > 0) {
      this.biologicalEfficiency = (this.totalWeightKg / substrateWeightKg) * 100;
    }

    // Calculate yield per bag
    if (this.bagsHarvested && this.bagsHarvested > 0) {
      this.yieldPerBag = this.totalWeightKg / this.bagsHarvested;
    }

    // Calculate yield vs expected
    if (expectedYieldKg && expectedYieldKg > 0) {
      this.yieldVsExpected = (this.totalWeightKg / expectedYieldKg) * 100;
    }

    // Calculate revenue if price is set
    if (this.pricePerKg) {
      this.totalRevenue = this.totalWeightKg * this.pricePerKg;
    }

    return this;
  };

  Harvest.prototype.getQualitySummary = function() {
    if (!this.qualityDistribution || Object.keys(this.qualityDistribution).length === 0) {
      return null;
    }

    const summary = {
      total: this.totalWeightKg,
      grades: {}
    };

    for (const [grade, weight] of Object.entries(this.qualityDistribution)) {
      summary.grades[grade] = {
        weight: weight,
        percentage: (weight / this.totalWeightKg) * 100
      };
    }

    return summary;
  };

  // Class methods
  Harvest.getBatchSummary = async function(batchId) {
    const harvests = await this.findAll({
      where: { batchId },
      order: [['flushNumber', 'ASC']]
    });

    if (harvests.length === 0) {
      return null;
    }

    const summary = {
      batchId: batchId,
      totalFlushes: harvests.length,
      totalYieldKg: 0,
      totalRevenue: 0,
      avgBiologicalEfficiency: 0,
      qualityDistribution: {},
      flushes: []
    };

    for (const harvest of harvests) {
      summary.totalYieldKg += harvest.totalWeightKg;
      if (harvest.totalRevenue) {
        summary.totalRevenue += harvest.totalRevenue;
      }

      summary.flushes.push({
        flushNumber: harvest.flushNumber,
        weightKg: harvest.totalWeightKg,
        biologicalEfficiency: harvest.biologicalEfficiency,
        qualityGrade: harvest.qualityGrade,
        harvestDate: harvest.harvestDate
      });

      // Aggregate quality distribution
      if (harvest.qualityDistribution) {
        for (const [grade, weight] of Object.entries(harvest.qualityDistribution)) {
          summary.qualityDistribution[grade] = (summary.qualityDistribution[grade] || 0) + weight;
        }
      }
    }

    // Calculate average BE
    const beValues = harvests.filter(h => h.biologicalEfficiency).map(h => h.biologicalEfficiency);
    if (beValues.length > 0) {
      summary.avgBiologicalEfficiency = beValues.reduce((a, b) => a + b, 0) / beValues.length;
    }

    return summary;
  };

  Harvest.getZoneAnalytics = async function(zoneId, startDate, endDate) {
    const where = { zoneId, status: 'completed' };
    
    if (startDate) {
      where.harvestDate = { ...where.harvestDate, [sequelize.Op.gte]: startDate };
    }
    if (endDate) {
      where.harvestDate = { ...where.harvestDate, [sequelize.Op.lte]: endDate };
    }

    const harvests = await this.findAll({ where });

    const analytics = {
      totalHarvests: harvests.length,
      totalYieldKg: 0,
      totalRevenue: 0,
      avgBiologicalEfficiency: 0,
      qualityGrades: {},
      marketDestinations: {},
      yieldTrend: []
    };

    for (const harvest of harvests) {
      analytics.totalYieldKg += harvest.totalWeightKg;
      if (harvest.totalRevenue) {
        analytics.totalRevenue += harvest.totalRevenue;
      }

      // Count quality grades
      if (harvest.qualityGrade) {
        analytics.qualityGrades[harvest.qualityGrade] = (analytics.qualityGrades[harvest.qualityGrade] || 0) + 1;
      }

      // Count market destinations
      if (harvest.marketDestination) {
        analytics.marketDestinations[harvest.marketDestination] = (analytics.marketDestinations[harvest.marketDestination] || 0) + 1;
      }

      // Yield trend
      analytics.yieldTrend.push({
        date: harvest.harvestDate,
        yieldKg: harvest.totalWeightKg,
        be: harvest.biologicalEfficiency
      });
    }

    // Calculate average BE
    const beValues = harvests.filter(h => h.biologicalEfficiency).map(h => h.biologicalEfficiency);
    if (beValues.length > 0) {
      analytics.avgBiologicalEfficiency = beValues.reduce((a, b) => a + b, 0) / beValues.length;
    }

    return analytics;
  };

  return Harvest;
};

