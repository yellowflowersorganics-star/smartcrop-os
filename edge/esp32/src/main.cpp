/**
 * SmartCrop OS - ESP32 Edge Controller
 * Main firmware for environmental monitoring and control
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "config.h"
#include "sensors.h"
#include "actuators.h"
#include "recipe_executor.h"

// WiFi and MQTT clients
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Preferences preferences;

// Component instances
Sensors sensors;
Actuators actuators;
RecipeExecutor recipeExecutor;

// Device configuration
String deviceId;
String zoneId;

// Timing
unsigned long lastTelemetryTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long TELEMETRY_INTERVAL = 60000;    // 60 seconds
const unsigned long HEARTBEAT_INTERVAL = 30000;    // 30 seconds

/**
 * Setup WiFi connection
 */
void setupWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

/**
 * MQTT message callback
 */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  
  // Parse JSON payload
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    return;
  }
  
  String topicStr = String(topic);
  
  // Handle setpoints update
  if (topicStr.endsWith("/setpoints")) {
    recipeExecutor.updateSetpoints(doc);
    Serial.println("Setpoints updated");
  }
  
  // Handle control commands
  else if (topicStr.endsWith("/command")) {
    String command = doc["command"] | "";
    String actuator = doc["actuator"] | "";
    String action = doc["action"] | "";
    
    if (command == "override") {
      actuators.manualControl(actuator, action);
      Serial.printf("Manual override: %s -> %s\n", actuator.c_str(), action.c_str());
    }
    else if (command == "emergency_stop") {
      actuators.emergencyStop();
      Serial.println("Emergency stop activated");
    }
  }
  
  // Handle configuration updates
  else if (topicStr.endsWith("/config")) {
    if (doc.containsKey("telemetryInterval")) {
      // Update telemetry interval
    }
    Serial.println("Configuration updated");
  }
}

/**
 * Connect to MQTT broker
 */
void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    if (mqttClient.connect(deviceId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      
      // Subscribe to topics
      String commandTopic = "smartcrop/" + deviceId + "/command";
      String setpointsTopic = "smartcrop/" + deviceId + "/setpoints";
      String configTopic = "smartcrop/" + deviceId + "/config";
      
      mqttClient.subscribe(commandTopic.c_str());
      mqttClient.subscribe(setpointsTopic.c_str());
      mqttClient.subscribe(configTopic.c_str());
      
      Serial.println("Subscribed to control topics");
      
      // Publish online status
      publishStatus("online");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

/**
 * Publish device status
 */
void publishStatus(const char* status) {
  String topic = "smartcrop/" + deviceId + "/status";
  
  DynamicJsonDocument doc(256);
  doc["status"] = status;
  doc["deviceId"] = deviceId;
  doc["zoneId"] = zoneId;
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  doc["uptime"] = millis() / 1000;
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["rssi"] = WiFi.RSSI();
  
  String payload;
  serializeJson(doc, payload);
  
  mqttClient.publish(topic.c_str(), payload.c_str(), true);
}

/**
 * Publish telemetry data
 */
void publishTelemetry() {
  // Read all sensors
  SensorReadings readings = sensors.readAll();
  
  String topic = "smartcrop/" + deviceId + "/telemetry";
  
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  doc["zoneId"] = zoneId;
  doc["timestamp"] = millis();
  
  // Environmental data
  JsonObject env = doc.createNestedObject("environment");
  env["temperature"] = readings.temperature;
  env["humidity"] = readings.humidity;
  env["co2"] = readings.co2;
  env["lightLevel"] = readings.lightLevel;
  env["soilMoisture"] = readings.soilMoisture;
  
  // Actuator states
  JsonObject actuatorStates = doc.createNestedObject("actuators");
  actuatorStates["fan"] = actuators.getState("fan");
  actuatorStates["humidifier"] = actuators.getState("humidifier");
  actuatorStates["heater"] = actuators.getState("heater");
  actuatorStates["light"] = actuators.getState("light");
  actuatorStates["pump"] = actuators.getState("pump");
  
  String payload;
  serializeJson(doc, payload);
  
  mqttClient.publish(topic.c_str(), payload.c_str());
  
  Serial.println("Telemetry published");
  Serial.printf("Temp: %.1f°C, RH: %.1f%%, CO2: %dppm\n", 
                readings.temperature, readings.humidity, readings.co2);
}

/**
 * Publish alert
 */
void publishAlert(const char* level, const char* message) {
  String topic = "smartcrop/" + deviceId + "/alert";
  
  DynamicJsonDocument doc(256);
  doc["deviceId"] = deviceId;
  doc["zoneId"] = zoneId;
  doc["level"] = level;
  doc["message"] = message;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  mqttClient.publish(topic.c_str(), payload.c_str());
  Serial.printf("Alert published: %s\n", message);
}

/**
 * Setup function - runs once
 */
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=================================");
  Serial.println("SmartCrop OS - ESP32 Controller");
  Serial.println("Firmware Version: " + String(FIRMWARE_VERSION));
  Serial.println("=================================\n");
  
  // Initialize preferences
  preferences.begin("smartcrop", false);
  
  // Get or generate device ID
  deviceId = preferences.getString("deviceId", "");
  if (deviceId == "") {
    deviceId = "ESP32_" + String((uint32_t)ESP.getEfuseMac(), HEX);
    preferences.putString("deviceId", deviceId);
  }
  Serial.println("Device ID: " + deviceId);
  
  // Get zone ID (set via provisioning)
  zoneId = preferences.getString("zoneId", "unassigned");
  Serial.println("Zone ID: " + zoneId);
  
  // Initialize components
  sensors.begin();
  actuators.begin();
  recipeExecutor.begin();
  
  // Connect WiFi
  setupWiFi();
  
  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(1024);
  
  Serial.println("Setup complete\n");
}

/**
 * Main loop
 */
void loop() {
  unsigned long currentTime = millis();
  
  // Maintain WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost, reconnecting...");
    setupWiFi();
  }
  
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();
  
  // Publish telemetry
  if (currentTime - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    publishTelemetry();
    lastTelemetryTime = currentTime;
  }
  
  // Publish heartbeat
  if (currentTime - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    publishStatus("running");
    lastHeartbeatTime = currentTime;
  }
  
  // Execute recipe control logic
  SensorReadings readings = sensors.readAll();
  recipeExecutor.execute(readings, actuators);
  
  // Check for sensor errors
  if (readings.temperature < -40 || readings.temperature > 85) {
    publishAlert("warning", "Temperature sensor error");
  }
  
  delay(1000);  // 1 second delay
}

