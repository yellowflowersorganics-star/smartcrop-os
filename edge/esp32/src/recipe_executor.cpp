/**
 * SmartCrop OS - Recipe Executor Implementation
 */

#include "recipe_executor.h"
#include "config.h"

void RecipeExecutor::begin() {
  Serial.println("Initializing recipe executor...");
  
  // Initialize default setpoints
  currentSetpoints.temperature = 25.0;
  currentSetpoints.humidity = 70.0;
  currentSetpoints.co2 = 800;
  currentSetpoints.lightHours = 12;
  currentSetpoints.lightIntensity = 100;
  currentSetpoints.valid = false;
  
  lastControlTime = millis();
  
  tempErrorSum = 0;
  tempLastError = 0;
  humidityErrorSum = 0;
  humidityLastError = 0;
  
  Serial.println("Recipe executor initialized\n");
}

void RecipeExecutor::updateSetpoints(JsonDocument& doc) {
  currentSetpoints.temperature = doc["temperature"] | 25.0;
  currentSetpoints.humidity = doc["humidity"] | 70.0;
  currentSetpoints.co2 = doc["co2"] | 800;
  currentSetpoints.lightHours = doc["lightHours"] | 12;
  currentSetpoints.lightIntensity = doc["lightIntensity"] | 100;
  currentSetpoints.valid = true;
  
  Serial.println("Setpoints updated:");
  Serial.printf("  Temp: %.1f°C, RH: %.1f%%, CO2: %dppm\n", 
                currentSetpoints.temperature, 
                currentSetpoints.humidity, 
                currentSetpoints.co2);
}

void RecipeExecutor::execute(SensorReadings& readings, Actuators& actuators) {
  if (!currentSetpoints.valid || !readings.valid) {
    return;
  }
  
  unsigned long currentTime = millis();
  float dt = (currentTime - lastControlTime) / 1000.0;  // seconds
  
  if (dt < 1.0) {
    return;  // Control update rate: 1 Hz
  }
  
  lastControlTime = currentTime;
  
  // Execute control loops
  controlTemperature(readings.temperature, currentSetpoints.temperature, actuators);
  controlHumidity(readings.humidity, currentSetpoints.humidity, actuators);
  controlCO2(readings.co2, currentSetpoints.co2, actuators);
  controlLight(actuators);
}

void RecipeExecutor::controlTemperature(float current, float target, Actuators& actuators) {
  if (current < -100) return;  // Invalid reading
  
  float error = target - current;
  
  // Safety limits
  if (current < TEMP_MIN || current > TEMP_MAX) {
    Serial.println("Temperature out of safe range!");
    actuators.setHeater(false);
    actuators.setFan(true);
    return;
  }
  
  // Simple bang-bang control with deadband
  if (error > TEMP_DEADBAND) {
    // Need heating
    actuators.setHeater(true);
    actuators.setFan(false);
  } 
  else if (error < -TEMP_DEADBAND) {
    // Need cooling
    actuators.setHeater(false);
    actuators.setFan(true);
  }
  else {
    // Within deadband - maintain
    actuators.setFan(false);
  }
}

void RecipeExecutor::controlHumidity(float current, float target, Actuators& actuators) {
  if (current < 0) return;  // Invalid reading
  
  float error = target - current;
  
  // Simple control
  if (error > HUMIDITY_DEADBAND) {
    // Need more humidity
    actuators.setHumidifier(true);
  }
  else if (error < -HUMIDITY_DEADBAND) {
    // Too humid, increase ventilation
    actuators.setHumidifier(false);
    actuators.setFan(true);
  }
  else {
    actuators.setHumidifier(false);
  }
}

void RecipeExecutor::controlCO2(int current, int target, Actuators& actuators) {
  if (current < 0) return;  // Invalid reading
  
  int error = target - current;
  
  // CO2 control logic
  // TODO: Implement CO2 injection control
  // For now, just monitoring
  if (current > CO2_MAX) {
    Serial.println("CO2 level too high! Increasing ventilation.");
    actuators.setFan(true);
  }
}

void RecipeExecutor::controlLight(Actuators& actuators) {
  // Get current hour (simplified - use RTC in production)
  // For now, assume light schedule based on setpoints
  
  // This should be enhanced with actual time from NTP/RTC
  // For demonstration, we'll just use the setpoint
  
  actuators.setLight(true, currentSetpoints.lightIntensity);
}

