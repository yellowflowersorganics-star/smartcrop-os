/**
 * SmartCrop OS - Actuator Implementation
 */

#include "actuators.h"
#include "config.h"

void Actuators::begin() {
  Serial.println("Initializing actuators...");
  
  // Configure output pins
  pinMode(PIN_FAN, OUTPUT);
  pinMode(PIN_HUMIDIFIER, OUTPUT);
  pinMode(PIN_HEATER, OUTPUT);
  pinMode(PIN_GROW_LIGHT, OUTPUT);
  pinMode(PIN_PUMP, OUTPUT);
  pinMode(PIN_VALVE, OUTPUT);
  
  // Initialize all to OFF
  digitalWrite(PIN_FAN, LOW);
  digitalWrite(PIN_HUMIDIFIER, LOW);
  digitalWrite(PIN_HEATER, LOW);
  digitalWrite(PIN_GROW_LIGHT, LOW);
  digitalWrite(PIN_PUMP, LOW);
  digitalWrite(PIN_VALVE, LOW);
  
  fanState = false;
  humidifierState = false;
  heaterState = false;
  lightState = false;
  pumpState = false;
  valveState = false;
  
  Serial.println("Actuators initialized\n");
}

void Actuators::setFan(bool state) {
  digitalWrite(PIN_FAN, state ? HIGH : LOW);
  fanState = state;
}

void Actuators::setHumidifier(bool state) {
  digitalWrite(PIN_HUMIDIFIER, state ? HIGH : LOW);
  humidifierState = state;
}

void Actuators::setHeater(bool state) {
  digitalWrite(PIN_HEATER, state ? HIGH : LOW);
  heaterState = state;
}

void Actuators::setLight(bool state, int intensity) {
  // Use PWM for intensity control
  if (state) {
    int pwmValue = map(intensity, 0, 100, 0, 255);
    analogWrite(PIN_GROW_LIGHT, pwmValue);
  } else {
    digitalWrite(PIN_GROW_LIGHT, LOW);
  }
  lightState = state;
}

void Actuators::setPump(bool state) {
  digitalWrite(PIN_PUMP, state ? HIGH : LOW);
  pumpState = state;
}

void Actuators::setValve(bool state) {
  digitalWrite(PIN_VALVE, state ? HIGH : LOW);
  valveState = state;
}

bool Actuators::getState(String actuator) {
  if (actuator == "fan") return fanState;
  if (actuator == "humidifier") return humidifierState;
  if (actuator == "heater") return heaterState;
  if (actuator == "light") return lightState;
  if (actuator == "pump") return pumpState;
  if (actuator == "valve") return valveState;
  return false;
}

void Actuators::manualControl(String actuator, String action) {
  bool state = (action == "on");
  
  if (actuator == "fan") setFan(state);
  else if (actuator == "humidifier") setHumidifier(state);
  else if (actuator == "heater") setHeater(state);
  else if (actuator == "light") setLight(state);
  else if (actuator == "pump") setPump(state);
  else if (actuator == "valve") setValve(state);
}

void Actuators::emergencyStop() {
  Serial.println("EMERGENCY STOP ACTIVATED");
  
  setFan(false);
  setHumidifier(false);
  setHeater(false);
  setLight(false);
  setPump(false);
  setValve(false);
}

