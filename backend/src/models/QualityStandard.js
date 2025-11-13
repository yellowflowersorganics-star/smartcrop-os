const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualityStandard = sequelize.define('QualityStandard', {
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
      onDelete: 'CASCADE'
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Standard name (e.g., "Grade A Oyster", "Organic Certification")'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Standard code/identifier'
    },
    standardType: {
      type: DataTypes.ENUM(
        'internal',         // Internal company standards
        'iso',              // ISO standards
        'fssai',            // FSSAI (India)
        'usda_organic',     // USDA Organic
        'eu_organic',       // EU Organic
        'gmp',              // Good Manufacturing Practice
        'haccp',            // HACCP
        'brc',              // BRC Global Standards
        'ifs',              // IFS Food
        'customer',         // Customer-specific requirements
        'other'
      ),
      defaultValue: 'internal',
      comment: 'Type of standard'
    },
    category: {
      type: DataTypes.ENUM(
        'product_quality',
        'food_safety',
        'environmental',
        'facility',
        'equipment',
        'personnel',
        'documentation',
        'traceability'
      ),
      allowNull: false,
      comment: 'Standard category'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of the standard'
    },
    // Applicability
    cropType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Applies to specific crop type (e.g., oyster, button)'
    },
    applicableStage: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Which stages this applies to (pre_harvest, harvest, post_harvest, etc.)'
    },
    // Criteria & Thresholds
    criteria: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Quality criteria with thresholds'
      /* Example structure:
      {
        "appearance": {
          "color": { "min": 8, "max": 10, "unit": "score" },
          "shape": { "min": 7, "max": 10, "unit": "score" }
        },
        "physical": {
          "size": { "min": 5, "max": 15, "unit": "cm" },
          "weight": { "min": 50, "max": 150, "unit": "g" },
          "moisture": { "min": 85, "max": 92, "unit": "%" }
        },
        "defects": {
          "max_defect_rate": { "max": 5, "unit": "%" },
          "critical_defects": { "max": 0, "unit": "count" }
        }
      }
      */
    },
    // Grading System
    gradingSystem: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Grade definitions and scoring'
      /* Example:
      {
        "A+": { "min_score": 95, "description": "Premium quality" },
        "A": { "min_score": 85, "description": "Excellent quality" },
        "B": { "min_score": 70, "description": "Good quality" },
        "C": { "min_score": 50, "description": "Acceptable quality" },
        "Reject": { "max_score": 49, "description": "Below acceptable quality" }
      }
      */
    },
    // Sampling Requirements
    sampleSize: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Required sample size'
    },
    sampleUnit: {
      type: DataTypes.STRING,
      defaultValue: 'kg',
      comment: 'Unit for sample size'
    },
    samplingMethod: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'How to perform sampling'
    },
    // Inspection Frequency
    inspectionFrequency: {
      type: DataTypes.ENUM('every_batch', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'as_needed'),
      defaultValue: 'every_batch',
      comment: 'How often inspection should occur'
    },
    // Testing Requirements
    testingRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether lab testing is required'
    },
    testingProcedures: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'List of required tests'
    },
    // Certification & Compliance
    certificationRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    certificationBody: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Certifying organization'
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When standard becomes effective'
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiration date'
    },
    // Documentation
    documentUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Related documents (certificates, procedures, forms)'
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0',
      comment: 'Standard version'
    },
    revisionHistory: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'History of revisions'
    },
    // Status & Approval
    status: {
      type: DataTypes.ENUM('draft', 'active', 'under_review', 'archived', 'expired'),
      defaultValue: 'draft',
      comment: 'Standard status'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Usage & Compliance
    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether compliance is mandatory'
    },
    complianceRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Current compliance rate (%)'
    },
    lastAssessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last compliance assessment date'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'quality_standards',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['standardType'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['code'] },
      { fields: ['cropType'] },
      { fields: ['isMandatory'] }
    ]
  });

  QualityStandard.associate = (models) => {
    QualityStandard.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    QualityStandard.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    QualityStandard.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
  };

  // Instance method to check if a quality check meets this standard
  QualityStandard.prototype.meetsStandard = function(qualityCheck) {
    if (!this.criteria || typeof this.criteria !== 'object') {
      return { meets: true, violations: [] };
    }

    const violations = [];
    
    // Check appearance criteria
    if (this.criteria.appearance && qualityCheck.appearance) {
      Object.entries(this.criteria.appearance).forEach(([key, threshold]) => {
        const value = qualityCheck.appearance[key];
        if (value !== undefined) {
          if (threshold.min !== undefined && value < threshold.min) {
            violations.push(`${key} below minimum (${value} < ${threshold.min})`);
          }
          if (threshold.max !== undefined && value > threshold.max) {
            violations.push(`${key} above maximum (${value} > ${threshold.max})`);
          }
        }
      });
    }

    // Check defect criteria
    if (this.criteria.defects) {
      if (this.criteria.defects.max_defect_rate && qualityCheck.defectRate > this.criteria.defects.max_defect_rate.max) {
        violations.push(`Defect rate too high (${qualityCheck.defectRate}% > ${this.criteria.defects.max_defect_rate.max}%)`);
      }
    }

    return {
      meets: violations.length === 0,
      violations
    };
  };

  return QualityStandard;
};

