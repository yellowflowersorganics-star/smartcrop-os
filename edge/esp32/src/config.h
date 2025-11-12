/**
 * SmartCrop OS - ESP32 Configuration
 */

#ifndef CONFIG_H
#define CONFIG_H

// Firmware version
#define FIRMWARE_VERSION "1.0.0"

// WiFi credentials (can be updated via web portal)
#define WIFI_SSID "YourWiFiSSID"
#define WIFI_PASSWORD "YourWiFiPassword"

// MQTT broker configuration
#define MQTT_BROKER "mqtt.smartcrop.io"  // Or use IP address
#define MQTT_PORT 1883
#define MQTT_USERNAME "smartcrop"
#define MQTT_PASSWORD "your_mqtt_password"

// Sensor pins
#define PIN_SHT31_SDA 21
#define PIN_SHT31_SCL 22
#define PIN_MHZ19_RX 16
#define PIN_MHZ19_TX 17
#define PIN_SOIL_MOISTURE 34
#define PIN_LIGHT_SENSOR 35

// Actuator pins
#define PIN_FAN 25
#define PIN_HUMIDIFIER 26
#define PIN_HEATER 27
#define PIN_GROW_LIGHT 32
#define PIN_PUMP 33
#define PIN_VALVE 14

// PID control parameters
#define PID_KP_TEMP 2.0
#define PID_KI_TEMP 0.5
#define PID_KD_TEMP 1.0

#define PID_KP_HUMIDITY 1.5
#define PID_KI_HUMIDITY 0.3
#define PID_KD_HUMIDITY 0.8

// Safety limits
#define TEMP_MIN 5.0
#define TEMP_MAX 45.0
#define HUMIDITY_MIN 20.0
#define HUMIDITY_MAX 95.0
#define CO2_MAX 3000

// Control dead bands
#define TEMP_DEADBAND 0.5
#define HUMIDITY_DEADBAND 2.0
#define CO2_DEADBAND 50

#endif // CONFIG_H

