/**
 * SmartCrop OS - Request Validators
 */

const Joi = require('joi');

// Crop recipe stage schema
const stageSchema = Joi.object({
  name: Joi.string().required(),
  duration: Joi.number().min(0).required(),
  temperature: Joi.number().min(-10).max(50).required(),
  humidity: Joi.number().min(0).max(100).required(),
  co2: Joi.number().min(0).max(5000).optional(),
  lightHours: Joi.number().min(0).max(24).required(),
  lightIntensity: Joi.number().min(0).max(100).optional(),
  irrigation: Joi.number().min(0).optional(),
  nutrients: Joi.string().optional(),
  notes: Joi.string().optional()
});

// Crop recipe validation
const validateCropRecipe = (req, res, next) => {
  const schema = Joi.object({
    cropId: Joi.string().required(),
    cropName: Joi.string().required(),
    cropType: Joi.string().valid('mushroom', 'vegetable', 'leafy-green', 'berry', 'herb').required(),
    description: Joi.string().optional(),
    version: Joi.string().optional(),
    isPublic: Joi.boolean().optional(),
    stages: Joi.array().items(stageSchema).min(1).required(),
    requiredSensors: Joi.array().items(Joi.string()).optional(),
    requiredActuators: Joi.array().items(Joi.string()).optional(),
    estimatedYield: Joi.object().optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  req.validatedData = value;
  next();
};

module.exports = {
  validateCropRecipe
};

