/**
 * SmartCrop OS - Recipe Executor
 * Executes crop recipe setpoints with PID control
 */

#ifndef RECIPE_EXECUTOR_H
#define RECIPE_EXECUTOR_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensors.h"
#include "actuators.h"

struct Setpoints {
  float temperature;
  float humidity;
  int co2;
  int lightHours;
  int lightIntensity;
  bool valid;
};

class RecipeExecutor {
private:
  Setpoints currentSetpoints;
  unsigned long lastControlTime;
  
  // PID variables
  float tempErrorSum;
  float tempLastError;
  float humidityErrorSum;
  float humidityLastError;
  
  void controlTemperature(float current, float target, Actuators& actuators);
  void controlHumidity(float current, float target, Actuators& actuators);
  void controlCO2(int current, int target, Actuators& actuators);
  void controlLight(Actuators& actuators);
  
public:
  void begin();
  void updateSetpoints(JsonDocument& doc);
  void execute(SensorReadings& readings, Actuators& actuators);
};

#endif // RECIPE_EXECUTOR_H

