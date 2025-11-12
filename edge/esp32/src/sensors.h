/**
 * SmartCrop OS - Sensor Management
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_SHT31.h>

struct SensorReadings {
  float temperature;
  float humidity;
  int co2;
  int lightLevel;
  int soilMoisture;
  bool valid;
};

class Sensors {
private:
  Adafruit_SHT31 sht31;
  bool sht31Available;
  
public:
  void begin();
  SensorReadings readAll();
  float readTemperature();
  float readHumidity();
  int readCO2();
  int readLightLevel();
  int readSoilMoisture();
};

#endif // SENSORS_H

