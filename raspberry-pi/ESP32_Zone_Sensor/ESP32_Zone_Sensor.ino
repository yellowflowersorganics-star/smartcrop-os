/*
 * SmartCrop OS - ESP32 Zone Sensor Node
 * Reads environmental sensors and publishes to MQTT
 * 
 * Hardware:
 * - ESP32 Dev Board
 * - DHT22 (Temperature & Humidity) on GPIO4
 * - MQ-135 (Air Quality/CO2) on GPIO34
 * - BH1750 (Light Sensor) on I2C (GPIO21=SDA, GPIO22=SCL)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION - UPDATE THESE ============
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER = "192.168.1.100";  // Raspberry Pi IP
const int MQTT_PORT = 1883;
const char* DEVICE_ID = "ESP32-ZONE-001";
const char* ZONE_ID = "your_zone_id_here";  // Get from SmartCrop OS
// =====================================================

// MQTT Topics (auto-generated)
char SENSOR_TOPIC[100];
char STATUS_TOPIC[100];
char CONTROL_TOPIC[100];

// Sensor Pins
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ135_PIN 34

// LED Pin (built-in)
#define LED_PIN 2

// Sensors
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Timing
unsigned long lastSensorRead = 0;
unsigned long lastStatusSend = 0;
const unsigned long SENSOR_INTERVAL = 60000;   // Read every 60 seconds
const unsigned long STATUS_INTERVAL = 300000;  // Status every 5 minutes

// Connection status
bool wifiConnected = false;
bool mqttConnected = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("==================================");
  Serial.println("🚀 SmartCrop OS ESP32 Sensor Node");
  Serial.println("==================================");
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  Serial.printf("Zone ID: %s\n", ZONE_ID);
  Serial.println("==================================\n");
  
  // Setup LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize sensors
  Serial.println("📡 Initializing sensors...");
  dht.begin();
  Wire.begin();
  
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("   ✅ BH1750 Light Sensor initialized");
  } else {
    Serial.println("   ⚠️  BH1750 not found, check wiring");
  }
  
  // Setup MQTT topics
  sprintf(SENSOR_TOPIC, "smartcrop/zone/%s/sensors", ZONE_ID);
  sprintf(STATUS_TOPIC, "smartcrop/zone/%s/status", ZONE_ID);
  sprintf(CONTROL_TOPIC, "smartcrop/zone/%s/control", ZONE_ID);
  
  Serial.println("\n📋 MQTT Topics:");
  Serial.printf("   Sensors: %s\n", SENSOR_TOPIC);
  Serial.printf("   Status: %s\n", STATUS_TOPIC);
  Serial.printf("   Control: %s\n\n", CONTROL_TOPIC);
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  
  Serial.println("✅ Setup complete!");
  Serial.println("==================================\n");
  
  // Blink LED to indicate ready
  for(int i=0; i<3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

void loop() {
  // Maintain WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("⚠️  WiFi disconnected, reconnecting...");
    connectWiFi();
  } else if (!wifiConnected) {
    wifiConnected = true;
    Serial.println("✅ WiFi reconnected");
  }
  
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    mqttConnected = false;
    digitalWrite(LED_PIN, LOW);
    reconnectMQTT();
  } else if (!mqttConnected) {
    mqttConnected = true;
    Serial.println("✅ MQTT reconnected");
    digitalWrite(LED_PIN, HIGH);
  }
  
  mqttClient.loop();
  
  // Read and publish sensors
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    readAndPublishSensors();
    lastSensorRead = millis();
  }
  
  // Publish status
  if (millis() - lastStatusSend >= STATUS_INTERVAL) {
    publishStatus("online");
    lastStatusSend = millis();
  }
  
  // Small delay to prevent watchdog issues
  delay(10);
}

void connectWiFi() {
  Serial.print("📡 Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✅");
    Serial.printf("   IP address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("   Signal: %d dBm\n", WiFi.RSSI());
    wifiConnected = true;
  } else {
    Serial.println(" ❌");
    Serial.println("   WiFi connection failed! Check SSID/password");
    wifiConnected = false;
  }
}

void reconnectMQTT() {
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 3) {
    Serial.print("🔌 Connecting to MQTT broker...");
    
    if (mqttClient.connect(DEVICE_ID)) {
      Serial.println(" ✅");
      
      // Subscribe to control topic
      mqttClient.subscribe(CONTROL_TOPIC);
      Serial.printf("   Subscribed to: %s\n", CONTROL_TOPIC);
      
      // Publish online status
      publishStatus("online");
      
      mqttConnected = true;
      return;
      
    } else {
      Serial.print(" ❌ (rc=");
      Serial.print(mqttClient.state());
      Serial.println(")");
      attempts++;
      
      if (attempts < 3) {
        Serial.println("   Retrying in 5 seconds...");
        delay(5000);
      }
    }
  }
  
  if (!mqttClient.connected()) {
    Serial.println("⚠️  MQTT connection failed. Will retry later.");
    mqttConnected = false;
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Handle control messages (future: actuator control)
  Serial.print("📥 Message on: ");
  Serial.println(topic);
  
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("   Payload: %s\n", message.c_str());
  
  // TODO: Parse and handle control commands here
  // Example: {"command": "set_fan", "value": 75}
}

void readAndPublishSensors() {
  Serial.println("📊 Reading sensors...");
  
  // Flash LED to indicate reading
  digitalWrite(LED_PIN, LOW);
  delay(100);
  digitalWrite(LED_PIN, HIGH);
  
  // Read DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Read light sensor
  float light = lightMeter.readLightLevel();
  
  // Read MQ-135 (CO2 approximation)
  int co2Raw = analogRead(MQ135_PIN);
  // Basic linear mapping - calibrate for better accuracy
  int co2 = map(co2Raw, 0, 4095, 400, 2000);
  
  // Check if DHT readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("   ❌ DHT22 read failed!");
    temperature = 0;
    humidity = 0;
  }
  
  // Display readings
  Serial.printf("   Temperature: %.1f°C\n", temperature);
  Serial.printf("   Humidity: %.1f%%\n", humidity);
  Serial.printf("   CO2: %d ppm\n", co2);
  Serial.printf("   Light: %.0f lux\n", light);
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["zone_id"] = ZONE_ID;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["co2"] = co2;
  doc["light"] = (int)light;
  doc["airflow"] = 0;  // Add if you have airflow sensor
  doc["soil_moisture"] = nullptr;
  doc["timestamp"] = millis();
  doc["rssi"] = WiFi.RSSI();
  
  // Serialize and publish
  char jsonBuffer[256];
  size_t len = serializeJson(doc, jsonBuffer);
  
  if (mqttClient.publish(SENSOR_TOPIC, jsonBuffer, len)) {
    Serial.println("   ✅ Published to MQTT");
  } else {
    Serial.println("   ❌ Publish failed!");
  }
  
  Serial.println();
}

void publishStatus(const char* status) {
  StaticJsonDocument<128> doc;
  doc["device_id"] = DEVICE_ID;
  doc["status"] = status;
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["free_heap"] = ESP.getFreeHeap();
  
  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);
  
  mqttClient.publish(STATUS_TOPIC, jsonBuffer);
  Serial.printf("📱 Status: %s (uptime: %lds, RSSI: %ddBm)\n", 
                status, millis()/1000, WiFi.RSSI());
}

