const { RecipeExecution, CropRecipe, Zone, Equipment, Batch } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const mqttControlService = require('./mqttControl.service');
const alertService = require('./alert.service');

class RecipeExecutionService {
  /**
   * Start recipe execution in a zone
   * @param {String} zoneId - Zone ID
   * @param {String} recipeId - Recipe ID
   * @param {String} batchNumber - Optional batch number
   * @param {String} userId - User ID
   * @returns {Promise<Object>} RecipeExecution instance
   */
  async startExecution(zoneId, recipeId, batchNumber, userId) {
    try {
      // Validate zone and recipe
      const zone = await Zone.findOne({
        where: { id: zoneId, ownerId: userId }
      });

      if (!zone) {
        throw new Error('Zone not found');
      }

      const recipe = await CropRecipe.findByPk(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      if (!recipe.stages || recipe.stages.length === 0) {
        throw new Error('Recipe has no stages defined');
      }

      // Check if there's already an active execution
      const existingExecution = await RecipeExecution.findOne({
        where: {
          zoneId,
          status: { [Op.in]: ['active', 'paused', 'waiting_approval'] }
        }
      });

      if (existingExecution) {
        throw new Error('Zone already has an active recipe execution');
      }

      // Create recipe execution
      const execution = await RecipeExecution.create({
        zoneId,
        recipeId,
        batchNumber,
        currentStage: 0,
        status: 'active',
        startedAt: new Date(),
        currentStageStartedAt: new Date(),
        stageHistory: [],
        autoEnvironmentControl: true,
        ownerId: userId
      });

      // Update zone
      await zone.update({
        recipeId,
        activeRecipeId: recipeId,
        currentStage: 0
      });

      logger.info(`Recipe execution started: ${recipe.cropName} in zone ${zone.name}`);

      // Apply first stage configuration
      await this.applyStageConfiguration(execution, 0);

      // Send recipe info to ESP32 display
      if (zone.deviceId) {
        await this.updateDeviceDisplay(execution);
      }

      // Create alert for start
      await alertService.createAlert({
        userId,
        type: 'batch_milestone',
        severity: 'low',
        title: 'Recipe Execution Started',
        message: `${recipe.cropName} recipe started in ${zone.name}`,
        zoneId,
        actionUrl: `/zones/${zoneId}`
      });

      return execution;

    } catch (error) {
      logger.error('Error starting recipe execution:', error);
      throw error;
    }
  }

  /**
   * Apply stage configuration to zone equipment
   * @param {Object} execution - RecipeExecution instance
   * @param {Number} stageIndex - Stage index
   */
  async applyStageConfiguration(execution, stageIndex) {
    try {
      const recipe = await execution.getRecipe();
      const zone = await execution.getZone();

      if (!recipe || !recipe.stages || !recipe.stages[stageIndex]) {
        throw new Error('Invalid stage index');
      }

      const stage = recipe.stages[stageIndex];
      logger.info(`Applying stage configuration: ${stage.name} for ${recipe.cropName}`);

      // Get all equipment for this zone
      const equipment = await Equipment.findAll({
        where: { zoneId: zone.id, isActive: true }
      });

      // Apply environmental controls
      if (stage.environmental && equipment.length > 0) {
        await this.controlEnvironment(equipment, stage.environmental);
      }

      // Apply lighting schedule
      if (stage.lighting) {
        await this.controlLighting(equipment, stage.lighting);
      }

      // Apply irrigation schedule
      if (stage.irrigation) {
        await this.controlIrrigation(equipment, stage.irrigation);
      }

      // Send stage config to ESP32
      if (zone.deviceId) {
        await mqttControlService.sendStageConfig(zone.deviceId, stage);
      }

      logger.info(`✅ Stage configuration applied: ${stage.name}`);

    } catch (error) {
      logger.error('Error applying stage configuration:', error);
      throw error;
    }
  }

  /**
   * Control environment based on stage parameters
   * @param {Array} equipment - Equipment list
   * @param {Object} environmental - Environmental parameters
   */
  async controlEnvironment(equipment, environmental) {
    const { ControlCommand } = require('../models');

    for (const eq of equipment) {
      let command = null;

      // Temperature control
      if (eq.type === 'heater' && environmental.temperature) {
        const targetTemp = environmental.temperature.optimal || environmental.temperature;
        command = {
          equipmentId: eq.id,
          zoneId: eq.zoneId,
          commandType: 'set_value',
          value: 100, // Full power, will be modulated by thermostat
          source: 'recipe',
          ownerId: eq.ownerId
        };
      }

      // Humidity control
      if (eq.type === 'humidifier' && environmental.humidity) {
        const targetHumidity = environmental.humidity.optimal || environmental.humidity;
        command = {
          equipmentId: eq.id,
          zoneId: eq.zoneId,
          commandType: 'set_value',
          value: Math.round(targetHumidity),
          source: 'recipe',
          ownerId: eq.ownerId
        };
      }

      // Fan control (for CO2/air exchange)
      if (eq.type === 'fan') {
        let fanSpeed = 50; // Default medium speed

        if (environmental.co2) {
          // High CO2 tolerance = low air exchange = low fan speed
          if (environmental.co2.max > 2000) {
            fanSpeed = 20; // Incubation stage - minimal air exchange
          } else if (environmental.co2.max < 1000) {
            fanSpeed = 80; // Fruiting stage - high air exchange
          }
        }

        command = {
          equipmentId: eq.id,
          zoneId: eq.zoneId,
          commandType: 'set_value',
          value: fanSpeed,
          source: 'recipe',
          ownerId: eq.ownerId
        };
      }

      // Create and send command
      if (command) {
        const cmd = await ControlCommand.create(command);
        await mqttControlService.sendCommand(eq, cmd);
        logger.info(`Command sent: ${cmd.commandType} to ${eq.name} (value: ${cmd.value})`);
      }
    }
  }

  /**
   * Control lighting based on stage parameters
   * @param {Array} equipment - Equipment list
   * @param {Object} lighting - Lighting parameters
   */
  async controlLighting(equipment, lighting) {
    const { ControlCommand } = require('../models');

    const lights = equipment.filter(eq => eq.type === 'light');

    for (const light of lights) {
      let command = null;

      if (lighting.hoursPerDay === 0) {
        // Turn off lights
        command = {
          equipmentId: light.id,
          zoneId: light.zoneId,
          commandType: 'turn_off',
          source: 'recipe',
          ownerId: light.ownerId
        };
      } else {
        // Turn on lights (schedule managed by ESP32)
        command = {
          equipmentId: light.id,
          zoneId: light.zoneId,
          commandType: 'turn_on',
          value: lighting.intensity || 100,
          source: 'recipe',
          ownerId: light.ownerId
        };
      }

      if (command) {
        const cmd = await ControlCommand.create(command);
        await mqttControlService.sendCommand(light, cmd);
        logger.info(`Lighting command sent: ${cmd.commandType} to ${light.name}`);
      }
    }
  }

  /**
   * Control irrigation based on stage parameters
   * @param {Array} equipment - Equipment list
   * @param {Object} irrigation - Irrigation parameters
   */
  async controlIrrigation(equipment, irrigation) {
    const { ControlCommand } = require('../models');

    const pumps = equipment.filter(eq => eq.type === 'pump');

    for (const pump of pumps) {
      if (irrigation.frequency && irrigation.frequency > 0) {
        // Enable irrigation (schedule managed by ESP32)
        const command = await ControlCommand.create({
          equipmentId: pump.id,
          zoneId: pump.zoneId,
          commandType: 'set_mode',
          mode: 'scheduled',
          value: irrigation.frequency,
          source: 'recipe',
          ownerId: pump.ownerId
        });

        await mqttControlService.sendCommand(pump, command);
        logger.info(`Irrigation scheduled: ${irrigation.frequency}x per day`);
      }
    }
  }

  /**
   * Check if stage should request approval (THIS IS THE KEY FEATURE!)
   * @param {Object} execution - RecipeExecution instance
   */
  async checkStageCompletion(execution) {
    try {
      const recipe = await execution.getRecipe();
      const zone = await execution.getZone();
      const stage = recipe.stages[execution.currentStage];

      if (!stage) {
        logger.warn(`Invalid stage index: ${execution.currentStage}`);
        return;
      }

      // Calculate days in current stage
      const daysInStage = execution.getDaysInCurrentStage();
      const minDuration = stage.duration;
      const maxDuration = stage.maxDuration || stage.duration + 5; // Add 5 days buffer

      logger.info(`Stage check: ${stage.name} - Day ${daysInStage}/${minDuration}-${maxDuration}`);

      // If minimum duration reached and no pending approval, request it!
      if (daysInStage >= minDuration && execution.status !== 'waiting_approval') {
        logger.info(`⏰ Stage ${stage.name} reached minimum duration (${minDuration} days)`);
        
        await this.requestStageApproval(execution, stage);
      }

      // If maximum duration exceeded without approval, send urgent reminder
      if (daysInStage > maxDuration && execution.status === 'waiting_approval') {
        logger.warn(`⚠️ Stage ${stage.name} exceeded maximum duration (${maxDuration} days)`);
        
        // Send urgent alert
        await alertService.createAlert({
          userId: execution.ownerId,
          type: 'warning',
          severity: 'high',
          title: 'Urgent: Stage Approval Overdue',
          message: `${recipe.cropName} in ${zone.name} has been in "${stage.name}" for ${daysInStage} days (max: ${maxDuration}). Please approve stage transition.`,
          zoneId: zone.id,
          actionUrl: `/zones/${zone.id}/approve-stage`
        });
      }

    } catch (error) {
      logger.error('Error checking stage completion:', error);
    }
  }

  /**
   * Request stage approval from manager (THE MAGIC MOMENT! 🎯)
   * @param {Object} execution - RecipeExecution instance
   * @param {Object} stage - Current stage
   */
  async requestStageApproval(execution, stage) {
    try {
      const recipe = await execution.getRecipe();
      const zone = await execution.getZone();
      const daysInStage = execution.getDaysInCurrentStage();

      // Build approval request
      const approvalRequest = {
        stage: execution.currentStage,
        stageName: stage.name,
        requestedAt: new Date(),
        daysInStage,
        minDuration: stage.duration,
        maxDuration: stage.maxDuration || stage.duration + 5,
        message: `Stage "${stage.name}" has reached day ${daysInStage} (expected: ${stage.duration}-${stage.maxDuration || stage.duration + 5} days). Is this stage complete?`,
        manualTasks: stage.manualTasks || []
      };

      // Update execution status
      await execution.update({
        status: 'waiting_approval',
        pendingApproval: approvalRequest,
        approvalRequestedAt: new Date()
      });

      // Send alert to manager
      await alertService.createAlert({
        userId: execution.ownerId,
        type: 'approval_required',
        severity: 'medium',
        title: `Stage Approval Required: ${recipe.cropName}`,
        message: approvalRequest.message,
        zoneId: zone.id,
        batchId: execution.batchNumber,
        actionUrl: `/zones/${zone.id}/approve-stage`,
        actionLabel: 'Review & Approve',
        metadata: approvalRequest
      });

      logger.info(`🔔 Stage approval requested for ${recipe.cropName} - ${stage.name} in ${zone.name}`);

      // Send notification (WhatsApp/SMS if configured)
      // This would trigger through the alertService notification system

    } catch (error) {
      logger.error('Error requesting stage approval:', error);
      throw error;
    }
  }

  /**
   * Approve stage transition (USER CLICKS "YES")
   * @param {String} executionId - RecipeExecution ID
   * @param {String} userId - User ID
   * @param {Object} approvalData - Approval data {approved, notes, manualTasksCompleted}
   */
  async approveStageTransition(executionId, userId, approvalData) {
    try {
      const execution = await RecipeExecution.findOne({
        where: { id: executionId, ownerId: userId }
      });

      if (!execution) {
        throw new Error('Recipe execution not found');
      }

      if (execution.status !== 'waiting_approval') {
        throw new Error('No pending approval for this execution');
      }

      const recipe = await execution.getRecipe();
      const zone = await execution.getZone();
      const currentStage = recipe.stages[execution.currentStage];

      if (approvalData.approved) {
        // ✅ APPROVED - Move to next stage!
        logger.info(`✅ Stage transition approved: ${currentStage.name} → Next stage`);

        // Record completion in history
        const stageHistory = execution.stageHistory || [];
        stageHistory.push({
          stage: execution.currentStage,
          stageName: currentStage.name,
          startedAt: execution.currentStageStartedAt,
          completedAt: new Date(),
          daysInStage: execution.getDaysInCurrentStage(),
          approvedBy: userId,
          notes: approvalData.notes || '',
          manualTasksCompleted: approvalData.manualTasksCompleted || false
        });

        const nextStage = execution.currentStage + 1;
        const isComplete = nextStage >= recipe.stages.length;

        if (isComplete) {
          // Recipe complete!
          await execution.update({
            status: 'completed',
            completedAt: new Date(),
            stageHistory,
            pendingApproval: null
          });

          // Update zone
          await zone.update({
            status: 'idle',
            activeRecipeId: null
          });

          // Send completion alert
          await alertService.createAlert({
            userId,
            type: 'batch_milestone',
            severity: 'low',
            title: 'Recipe Execution Complete!',
            message: `${recipe.cropName} has completed all stages in ${zone.name}. Ready for harvest!`,
            zoneId: zone.id,
            actionUrl: `/zones/${zone.id}`
          });

          logger.info(`🎉 Recipe execution completed: ${recipe.cropName} in ${zone.name}`);

        } else {
          // Move to next stage
          const nextStageData = recipe.stages[nextStage];
          
          await execution.update({
            currentStage: nextStage,
            status: 'active',
            currentStageStartedAt: new Date(),
            stageHistory,
            pendingApproval: null,
            approvalRequestedAt: null
          });

          // Apply next stage configuration
          await this.applyStageConfiguration(execution, nextStage);

          // Update zone
          await zone.update({
            currentStage: nextStage
          });

          // Update ESP32 display
          if (zone.deviceId) {
            await this.updateDeviceDisplay(execution);
          }

          // Send transition alert
          await alertService.createAlert({
            userId,
            type: 'batch_milestone',
            severity: 'low',
            title: 'Stage Transition Complete',
            message: `${recipe.cropName} in ${zone.name} has moved to "${nextStageData.name}" stage.`,
            zoneId: zone.id,
            actionUrl: `/zones/${zone.id}`
          });

          logger.info(`➡️  Stage transition complete: ${currentStage.name} → ${nextStageData.name}`);
        }

      } else {
        // ❌ NOT APPROVED - Continue current stage
        logger.info(`❌ Stage transition declined: ${currentStage.name} - continuing`);

        await execution.update({
          status: 'active',
          pendingApproval: null,
          approvalRequestedAt: null
        });

        // Send alert
        await alertService.createAlert({
          userId,
          type: 'info',
          severity: 'low',
          title: 'Stage Extension',
          message: `${recipe.cropName} in ${zone.name} will continue in "${currentStage.name}" stage.`,
          zoneId: zone.id
        });
      }

      return execution;

    } catch (error) {
      logger.error('Error approving stage transition:', error);
      throw error;
    }
  }

  /**
   * Update device display with current recipe info
   * @param {Object} execution - RecipeExecution instance
   */
  async updateDeviceDisplay(execution) {
    try {
      const recipe = await execution.getRecipe();
      const zone = await execution.getZone();
      const stage = recipe.stages[execution.currentStage];

      if (!zone.deviceId) {
        return;
      }

      const recipeInfo = {
        cropName: recipe.cropName,
        currentStage: execution.currentStage,
        stageName: stage?.name || 'Unknown',
        totalStages: recipe.stages.length,
        progress: execution.getProgress(),
        daysInStage: execution.getDaysInCurrentStage(),
        expectedDuration: `${stage?.duration || 0}-${stage?.maxDuration || stage?.duration + 5 || 0}`,
        status: execution.status
      };

      await mqttControlService.sendRecipeInfo(zone.deviceId, recipeInfo);

      logger.info(`📺 Display updated for ${zone.deviceId}`);

    } catch (error) {
      logger.error('Error updating device display:', error);
    }
  }

  /**
   * Pause recipe execution
   * @param {String} executionId - RecipeExecution ID
   * @param {String} userId - User ID
   */
  async pauseExecution(executionId, userId) {
    try {
      const execution = await RecipeExecution.findOne({
        where: { id: executionId, ownerId: userId }
      });

      if (!execution) {
        throw new Error('Recipe execution not found');
      }

      await execution.update({ status: 'paused' });

      logger.info(`⏸️  Recipe execution paused: ${executionId}`);

      return execution;

    } catch (error) {
      logger.error('Error pausing execution:', error);
      throw error;
    }
  }

  /**
   * Resume recipe execution
   * @param {String} executionId - RecipeExecution ID
   * @param {String} userId - User ID
   */
  async resumeExecution(executionId, userId) {
    try {
      const execution = await RecipeExecution.findOne({
        where: { id: executionId, ownerId: userId }
      });

      if (!execution) {
        throw new Error('Recipe execution not found');
      }

      await execution.update({ status: 'active' });

      logger.info(`▶️  Recipe execution resumed: ${executionId}`);

      return execution;

    } catch (error) {
      logger.error('Error resuming execution:', error);
      throw error;
    }
  }

  /**
   * Abort recipe execution
   * @param {String} executionId - RecipeExecution ID
   * @param {String} userId - User ID
   */
  async abortExecution(executionId, userId) {
    try {
      const execution = await RecipeExecution.findOne({
        where: { id: executionId, ownerId: userId }
      });

      if (!execution) {
        throw new Error('Recipe execution not found');
      }

      const zone = await execution.getZone();

      await execution.update({
        status: 'aborted',
        completedAt: new Date()
      });

      // Update zone
      await zone.update({
        status: 'idle',
        activeRecipeId: null
      });

      logger.info(`🛑 Recipe execution aborted: ${executionId}`);

      return execution;

    } catch (error) {
      logger.error('Error aborting execution:', error);
      throw error;
    }
  }

  /**
   * Get active executions that need approval check
   * (Called by scheduler every hour)
   */
  async checkAllExecutions() {
    try {
      const activeExecutions = await RecipeExecution.findAll({
        where: {
          status: { [Op.in]: ['active', 'waiting_approval'] }
        },
        include: [
          { model: CropRecipe, as: 'recipe' },
          { model: Zone, as: 'zone' }
        ]
      });

      logger.info(`Checking ${activeExecutions.length} active recipe executions...`);

      for (const execution of activeExecutions) {
        await this.checkStageCompletion(execution);
      }

      logger.info(`✅ Recipe execution check complete`);

    } catch (error) {
      logger.error('Error checking all executions:', error);
    }
  }
}

// Export singleton instance
module.exports = new RecipeExecutionService();

