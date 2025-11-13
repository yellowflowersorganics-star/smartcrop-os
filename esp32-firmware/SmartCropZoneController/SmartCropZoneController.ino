/**
 * SmartCrop OS - ESP32 Zone Controller
 * 
 * Complete zone automation with:
 * - OLED/TFT Display (Recipe info, environment, equipment status)
 * - Equipment control (8 relays + 2 PWM outputs)
 * - Environmental sensors (DHT22, BH1750, MQ-135)
 * - MQTT communication with backend
 * - Local button control
 * - Recipe execution display
 * 
 * Hardware:
 * - ESP32 DevKit
 * - DHT22 (Temperature & Humidity)
 * - BH1750 (Light sensor)
 * - MQ-135 (CO2/Air quality)
 * - 8-Channel Relay Module
 * - SSD1306 OLED Display (128x64) or ILI9341 TFT
 * - 3 Push buttons (Up, Down, Select)
 * 
 * Author: SmartCrop OS Team
 * Version: 1.0.0
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <BH1750.h>
#include <ArduinoJson.h>

// ============================================
// CONFIGURATION - MODIFY FOR YOUR SETUP
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// MQTT Broker (Raspberry Pi)
const char* MQTT_BROKER = "192.168.1.100";  // Your Raspberry Pi IP
const int MQTT_PORT = 1883;
const char* MQTT_USER = "";  // Leave empty if no auth
const char* MQTT_PASSWORD = "";

// Device ID (MUST BE UNIQUE PER ESP32!)
const char* DEVICE_ID = "ESP32-ZONE-A";

// Sensor Pins
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ135_PIN 34  // Analog pin

// Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Relay Pins (Active LOW)
#define RELAY_1_PIN 13  // Exhaust Fan
#define RELAY_2_PIN 12  // Circulation Fan
#define RELAY_3_PIN 14  // Humidifier
#define RELAY_4_PIN 27  // Heater
#define RELAY_5_PIN 26  // Cooler
#define RELAY_6_PIN 25  // Grow Lights
#define RELAY_7_PIN 33  // Irrigation Pump
#define RELAY_8_PIN 32  // CO2 Valve

// PWM Pins
#define PWM_FAN_PIN 5      // Fan speed control
#define PWM_HUMIDIFIER_PIN 18  // Humidifier level

// Button Pins
#define BUTTON_UP 19
#define BUTTON_DOWN 21
#define BUTTON_SELECT 22

// ============================================
// GLOBAL OBJECTS
// ============================================

WiFiClient espClient;
PubSubClient mqtt(espClient);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

// ============================================
// EQUIPMENT STATE
// ============================================

struct Equipment {
  const char* name;
  int pin;
  bool isRelay;  // true = relay, false = PWM
  bool state;    // ON/OFF
  int value;     // 0-100 for PWM, 0/1 for relay
  String mode;   // "manual", "auto", "scheduled"
};

Equipment equipment[] = {
  {"ExhaustFan", RELAY_1_PIN, true, false, 0, "auto"},
  {"CirculationFan", RELAY_2_PIN, true, false, 0, "auto"},
  {"Humidifier", RELAY_3_PIN, true, false, 0, "auto"},
  {"Heater", RELAY_4_PIN, true, false, 0, "auto"},
  {"Cooler", RELAY_5_PIN, true, false, 0, "auto"},
  {"GrowLights", RELAY_6_PIN, true, false, 0, "auto"},
  {"IrrigationPump", RELAY_7_PIN, true, false, 0, "auto"},
  {"CO2Valve", RELAY_8_PIN, true, false, 0, "auto"}
};

const int EQUIPMENT_COUNT = sizeof(equipment) / sizeof(equipment[0]);

// PWM Channels
const int PWM_FAN_CHANNEL = 0;
const int PWM_HUMIDIFIER_CHANNEL = 1;

// ============================================
// RECIPE EXECUTION STATE
// ============================================

struct RecipeInfo {
  String cropName;
  String stageName;
  int currentStage;
  int totalStages;
  int progress;
  int daysInStage;
  String expectedDuration;
  String status;
  bool active;
};

RecipeInfo currentRecipe = {"", "", 0, 0, 0, 0, "", "idle", false};

// ============================================
// ENVIRONMENTAL DATA
// ============================================

struct EnvironmentData {
  float temperature;
  float humidity;
  float light;
  int co2;
  unsigned long lastUpdate;
};

EnvironmentData environment = {0, 0, 0, 0, 0};

// ============================================
// DISPLAY PAGES
// ============================================

enum DisplayPage {
  PAGE_RECIPE,
  PAGE_ENVIRONMENT,
  PAGE_EQUIPMENT,
  PAGE_NETWORK
};

DisplayPage currentPage = PAGE_RECIPE;
unsigned long lastButtonPress = 0;
const unsigned long BUTTON_DEBOUNCE = 200;

// ============================================
// TIMING
// ============================================

unsigned long lastSensorRead = 0;
unsigned long lastMqttPublish = 0;
unsigned long lastDisplayUpdate = 0;

const unsigned long SENSOR_INTERVAL = 5000;     // Read sensors every 5 seconds
const unsigned long MQTT_PUBLISH_INTERVAL = 30000;  // Publish every 30 seconds
const unsigned long DISPLAY_UPDATE_INTERVAL = 1000; // Update display every second

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n========================================");
  Serial.println("SmartCrop OS - ESP32 Zone Controller");
  Serial.println("========================================\n");

  // Initialize pins
  initializePins();

  // Initialize display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("ERROR: SSD1306 allocation failed");
  } else {
    Serial.println("✓ Display initialized");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("SmartCrop OS");
    display.println("Initializing...");
    display.display();
  }

  // Initialize sensors
  dht.begin();
  Serial.println("✓ DHT22 initialized");

  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("✓ BH1750 initialized");
  } else {
    Serial.println("⚠ BH1750 not found");
  }

  // Connect to WiFi
  connectWiFi();

  // Connect to MQTT
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  connectMQTT();

  Serial.println("\n✓ Setup complete!");
  Serial.println("========================================\n");
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // Maintain MQTT connection
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();

  // Read sensors
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }

  // Publish to MQTT
  if (millis() - lastMqttPublish >= MQTT_PUBLISH_INTERVAL) {
    publishStatus();
    lastMqttPublish = millis();
  }

  // Update display
  if (millis() - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL) {
    updateDisplay();
    lastDisplayUpdate = millis();
  }

  // Handle buttons
  handleButtons();

  // Auto control (if in auto mode)
  autoControl();
}

// ============================================
// INITIALIZATION
// ============================================

void initializePins() {
  // Relay pins (Active LOW)
  for (int i = 0; i < EQUIPMENT_COUNT; i++) {
    if (equipment[i].isRelay) {
      pinMode(equipment[i].pin, OUTPUT);
      digitalWrite(equipment[i].pin, HIGH);  // OFF (Active LOW)
    }
  }

  // PWM setup
  ledcSetup(PWM_FAN_CHANNEL, 5000, 8);  // 5kHz, 8-bit resolution
  ledcAttachPin(PWM_FAN_PIN, PWM_FAN_CHANNEL);
  ledcWrite(PWM_FAN_CHANNEL, 0);

  ledcSetup(PWM_HUMIDIFIER_CHANNEL, 5000, 8);
  ledcAttachPin(PWM_HUMIDIFIER_PIN, PWM_HUMIDIFIER_CHANNEL);
  ledcWrite(PWM_HUMIDIFIER_CHANNEL, 0);

  // Button pins
  pinMode(BUTTON_UP, INPUT_PULLUP);
  pinMode(BUTTON_DOWN, INPUT_PULLUP);
  pinMode(BUTTON_SELECT, INPUT_PULLUP);

  Serial.println("✓ GPIO pins initialized");
}

// ============================================
// WIFI CONNECTION
// ============================================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected");
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi connection failed");
  }
}

// ============================================
// MQTT CONNECTION
// ============================================

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting to MQTT broker...");

    String clientId = String(DEVICE_ID) + "-" + String(random(0xffff), HEX);

    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      Serial.println(" connected!");

      // Subscribe to command topics
      String baseTopic = "smartcrop/" + String(DEVICE_ID) + "/command/#";
      mqtt.subscribe(baseTopic.c_str());
      Serial.println("✓ Subscribed to: " + baseTopic);

      // Subscribe to config topics
      String configTopic = "smartcrop/" + String(DEVICE_ID) + "/config/#";
      mqtt.subscribe(configTopic.c_str());
      Serial.println("✓ Subscribed to: " + configTopic);

      // Subscribe to display topics
      String displayTopic = "smartcrop/" + String(DEVICE_ID) + "/display/#";
      mqtt.subscribe(displayTopic.c_str());
      Serial.println("✓ Subscribed to: " + displayTopic);

      // Publish online status
      String statusTopic = "smartcrop/" + String(DEVICE_ID) + "/status/online";
      mqtt.publish(statusTopic.c_str(), "true", true);

    } else {
      Serial.print(" failed, rc=");
      Serial.println(mqtt.state());
      delay(5000);
    }
  }
}

// ============================================
// MQTT CALLBACK (RECEIVE COMMANDS)
// ============================================

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String message = "";
  
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("\n📥 MQTT Message Received:");
  Serial.println("  Topic: " + topicStr);
  Serial.println("  Payload: " + message);

  // Parse JSON
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.println("✗ JSON parsing failed");
    return;
  }

  // Handle different topic types
  if (topicStr.indexOf("/command/") >= 0) {
    handleCommand(doc);
  } else if (topicStr.indexOf("/config/stage") >= 0) {
    handleStageConfig(doc);
  } else if (topicStr.indexOf("/display/recipe") >= 0) {
    handleRecipeInfo(doc);
  }
}

// ============================================
// COMMAND HANDLER
// ============================================

void handleCommand(JsonDocument& doc) {
  String commandId = doc["commandId"] | "";
  String commandType = doc["commandType"] | "";
  String equipmentName = doc["equipmentName"] | "";
  int value = doc["value"] | 0;
  String mode = doc["mode"] | "";

  Serial.println("🎮 Executing command: " + commandType + " for " + equipmentName);

  // Find equipment
  Equipment* eq = nullptr;
  for (int i = 0; i < EQUIPMENT_COUNT; i++) {
    if (String(equipment[i].name) == equipmentName) {
      eq = &equipment[i];
      break;
    }
  }

  if (eq == nullptr) {
    Serial.println("✗ Equipment not found: " + equipmentName);
    sendCommandAck(commandId, false, "Equipment not found");
    return;
  }

  // Execute command
  bool success = false;

  if (commandType == "turn_on") {
    success = setEquipmentState(eq, true, 100);
  } else if (commandType == "turn_off") {
    success = setEquipmentState(eq, false, 0);
  } else if (commandType == "set_value") {
    success = setEquipmentState(eq, value > 0, value);
  } else if (commandType == "set_mode") {
    eq->mode = mode;
    success = true;
    Serial.println("✓ Mode set to: " + mode);
  }

  // Send acknowledgment
  sendCommandAck(commandId, success, success ? "OK" : "Failed");
}

// ============================================
// EQUIPMENT CONTROL
// ============================================

bool setEquipmentState(Equipment* eq, bool state, int value) {
  eq->state = state;
  eq->value = constrain(value, 0, 100);

  if (eq->isRelay) {
    // Relay control (Active LOW)
    digitalWrite(eq->pin, state ? LOW : HIGH);
    Serial.println("✓ " + String(eq->name) + " " + (state ? "ON" : "OFF"));
  } else {
    // PWM control
    int pwmValue = map(eq->value, 0, 100, 0, 255);
    
    if (eq->pin == PWM_FAN_PIN) {
      ledcWrite(PWM_FAN_CHANNEL, pwmValue);
    } else if (eq->pin == PWM_HUMIDIFIER_PIN) {
      ledcWrite(PWM_HUMIDIFIER_CHANNEL, pwmValue);
    }
    
    Serial.println("✓ " + String(eq->name) + " set to " + String(eq->value) + "%");
  }

  return true;
}

// ============================================
// STAGE CONFIG HANDLER
// ============================================

void handleStageConfig(JsonDocument& doc) {
  Serial.println("📋 Received stage configuration");
  
  String stageName = doc["stageName"] | "";
  int duration = doc["duration"] | 0;

  // Extract environmental parameters
  if (doc.containsKey("environmental")) {
    JsonObject env = doc["environmental"];
    Serial.println("  Stage: " + stageName);
    Serial.println("  Duration: " + String(duration) + " days");
    
    // Could store these for auto-control
    // For now, just log them
  }
}

// ============================================
// RECIPE INFO HANDLER (FOR DISPLAY)
// ============================================

void handleRecipeInfo(JsonDocument& doc) {
  currentRecipe.cropName = doc["recipeName"] | "";
  currentRecipe.stageName = doc["stageName"] | "";
  currentRecipe.currentStage = doc["currentStage"] | 0;
  currentRecipe.totalStages = doc["totalStages"] | 0;
  currentRecipe.progress = doc["progress"] | 0;
  currentRecipe.daysInStage = doc["daysInStage"] | 0;
  currentRecipe.expectedDuration = doc["expectedDuration"] | "";
  currentRecipe.status = doc["status"] | "";
  currentRecipe.active = true;

  Serial.println("📺 Display updated: " + currentRecipe.cropName + " - " + currentRecipe.stageName);
}

// ============================================
// SENSOR READING
// ============================================

void readSensors() {
  // Read DHT22
  environment.temperature = dht.readTemperature();
  environment.humidity = dht.readHumidity();

  // Read Light sensor
  environment.light = lightMeter.readLightLevel();

  // Read MQ-135 (simplified - actual calibration needed)
  int analogValue = analogRead(MQ135_PIN);
  environment.co2 = map(analogValue, 0, 4095, 400, 5000);

  environment.lastUpdate = millis();

  // Debug output
  Serial.printf("📊 Sensors: T=%.1f°C, H=%.1f%%, L=%.0flx, CO2=%dppm\n",
                environment.temperature, environment.humidity, 
                environment.light, environment.co2);
}

// ============================================
// PUBLISH STATUS TO MQTT
// ============================================

void publishStatus() {
  StaticJsonDocument<1024> doc;

  // Equipment status
  JsonObject eqObj = doc.createNestedObject("equipment");
  for (int i = 0; i < EQUIPMENT_COUNT; i++) {
    JsonObject item = eqObj.createNestedObject(equipment[i].name);
    item["state"] = equipment[i].state ? "on" : "off";
    item["value"] = equipment[i].value;
    item["mode"] = equipment[i].mode;
  }

  // Environmental data
  JsonObject envObj = doc.createNestedObject("environment");
  envObj["temperature"] = environment.temperature;
  envObj["humidity"] = environment.humidity;
  envObj["light"] = environment.light;
  envObj["co2"] = environment.co2;

  // Device info
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();

  // Serialize and publish
  String output;
  serializeJson(doc, output);

  String topic = "smartcrop/" + String(DEVICE_ID) + "/status/full";
  mqtt.publish(topic.c_str(), output.c_str());

  Serial.println("📤 Status published to MQTT");
}

// ============================================
// SEND COMMAND ACKNOWLEDGMENT
// ============================================

void sendCommandAck(String commandId, bool success, String message) {
  StaticJsonDocument<256> doc;
  doc["commandId"] = commandId;
  doc["success"] = success;
  doc["error"] = message;
  doc["timestamp"] = millis();

  String output;
  serializeJson(doc, output);

  String topic = "smartcrop/" + String(DEVICE_ID) + "/ack/command";
  mqtt.publish(topic.c_str(), output.c_str());

  Serial.println(success ? "✅ Command ACK sent" : "❌ Command NACK sent");
}

// ============================================
// AUTO CONTROL (SIMPLE EXAMPLE)
// ============================================

void autoControl() {
  // Only run auto control if in auto mode
  // This is a simplified example - real control would be more sophisticated

  for (int i = 0; i < EQUIPMENT_COUNT; i++) {
    if (equipment[i].mode != "auto") continue;

    // Example: Auto humidifier control
    if (String(equipment[i].name) == "Humidifier") {
      if (environment.humidity < 80 && !equipment[i].state) {
        setEquipmentState(&equipment[i], true, 100);
      } else if (environment.humidity > 95 && equipment[i].state) {
        setEquipmentState(&equipment[i], false, 0);
      }
    }

    // Example: Auto heater control
    if (String(equipment[i].name) == "Heater") {
      if (environment.temperature < 20 && !equipment[i].state) {
        setEquipmentState(&equipment[i], true, 100);
      } else if (environment.temperature > 26 && equipment[i].state) {
        setEquipmentState(&equipment[i], false, 0);
      }
    }
  }
}

// ============================================
// DISPLAY UPDATE
// ============================================

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);

  switch (currentPage) {
    case PAGE_RECIPE:
      displayRecipePage();
      break;
    case PAGE_ENVIRONMENT:
      displayEnvironmentPage();
      break;
    case PAGE_EQUIPMENT:
      displayEquipmentPage();
      break;
    case PAGE_NETWORK:
      displayNetworkPage();
      break;
  }

  display.display();
}

void displayRecipePage() {
  display.setTextSize(1);
  display.println("=== RECIPE ===");
  display.println();

  if (currentRecipe.active) {
    display.setTextSize(1);
    display.println(currentRecipe.cropName);
    display.println();
    display.print("Stage: ");
    display.println(currentRecipe.stageName);
    display.print("Day ");
    display.print(currentRecipe.daysInStage);
    display.print("/");
    display.println(currentRecipe.expectedDuration);
    display.println();
    display.print("Progress: ");
    display.print(currentRecipe.progress);
    display.println("%");
  } else {
    display.setTextSize(1);
    display.println("No active recipe");
    display.println();
    display.println("Waiting for");
    display.println("recipe start...");
  }
}

void displayEnvironmentPage() {
  display.setTextSize(1);
  display.println("== ENVIRONMENT ==");
  display.println();
  display.print("Temp: ");
  display.print(environment.temperature, 1);
  display.println(" C");
  display.print("Humid: ");
  display.print(environment.humidity, 1);
  display.println(" %");
  display.print("Light: ");
  display.print(environment.light, 0);
  display.println(" lx");
  display.print("CO2: ");
  display.print(environment.co2);
  display.println(" ppm");
}

void displayEquipmentPage() {
  display.setTextSize(1);
  display.println("== EQUIPMENT ==");
  display.println();

  // Show first 5 equipment states
  for (int i = 0; i < min(5, EQUIPMENT_COUNT); i++) {
    display.print(equipment[i].name);
    display.print(": ");
    display.println(equipment[i].state ? "ON" : "OFF");
  }
}

void displayNetworkPage() {
  display.setTextSize(1);
  display.println("=== NETWORK ===");
  display.println();
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "OK" : "ERR");
  display.print("MQTT: ");
  display.println(mqtt.connected() ? "OK" : "ERR");
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.print("RSSI: ");
  display.print(WiFi.RSSI());
  display.println(" dBm");
}

// ============================================
// BUTTON HANDLING
// ============================================

void handleButtons() {
  // Simple debouncing
  if (millis() - lastButtonPress < BUTTON_DEBOUNCE) {
    return;
  }

  // UP button - previous page
  if (digitalRead(BUTTON_UP) == LOW) {
    currentPage = (DisplayPage)((currentPage - 1 + 4) % 4);
    lastButtonPress = millis();
    Serial.println("📱 Page: " + String(currentPage));
  }

  // DOWN button - next page
  if (digitalRead(BUTTON_DOWN) == LOW) {
    currentPage = (DisplayPage)((currentPage + 1) % 4);
    lastButtonPress = millis();
    Serial.println("📱 Page: " + String(currentPage));
  }

  // SELECT button - future use (recipe selection, etc.)
  if (digitalRead(BUTTON_SELECT) == LOW) {
    lastButtonPress = millis();
    Serial.println("📱 Select pressed");
    // Could implement local menu system here
  }
}

