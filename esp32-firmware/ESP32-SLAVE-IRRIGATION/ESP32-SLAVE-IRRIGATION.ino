/**
 * ═══════════════════════════════════════════════════════════════════════
 * SmartCrop OS - ESP32 IRRIGATION SLAVE NODE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE: Slave node in Master-Slave hierarchy
 * 
 * RESPONSIBILITIES:
 *   - Control irrigation pumps and valves
 *   - Execute irrigation schedules received from Master
 *   - Monitor water flow, pressure, and level
 *   - Report irrigation events to Master
 *   - Automatic shut-off on leak detection
 *   - Manual override capability
 * 
 * COMMUNICATION:
 *   - Master ↔ Irrigation: ESP-NOW only
 *   - Reports irrigation completion with water usage
 * 
 * EQUIPMENT CONTROLLED:
 *   - 1x Water pump (relay)
 *   - 4x Solenoid valves (relays)
 *   - 1x Flow sensor
 *   - 1x Pressure sensor (optional)
 *   - 1x Water level sensor (optional)
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
#define SLAVE_ID 2           // Unique ID
#define SLAVE_TYPE 2         // 2 = Irrigation node
String SLAVE_NAME = "IRRIGATION-A";

// Master ESP32 MAC Address
uint8_t masterMAC[] = {0x24, 0x6F, 0x28, 0xAB, 0xCD, 0xEF};  // REPLACE THIS!

// Pin Configuration
#define PUMP_RELAY 13        // Main water pump
#define VALVE_1 14           // Zone 1
#define VALVE_2 27           // Zone 2
#define VALVE_3 26           // Zone 3
#define VALVE_4 25           // Zone 4

#define FLOW_SENSOR_PIN 4    // Flow meter pulse input
#define PRESSURE_SENSOR 34   // Analog pressure sensor
#define WATER_LEVEL_PIN 35   // Analog water level

#define STATUS_LED 2
#define MANUAL_BUTTON 0      // Manual override button

// Flow Meter Calibration
#define FLOW_CALIBRATION_FACTOR 7.5  // Pulses per liter (YF-S201: ~7.5)

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
  
  // Irrigation
  bool irrigationEnabled;
  uint8_t irrigationFrequency;
  uint16_t irrigationDuration;  // seconds
  char irrigationTimes[4][6];   // "HH:MM"
  float flowRate;
  uint16_t waterUsed;           // liters
  
  char lightOnTime[6];
  char lightOffTime[6];
  uint16_t photoperiod;
  
  unsigned long timestamp;
  uint8_t batteryLevel;
  int8_t rssi;
  uint16_t errorCode;
  
  uint8_t macAddress[6];
  
} espnow_message_t;

// ═══════════════════════════════════════════════════════════════════════
// IRRIGATION SCHEDULE
// ═══════════════════════════════════════════════════════════════════════

struct IrrigationSchedule {
  bool enabled;
  uint8_t frequency;           // Times per day
  uint16_t duration;           // Seconds per cycle
  String times[4];             // "HH:MM"
  bool active;
  int lastCompletedIndex;      // Track which schedule was last run
} schedule;

// ═══════════════════════════════════════════════════════════════════════
// FLOW METER
// ═══════════════════════════════════════════════════════════════════════

volatile uint16_t flowPulseCount = 0;
float flowRate = 0.0;         // Liters per minute
float totalWaterUsed = 0.0;   // Liters

void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

// ═══════════════════════════════════════════════════════════════════════
// IRRIGATION STATE
// ═══════════════════════════════════════════════════════════════════════

bool irrigating = false;
unsigned long irrigationStartTime = 0;
unsigned long lastFlowCalc = 0;
uint16_t currentCycleDuration = 0;
float currentCycleWaterUsed = 0.0;

// ═══════════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════════

unsigned long lastScheduleCheck = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastStatusSend = 0;
unsigned long lastButtonPress = 0;

const unsigned long SCHEDULE_CHECK_INTERVAL = 60000;   // 1 minute
const unsigned long HEARTBEAT_INTERVAL = 30000;        // 30 seconds
const unsigned long STATUS_SEND_INTERVAL = 10000;      // 10 seconds
const unsigned long BUTTON_DEBOUNCE = 500;

// ═══════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println("  SmartCrop OS - ESP32 IRRIGATION SLAVE v2.0");
  Serial.printf("  Slave ID: %d (%s)\n", SLAVE_ID, SLAVE_NAME.c_str());
  Serial.println("═══════════════════════════════════════════════════════");
  Serial.println();
  
  // Initialize GPIO
  initGPIO();
  
  // Initialize ESP-NOW
  initESPNow();
  
  // Register with master
  registerWithMaster();
  
  // Request current config
  requestConfig();
  
  schedule.enabled = false;
  schedule.active = false;
  schedule.lastCompletedIndex = -1;
  
  Serial.println();
  Serial.println("✅ IRRIGATION SLAVE READY");
  Serial.println("⏳ Waiting for irrigation schedule...");
  Serial.println();
}

// ═══════════════════════════════════════════════════════════════════════
// GPIO INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

void initGPIO() {
  Serial.print("Initializing GPIO...");
  
  // Relays (Active LOW)
  pinMode(PUMP_RELAY, OUTPUT);
  pinMode(VALVE_1, OUTPUT);
  pinMode(VALVE_2, OUTPUT);
  pinMode(VALVE_3, OUTPUT);
  pinMode(VALVE_4, OUTPUT);
  
  // Turn OFF all relays
  digitalWrite(PUMP_RELAY, HIGH);
  digitalWrite(VALVE_1, HIGH);
  digitalWrite(VALVE_2, HIGH);
  digitalWrite(VALVE_3, HIGH);
  digitalWrite(VALVE_4, HIGH);
  
  // Flow sensor
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, RISING);
  
  // Button
  pinMode(MANUAL_BUTTON, INPUT_PULLUP);
  
  // LED
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println(" ✓");
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

void loop() {
  // Check irrigation schedule
  if (schedule.enabled && millis() - lastScheduleCheck >= SCHEDULE_CHECK_INTERVAL) {
    checkIrrigationSchedule();
    lastScheduleCheck = millis();
  }
  
  // Update irrigation status
  if (irrigating) {
    updateIrrigation();
  }
  
  // Send heartbeat
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  // Send status (if irrigating)
  if (irrigating && millis() - lastStatusSend >= STATUS_SEND_INTERVAL) {
    sendIrrigationStatus();
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
    case MSG_IRRIGATION_SCHEDULE:
      handleIrrigationSchedule(&msg);
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
// HANDLE IRRIGATION SCHEDULE FROM MASTER
// ═══════════════════════════════════════════════════════════════════════

void handleIrrigationSchedule(espnow_message_t *msg) {
  Serial.println("📥 Irrigation schedule received from master!");
  
  schedule.enabled = msg->irrigationEnabled;
  schedule.frequency = msg->irrigationFrequency;
  schedule.duration = msg->irrigationDuration;
  
  if (schedule.enabled) {
    Serial.printf("   Enabled: %d times/day\n", schedule.frequency);
    Serial.printf("   Duration: %d seconds\n", schedule.duration);
    
    for (int i = 0; i < schedule.frequency && i < 4; i++) {
      schedule.times[i] = String(msg->irrigationTimes[i]);
      Serial.printf("   Time %d: %s\n", i+1, schedule.times[i].c_str());
    }
    
    schedule.active = true;
    schedule.lastCompletedIndex = -1;
    
    Serial.println("✅ Irrigation activated!");
    
    // Blink LED 3 times
    for (int i = 0; i < 3; i++) {
      digitalWrite(STATUS_LED, HIGH);
      delay(200);
      digitalWrite(STATUS_LED, LOW);
      delay(200);
    }
    
  } else {
    Serial.println("   Irrigation DISABLED");
    schedule.active = false;
    stopIrrigation();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK IRRIGATION SCHEDULE
// ═══════════════════════════════════════════════════════════════════════

void checkIrrigationSchedule() {
  if (!schedule.active || irrigating) {
    return;
  }
  
  // Get current time (you need to implement NTP time sync or use RTC)
  // For now, use a simple counter-based approach
  
  // Example: Check if it's time to irrigate
  // In production, compare current time with schedule.times[]
  
  // Placeholder logic: Irrigate every SCHEDULE_CHECK_INTERVAL if enabled
  Serial.println("⏰ Checking irrigation schedule...");
  
  // For demo purposes, start irrigation
  // Replace with actual time comparison
}

// ═══════════════════════════════════════════════════════════════════════
// START IRRIGATION
// ═══════════════════════════════════════════════════════════════════════

void startIrrigation() {
  if (irrigating) {
    Serial.println("⚠️ Already irrigating!");
    return;
  }
  
  Serial.println("💧 STARTING IRRIGATION CYCLE");
  
  irrigating = true;
  irrigationStartTime = millis();
  flowPulseCount = 0;
  currentCycleWaterUsed = 0.0;
  currentCycleDuration = schedule.duration;
  lastFlowCalc = millis();
  
  // Open all valves
  digitalWrite(VALVE_1, LOW);
  digitalWrite(VALVE_2, LOW);
  digitalWrite(VALVE_3, LOW);
  digitalWrite(VALVE_4, LOW);
  
  delay(500);  // Let valves open
  
  // Start pump
  digitalWrite(PUMP_RELAY, LOW);
  
  digitalWrite(STATUS_LED, HIGH);
  
  Serial.printf("✓ Pump ON, duration: %d seconds\n", currentCycleDuration);
}

// ═══════════════════════════════════════════════════════════════════════
// UPDATE IRRIGATION (called in loop)
// ═══════════════════════════════════════════════════════════════════════

void updateIrrigation() {
  // Calculate flow rate (every second)
  if (millis() - lastFlowCalc >= 1000) {
    flowRate = (flowPulseCount / FLOW_CALIBRATION_FACTOR) * 60.0;  // L/min
    currentCycleWaterUsed += flowPulseCount / FLOW_CALIBRATION_FACTOR;
    
    Serial.printf("💧 Flow: %.2f L/min, Total: %.2f L\n", 
                  flowRate, currentCycleWaterUsed);
    
    flowPulseCount = 0;
    lastFlowCalc = millis();
  }
  
  // Check if duration reached
  unsigned long elapsed = (millis() - irrigationStartTime) / 1000;
  if (elapsed >= currentCycleDuration) {
    stopIrrigation();
  }
  
  // Safety: Check pressure (if sensor present)
  int pressure = analogRead(PRESSURE_SENSOR);
  if (pressure < 100) {  // Low pressure = possible leak
    Serial.println("⚠️ LOW PRESSURE DETECTED!");
    stopIrrigation();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// STOP IRRIGATION
// ═══════════════════════════════════════════════════════════════════════

void stopIrrigation() {
  if (!irrigating) {
    return;
  }
  
  Serial.println("💧 STOPPING IRRIGATION");
  
  // Stop pump
  digitalWrite(PUMP_RELAY, HIGH);
  
  delay(500);
  
  // Close all valves
  digitalWrite(VALVE_1, HIGH);
  digitalWrite(VALVE_2, HIGH);
  digitalWrite(VALVE_3, HIGH);
  digitalWrite(VALVE_4, HIGH);
  
  digitalWrite(STATUS_LED, LOW);
  
  unsigned long actualDuration = (millis() - irrigationStartTime) / 1000;
  
  Serial.printf("✓ Irrigation complete\n");
  Serial.printf("   Duration: %lu seconds\n", actualDuration);
  Serial.printf("   Water used: %.2f liters\n", currentCycleWaterUsed);
  
  totalWaterUsed += currentCycleWaterUsed;
  
  // Send completion report to master
  sendIrrigationComplete(actualDuration, currentCycleWaterUsed);
  
  irrigating = false;
}

// ═══════════════════════════════════════════════════════════════════════
// SEND IRRIGATION COMPLETE
// ═══════════════════════════════════════════════════════════════════════

void sendIrrigationComplete(unsigned long duration, float waterUsed) {
  espnow_message_t msg;
  msg.type = MSG_IRRIGATION_COMPLETE;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.irrigationDuration = duration;
  msg.flowRate = waterUsed / (duration / 60.0);  // L/min
  msg.waterUsed = (uint16_t)waterUsed;
  msg.timestamp = millis();
  
  esp_now_send(masterMAC, (uint8_t*)&msg, sizeof(msg));
  
  Serial.println("📤 Irrigation complete report sent to master");
}

// ═══════════════════════════════════════════════════════════════════════
// SEND IRRIGATION STATUS (while running)
// ═══════════════════════════════════════════════════════════════════════

void sendIrrigationStatus() {
  espnow_message_t msg;
  msg.type = MSG_EQUIPMENT_STATUS;
  msg.slaveId = SLAVE_ID;
  msg.slaveType = SLAVE_TYPE;
  msg.flowRate = flowRate;
  msg.waterUsed = (uint16_t)currentCycleWaterUsed;
  msg.irrigationDuration = (millis() - irrigationStartTime) / 1000;
  msg.timestamp = millis();
  
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
  
  // Manual irrigation trigger from backend/master
  if (msg->irrigationEnabled) {
    currentCycleDuration = msg->irrigationDuration;
    startIrrigation();
  } else {
    stopIrrigation();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MANUAL OVERRIDE BUTTON
// ═══════════════════════════════════════════════════════════════════════

void handleManualOverride() {
  Serial.println("🔘 Manual button pressed");
  
  if (irrigating) {
    Serial.println("   Stopping irrigation...");
    stopIrrigation();
  } else {
    Serial.println("   Starting manual irrigation (60 seconds)...");
    currentCycleDuration = 60;
    startIrrigation();
  }
}

