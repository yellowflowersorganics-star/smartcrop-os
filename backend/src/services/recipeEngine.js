/**
 * SmartCrop OS - Recipe Engine
 * Core logic for crop recipe execution and stage management
 */

const dayjs = require('dayjs');
const logger = require('../utils/logger');

class RecipeEngine {
  /**
   * Calculate current growth stage based on batch start date
   * @param {Object} recipe - Crop recipe object
   * @param {Date} batchStartDate - When the crop batch started
   * @returns {Object} Current stage information
   */
  getCurrentStage(recipe, batchStartDate) {
    if (!batchStartDate) {
      return {
        stageIndex: 0,
        stage: recipe.stages[0],
        dayInStage: 0,
        daysRemaining: recipe.stages[0].duration,
        totalDaysElapsed: 0,
        progress: 0
      };
    }

    const now = dayjs();
    const start = dayjs(batchStartDate);
    const totalDaysElapsed = now.diff(start, 'day');

    let cumulativeDays = 0;
    let currentStageIndex = 0;

    // Find which stage we're in
    for (let i = 0; i < recipe.stages.length; i++) {
      const stageDuration = recipe.stages[i].duration;
      
      if (totalDaysElapsed < cumulativeDays + stageDuration) {
        currentStageIndex = i;
        break;
      }
      
      cumulativeDays += stageDuration;
      
      // If we're past all stages, stay at the last stage
      if (i === recipe.stages.length - 1) {
        currentStageIndex = i;
      }
    }

    const currentStage = recipe.stages[currentStageIndex];
    const dayInStage = totalDaysElapsed - cumulativeDays;
    const daysRemaining = currentStage.duration - dayInStage;
    const progress = (totalDaysElapsed / recipe.totalDuration) * 100;

    return {
      stageIndex: currentStageIndex,
      stage: currentStage,
      dayInStage,
      daysRemaining: Math.max(0, daysRemaining),
      totalDaysElapsed,
      progress: Math.min(100, progress),
      isComplete: totalDaysElapsed >= recipe.totalDuration
    };
  }

  /**
   * Get environmental setpoints for current stage
   * @param {Object} recipe - Crop recipe
   * @param {Date} batchStartDate - Batch start date
   * @returns {Object} Environmental setpoints
   */
  getCurrentSetpoints(recipe, batchStartDate) {
    const { stage } = this.getCurrentStage(recipe, batchStartDate);
    
    return {
      temperature: stage.temperature,
      humidity: stage.humidity,
      co2: stage.co2 || null,
      lightHours: stage.lightHours,
      lightIntensity: stage.lightIntensity || null,
      irrigation: stage.irrigation || null,
      nutrients: stage.nutrients || null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if setpoints should transition to next stage
   * @param {Object} recipe - Crop recipe
   * @param {Date} batchStartDate - Batch start date
   * @returns {Boolean} True if stage transition is needed
   */
  shouldTransitionStage(recipe, batchStartDate) {
    const { dayInStage, daysRemaining, stageIndex } = this.getCurrentStage(recipe, batchStartDate);
    
    // Transition at the start of a new day when stage duration is complete
    return daysRemaining === 0 && stageIndex < recipe.stages.length - 1;
  }

  /**
   * Validate recipe structure and parameters
   * @param {Object} recipe - Crop recipe to validate
   * @param {Object} zoneCapabilities - Available sensors/actuators in zone
   * @returns {Object} Validation result
   */
  validateRecipe(recipe, zoneCapabilities = {}) {
    const errors = [];
    const warnings = [];

    // Validate stages exist
    if (!recipe.stages || recipe.stages.length === 0) {
      errors.push('Recipe must have at least one stage');
    }

    // Validate each stage
    recipe.stages?.forEach((stage, index) => {
      if (!stage.name) {
        errors.push(`Stage ${index + 1}: Name is required`);
      }
      
      if (stage.duration <= 0) {
        errors.push(`Stage ${index + 1}: Duration must be positive`);
      }

      if (stage.temperature < -10 || stage.temperature > 50) {
        warnings.push(`Stage ${index + 1}: Temperature ${stage.temperature}°C is outside normal range`);
      }

      if (stage.humidity < 0 || stage.humidity > 100) {
        errors.push(`Stage ${index + 1}: Humidity must be between 0-100%`);
      }

      if (stage.lightHours < 0 || stage.lightHours > 24) {
        errors.push(`Stage ${index + 1}: Light hours must be between 0-24`);
      }
    });

    // Check zone capabilities
    if (zoneCapabilities.sensors) {
      const requiredSensors = recipe.requiredSensors || [];
      const missingSensors = requiredSensors.filter(s => !zoneCapabilities.sensors.includes(s));
      
      if (missingSensors.length > 0) {
        warnings.push(`Zone is missing sensors: ${missingSensors.join(', ')}`);
      }
    }

    if (zoneCapabilities.actuators) {
      const requiredActuators = recipe.requiredActuators || [];
      const missingActuators = requiredActuators.filter(a => !zoneCapabilities.actuators.includes(a));
      
      if (missingActuators.length > 0) {
        warnings.push(`Zone is missing actuators: ${missingActuators.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate expected harvest date
   * @param {Object} recipe - Crop recipe
   * @param {Date} batchStartDate - Batch start date
   * @returns {Date} Expected harvest date
   */
  getExpectedHarvestDate(recipe, batchStartDate) {
    return dayjs(batchStartDate).add(recipe.totalDuration, 'day').toDate();
  }

  /**
   * Generate control commands based on current setpoints
   * @param {Object} setpoints - Target environmental setpoints
   * @param {Object} currentReadings - Current sensor readings
   * @returns {Array} Control commands to send to devices
   */
  generateControlCommands(setpoints, currentReadings) {
    const commands = [];

    // Temperature control
    if (currentReadings.temperature !== undefined) {
      const tempDiff = currentReadings.temperature - setpoints.temperature;
      
      if (tempDiff > 2) {
        commands.push({
          actuator: 'cooling',
          action: 'on',
          reason: 'Temperature too high'
        });
      } else if (tempDiff < -2) {
        commands.push({
          actuator: 'heating',
          action: 'on',
          reason: 'Temperature too low'
        });
      }
    }

    // Humidity control
    if (currentReadings.humidity !== undefined) {
      const humidityDiff = currentReadings.humidity - setpoints.humidity;
      
      if (humidityDiff > 5) {
        commands.push({
          actuator: 'dehumidifier',
          action: 'on',
          reason: 'Humidity too high'
        });
      } else if (humidityDiff < -5) {
        commands.push({
          actuator: 'humidifier',
          action: 'on',
          reason: 'Humidity too low'
        });
      }
    }

    // CO2 control
    if (setpoints.co2 && currentReadings.co2 !== undefined) {
      if (currentReadings.co2 < setpoints.co2 - 100) {
        commands.push({
          actuator: 'co2_injection',
          action: 'on',
          reason: 'CO2 too low'
        });
      }
    }

    // Light control
    const currentHour = dayjs().hour();
    const isDayTime = currentHour >= 6 && currentHour < (6 + setpoints.lightHours);
    
    commands.push({
      actuator: 'grow_light',
      action: isDayTime ? 'on' : 'off',
      intensity: setpoints.lightIntensity || 100,
      reason: isDayTime ? 'Day cycle' : 'Night cycle'
    });

    return commands;
  }

  /**
   * Log recipe execution metrics for ML training
   * @param {String} zoneId - Zone ID
   * @param {Object} recipe - Crop recipe
   * @param {Object} stageInfo - Current stage information
   * @param {Object} environmentData - Current environmental data
   */
  logExecutionMetrics(zoneId, recipe, stageInfo, environmentData) {
    logger.info('Recipe execution metrics', {
      zoneId,
      cropType: recipe.cropType,
      stageIndex: stageInfo.stageIndex,
      stageName: stageInfo.stage.name,
      dayInStage: stageInfo.dayInStage,
      progress: stageInfo.progress,
      environment: environmentData
    });
  }
}

module.exports = new RecipeEngine();

