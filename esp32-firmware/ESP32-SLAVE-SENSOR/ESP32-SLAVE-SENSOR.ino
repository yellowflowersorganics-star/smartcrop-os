/**
 * ═══════════════════════════════════════════════════════════════════════
 * SmartCrop OS - ESP32 SENSOR SLAVE NODE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE: Slave node in Master-Slave hierarchy
 * 
 * RESPONSIBILITIES:
 *   - Read environmental sensors (DHT22, BH1750, MQ-135, etc.)
 *   - Report data to Master via ESP-NOW (every 5 seconds)
 *   - Send heartbeat signals
 *   - Register with Master on boot
 *   - Request config after reboot
 *   - Low power operation (battery optional)
 * 
 * COMMUNICATION:
 *   - Master ↔ Sensor: ESP-NOW only (no WiFi required!)
 *   - Range: 50-100m line of sight
 *   - Latency: < 10ms
 * 
 * POWER:
 *   - Can run on battery + solar
 *   - Deep sleep support (not implemented yet)
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

#include <esp_now.h>
#include <WiFi.h>
#include <DHT.h>
#include <BH1750.h>
#include <Wire.h>

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

// Slave Identity
#define SLAVE_ID 1           // Change for each sensor (1, 2, 3...)
#define SLAVE_TYPE 1         // 1 = Sensor node
String SLAVE_NAME = "SENSOR-A";

// Master ESP32 MAC Address (GET THIS FROM MASTER SERIAL OUTPUT!)
uint8_t masterMAC[] = {0x24, 0x6F, 0x28, 0xAB, 0xCD, 0xEF};  // REPLACE THIS!

// Pin Configuration
#define DHT_PIN 4
#define DHT_TYPE DHT22

#define I2C_SDA 21
#define I2C_SCL 22

#define MQ135_PIN 34        // Analog for CO2 sensor
#define SOIL_MOISTURE_PIN 35 // Analog for soil moisture (optional)

#define STATUS_LED 2         // Built-in LED

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW MESSAGE STRUCTURE (SAME AS MASTER)
// ═══════════════════════════════════════════════════════════════════════

enum MessageType {
  MSG_STAGE_CONFIG = 1,
  MSG_SENSOR_DATA = 2,
  MSG_EQUIPMENT_CMD = 3,
  MSG_EQUIPMENT_STATUS = 4,
  MSG_IRRIGATION_SCHEDULE = 5,
  MSG_IRRIGATION_COMPLETE = 6,
  MSG_LIGHTING_SCHEDULE = 7,
  MSG_HEARTBEAT = 8,
  MSG_REQUEST_CONFIG = 9,
  MSG_SLAVE_REGISTER = 10
};

typedef struct {
  uint8_t type;
  uint8_t slaveId;
  uint8_t slaveType;
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
  uint16_t irrigationDuration;
  char irrigationTimes[4][6];
  float flowRate;
  uint16_t waterUsed;
  
  // Lighting schedule
  char lightOnTime[6];
  char lightOffTime[6];
  uint16_t photoperiod;
  
  // Status
  unsigned long timestamp;
  uint8_t batteryLevel;
  int8_t rssi;
  uint16_t errorCode;
  
  // MAC address
  uint8_t macAddress[6];
  
} espnow_message_t;

// ═══════════════════════════════════════════════════════════════════════
// SENSOR OBJECTS
// ═══════════════════════════════════════════════════════════════════════

DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter(0x23);

// ═══════════════════════════════════════════════════════════════════════
// SENSOR DATA
// ═══════════════════════════════════════════════════════════════════════

float temperature = 0.0;
float humidity = 0.0;
float co2 = 0.0;
float light = 0.0;
float soilMoisture = 0.0;

// ═══════════════════════════════════════════════════════════════════════
// RECIPE CONFIG (received from master)
// ═══════════════════════════════════════════════════════════════════════

struct RecipeConfig {
  uint8_t stageIndex;
  char stageName[32];
  float targetTemp;
  float targetHumidity;
  float targetCO2;
  float targetLight;
  bool active;
} currentConfig;

// ═══════════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════════

unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastLedBlink = 0;
unsigned long bootTime = 0;

const unsigned long SENSOR_READ_INTERVAL = 5000;   // 5 seconds
const unsigned long DATA_SEND_INTERVAL = 5000;     // 5 seconds
const unsigned long HEARTBEAT_INTERVAL = 30000;    // 30 seconds
const unsigned long LED_BLINK_INTERVAL = 2000;     // 2 seconds

bool ledState = false;
bool masterOnline = false;

// ═══════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println("  SmartCrop OS - ESP32 SENSOR SLAVE v2.0");
  Serial.printf("  Slave ID: %d (%s)\n", SLAVE_ID, SLAVE_NAME.c_str());
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println();
  
  bootTime = millis();
  
  // Initialize hardware
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, HIGH);  // LED ON during boot
  
  // Initialize sensors
  Serial.print("Initializing sensors...");
  Wire.begin(I2C_SDA, I2C_SCL);
  dht.begin();
  
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.print(" [Light:OK] ");
  } else {
    Serial.print(" [Light:FAIL] ");
  }
  Serial.println(" ✓");
  
  // Initialize ESP-NOW
  initESPNow();
  
  // Register with master
  registerWithMaster();
  
  // Request current config
  requestConfig();
  
  currentConfig.active = false;
  strcpy(currentConfig.stageName, "Waiting...");
  
  Serial.println();
  Serial.println("✅ SENSOR SLAVE READY");
  Serial.println("📡 Sending data to master...");
  Serial.println();
  
  digitalWrite(STATUS_LED, LOW);  // LED OFF
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

void loop() {
  // Read sensors
  if (millis() - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }
  
  // Send data to master
  if (millis() - lastDataSend >= DATA_SEND_INTERVAL) {
    sendSensorDataToMaster();
    lastDataSend = millis();
  }
  
  // Send heartbeat
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  // Blink LED
  if (millis() - lastLedBlink >= LED_BLINK_INTERVAL) {
    ledState = !ledState;
    digitalWrite(STATUS_LED, ledState ? HIGH : LOW);
    lastLedBlink = millis();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initESPNow() {
  Serial.print("Initializing ESP-NOW (Slave)...");
  
  // Set device as WiFi station (no actual WiFi connection needed)
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  
  // Print MAC address
  Serial.println();
  Serial.print("My MAC Address: ");
  Serial.println(WiFi.macAddress());
  Serial.println("⚠️ COPY THIS MAC TO MASTER IF NOT ALREADY DONE!");
  
  if (esp_now_init() != ESP_OK) {
    Serial.println(" FAIL!");
    ESP.restart();
    return;
  }
  
  // Register callbacks
  esp_now_register_recv_cb(onESPNowRecv);
  esp_now_register_send_cb(onESPNowSend);
  
  // Add master as peer
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, masterMAC, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println(" Failed to add master as peer!");
    Serial.println("⚠️ CHECK MASTER MAC ADDRESS!");
    ESP.restart();
    return;
  }
  
  Serial.println(" ✓");
  Serial.print("Master MAC: ");
  for (int i = 0; i < 6; i++) {
    Serial.printf("%02X", masterMAC[i]);
    if (i < 5) Serial.print(":");
  }
  Serial.println();
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW RECEIVE CALLBACK
// ═══════════════════════════════════════════════════════════════════════

void onESPNowRecv(const uint8_t *mac, const uint8_t *data, int len) {
  espnow_message_t msg;
  memcpy(&msg, data, sizeof(msg));
  
  masterOnline = true;
  
  switch (msg.type) {
    case MSG_STAGE_CONFIG:
      handleStageConfig(&msg);
      break;
      
    default:
      Serial.printf("⚠️ Unknown message type: %d\n", msg.type);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW SEND CALLBACK
// ═══════════════════════════════════════════════════════════════════════

void onESPNowSend(const uint8_t *mac, esp_now_send_status_t status) {
  if (status == ESP_NOW_SEND_SUCCESS) {
    // Success - blink LED quickly
    digitalWrite(STATUS_LED, HIGH);
    delay(50);
    digitalWrite(STATUS_LED, LOW);
  } else {
    Serial.println("⚠️ Send failed!");
    masterOnline = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// REGISTER WITH MASTER
// ═══════════════════════════════════════════════════════════════════════

void registerWithMaster() {
  Serial.print("Registering with master...");
  
  espnow_message_t msg;
  msg.type = MSG_SLAVE_REGISTER;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;  // 1 = Sensor
  
  // Include MAC address
  uint8_t mac[6];
  WiFi.macAddress(mac);
  memcpy(msg.macAddress, mac, 6);
  
  msg.timestamp = millis();
  
  esp_err_t result = esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
  
  if (result == ESP_OK) {
    Serial.println(" ✓");
    Serial.println("📡 Registration packet sent to master");
  } else {
    Serial.println(" FAIL!");
  }
  
  delay(1000);  // Give master time to process
}

// ═══════════════════════════════════════════════════════════════════════
// REQUEST CONFIG FROM MASTER
// ═══════════════════════════════════════════════════════════════════════

void requestConfig() {
  Serial.println("📥 Requesting current config from master...");
  
  espnow_message_t msg;
  msg.type = MSG_REQUEST_CONFIG;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.timestamp = millis();
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE STAGE CONFIG FROM MASTER
// ═══════════════════════════════════════════════════════════════════════

void handleStageConfig(espnow_message_t *msg) {
  Serial.println("📥 Stage config received from master!");
  Serial.printf("   Stage: %s\n", msg->stageName);
  Serial.printf("   Targets: T=%.1f°C, H=%.1f%%\n", 
                msg->targetTemp, msg->targetHumidity);
  
  currentConfig.stageIndex = msg->stageIndex;
  strncpy(currentConfig.stageName, msg->stageName, 32);
  currentConfig.targetTemp = msg->targetTemp;
  currentConfig.targetHumidity = msg->targetHumidity;
  currentConfig.targetCO2 = msg->targetCO2;
  currentConfig.targetLight = msg->targetLight;
  currentConfig.active = true;
  
  Serial.println("✅ Config updated");
}

// ═══════════════════════════════════════════════════════════════════════
// READ SENSORS
// ═══════════════════════════════════════════════════════════════════════

void readSensors() {
  // Read DHT22
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Validate
  if (isnan(temperature) || temperature < -40 || temperature > 80) {
    temperature = 25.0;  // Default
  }
  if (isnan(humidity) || humidity < 0 || humidity > 100) {
    humidity = 60.0;
  }
  
  // Read light sensor
  light = lightMeter.readLightLevel();
  if (isnan(light) || light < 0) {
    light = 0.0;
  }
  
  // Read CO2 sensor (MQ-135)
  int co2Raw = analogRead(MQ135_PIN);
  co2 = mapCO2(co2Raw);
  
  // Read soil moisture (optional)
  int soilRaw = analogRead(SOIL_MOISTURE_PIN);
  soilMoisture = map(soilRaw, 4095, 0, 0, 100);  // Invert: wet = 100%, dry = 0%
  
  Serial.printf("📊 T=%.1f°C H=%.1f%% CO2=%.0fppm L=%.0flux Soil=%.0f%%\n",
                temperature, humidity, co2, light, soilMoisture);
}

// ═══════════════════════════════════════════════════════════════════════
// MAP CO2 (MQ-135 calibration)
// ═══════════════════════════════════════════════════════════════════════

float mapCO2(int analogValue) {
  // Simplified mapping - calibrate for your sensor!
  // MQ-135: Lower voltage = higher CO2
  float voltage = analogValue * (3.3 / 4095.0);
  float rs = (3.3 - voltage) / voltage * 10.0;  // 10k load resistor
  
  // Approximate CO2 calculation (needs calibration!)
  float ppm = 116.6020682 * pow(rs / 76.63, -2.769034857);
  
  // Constrain to reasonable range
  ppm = constrain(ppm, 400, 5000);
  
  return ppm;
}

// ═══════════════════════════════════════════════════════════════════════
// SEND SENSOR DATA TO MASTER
// ═══════════════════════════════════════════════════════════════════════

void sendSensorDataToMaster() {
  espnow_message_t msg;
  msg.type = MSG_SENSOR_DATA;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  
  // Sensor readings
  msg.temperature = temperature;
  msg.humidity = humidity;
  msg.co2 = co2;
  msg.light = light;
  msg.soilMoisture = soilMoisture;
  
  // Status
  msg.timestamp = millis();
  msg.rssi = WiFi.RSSI();
  msg.batteryLevel = 100;  // TODO: Implement battery monitoring
  
  esp_err_t result = esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
  
  if (result == ESP_OK) {
    Serial.println("📤 Data sent to master");
  } else {
    Serial.println("⚠️ Failed to send data");
    masterOnline = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SEND HEARTBEAT
// ═══════════════════════════════════════════════════════════════════════

void sendHeartbeat() {
  espnow_message_t msg;
  msg.type = MSG_HEARTBEAT;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.timestamp = millis();
  msg.rssi = WiFi.RSSI();
  msg.batteryLevel = 100;
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
  
  Serial.println("💓 Heartbeat sent");
}

