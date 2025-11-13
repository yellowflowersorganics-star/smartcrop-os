/**
 * ═══════════════════════════════════════════════════════════════════════
 * SmartCrop OS - ESP32 MASTER CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE: Master-Slave Hierarchy with ESP-NOW + MQTT
 * 
 * RESPONSIBILITIES:
 *   - MQTT Gateway (ONLY node that talks to Raspberry Pi)
 *   - ESP-NOW Master (coordinates 0-5 slave nodes)
 *   - Data Aggregator (combines sensor data from all nodes)
 *   - Equipment Controller (8 relays + 2 PWM outputs)
 *   - Display Controller (OLED/TFT status display)
 *   - Local Sensors (DHT22, BH1750, MQ-135)
 *   - Auto-Control Intelligence (PID-like control)
 *   - User Interface (button for manual control)
 * 
 * SCALABILITY:
 *   - Standalone Mode: 1 ESP32 (all-in-one)
 *   - Master-Slave Mode: 1 Master + 1-5 Slaves
 * 
 * COMMUNICATION:
 *   - Raspberry Pi → Master: MQTT (WiFi)
 *   - Master ↔ Slaves: ESP-NOW (peer-to-peer, <10ms latency)
 * 
 * VERSION: 2.0
 * AUTHOR: SmartCrop OS Team
 * LICENSE: MIT
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════
// LIBRARY IMPORTS
// ═══════════════════════════════════════════════════════════════════════

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <BH1750.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <time.h>

// ═══════════════════════════════════════════════════════════════════════
// HARDWARE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

// WiFi Configuration
const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// MQTT Configuration
const char* MQTT_BROKER = "192.168.1.100";  // Raspberry Pi IP
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "ESP32-MASTER-ZONE-A";
const char* MQTT_USERNAME = "";  // Optional
const char* MQTT_PASSWORD = "";  // Optional

// Zone Configuration
const char* FARM_ID = "farm1";
const char* ZONE_ID = "zone-a";
String DEVICE_ID = "ESP32-MASTER-ZONE-A";

// Pin Configuration
#define DHT_PIN 4
#define DHT_TYPE DHT22

#define I2C_SDA 21
#define I2C_SCL 22

// 8 Relay Outputs (Active LOW)
#define RELAY_1 13  // Exhaust Fan
#define RELAY_2 14  // Circulation Fan
#define RELAY_3 27  // Heater
#define RELAY_4 26  // Humidifier
#define RELAY_5 25  // Grow Lights
#define RELAY_6 33  // Irrigation Pump
#define RELAY_7 32  // Water Valve
#define RELAY_8 15  // Spare/Cooler

// PWM Outputs (for fan speed control)
#define PWM_FAN_1 16  // Exhaust Fan PWM
#define PWM_FAN_2 17  // Circulation Fan PWM

// Button Input
#define BUTTON_PIN 0  // Boot button

// Display Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW MESSAGE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════

enum MessageType {
  MSG_STAGE_CONFIG = 1,       // Master → Slaves: Recipe stage config
  MSG_SENSOR_DATA = 2,        // Slaves → Master: Sensor readings
  MSG_EQUIPMENT_CMD = 3,      // Master → Slaves: Equipment command
  MSG_EQUIPMENT_STATUS = 4,   // Slaves → Master: Equipment status
  MSG_IRRIGATION_SCHEDULE = 5, // Master → Irrigation: Schedule
  MSG_IRRIGATION_COMPLETE = 6, // Irrigation → Master: Cycle done
  MSG_LIGHTING_SCHEDULE = 7,   // Master → Lighting: Schedule
  MSG_HEARTBEAT = 8,          // Slaves → Master: I'm alive
  MSG_REQUEST_CONFIG = 9,     // Slaves → Master: Resend config
  MSG_SLAVE_REGISTER = 10     // Slave → Master: Register me
};

typedef struct {
  uint8_t type;
  uint8_t slaveId;            // 0=Master, 1-5=Slaves
  uint8_t slaveType;          // 1=Sensor, 2=Irrigation, 3=Lighting
  uint8_t stageIndex;
  char stageName[32];
  
  // Environmental targets
  float targetTemp;
  float targetHumidity;
  float targetCO2;
  float targetLight;
  
  // Sensor readings
  float temperature;
  float humidity;
  float co2;
  float light;
  float soilMoisture;
  float waterPressure;
  
  // Equipment settings
  uint8_t exhaustFanSpeed;
  uint8_t circulationFanSpeed;
  uint8_t humidifierLevel;
  bool heaterState;
  bool lightsState;
  uint8_t lightIntensity;
  
  // Irrigation
  bool irrigationEnabled;
  uint8_t irrigationFrequency;
  uint16_t irrigationDuration;  // seconds
  char irrigationTimes[4][6];   // "HH:MM"
  float flowRate;
  uint16_t waterUsed;           // liters
  
  // Lighting schedule
  char lightOnTime[6];
  char lightOffTime[6];
  uint16_t photoperiod;         // hours
  
  // Status
  unsigned long timestamp;
  uint8_t batteryLevel;
  int8_t rssi;
  uint16_t errorCode;
  
  // MAC address for registration
  uint8_t macAddress[6];
  
} espnow_message_t;

// ═══════════════════════════════════════════════════════════════════════
// SLAVE NODE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

struct SlaveNode {
  uint8_t macAddress[6];
  uint8_t slaveId;
  uint8_t slaveType;          // 1=Sensor, 2=Irrigation, 3=Lighting
  char name[32];
  bool isOnline;
  unsigned long lastHeartbeat;
  float temperature;
  float humidity;
  float co2;
  float light;
  float soilMoisture;
  int8_t rssi;
};

SlaveNode slaves[5];
uint8_t slaveCount = 0;
bool standaloneMode = true;   // No slaves registered

// ═══════════════════════════════════════════════════════════════════════
// RECIPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

struct RecipeConfig {
  String name;
  String recipeId;
  uint8_t currentStage;
  String stageName;
  
  // Environmental targets
  float targetTemp;
  float tempMin;
  float tempMax;
  float targetHumidity;
  float humidityMin;
  float humidityMax;
  float targetCO2;
  float co2Max;
  float targetLight;
  
  // Equipment settings
  uint8_t exhaustFanSpeed;
  uint8_t circulationFanSpeed;
  uint8_t humidifierLevel;
  uint8_t heaterPower;
  bool lightsEnabled;
  uint8_t lightIntensity;
  
  // Irrigation
  bool irrigationEnabled;
  uint8_t irrigationFrequency;
  uint16_t irrigationDuration;
  
  // Stage timing
  unsigned long stageStartedAt;
  uint16_t stageDays;
  
  bool active;
};

RecipeConfig currentRecipe;

// ═══════════════════════════════════════════════════════════════════════
// SENSOR DATA
// ═══════════════════════════════════════════════════════════════════════

// Local sensors
float localTemp = 0.0;
float localHumidity = 0.0;
float localCO2 = 0.0;
float localLight = 0.0;

// Aggregated from all nodes
float avgTemp = 0.0;
float avgHumidity = 0.0;
float avgCO2 = 0.0;
float avgLight = 0.0;

// ═══════════════════════════════════════════════════════════════════════
// EQUIPMENT STATE
// ═══════════════════════════════════════════════════════════════════════

uint8_t exhaustFanSpeed = 0;
uint8_t circulationFanSpeed = 0;
bool heaterState = false;
uint8_t humidifierLevel = 0;
bool lightsState = false;
uint8_t lightIntensity = 0;

// ═══════════════════════════════════════════════════════════════════════
// OBJECT INSTANCES
// ═══════════════════════════════════════════════════════════════════════

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter(0x23);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ═══════════════════════════════════════════════════════════════════════
// TIMING VARIABLES
// ═══════════════════════════════════════════════════════════════════════

unsigned long lastSensorRead = 0;
unsigned long lastMqttPublish = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastHeartbeatCheck = 0;
unsigned long lastButtonPress = 0;

const unsigned long SENSOR_READ_INTERVAL = 5000;    // 5 seconds
const unsigned long MQTT_PUBLISH_INTERVAL = 30000;  // 30 seconds
const unsigned long DISPLAY_UPDATE_INTERVAL = 2000; // 2 seconds
const unsigned long HEARTBEAT_TIMEOUT = 60000;      // 60 seconds
const unsigned long BUTTON_DEBOUNCE = 500;          // 500ms

// ═══════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println("  SmartCrop OS - ESP32 MASTER CONTROLLER v2.0");
  Serial.println("  Architecture: Hierarchical Master-Slave");
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println();
  
  // Initialize hardware
  initGPIO();
  initSensors();
  initDisplay();
  
  // Initialize connectivity
  initWiFi();
  initESPNow();
  initMQTT();
  
  // Initialize recipe
  currentRecipe.active = false;
  currentRecipe.name = "No Recipe";
  currentRecipe.stageName = "Idle";
  
  Serial.println();
  Serial.println("✅ MASTER CONTROLLER READY");
  Serial.println("🎯 Mode: " + String(standaloneMode ? "Standalone" : "Master-Slave"));
  Serial.println("📡 Waiting for backend commands...");
  Serial.println();
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

void loop() {
  // Maintain connections
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();
  
  // Read local sensors
  if (millis() - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readLocalSensors();
    aggregateSensorData();
    autoControlEquipment();
    lastSensorRead = millis();
  }
  
  // Publish to backend
  if (millis() - lastMqttPublish >= MQTT_PUBLISH_INTERVAL) {
    publishStatusToBackend();
    lastMqttPublish = millis();
  }
  
  // Update display
  if (millis() - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL) {
    updateDisplay();
    lastDisplayUpdate = millis();
  }
  
  // Check slave heartbeats
  if (millis() - lastHeartbeatCheck >= HEARTBEAT_TIMEOUT / 2) {
    checkSlaveHeartbeats();
    lastHeartbeatCheck = millis();
  }
  
  // Handle button press
  if (digitalRead(BUTTON_PIN) == LOW && millis() - lastButtonPress > BUTTON_DEBOUNCE) {
    handleButtonPress();
    lastButtonPress = millis();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GPIO INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initGPIO() {
  Serial.print("Initializing GPIO...");
  
  // Setup relay outputs (Active LOW)
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);
  pinMode(RELAY_5, OUTPUT);
  pinMode(RELAY_6, OUTPUT);
  pinMode(RELAY_7, OUTPUT);
  pinMode(RELAY_8, OUTPUT);
  
  // Turn OFF all relays
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
  digitalWrite(RELAY_3, HIGH);
  digitalWrite(RELAY_4, HIGH);
  digitalWrite(RELAY_5, HIGH);
  digitalWrite(RELAY_6, HIGH);
  digitalWrite(RELAY_7, HIGH);
  digitalWrite(RELAY_8, HIGH);
  
  // Setup PWM channels
  ledcSetup(0, 25000, 8);  // Channel 0, 25kHz, 8-bit
  ledcSetup(1, 25000, 8);  // Channel 1, 25kHz, 8-bit
  ledcAttachPin(PWM_FAN_1, 0);
  ledcAttachPin(PWM_FAN_2, 1);
  ledcWrite(0, 0);  // 0% duty cycle
  ledcWrite(1, 0);
  
  // Setup button
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  Serial.println(" ✓");
}

// ═══════════════════════════════════════════════════════════════════════
// SENSOR INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initSensors() {
  Serial.print("Initializing sensors...");
  
  Wire.begin(I2C_SDA, I2C_SCL);
  
  dht.begin();
  
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.print(" [Light] ");
  } else {
    Serial.print(" [Light:FAIL] ");
  }
  
  Serial.println(" ✓");
}

// ═══════════════════════════════════════════════════════════════════════
// DISPLAY INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initDisplay() {
  Serial.print("Initializing display...");
  
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(" FAIL!");
    return;
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("SmartCrop OS");
  display.println("MASTER v2.0");
  display.println("");
  display.println("Booting...");
  display.display();
  
  Serial.println(" ✓");
}

// ═══════════════════════════════════════════════════════════════════════
// WIFI INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initWiFi() {
  Serial.print("Connecting to WiFi");
  
  WiFi.mode(WIFI_MODE_APSTA);  // AP+STA for ESP-NOW + WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✓");
    Serial.println("IP Address: " + WiFi.localIP().toString());
    Serial.println("MAC Address: " + WiFi.macAddress());
  } else {
    Serial.println(" FAIL! Operating in offline mode");
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW INITIALIZATION (Master Mode)
// ═══════════════════════════════════════════════════════════════════════

void initESPNow() {
  Serial.print("Initializing ESP-NOW (Master)...");
  
  if (esp_now_init() != ESP_OK) {
    Serial.println(" FAIL!");
    return;
  }
  
  // Register receive callback
  esp_now_register_recv_cb(onESPNowRecv);
  
  // Register send callback
  esp_now_register_send_cb(onESPNowSend);
  
  Serial.println(" ✓");
  Serial.println("🎯 ESP-NOW Master ready to accept slave registrations");
  
  standaloneMode = true;
  slaveCount = 0;
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW RECEIVE CALLBACK
// ═══════════════════════════════════════════════════════════════════════

void onESPNowRecv(const uint8_t *mac, const uint8_t *data, int len) {
  espnow_message_t msg;
  memcpy(&msg, data, sizeof(msg));
  
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  
  // Handle different message types
  switch (msg.type) {
    case MSG_SLAVE_REGISTER:
      handleSlaveRegistration(mac, &msg);
      break;
      
    case MSG_SENSOR_DATA:
      handleSensorData(mac, &msg);
      break;
      
    case MSG_EQUIPMENT_STATUS:
      handleEquipmentStatus(mac, &msg);
      break;
      
    case MSG_IRRIGATION_COMPLETE:
      handleIrrigationComplete(mac, &msg);
      break;
      
    case MSG_HEARTBEAT:
      handleHeartbeat(mac, &msg);
      break;
      
    case MSG_REQUEST_CONFIG:
      // Slave requesting current config (after reboot)
      resendStageConfig(mac);
      break;
      
    default:
      Serial.printf("⚠️ Unknown message type %d from %s\n", msg.type, macStr);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW SEND CALLBACK
// ═══════════════════════════════════════════════════════════════════════

void onESPNowSend(const uint8_t *mac, esp_now_send_status_t status) {
  // Optional: Track send failures
  if (status != ESP_NOW_SEND_SUCCESS) {
    char macStr[18];
    snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
             mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    Serial.printf("⚠️ Send failed to %s\n", macStr);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SLAVE REGISTRATION
// ═══════════════════════════════════════════════════════════════════════

void handleSlaveRegistration(const uint8_t *mac, espnow_message_t *msg) {
  Serial.println("📥 Slave registration request:");
  Serial.printf("   Type: %s\n", msg->slaveType == 1 ? "Sensor" : 
                                  msg->slaveType == 2 ? "Irrigation" : "Lighting");
  Serial.printf("   ID: %d\n", msg->slaveId);
  
  // Check if already registered
  for (int i = 0; i < slaveCount; i++) {
    if (memcmp(slaves[i].macAddress, mac, 6) == 0) {
      Serial.println("   ✓ Already registered");
      
      // Resend current config
      resendStageConfig(mac);
      return;
    }
  }
  
  // Add new slave
  if (slaveCount < 5) {
    memcpy(slaves[slaveCount].macAddress, mac, 6);
    slaves[slaveCount].slaveId = msg->slaveId;
    slaves[slaveCount].slaveType = msg->slaveType;
    snprintf(slaves[slaveCount].name, 32, "%s-%d", 
             msg->slaveType == 1 ? "SENSOR" : 
             msg->slaveType == 2 ? "IRRIGATION" : "LIGHTING",
             msg->slaveId);
    slaves[slaveCount].isOnline = true;
    slaves[slaveCount].lastHeartbeat = millis();
    
    // Add to ESP-NOW peer list
    esp_now_peer_info_t peerInfo;
    memcpy(peerInfo.peer_addr, mac, 6);
    peerInfo.channel = 0;
    peerInfo.encrypt = false;
    
    if (esp_now_add_peer(&peerInfo) == ESP_OK) {
      Serial.printf("✅ Slave %s registered successfully!\n", slaves[slaveCount].name);
      slaveCount++;
      standaloneMode = false;
      
      // Send current recipe config to new slave
      if (currentRecipe.active) {
        sendStageConfigToSlave(mac);
      }
    } else {
      Serial.println("❌ Failed to add slave to peer list");
    }
  } else {
    Serial.println("❌ Maximum slaves reached (5)");
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE SENSOR DATA FROM SLAVES
// ═══════════════════════════════════════════════════════════════════════

void handleSensorData(const uint8_t *mac, espnow_message_t *msg) {
  // Find slave
  for (int i = 0; i < slaveCount; i++) {
    if (memcmp(slaves[i].macAddress, mac, 6) == 0) {
      slaves[i].temperature = msg->temperature;
      slaves[i].humidity = msg->humidity;
      slaves[i].co2 = msg->co2;
      slaves[i].light = msg->light;
      slaves[i].soilMoisture = msg->soilMoisture;
      slaves[i].rssi = msg->rssi;
      slaves[i].lastHeartbeat = millis();
      slaves[i].isOnline = true;
      
      Serial.printf("📊 %s: T=%.1f°C H=%.1f%% CO2=%.0f Light=%.0f\n",
                    slaves[i].name, msg->temperature, msg->humidity, 
                    msg->co2, msg->light);
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE EQUIPMENT STATUS FROM SLAVES
// ═══════════════════════════════════════════════════════════════════════

void handleEquipmentStatus(const uint8_t *mac, espnow_message_t *msg) {
  for (int i = 0; i < slaveCount; i++) {
    if (memcmp(slaves[i].macAddress, mac, 6) == 0) {
      slaves[i].lastHeartbeat = millis();
      Serial.printf("📌 %s status updated\n", slaves[i].name);
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE IRRIGATION COMPLETE
// ═══════════════════════════════════════════════════════════════════════

void handleIrrigationComplete(const uint8_t *mac, espnow_message_t *msg) {
  Serial.printf("💧 Irrigation complete: %.1fL used in %ds\n", 
                msg->flowRate, msg->irrigationDuration);
  
  // Could send this to backend via MQTT
  publishIrrigationEvent(msg);
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE HEARTBEAT
// ═══════════════════════════════════════════════════════════════════════

void handleHeartbeat(const uint8_t *mac, espnow_message_t *msg) {
  for (int i = 0; i < slaveCount; i++) {
    if (memcmp(slaves[i].macAddress, mac, 6) == 0) {
      slaves[i].lastHeartbeat = millis();
      slaves[i].isOnline = true;
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK SLAVE HEARTBEATS
// ═══════════════════════════════════════════════════════════════════════

void checkSlaveHeartbeats() {
  for (int i = 0; i < slaveCount; i++) {
    if (millis() - slaves[i].lastHeartbeat > HEARTBEAT_TIMEOUT) {
      if (slaves[i].isOnline) {
        slaves[i].isOnline = false;
        Serial.printf("⚠️ Slave %s OFFLINE (no heartbeat)\n", slaves[i].name);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MQTT INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initMQTT() {
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(2048);  // Larger buffer for JSON
  
  reconnectMQTT();
}

void reconnectMQTT() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  while (!mqtt.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println(" ✓");
      
      // Subscribe to command topics
      String baseTopic = String("smartcrop/") + FARM_ID + "/" + ZONE_ID + "/master/command/#";
      mqtt.subscribe(baseTopic.c_str());
      
      Serial.println("📡 Subscribed to: " + baseTopic);
      
      // Publish online status
      String statusTopic = String("smartcrop/") + FARM_ID + "/" + ZONE_ID + "/master/status/online";
      mqtt.publish(statusTopic.c_str(), "true", true);
      
    } else {
      Serial.print(" Failed, rc=");
      Serial.println(mqtt.state());
      delay(5000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MQTT CALLBACK (Commands from Backend)
// ═══════════════════════════════════════════════════════════════════════

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📥 MQTT: %s\n", topic);
  
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.printf("❌ JSON parse error: %s\n", error.c_str());
    return;
  }
  
  String topicStr = String(topic);
  
  // Recipe start
  if (topicStr.indexOf("/command/recipe/start") >= 0) {
    handleRecipeStart(doc);
  }
  // Stage transition
  else if (topicStr.indexOf("/command/recipe/transition") >= 0) {
    handleStageTransition(doc);
  }
  // Equipment control
  else if (topicStr.indexOf("/command/equipment/") >= 0) {
    handleEquipmentCommand(doc);
  }
  // Recipe stop
  else if (topicStr.indexOf("/command/recipe/stop") >= 0) {
    handleRecipeStop();
  }
  // Display message
  else if (topicStr.indexOf("/command/display/message") >= 0) {
    handleDisplayMessage(doc);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE RECIPE START
// ═══════════════════════════════════════════════════════════════════════

void handleRecipeStart(JsonDocument& doc) {
  Serial.println("🔥 RECIPE START command received");
  
  currentRecipe.name = doc["recipeName"].as<String>();
  currentRecipe.recipeId = doc["recipeId"].as<String>();
  currentRecipe.currentStage = doc["currentStage"];
  currentRecipe.stageName = doc["stageName"].as<String>();
  currentRecipe.active = true;
  currentRecipe.stageStartedAt = millis();
  
  JsonObject stageConfig = doc["stageConfig"];
  
  // Store target values
  JsonObject temp = stageConfig["temperature"];
  currentRecipe.targetTemp = temp["optimal"];
  currentRecipe.tempMin = temp["min"];
  currentRecipe.tempMax = temp["max"];
  
  JsonObject hum = stageConfig["humidity"];
  currentRecipe.targetHumidity = hum["optimal"];
  currentRecipe.humidityMin = hum["min"];
  currentRecipe.humidityMax = hum["max"];
  
  currentRecipe.targetCO2 = stageConfig["co2"]["optimal"] | 1000.0;
  currentRecipe.co2Max = stageConfig["co2"]["max"] | 2000.0;
  currentRecipe.targetLight = stageConfig["light"] | 0.0;
  
  // Apply equipment settings
  JsonObject equipment = stageConfig["equipment"];
  applyEquipmentSettings(equipment);
  
  // Broadcast to slaves
  broadcastStageConfig(stageConfig);
  
  // Send ACK
  sendMqttAck("recipe_started", true);
  
  Serial.printf("✅ Recipe started: %s - %s\n", 
                currentRecipe.name.c_str(), 
                currentRecipe.stageName.c_str());
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE STAGE TRANSITION
// ═══════════════════════════════════════════════════════════════════════

void handleStageTransition(JsonDocument& doc) {
  Serial.println("🔄 STAGE TRANSITION command received");
  
  currentRecipe.currentStage = doc["newStage"];
  currentRecipe.stageName = doc["stageName"].as<String>();
  currentRecipe.stageStartedAt = millis();
  
  JsonObject stageConfig = doc["stageConfig"];
  
  // Update targets
  currentRecipe.targetTemp = stageConfig["temperature"]["optimal"];
  currentRecipe.targetHumidity = stageConfig["humidity"]["optimal"];
  currentRecipe.targetCO2 = stageConfig["co2"]["optimal"] | 1000.0;
  currentRecipe.targetLight = stageConfig["light"] | 0.0;
  
  // Apply new equipment settings
  JsonObject equipment = stageConfig["equipment"];
  applyEquipmentSettings(equipment);
  
  // Broadcast to slaves
  broadcastStageConfig(stageConfig);
  
  // Display transition
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("STAGE TRANSITION");
  display.println("");
  display.println("New Stage:");
  display.println(currentRecipe.stageName);
  display.display();
  delay(3000);
  
  sendMqttAck("stage_transition_complete", true);
  
  Serial.printf("✅ Transitioned to: %s\n", currentRecipe.stageName.c_str());
}

// ═══════════════════════════════════════════════════════════════════════
// APPLY EQUIPMENT SETTINGS
// ═══════════════════════════════════════════════════════════════════════

void applyEquipmentSettings(JsonObject equipment) {
  exhaustFanSpeed = equipment["ExhaustFan"] | 0;
  circulationFanSpeed = equipment["CirculationFan"] | 0;
  currentRecipe.humidifierLevel = equipment["Humidifier"] | 0;
  currentRecipe.heaterPower = equipment["Heater"] | 0;
  currentRecipe.lightsEnabled = equipment["GrowLights"].as<int>() > 0;
  currentRecipe.lightIntensity = equipment["GrowLights"] | 0;
  
  // Apply immediately
  setFanSpeed(PWM_FAN_1, exhaustFanSpeed);
  setFanSpeed(PWM_FAN_2, circulationFanSpeed);
  setRelay(RELAY_3, currentRecipe.heaterPower > 0);  // Heater
  setHumidifier(currentRecipe.humidifierLevel);
  setRelay(RELAY_5, currentRecipe.lightsEnabled);    // Lights
  
  Serial.println("✓ Local equipment configured");
}

// ═══════════════════════════════════════════════════════════════════════
// BROADCAST STAGE CONFIG TO ALL SLAVES
// ═══════════════════════════════════════════════════════════════════════

void broadcastStageConfig(JsonObject stageConfig) {
  if (standaloneMode) {
    Serial.println("ℹ️ Standalone mode - no slaves to broadcast to");
    return;
  }
  
  espnow_message_t msg;
  msg.type = MSG_STAGE_CONFIG;
  msg.stageIndex = currentRecipe.currentStage;
  strncpy(msg.stageName, currentRecipe.stageName.c_str(), 32);
  
  msg.targetTemp = currentRecipe.targetTemp;
  msg.targetHumidity = currentRecipe.targetHumidity;
  msg.targetCO2 = currentRecipe.targetCO2;
  msg.targetLight = currentRecipe.targetLight;
  
  // Irrigation config
  JsonObject irrigation = stageConfig["irrigation"];
  msg.irrigationEnabled = irrigation["enabled"] | false;
  msg.irrigationFrequency = irrigation["frequency"] | 0;
  msg.irrigationDuration = irrigation["duration"] | 120;
  
  if (msg.irrigationEnabled && irrigation.containsKey("times")) {
    JsonArray times = irrigation["times"];
    for (int i = 0; i < 4 && i < times.size(); i++) {
      strncpy(msg.irrigationTimes[i], times[i], 6);
    }
  }
  
  msg.timestamp = millis();
  
  // Send to all registered slaves
  for (int i = 0; i < slaveCount; i++) {
    esp_err_t result = esp_now_send(slaves[i].macAddress, (uint8_t*)&msg, sizeof(msg));
    if (result == ESP_OK) {
      Serial.printf("📡 Config sent to %s\n", slaves[i].name);
    } else {
      Serial.printf("⚠️ Failed to send to %s\n", slaves[i].name);
    }
  }
  
  Serial.printf("📡 Stage config broadcast to %d slaves\n", slaveCount);
}

// ═══════════════════════════════════════════════════════════════════════
// RESEND STAGE CONFIG TO SPECIFIC SLAVE
// ═══════════════════════════════════════════════════════════════════════

void sendStageConfigToSlave(const uint8_t *mac) {
  if (!currentRecipe.active) {
    return;
  }
  
  espnow_message_t msg;
  msg.type = MSG_STAGE_CONFIG;
  msg.stageIndex = currentRecipe.currentStage;
  strncpy(msg.stageName, currentRecipe.stageName.c_str(), 32);
  msg.targetTemp = currentRecipe.targetTemp;
  msg.targetHumidity = currentRecipe.targetHumidity;
  msg.targetCO2 = currentRecipe.targetCO2;
  msg.targetLight = currentRecipe.targetLight;
  msg.timestamp = millis();
  
  esp_now_send(mac, (uint8_t*)&msg, sizeof(msg));
}

void resendStageConfig(const uint8_t *mac) {
  sendStageConfigToSlave(mac);
}

// ═══════════════════════════════════════════════════════════════════════
// READ LOCAL SENSORS
// ═══════════════════════════════════════════════════════════════════════

void readLocalSensors() {
  localTemp = dht.readTemperature();
  localHumidity = dht.readHumidity();
  localLight = lightMeter.readLightLevel();
  
  // Simulate CO2 (replace with real sensor)
  localCO2 = 800 + random(0, 400);
  
  // Validate readings
  if (isnan(localTemp) || localTemp < -40 || localTemp > 80) {
    localTemp = 25.0;  // Default
  }
  if (isnan(localHumidity) || localHumidity < 0 || localHumidity > 100) {
    localHumidity = 60.0;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// AGGREGATE SENSOR DATA
// ═══════════════════════════════════════════════════════════════════════

void aggregateSensorData() {
  if (standaloneMode) {
    // Only local sensors
    avgTemp = localTemp;
    avgHumidity = localHumidity;
    avgCO2 = localCO2;
    avgLight = localLight;
  } else {
    // Average all online sensors
    float tempSum = localTemp;
    float humSum = localHumidity;
    float co2Sum = localCO2;
    float lightSum = localLight;
    int count = 1;
    
    for (int i = 0; i < slaveCount; i++) {
      if (slaves[i].isOnline && slaves[i].slaveType == 1) {  // Sensor type
        tempSum += slaves[i].temperature;
        humSum += slaves[i].humidity;
        co2Sum += slaves[i].co2;
        lightSum += slaves[i].light;
        count++;
      }
    }
    
    avgTemp = tempSum / count;
    avgHumidity = humSum / count;
    avgCO2 = co2Sum / count;
    avgLight = lightSum / count;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// AUTO CONTROL EQUIPMENT (PID-like)
// ═══════════════════════════════════════════════════════════════════════

void autoControlEquipment() {
  if (!currentRecipe.active) {
    return;
  }
  
  // Temperature control
  if (avgTemp < currentRecipe.targetTemp - 1.0) {
    // Too cold - increase heater, reduce exhaust
    setRelay(RELAY_3, true);
    exhaustFanSpeed = max(10, exhaustFanSpeed - 5);
    setFanSpeed(PWM_FAN_1, exhaustFanSpeed);
  } else if (avgTemp > currentRecipe.targetTemp + 1.0) {
    // Too hot - decrease heater, increase exhaust
    setRelay(RELAY_3, false);
    exhaustFanSpeed = min(100, exhaustFanSpeed + 5);
    setFanSpeed(PWM_FAN_1, exhaustFanSpeed);
  }
  
  // Humidity control
  if (avgHumidity < currentRecipe.targetHumidity - 3.0) {
    // Too dry - increase humidifier
    humidifierLevel = min(100, humidifierLevel + 5);
    setHumidifier(humidifierLevel);
  } else if (avgHumidity > currentRecipe.targetHumidity + 3.0) {
    // Too wet - decrease humidifier, increase exhaust
    humidifierLevel = max(0, humidifierLevel - 5);
    setHumidifier(humidifierLevel);
    exhaustFanSpeed = min(100, exhaustFanSpeed + 5);
    setFanSpeed(PWM_FAN_1, exhaustFanSpeed);
  }
  
  // CO2 control
  if (avgCO2 > currentRecipe.co2Max) {
    // Too much CO2 - increase exhaust
    exhaustFanSpeed = min(100, exhaustFanSpeed + 10);
    setFanSpeed(PWM_FAN_1, exhaustFanSpeed);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SET FAN SPEED (PWM)
// ═══════════════════════════════════════════════════════════════════════

void setFanSpeed(uint8_t pwmPin, uint8_t speed) {
  speed = constrain(speed, 0, 100);
  uint8_t dutyCycle = map(speed, 0, 100, 0, 255);
  
  if (pwmPin == PWM_FAN_1) {
    ledcWrite(0, dutyCycle);
  } else if (pwmPin == PWM_FAN_2) {
    ledcWrite(1, dutyCycle);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SET RELAY
// ═══════════════════════════════════════════════════════════════════════

void setRelay(uint8_t pin, bool state) {
  digitalWrite(pin, state ? LOW : HIGH);  // Active LOW
}

// ═══════════════════════════════════════════════════════════════════════
// SET HUMIDIFIER (PWM on relay 4)
// ═══════════════════════════════════════════════════════════════════════

void setHumidifier(uint8_t level) {
  humidifierLevel = constrain(level, 0, 100);
  setRelay(RELAY_4, humidifierLevel > 0);
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLISH STATUS TO BACKEND (MQTT)
// ═══════════════════════════════════════════════════════════════════════

void publishStatusToBackend() {
  if (!mqtt.connected()) {
    return;
  }
  
  StaticJsonDocument<2048> doc;
  
  // Environment (aggregated)
  JsonObject env = doc.createNestedObject("environment");
  env["temperature"] = round(avgTemp * 10) / 10.0;
  env["humidity"] = round(avgHumidity * 10) / 10.0;
  env["co2"] = round(avgCO2);
  env["light"] = round(avgLight);
  
  // Individual sensors
  JsonArray sensors = doc.createNestedArray("sensors");
  
  JsonObject localSensor = sensors.createNestedObject();
  localSensor["location"] = "master";
  localSensor["temperature"] = localTemp;
  localSensor["humidity"] = localHumidity;
  localSensor["co2"] = localCO2;
  localSensor["light"] = localLight;
  
  for (int i = 0; i < slaveCount; i++) {
    if (slaves[i].slaveType == 1) {  // Sensor slaves
      JsonObject slaveSensor = sensors.createNestedObject();
      slaveSensor["location"] = slaves[i].name;
      slaveSensor["temperature"] = slaves[i].temperature;
      slaveSensor["humidity"] = slaves[i].humidity;
      slaveSensor["co2"] = slaves[i].co2;
      slaveSensor["light"] = slaves[i].light;
      slaveSensor["online"] = slaves[i].isOnline;
    }
  }
  
  // Equipment status
  JsonObject equipment = doc.createNestedObject("equipment");
  equipment["ExhaustFan"] = exhaustFanSpeed;
  equipment["CirculationFan"] = circulationFanSpeed;
  equipment["Heater"] = heaterState;
  equipment["Humidifier"] = humidifierLevel;
  equipment["GrowLights"] = lightsState;
  
  // Recipe status
  if (currentRecipe.active) {
    JsonObject recipe = doc.createNestedObject("recipe");
    recipe["name"] = currentRecipe.name;
    recipe["stage"] = currentRecipe.currentStage;
    recipe["stageName"] = currentRecipe.stageName;
    recipe["daysInStage"] = (millis() - currentRecipe.stageStartedAt) / 86400000;
  }
  
  // Slave status
  JsonObject slaveStatus = doc.createNestedObject("slaves");
  slaveStatus["count"] = slaveCount;
  slaveStatus["mode"] = standaloneMode ? "standalone" : "master-slave";
  
  JsonArray slaveList = slaveStatus.createNestedArray("nodes");
  for (int i = 0; i < slaveCount; i++) {
    JsonObject slave = slaveList.createNestedObject();
    slave["name"] = slaves[i].name;
    slave["type"] = slaves[i].slaveType;
    slave["online"] = slaves[i].isOnline;
  }
  
  // System
  doc["uptime"] = millis() / 1000;
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["rssi"] = WiFi.RSSI();
  
  String output;
  serializeJson(doc, output);
  
  String topic = String("smartcrop/") + FARM_ID + "/" + ZONE_ID + "/master/status/full";
  mqtt.publish(topic.c_str(), output.c_str());
  
  Serial.println("📤 Status published to backend");
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLISH IRRIGATION EVENT
// ═══════════════════════════════════════════════════════════════════════

void publishIrrigationEvent(espnow_message_t *msg) {
  if (!mqtt.connected()) {
    return;
  }
  
  StaticJsonDocument<512> doc;
  doc["event"] = "irrigation_complete";
  doc["duration"] = msg->irrigationDuration;
  doc["flowRate"] = msg->flowRate;
  doc["waterUsed"] = msg->waterUsed;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  
  String topic = String("smartcrop/") + FARM_ID + "/" + ZONE_ID + "/master/events/irrigation";
  mqtt.publish(topic.c_str(), output.c_str());
}

// ═══════════════════════════════════════════════════════════════════════
// SEND MQTT ACK
// ═══════════════════════════════════════════════════════════════════════

void sendMqttAck(const char* action, bool success) {
  if (!mqtt.connected()) {
    return;
  }
  
  StaticJsonDocument<256> doc;
  doc["action"] = action;
  doc["success"] = success;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  
  String topic = String("smartcrop/") + FARM_ID + "/" + ZONE_ID + "/master/ack";
  mqtt.publish(topic.c_str(), output.c_str());
}

// ═══════════════════════════════════════════════════════════════════════
// UPDATE DISPLAY
// ═══════════════════════════════════════════════════════════════════════

void updateDisplay() {
  display.clearDisplay();
  display.setCursor(0, 0);
  
  // Line 1: Recipe name
  display.setTextSize(1);
  if (currentRecipe.active) {
    display.println(currentRecipe.name.substring(0, 16));
    display.println(currentRecipe.stageName);
  } else {
    display.println("SmartCrop OS");
    display.println("No Active Recipe");
  }
  
  // Line 3-4: Environment
  display.println("");
  display.printf("T:%.1fC H:%.1f%%\n", avgTemp, avgHumidity);
  display.printf("CO2:%.0f L:%.0f\n", avgCO2, avgLight);
  
  // Line 6: Slaves
  display.println("");
  if (standaloneMode) {
    display.println("Mode: Standalone");
  } else {
    int onlineCount = 0;
    for (int i = 0; i < slaveCount; i++) {
      if (slaves[i].isOnline) onlineCount++;
    }
    display.printf("Slaves:%d/%d online\n", onlineCount, slaveCount);
  }
  
  // Line 7-8: Status icons
  display.print(exhaustFanSpeed > 0 ? "F" : "-");
  display.print(heaterState ? "H" : "-");
  display.print(humidifierLevel > 0 ? "U" : "-");
  display.print(lightsState ? "L" : "-");
  display.print(" WiFi:");
  display.print(WiFi.status() == WL_CONNECTED ? "OK" : "X");
  
  display.display();
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE BUTTON PRESS
// ═══════════════════════════════════════════════════════════════════════

void handleButtonPress() {
  Serial.println("🔘 Button pressed - Manual override");
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("MANUAL MODE");
  display.println("");
  display.println("Press again to");
  display.println("toggle equipment");
  display.display();
  
  // Could implement manual control menu here
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE EQUIPMENT COMMAND
// ═══════════════════════════════════════════════════════════════════════

void handleEquipmentCommand(JsonDocument& doc) {
  String equipmentName = doc["equipment"];
  String action = doc["action"];
  int value = doc["value"] | 0;
  
  Serial.printf("🔧 Equipment command: %s = %s (%d)\n", 
                equipmentName.c_str(), action.c_str(), value);
  
  if (equipmentName == "ExhaustFan") {
    setFanSpeed(PWM_FAN_1, value);
    exhaustFanSpeed = value;
  } else if (equipmentName == "Heater") {
    setRelay(RELAY_3, action == "on");
    heaterState = (action == "on");
  } else if (equipmentName == "Humidifier") {
    setHumidifier(value);
  } else if (equipmentName == "GrowLights") {
    setRelay(RELAY_5, action == "on");
    lightsState = (action == "on");
  }
  
  sendMqttAck("equipment_control", true);
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE RECIPE STOP
// ═══════════════════════════════════════════════════════════════════════

void handleRecipeStop() {
  Serial.println("🛑 Recipe stopped by backend");
  
  currentRecipe.active = false;
  currentRecipe.name = "No Recipe";
  currentRecipe.stageName = "Idle";
  
  // Turn off all equipment
  setFanSpeed(PWM_FAN_1, 0);
  setFanSpeed(PWM_FAN_2, 0);
  setRelay(RELAY_3, false);
  setRelay(RELAY_4, false);
  setRelay(RELAY_5, false);
  
  exhaustFanSpeed = 0;
  circulationFanSpeed = 0;
  heaterState = false;
  humidifierLevel = 0;
  lightsState = false;
  
  sendMqttAck("recipe_stopped", true);
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE DISPLAY MESSAGE
// ═══════════════════════════════════════════════════════════════════════

void handleDisplayMessage(JsonDocument& doc) {
  String message = doc["message"];
  int duration = doc["duration"] | 5000;
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(message);
  display.display();
  
  delay(duration);
}

