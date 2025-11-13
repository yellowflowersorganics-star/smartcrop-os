const mqtt = require('mqtt');
const logger = require('../utils/logger');

class MQTTControlService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  }

  /**
   * Connect to MQTT broker
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.client && this.connected) {
          logger.info('MQTT already connected');
          return resolve(true);
        }

        logger.info(`Connecting to MQTT broker: ${this.brokerUrl}`);

        this.client = mqtt.connect(this.brokerUrl, {
          clientId: `smartcrop-backend-${Date.now()}`,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000
        });

        this.client.on('connect', () => {
          this.connected = true;
          logger.info('✅ MQTT Control Service connected');
          
          // Subscribe to status updates from all devices
          this.client.subscribe('smartcrop/+/status/#', (err) => {
            if (err) {
              logger.error('Failed to subscribe to status topics:', err);
            } else {
              logger.info('📡 Subscribed to device status updates');
            }
          });

          // Subscribe to command acknowledgments
          this.client.subscribe('smartcrop/+/ack/#', (err) => {
            if (err) {
              logger.error('Failed to subscribe to ack topics:', err);
            } else {
              logger.info('📡 Subscribed to command acknowledgments');
            }
          });

          resolve(true);
        });

        this.client.on('error', (error) => {
          logger.error('MQTT connection error:', error);
          this.connected = false;
          reject(error);
        });

        this.client.on('close', () => {
          logger.warn('MQTT connection closed');
          this.connected = false;
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

      } catch (error) {
        logger.error('Failed to connect to MQTT:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      logger.debug(`MQTT message received on ${topic}:`, payload);

      // Handle status updates
      if (topic.includes('/status/')) {
        this.handleStatusUpdate(topic, payload);
      }

      // Handle command acknowledgments
      if (topic.includes('/ack/')) {
        this.handleCommandAck(topic, payload);
      }

    } catch (error) {
      logger.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Handle device status updates
   */
  async handleStatusUpdate(topic, payload) {
    // Extract device ID from topic: smartcrop/{deviceId}/status/...
    const parts = topic.split('/');
    const deviceId = parts[1];

    logger.info(`Status update from ${deviceId}:`, payload);

    // Update equipment status in database
    const { Equipment } = require('../models');
    
    if (payload.equipment) {
      for (const [equipmentName, status] of Object.entries(payload.equipment)) {
        try {
          await Equipment.update(
            {
              status: status.state || 'unknown',
              currentValue: status.value || 0,
              lastStatusUpdate: new Date()
            },
            {
              where: {
                deviceId,
                name: equipmentName
              }
            }
          );
        } catch (error) {
          logger.error(`Failed to update equipment ${equipmentName}:`, error);
        }
      }
    }

    // Update environmental data if included
    if (payload.environment) {
      const { Telemetry, Zone } = require('../models');
      
      try {
        // Find zone by device ID
        const zone = await Zone.findOne({
          where: { deviceId }
        });

        if (zone) {
          await Telemetry.create({
            zoneId: zone.id,
            deviceId,
            temperature: payload.environment.temperature,
            humidity: payload.environment.humidity,
            co2: payload.environment.co2,
            light: payload.environment.light,
            airflow: payload.environment.airflow,
            source: 'sensor',
            timestamp: new Date()
          });
        }
      } catch (error) {
        logger.error('Failed to record telemetry:', error);
      }
    }
  }

  /**
   * Handle command acknowledgments
   */
  async handleCommandAck(topic, payload) {
    const parts = topic.split('/');
    const deviceId = parts[1];

    logger.info(`Command ACK from ${deviceId}:`, payload);

    // Update command status in database
    const { ControlCommand } = require('../models');
    
    if (payload.commandId) {
      try {
        const updates = {
          status: payload.success ? 'completed' : 'failed',
          completedAt: new Date()
        };

        if (!payload.success && payload.error) {
          updates.errorMessage = payload.error;
        }

        await ControlCommand.update(updates, {
          where: { id: payload.commandId }
        });

        logger.info(`Command ${payload.commandId} ${payload.success ? 'completed' : 'failed'}`);
      } catch (error) {
        logger.error('Failed to update command status:', error);
      }
    }
  }

  /**
   * Send control command to device
   * @param {Object} equipment - Equipment model instance
   * @param {Object} command - ControlCommand model instance
   * @returns {Promise<Object>} Result
   */
  async sendCommand(equipment, command) {
    try {
      if (!this.connected) {
        logger.warn('MQTT not connected, attempting to connect...');
        await this.connect();
      }

      // Build command payload
      const payload = {
        commandId: command.id,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentPin: equipment.pin,
        commandType: command.commandType,
        timestamp: new Date().toISOString()
      };

      // Add command-specific data
      if (command.value !== undefined && command.value !== null) {
        payload.value = command.value;
      }

      if (command.mode) {
        payload.mode = command.mode;
      }

      // Build MQTT topic
      const topic = `smartcrop/${equipment.deviceId}/command/${equipment.type}/${equipment.name}`;

      // Publish command
      return new Promise((resolve, reject) => {
        this.client.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1, retain: false },
          (error) => {
            if (error) {
              logger.error(`Failed to publish command to ${topic}:`, error);
              reject({ success: false, error: error.message });
            } else {
              logger.info(`✅ Command published to ${topic}:`, payload.commandType);
              resolve({ success: true, topic, payload });
            }
          }
        );
      });

    } catch (error) {
      logger.error('Error sending MQTT command:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send recipe stage configuration to device
   * @param {String} deviceId - ESP32 device ID
   * @param {Object} stageConfig - Stage configuration
   * @returns {Promise<Object>} Result
   */
  async sendStageConfig(deviceId, stageConfig) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const topic = `smartcrop/${deviceId}/config/stage`;
      const payload = {
        stageName: stageConfig.name,
        duration: stageConfig.duration,
        environmental: stageConfig.environmental,
        irrigation: stageConfig.irrigation,
        lighting: stageConfig.lighting,
        timestamp: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        this.client.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1, retain: true }, // Retain for device to get on reconnect
          (error) => {
            if (error) {
              logger.error(`Failed to publish stage config to ${topic}:`, error);
              reject({ success: false, error: error.message });
            } else {
              logger.info(`✅ Stage config published to ${topic}`);
              resolve({ success: true, topic, payload });
            }
          }
        );
      });

    } catch (error) {
      logger.error('Error sending stage config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send recipe information to device display
   * @param {String} deviceId - ESP32 device ID
   * @param {Object} recipeInfo - Recipe information
   * @returns {Promise<Object>} Result
   */
  async sendRecipeInfo(deviceId, recipeInfo) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const topic = `smartcrop/${deviceId}/display/recipe`;
      const payload = {
        recipeName: recipeInfo.cropName,
        currentStage: recipeInfo.currentStage,
        stageName: recipeInfo.stageName,
        totalStages: recipeInfo.totalStages,
        progress: recipeInfo.progress,
        daysInStage: recipeInfo.daysInStage,
        expectedDuration: recipeInfo.expectedDuration,
        status: recipeInfo.status,
        timestamp: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        this.client.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1, retain: true },
          (error) => {
            if (error) {
              logger.error(`Failed to publish recipe info to ${topic}:`, error);
              reject({ success: false, error: error.message });
            } else {
              logger.info(`✅ Recipe info published to ${topic}`);
              resolve({ success: true, topic, payload });
            }
          }
        );
      });

    } catch (error) {
      logger.error('Error sending recipe info:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Request device to send current status
   * @param {String} deviceId - ESP32 device ID
   * @returns {Promise<Object>} Result
   */
  async requestDeviceStatus(deviceId) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const topic = `smartcrop/${deviceId}/command/status_request`;
      const payload = {
        requestId: `status_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        this.client.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1 },
          (error) => {
            if (error) {
              reject({ success: false, error: error.message });
            } else {
              logger.info(`✅ Status request sent to ${deviceId}`);
              resolve({ success: true });
            }
          }
        );
      });

    } catch (error) {
      logger.error('Error requesting device status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
      logger.info('MQTT Control Service disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      connected: this.connected,
      brokerUrl: this.brokerUrl,
      clientId: this.client?.options?.clientId || null
    };
  }
}

// Export singleton instance
module.exports = new MQTTControlService();

