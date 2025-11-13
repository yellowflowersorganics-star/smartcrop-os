const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOPStep = sequelize.define('SOPStep', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sopId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sops',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Parent SOP'
    },
    stepNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Step sequence number'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Step title'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed step instructions'
    },
    stepType: {
      type: DataTypes.ENUM('action', 'decision', 'inspection', 'measurement', 'wait', 'safety_check', 'note'),
      defaultValue: 'action',
      comment: 'Type of step'
    },
    // Duration & Timing
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time for this step (minutes)'
    },
    isCritical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a critical control point'
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this step can be skipped'
    },
    // Conditional Logic
    conditionalLogic: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: 'Conditional branching rules'
    },
    skipConditions: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Conditions under which this step can be skipped'
    },
    // Requirements
    requiredEquipment: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Equipment needed for this step'
    },
    requiredMaterials: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Materials needed for this step'
    },
    safetyPrecautions: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Safety warnings and precautions'
    },
    // Quality & Validation
    validationCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'How to validate this step was done correctly'
    },
    acceptableRange: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: 'Acceptable range for measurements (min, max, unit)'
    },
    qualityCheckRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether quality check is required'
    },
    // Documentation
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Reference images for this step'
    },
    videos: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Video demonstrations'
    },
    diagrams: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Diagrams or schematics'
    },
    // Input/Output
    inputRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether operator input is required'
    },
    inputType: {
      type: DataTypes.ENUM('text', 'number', 'checkbox', 'photo', 'signature', 'measurement', 'time', 'date'),
      allowNull: true,
      comment: 'Type of input expected'
    },
    inputLabel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Label for input field'
    },
    inputValidation: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: 'Validation rules for input'
    },
    // Tips & Warnings
    tips: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Helpful tips for completing this step'
    },
    warnings: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Important warnings'
    },
    commonMistakes: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Common mistakes to avoid'
    },
    // References
    references: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Related documents or procedures'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'sop_steps',
    timestamps: true,
    indexes: [
      { fields: ['sopId'] },
      { fields: ['stepNumber'] },
      { fields: ['isCritical'] },
      { fields: ['sopId', 'stepNumber'] }
    ]
  });

  SOPStep.associate = (models) => {
    SOPStep.belongsTo(models.SOP, {
      foreignKey: 'sopId',
      as: 'sop'
    });
  };

  return SOPStep;
};

