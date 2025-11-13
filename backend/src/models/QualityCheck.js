const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualityCheck = sequelize.define('QualityCheck', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'User who performed the quality check'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    checkType: {
      type: DataTypes.ENUM(
        'pre_harvest',      // Before harvesting
        'harvest',          // During harvest
        'post_harvest',     // After harvest
        'packaging',        // During packaging
        'pre_shipment',     // Before shipping
        'substrate',        // Substrate quality
        'spawn',            // Spawn quality
        'environmental',    // Environmental conditions
        'equipment',        // Equipment inspection
        'facility',         // Facility inspection
        'incoming',         // Incoming materials
        'routine'          // Routine inspection
      ),
      allowNull: false,
      comment: 'Type of quality check'
    },
    checkDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the check was performed'
    },
    // Associations
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Zone being inspected'
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'batches',
        key: 'batchNumber'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Batch being inspected'
    },
    harvestId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'harvests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related harvest'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'farms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Quality Metrics
    overallGrade: {
      type: DataTypes.ENUM('A+', 'A', 'B', 'C', 'Reject'),
      allowNull: false,
      comment: 'Overall quality grade'
    },
    passStatus: {
      type: DataTypes.ENUM('pass', 'conditional_pass', 'fail'),
      allowNull: false,
      comment: 'Pass/fail status'
    },
    qualityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Overall quality score (0-100)'
    },
    // Inspection Details
    sampleSize: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Sample size (kg, pieces, etc.)'
    },
    sampleUnit: {
      type: DataTypes.STRING,
      defaultValue: 'kg',
      comment: 'Unit of measurement'
    },
    defectCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of defects found'
    },
    defectRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Defect rate percentage'
    },
    // Visual Inspection
    appearance: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Appearance scores: color, shape, size, texture'
    },
    // Physical Properties
    physicalProperties: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Physical measurements: weight, dimensions, moisture'
    },
    // Contamination Check
    contamination: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Contamination findings: bacterial, fungal, pest, foreign_matter'
    },
    // Packaging Quality (if applicable)
    packaging: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Packaging quality: condition, labeling, sealing'
    },
    // Environmental Conditions (if applicable)
    environmental: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Environmental readings during check'
    },
    // Inspector Details
    inspectorName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of inspector'
    },
    inspectorCertification: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Inspector certification/credentials'
    },
    // Documentation
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional inspection notes'
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Recommendations for improvement'
    },
    correctiveActions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Corrective actions taken or needed'
    },
    // Evidence
    photoUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Photos from inspection'
    },
    videoUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Video evidence'
    },
    documentUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Related documents (test results, certificates)'
    },
    // Follow-up
    requiresFollowUp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether follow-up inspection is needed'
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When follow-up inspection should occur'
    },
    followUpCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Compliance
    complianceStandards: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Standards checked against (ISO, FSSAI, organic, etc.)'
    },
    complianceStatus: {
      type: DataTypes.ENUM('compliant', 'non_compliant', 'partial', 'not_applicable'),
      defaultValue: 'compliant'
    },
    // Review & Approval
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected'),
      defaultValue: 'submitted'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'quality_checks',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['checkType'] },
      { fields: ['checkDate'] },
      { fields: ['overallGrade'] },
      { fields: ['passStatus'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['harvestId'] },
      { fields: ['status'] },
      { fields: ['requiresFollowUp'] },
      { fields: ['checkDate', 'checkType'] }
    ]
  });

  QualityCheck.associate = (models) => {
    QualityCheck.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    QualityCheck.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });

    QualityCheck.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    QualityCheck.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    QualityCheck.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    QualityCheck.belongsTo(models.Harvest, {
      foreignKey: 'harvestId',
      as: 'harvest'
    });

    QualityCheck.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });

    QualityCheck.hasMany(models.Defect, {
      foreignKey: 'qualityCheckId',
      as: 'defects'
    });
  };

  // Instance method to calculate quality score
  QualityCheck.prototype.calculateQualityScore = function() {
    let score = 100;
    
    // Deduct for defects
    if (this.defectRate) {
      score -= this.defectRate * 0.5; // 0.5 points per 1% defect rate
    }
    
    // Appearance scoring (0-25 points)
    if (this.appearance && Object.keys(this.appearance).length > 0) {
      const appearanceScores = Object.values(this.appearance);
      const avgAppearance = appearanceScores.reduce((a, b) => a + b, 0) / appearanceScores.length;
      score = score * 0.75 + avgAppearance * 0.25;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  return QualityCheck;
};

