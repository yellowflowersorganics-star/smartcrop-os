/**
 * SmartCrop OS - MQTT Service
 * Handles communication with edge devices
 */

const mqtt = require('mqtt');
const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');

class MQTTService {
  constructor() {
    this.client = null;
    this.subscribers = new Map();
  }

  /**
   * Connect to MQTT broker
   */
  async connect() {
    const options = {
      clientId: process.env.MQTT_CLIENT_ID || 'smartcrop-backend',
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clean: true,
      reconnectPeriod: 5000
    };

    this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', options);

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        logger.info('MQTT broker connected');
        this.subscribeToTopics();
        resolve();
      });

      this.client.on('error', (error) => {
        logger.error('MQTT connection error:', error);
        reject(error);
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      this.client.on('reconnect', () => {
        logger.info('MQTT reconnecting...');
      });

      this.client.on('close', () => {
        logger.warn('MQTT connection closed');
      });
    });
  }

  /**
   * Subscribe to device topics
   */
  subscribeToTopics() {
    const topics = [
      'smartcrop/+/telemetry',      // Device telemetry
      'smartcrop/+/status',          // Device status
      'smartcrop/+/response',        // Command responses
      'smartcrop/+/alert'            // Device alerts
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          logger.info(`Subscribed to ${topic}`);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT message
   */
  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      logger.debug(`MQTT message received on ${topic}:`, payload);

      const topicParts = topic.split('/');
      const deviceId = topicParts[1];
      const messageType = topicParts[2];

      switch (messageType) {
        case 'telemetry':
          await this.handleTelemetry(deviceId, payload);
          break;
        case 'status':
          await this.handleDeviceStatus(deviceId, payload);
          break;
        case 'response':
          await this.handleCommandResponse(deviceId, payload);
          break;
        case 'alert':
          await this.handleAlert(deviceId, payload);
          break;
        default:
          logger.warn(`Unknown message type: ${messageType}`);
      }

      // Call registered subscribers
      const subscribers = this.subscribers.get(topic) || [];
      subscribers.forEach(callback => callback(topic, payload));

    } catch (error) {
      logger.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Handle telemetry data from device
   */
  async handleTelemetry(deviceId, data) {
    try {
      const redis = getRedisClient();
      
      // Store latest telemetry in Redis
      const key = `telemetry:${deviceId}:latest`;
      await redis.setEx(key, 3600, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));

      // TODO: Store in time-series database for historical data
      logger.debug(`Telemetry stored for device ${deviceId}`);
    } catch (error) {
      logger.error('Error handling telemetry:', error);
    }
  }

  /**
   * Handle device status update
   */
  async handleDeviceStatus(deviceId, status) {
    try {
      const redis = getRedisClient();
      
      const key = `device:${deviceId}:status`;
      await redis.setEx(key, 300, JSON.stringify({
        ...status,
        lastSeen: new Date().toISOString()
      }));

      logger.info(`Device ${deviceId} status: ${status.status}`);
    } catch (error) {
      logger.error('Error handling device status:', error);
    }
  }

  /**
   * Handle command response from device
   */
  async handleCommandResponse(deviceId, response) {
    logger.info(`Command response from ${deviceId}:`, response);
    // TODO: Update command status in database
  }

  /**
   * Handle alert from device
   */
  async handleAlert(deviceId, alert) {
    logger.warn(`Alert from device ${deviceId}:`, alert);
    // TODO: Store alert and trigger notifications
  }

  /**
   * Publish control command to device
   */
  publishCommand(deviceId, command) {
    const topic = `smartcrop/${deviceId}/command`;
    const payload = JSON.stringify({
      ...command,
      timestamp: new Date().toISOString(),
      messageId: `cmd_${Date.now()}`
    });

    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        logger.error(`Failed to publish command to ${deviceId}:`, err);
      } else {
        logger.info(`Command published to ${deviceId}:`, command);
      }
    });
  }

  /**
   * Publish setpoints to device
   */
  publishSetpoints(deviceId, setpoints) {
    const topic = `smartcrop/${deviceId}/setpoints`;
    const payload = JSON.stringify({
      ...setpoints,
      timestamp: new Date().toISOString()
    });

    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        logger.error(`Failed to publish setpoints to ${deviceId}:`, err);
      } else {
        logger.info(`Setpoints published to ${deviceId}`);
      }
    });
  }

  /**
   * Register a custom message handler
   */
  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);
  }

  /**
   * Get latest telemetry for a device
   */
  async getLatestTelemetry(deviceId) {
    try {
      const redis = getRedisClient();
      const key = `telemetry:${deviceId}:latest`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting telemetry:', error);
      return null;
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      logger.info('MQTT client disconnected');
    }
  }
}

const mqttService = new MQTTService();

module.exports = {
  connectMQTT: () => mqttService.connect(),
  mqttService
};

