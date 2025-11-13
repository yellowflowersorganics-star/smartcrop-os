const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Defect = sequelize.define('Defect', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    qualityCheckId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'quality_checks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Related quality check'
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
    defectType: {
      type: DataTypes.ENUM(
        // Visual Defects
        'discoloration',
        'bruising',
        'spots',
        'deformity',
        'undersized',
        'oversized',
        'broken_caps',
        'damaged_stems',
        // Quality Issues
        'overripe',
        'underripe',
        'slimy',
        'dry',
        'soft',
        'tough',
        // Contamination
        'mold',
        'bacteria',
        'pest_damage',
        'foreign_matter',
        // Packaging
        'packaging_damage',
        'labeling_error',
        'seal_failure',
        'weight_variance',
        // Other
        'odor',
        'moisture_content',
        'other'
      ),
      allowNull: false,
      comment: 'Type of defect'
    },
    severity: {
      type: DataTypes.ENUM('critical', 'major', 'minor', 'cosmetic'),
      allowNull: false,
      comment: 'Severity level'
    },
    category: {
      type: DataTypes.ENUM('visual', 'physical', 'contamination', 'packaging', 'compliance'),
      allowNull: false,
      comment: 'Defect category'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed description of defect'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Where defect was found (cap, stem, packaging, etc.)'
    },
    affectedQuantity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Quantity affected'
    },
    affectedUnit: {
      type: DataTypes.STRING,
      defaultValue: 'pieces',
      comment: 'Unit of affected quantity'
    },
    affectedPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Percentage of sample affected'
    },
    // Root Cause
    rootCause: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Identified or suspected root cause'
    },
    possibleCauses: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'List of possible causes'
    },
    // Impact
    impact: {
      type: DataTypes.ENUM('no_impact', 'minor_impact', 'moderate_impact', 'severe_impact'),
      defaultValue: 'minor_impact',
      comment: 'Impact on product quality/safety'
    },
    marketability: {
      type: DataTypes.ENUM('marketable', 'downgrade', 'reject'),
      allowNull: false,
      comment: 'Whether product can still be marketed'
    },
    // Actions
    immediateAction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Immediate action taken'
    },
    correctiveAction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Corrective action to prevent recurrence'
    },
    preventiveAction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Preventive measures'
    },
    actionStatus: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'verified'),
      defaultValue: 'pending',
      comment: 'Status of corrective actions'
    },
    actionDueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When action should be completed'
    },
    actionCompletedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Responsible Party
    responsiblePerson: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Person responsible for corrective action'
    },
    responsibleUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Cost Impact
    estimatedLoss: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated financial loss'
    },
    actualLoss: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual financial loss'
    },
    // Documentation
    photoUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Photos of defect'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes'
    },
    // Verification
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a recurring defect'
    },
    recurrenceCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'How many times this defect has occurred'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'defects',
    timestamps: true,
    indexes: [
      { fields: ['qualityCheckId'] },
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['defectType'] },
      { fields: ['severity'] },
      { fields: ['category'] },
      { fields: ['marketability'] },
      { fields: ['actionStatus'] },
      { fields: ['isRecurring'] }
    ]
  });

  Defect.associate = (models) => {
    Defect.belongsTo(models.QualityCheck, {
      foreignKey: 'qualityCheckId',
      as: 'qualityCheck'
    });

    Defect.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    Defect.belongsTo(models.User, {
      foreignKey: 'responsibleUserId',
      as: 'responsible'
    });

    Defect.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });

    Defect.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
  };

  return Defect;
};

