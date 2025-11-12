/**
 * SmartCrop OS - Sensor Implementation
 */

#include "sensors.h"
#include "config.h"

void Sensors::begin() {
  Serial.println("Initializing sensors...");
  
  // Initialize I2C
  Wire.begin(PIN_SHT31_SDA, PIN_SHT31_SCL);
  
  // Initialize SHT31 (Temperature & Humidity)
  if (sht31.begin(0x44)) {
    Serial.println("✓ SHT31 sensor found");
    sht31Available = true;
  } else {
    Serial.println("✗ SHT31 sensor not found");
    sht31Available = false;
  }
  
  // Configure analog pins
  pinMode(PIN_SOIL_MOISTURE, INPUT);
  pinMode(PIN_LIGHT_SENSOR, INPUT);
  
  Serial.println("Sensors initialized\n");
}

SensorReadings Sensors::readAll() {
  SensorReadings readings;
  
  readings.temperature = readTemperature();
  readings.humidity = readHumidity();
  readings.co2 = readCO2();
  readings.lightLevel = readLightLevel();
  readings.soilMoisture = readSoilMoisture();
  readings.valid = true;
  
  return readings;
}

float Sensors::readTemperature() {
  if (!sht31Available) {
    return -999.0;
  }
  
  float temp = sht31.readTemperature();
  
  if (isnan(temp)) {
    Serial.println("Failed to read temperature");
    return -999.0;
  }
  
  return temp;
}

float Sensors::readHumidity() {
  if (!sht31Available) {
    return -999.0;
  }
  
  float humidity = sht31.readHumidity();
  
  if (isnan(humidity)) {
    Serial.println("Failed to read humidity");
    return -999.0;
  }
  
  return humidity;
}

int Sensors::readCO2() {
  // TODO: Implement MH-Z19C CO2 sensor reading
  // For now, return dummy value
  return 800;
}

int Sensors::readLightLevel() {
  int rawValue = analogRead(PIN_LIGHT_SENSOR);
  
  // Convert to lux (approximate)
  int lux = map(rawValue, 0, 4095, 0, 10000);
  
  return lux;
}

int Sensors::readSoilMoisture() {
  int rawValue = analogRead(PIN_SOIL_MOISTURE);
  
  // Convert to percentage (0-100%)
  int moisture = map(rawValue, 0, 4095, 0, 100);
  moisture = constrain(moisture, 0, 100);
  
  return moisture;
}

