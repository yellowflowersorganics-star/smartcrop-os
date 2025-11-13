const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOP = sequelize.define('SOP', {
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
      comment: 'User who created the SOP'
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'SOP title'
    },
    sopNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Unique SOP identifier (e.g., SOP-001, HARVEST-01)'
    },
    category: {
      type: DataTypes.ENUM(
        'cultivation',       // Growing processes
        'harvesting',        // Harvest procedures
        'post_harvest',      // Post-harvest handling
        'quality_control',   // QC procedures
        'sanitation',        // Cleaning and sanitization
        'equipment',         // Equipment operation
        'safety',            // Safety procedures
        'maintenance',       // Maintenance procedures
        'packaging',         // Packaging processes
        'inventory',         // Inventory management
        'environmental',     // Environmental control
        'inoculation',       // Inoculation procedures
        'substrate',         // Substrate preparation
        'compliance',        // Regulatory compliance
        'training',          // Training procedures
        'emergency',         // Emergency procedures
        'other'
      ),
      allowNull: false,
      comment: 'SOP category'
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Subcategory for finer classification'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Brief description of the SOP'
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Purpose and objectives of this SOP'
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Scope and applicability'
    },
    // Version Control
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0',
      comment: 'Version number'
    },
    revisionNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Revision count'
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this version becomes effective'
    },
    reviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Next review date'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this SOP expires'
    },
    // Content Structure
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time to complete (minutes)'
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'intermediate',
      comment: 'Skill level required'
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'as_needed'),
      allowNull: true,
      comment: 'How often this SOP is typically used'
    },
    // Safety & Compliance
    safetyRequirements: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Required PPE and safety measures'
    },
    equipmentRequired: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Tools and equipment needed'
    },
    materialsRequired: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Materials and supplies needed'
    },
    prerequisites: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Prerequisites or dependencies'
    },
    // Quality & Standards
    qualityChecks: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Quality checkpoints during execution'
    },
    acceptanceCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'What constitutes successful completion'
    },
    complianceStandards: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Related compliance standards (ISO, FSSAI, etc.)'
    },
    // References
    relatedSOPs: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Related SOP IDs'
    },
    references: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'External references and documents'
    },
    // Roles & Responsibilities
    responsibleRole: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Who is responsible for execution'
    },
    approverRole: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Who approves completed executions'
    },
    // Documentation
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Attached documents, images, videos'
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Reference images'
    },
    videos: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Training or reference videos'
    },
    // Training
    trainingRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether training is required before execution'
    },
    certificationRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether certification is needed'
    },
    // Status & Approval
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'active', 'under_revision', 'archived', 'obsolete'),
      defaultValue: 'draft',
      comment: 'Current status'
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
    // Usage Tracking
    executionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'How many times this SOP has been executed'
    },
    lastExecutedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    averageCompletionTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average time to complete (minutes)'
    },
    successRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Success rate percentage'
    },
    // Search & Tags
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Tags for search and categorization'
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Searchable keywords'
    },
    // Access Control
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this SOP is publicly visible'
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a template for creating new SOPs'
    },
    // Revision History
    revisionHistory: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'History of changes'
    },
    changeLog: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Summary of changes in this version'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'sops',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['sopNumber'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['version'] },
      { fields: ['isPublic'] },
      { fields: ['isTemplate'] },
      { fields: ['effectiveDate'] },
      { fields: ['reviewDate'] }
    ]
  });

  SOP.associate = (models) => {
    SOP.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    SOP.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    SOP.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });

    SOP.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    SOP.hasMany(models.SOPStep, {
      foreignKey: 'sopId',
      as: 'steps',
      onDelete: 'CASCADE'
    });

    SOP.hasMany(models.SOPExecution, {
      foreignKey: 'sopId',
      as: 'executions'
    });
  };

  // Instance method to generate next version number
  SOP.prototype.getNextVersion = function() {
    const [major, minor] = this.version.split('.').map(Number);
    return `${major}.${minor + 1}`;
  };

  // Instance method to check if review is due
  SOP.prototype.isReviewDue = function() {
    if (!this.reviewDate) return false;
    return new Date() >= new Date(this.reviewDate);
  };

  return SOP;
};

