/**
 * ═══════════════════════════════════════════════════════════════════════
 * SmartCrop OS - ESP32 LIGHTING SLAVE NODE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE: Slave node in Master-Slave hierarchy
 * 
 * RESPONSIBILITIES:
 *   - Control LED grow lights (multiple zones)
 *   - PWM dimming (0-100% intensity)
 *   - Execute photoperiod schedules (on/off times)
 *   - Sunrise/sunset simulation (gradual dimming)
 *   - Report lighting status to Master
 *   - Energy monitoring (optional)
 * 
 * COMMUNICATION:
 *   - Master ↔ Lighting: ESP-NOW only
 * 
 * EQUIPMENT CONTROLLED:
 *   - 4x LED zones (PWM dimmable)
 *   - OR 4x relay-controlled lights
 *   - Optional: Light sensor for verification
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

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

// Slave Identity
#define SLAVE_ID 3           // Unique ID
#define SLAVE_TYPE 3         // 3 = Lighting node
String SLAVE_NAME = "LIGHTING-A";

// Master ESP32 MAC Address
uint8_t masterMAC[] = {0x24, 0x6F, 0x28, 0xAB, 0xCD, 0xEF};  // REPLACE THIS!

// Pin Configuration - PWM Outputs
#define LED_ZONE_1 13        // PWM Channel 0
#define LED_ZONE_2 14        // PWM Channel 1
#define LED_ZONE_3 27        // PWM Channel 2
#define LED_ZONE_4 26        // PWM Channel 3

// Optional: Relay control (if not using PWM)
#define LIGHT_RELAY_1 13
#define LIGHT_RELAY_2 14
#define LIGHT_RELAY_3 27
#define LIGHT_RELAY_4 26

#define STATUS_LED 2
#define MANUAL_BUTTON 0

// PWM Configuration
#define PWM_FREQ 1000        // 1 kHz
#define PWM_RESOLUTION 10    // 10-bit (0-1023)

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW MESSAGE STRUCTURE
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
  
  float targetTemp;
  float targetHumidity;
  float targetCO2;
  float targetLight;
  
  float temperature;
  float humidity;
  float co2;
  float light;
  float soilMoisture;
  float waterPressure;
  
  uint8_t exhaustFanSpeed;
  uint8_t circulationFanSpeed;
  uint8_t humidifierLevel;
  bool heaterState;
  bool lightsState;
  uint8_t lightIntensity;
  
  bool irrigationEnabled;
  uint8_t irrigationFrequency;
  uint16_t irrigationDuration;
  char irrigationTimes[4][6];
  float flowRate;
  uint16_t waterUsed;
  
  // Lighting
  char lightOnTime[6];        // "HH:MM"
  char lightOffTime[6];       // "HH:MM"
  uint16_t photoperiod;       // Hours per day
  
  unsigned long timestamp;
  uint8_t batteryLevel;
  int8_t rssi;
  uint16_t errorCode;
  
  uint8_t macAddress[6];
  
} espnow_message_t;

// ═══════════════════════════════════════════════════════════════════════
// LIGHTING SCHEDULE
// ═══════════════════════════════════════════════════════════════════════

struct LightingSchedule {
  bool enabled;
  uint8_t intensity;          // 0-100%
  String onTime;              // "HH:MM"
  String offTime;             // "HH:MM"
  uint16_t photoperiod;       // Hours
  bool sunriseSunsetMode;     // Gradual transitions
  uint16_t transitionMinutes; // Sunrise/sunset duration
  bool active;
} schedule;

// ═══════════════════════════════════════════════════════════════════════
// LIGHTING STATE
// ═══════════════════════════════════════════════════════════════════════

bool lightsOn = false;
uint8_t currentIntensity = 0;
uint8_t targetIntensity = 0;

// ═══════════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════════

unsigned long lastScheduleCheck = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastStatusSend = 0;
unsigned long lastDimUpdate = 0;
unsigned long lastButtonPress = 0;

const unsigned long SCHEDULE_CHECK_INTERVAL = 60000;   // 1 minute
const unsigned long HEARTBEAT_INTERVAL = 30000;        // 30 seconds
const unsigned long STATUS_SEND_INTERVAL = 10000;      // 10 seconds
const unsigned long DIM_UPDATE_INTERVAL = 100;         // 100ms for smooth transitions
const unsigned long BUTTON_DEBOUNCE = 500;

// ═══════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println("  SmartCrop OS - ESP32 LIGHTING SLAVE v2.0");
  Serial.printf("  Slave ID: %d (%s)\n", SLAVE_ID, SLAVE_NAME.c_str());
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println();
  
  // Initialize GPIO & PWM
  initLighting();
  
  // Initialize ESP-NOW
  initESPNow();
  
  // Register with master
  registerWithMaster();
  
  // Request current config
  requestConfig();
  
  schedule.enabled = false;
  schedule.active = false;
  schedule.sunriseSunsetMode = false;
  
  Serial.println();
  Serial.println("✅ LIGHTING SLAVE READY");
  Serial.println("⏳ Waiting for lighting schedule...");
  Serial.println();
}

// ═══════════════════════════════════════════════════════════════════════
// LIGHTING INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initLighting() {
  Serial.print("Initializing lighting control...");
  
  // Setup PWM channels
  ledcSetup(0, PWM_FREQ, PWM_RESOLUTION);
  ledcSetup(1, PWM_FREQ, PWM_RESOLUTION);
  ledcSetup(2, PWM_FREQ, PWM_RESOLUTION);
  ledcSetup(3, PWM_FREQ, PWM_RESOLUTION);
  
  // Attach pins
  ledcAttachPin(LED_ZONE_1, 0);
  ledcAttachPin(LED_ZONE_2, 1);
  ledcAttachPin(LED_ZONE_3, 2);
  ledcAttachPin(LED_ZONE_4, 3);
  
  // Start with lights OFF
  setAllLights(0);
  
  // Button
  pinMode(MANUAL_BUTTON, INPUT_PULLUP);
  
  // LED
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println(" ✓");
  Serial.println("   4 PWM zones configured");
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

void loop() {
  // Check lighting schedule
  if (schedule.enabled && millis() - lastScheduleCheck >= SCHEDULE_CHECK_INTERVAL) {
    checkLightingSchedule();
    lastScheduleCheck = millis();
  }
  
  // Smooth dimming transitions
  if (millis() - lastDimUpdate >= DIM_UPDATE_INTERVAL) {
    updateDimming();
    lastDimUpdate = millis();
  }
  
  // Send heartbeat
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  // Send status
  if (millis() - lastStatusSend >= STATUS_SEND_INTERVAL) {
    sendLightingStatus();
    lastStatusSend = millis();
  }
  
  // Manual button
  if (digitalRead(MANUAL_BUTTON) == LOW && millis() - lastButtonPress > BUTTON_DEBOUNCE) {
    handleManualOverride();
    lastButtonPress = millis();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initESPNow() {
  Serial.print("Initializing ESP-NOW (Slave)...");
  
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  
  Serial.println();
  Serial.print("My MAC Address: ");
  Serial.println(WiFi.macAddress());
  
  if (esp_now_init() != ESP_OK) {
    Serial.println(" FAIL!");
    ESP.restart();
    return;
  }
  
  esp_now_register_recv_cb(onESPNowRecv);
  esp_now_register_send_cb(onESPNowSend);
  
  // Add master as peer
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, masterMAC, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println(" Failed to add master!");
    ESP.restart();
    return;
  }
  
  Serial.println(" ✓");
}

// ═══════════════════════════════════════════════════════════════════════
// ESP-NOW CALLBACKS
// ═══════════════════════════════════════════════════════════════════════

void onESPNowRecv(const uint8_t *mac, const uint8_t *data, int len) {
  espnow_message_t msg;
  memcpy(&msg, data, sizeof(msg));
  
  switch (msg.type) {
    case MSG_LIGHTING_SCHEDULE:
      handleLightingSchedule(&msg);
      break;
      
    case MSG_STAGE_CONFIG:
      handleStageConfig(&msg);
      break;
      
    case MSG_EQUIPMENT_CMD:
      handleEquipmentCommand(&msg);
      break;
      
    default:
      Serial.printf("⚠️ Unknown message type: %d\n", msg.type);
  }
}

void onESPNowSend(const uint8_t *mac, esp_now_send_status_t status) {
  if (status == ESP_NOW_SEND_SUCCESS) {
    digitalWrite(STATUS_LED, HIGH);
    delay(50);
    digitalWrite(STATUS_LED, LOW);
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
  msg.slaveType = SLAVE_TYPE;
  
  uint8_t mac[6];
  WiFi.macAddress(mac);
  memcpy(msg.macAddress, mac, 6);
  
  msg.timestamp = millis();
  
  if (esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg)) == ESP_OK) {
    Serial.println(" ✓");
  } else {
    Serial.println(" FAIL!");
  }
  
  delay(1000);
}

// ═══════════════════════════════════════════════════════════════════════
// REQUEST CONFIG
// ═══════════════════════════════════════════════════════════════════════

void requestConfig() {
  espnow_message_t msg;
  msg.type = MSG_REQUEST_CONFIG;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.timestamp = millis();
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE STAGE CONFIG
// ═══════════════════════════════════════════════════════════════════════

void handleStageConfig(espnow_message_t *msg) {
  Serial.println("📥 Stage config received from master!");
  Serial.printf("   Stage: %s\n", msg->stageName);
  
  // Check lighting requirements for this stage
  if (msg->targetLight > 0) {
    schedule.enabled = true;
    schedule.intensity = (uint8_t)msg->targetLight;
    schedule.active = true;
    
    Serial.printf("   Lights: ON at %d%% intensity\n", schedule.intensity);
    
    targetIntensity = schedule.intensity;
    lightsOn = true;
    
  } else {
    schedule.enabled = false;
    
    Serial.println("   Lights: OFF (dark stage)");
    
    targetIntensity = 0;
    lightsOn = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE LIGHTING SCHEDULE
// ═══════════════════════════════════════════════════════════════════════

void handleLightingSchedule(espnow_message_t *msg) {
  Serial.println("📥 Lighting schedule received from master!");
  
  schedule.enabled = msg->lightsState;
  schedule.intensity = msg->lightIntensity;
  schedule.onTime = String(msg->lightOnTime);
  schedule.offTime = String(msg->lightOffTime);
  schedule.photoperiod = msg->photoperiod;
  
  if (schedule.enabled) {
    Serial.printf("   Intensity: %d%%\n", schedule.intensity);
    Serial.printf("   ON time: %s\n", schedule.onTime.c_str());
    Serial.printf("   OFF time: %s\n", schedule.offTime.c_str());
    Serial.printf("   Photoperiod: %d hours\n", schedule.photoperiod);
    
    schedule.active = true;
    
    // Turn lights ON immediately (or wait for schedule)
    targetIntensity = schedule.intensity;
    lightsOn = true;
    
    Serial.println("✅ Lighting schedule activated!");
    
  } else {
    Serial.println("   Lighting DISABLED");
    schedule.active = false;
    targetIntensity = 0;
    lightsOn = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK LIGHTING SCHEDULE (Time-based on/off)
// ═══════════════════════════════════════════════════════════════════════

void checkLightingSchedule() {
  if (!schedule.active) {
    return;
  }
  
  // Get current time (you need to implement NTP time sync or use RTC)
  // For now, this is a placeholder
  
  // Example: Compare current time with schedule.onTime and schedule.offTime
  // If current time >= onTime && current time < offTime: Turn ON
  // Else: Turn OFF
  
  Serial.println("⏰ Checking lighting schedule...");
  
  // Placeholder: Keep lights at target intensity
  // In production, implement time-based switching
}

// ═══════════════════════════════════════════════════════════════════════
// UPDATE DIMMING (Smooth transitions)
// ═══════════════════════════════════════════════════════════════════════

void updateDimming() {
  if (currentIntensity == targetIntensity) {
    return;  // Already at target
  }
  
  // Gradual transition (1% per update)
  if (currentIntensity < targetIntensity) {
    currentIntensity++;
  } else {
    currentIntensity--;
  }
  
  setAllLights(currentIntensity);
  
  // Serial.printf("💡 Dimming: %d%% → %d%%\n", currentIntensity, targetIntensity);
}

// ═══════════════════════════════════════════════════════════════════════
// SET ALL LIGHTS (PWM)
// ═══════════════════════════════════════════════════════════════════════

void setAllLights(uint8_t intensity) {
  intensity = constrain(intensity, 0, 100);
  
  // Convert 0-100% to 0-1023 (10-bit PWM)
  uint16_t pwmValue = map(intensity, 0, 100, 0, 1023);
  
  ledcWrite(0, pwmValue);
  ledcWrite(1, pwmValue);
  ledcWrite(2, pwmValue);
  ledcWrite(3, pwmValue);
  
  currentIntensity = intensity;
}

// ═══════════════════════════════════════════════════════════════════════
// SET INDIVIDUAL ZONE
// ═══════════════════════════════════════════════════════════════════════

void setZoneLight(uint8_t zone, uint8_t intensity) {
  if (zone < 0 || zone > 3) {
    return;
  }
  
  intensity = constrain(intensity, 0, 100);
  uint16_t pwmValue = map(intensity, 0, 100, 0, 1023);
  
  ledcWrite(zone, pwmValue);
}

// ═══════════════════════════════════════════════════════════════════════
// SEND LIGHTING STATUS
// ═══════════════════════════════════════════════════════════════════════

void sendLightingStatus() {
  espnow_message_t msg;
  msg.type = MSG_EQUIPMENT_STATUS;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.lightsState = lightsOn;
  msg.lightIntensity = currentIntensity;
  msg.timestamp = millis();
  msg.rssi = WiFi.RSSI();
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
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
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
  
  Serial.println("💓 Heartbeat");
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLE EQUIPMENT COMMAND
// ═══════════════════════════════════════════════════════════════════════

void handleEquipmentCommand(espnow_message_t *msg) {
  Serial.println("📥 Equipment command received");
  
  targetIntensity = msg->lightIntensity;
  lightsOn = msg->lightsState;
  
  Serial.printf("   Setting lights to: %s at %d%%\n", 
                lightsOn ? "ON" : "OFF", targetIntensity);
}

// ═══════════════════════════════════════════════════════════════════════
// MANUAL OVERRIDE BUTTON
// ═══════════════════════════════════════════════════════════════════════

void handleManualOverride() {
  Serial.println("🔘 Manual button pressed");
  
  if (lightsOn) {
    Serial.println("   Turning lights OFF...");
    targetIntensity = 0;
    lightsOn = false;
  } else {
    Serial.println("   Turning lights ON at 100%...");
    targetIntensity = 100;
    lightsOn = true;
  }
}

