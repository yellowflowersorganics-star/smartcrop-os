/**
 * SmartCrop OS - Actuator Control
 */

#ifndef ACTUATORS_H
#define ACTUATORS_H

#include <Arduino.h>

class Actuators {
private:
  bool fanState;
  bool humidifierState;
  bool heaterState;
  bool lightState;
  bool pumpState;
  bool valveState;
  
public:
  void begin();
  void setFan(bool state);
  void setHumidifier(bool state);
  void setHeater(bool state);
  void setLight(bool state, int intensity = 100);
  void setPump(bool state);
  void setValve(bool state);
  
  bool getState(String actuator);
  void manualControl(String actuator, String action);
  void emergencyStop();
};

#endif // ACTUATORS_H

