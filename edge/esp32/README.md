# CropWise - ESP32 Edge Controller

Firmware for ESP32-based environmental monitoring and control.

## 🔧 Hardware Requirements

### Core Components
- ESP32 DevKit (ESP-WROOM-32)
- Power Supply: 5V/2A minimum

### Sensors
- **SHT31**: Temperature & Humidity (I2C)
- **MH-Z19C**: CO₂ sensor (UART)
- **Analog sensors**:
  - Soil moisture sensor
  - Light sensor (LDR or photodiode)

### Actuators
- Relay modules (4-8 channel)
- Fan (12V)
- Humidifier (12V/220V via relay)
- Heater element (12V/220V via relay)
- Grow lights (LED, controllable via PWM or relay)
- Water pump (12V)
- Solenoid valve (12V)

## 📋 Pin Configuration

| Component | ESP32 Pin | Description |
|:----------|:----------|:------------|
| SHT31 SDA | GPIO 21 | I2C Data |
| SHT31 SCL | GPIO 22 | I2C Clock |
| MH-Z19 RX | GPIO 16 | UART Receive |
| MH-Z19 TX | GPIO 17 | UART Transmit |
| Soil Moisture | GPIO 34 | Analog Input |
| Light Sensor | GPIO 35 | Analog Input |
| Fan | GPIO 25 | Digital Output |
| Humidifier | GPIO 26 | Digital Output |
| Heater | GPIO 27 | Digital Output |
| Grow Light | GPIO 32 | PWM Output |
| Pump | GPIO 33 | Digital Output |
| Valve | GPIO 14 | Digital Output |

## 🚀 Getting Started

### 1. Install PlatformIO

```bash
# Using VS Code
# Install PlatformIO IDE extension

# Or using CLI
pip install platformio
```

### 2. Configure WiFi and MQTT

Edit `src/config.h`:

```cpp
#define WIFI_SSID "YourWiFiSSID"
#define WIFI_PASSWORD "YourWiFiPassword"

#define MQTT_BROKER "mqtt.cropwise.io"
#define MQTT_PORT 1883
#define MQTT_USERNAME "cropwise"
#define MQTT_PASSWORD "your_password"
```

### 3. Build and Upload

```bash
# Build firmware
pio run

# Upload to ESP32
pio run -t upload

# Open serial monitor
pio device monitor
```

## 📡 MQTT Topics

### Device → Cloud

| Topic | Description | Payload |
|:------|:------------|:--------|
| `cropwise/{deviceId}/telemetry` | Sensor readings | Environmental data + actuator states |
| `cropwise/{deviceId}/status` | Device status | Online/offline, uptime, memory |
| `cropwise/{deviceId}/alert` | Alerts/warnings | Error conditions |
| `cropwise/{deviceId}/response` | Command response | Acknowledgments |

### Cloud → Device

| Topic | Description | Payload |
|:------|:------------|:--------|
| `cropwise/{deviceId}/setpoints` | Environmental targets | Temperature, humidity, CO₂, light |
| `cropwise/{deviceId}/command` | Control commands | Override, emergency stop |
| `cropwise/{deviceId}/config` | Configuration | Settings update |

## 📊 Telemetry Message Format

```json
{
  "deviceId": "ESP32_ABCD1234",
  "zoneId": "zone-uuid",
  "timestamp": 123456789,
  "environment": {
    "temperature": 24.5,
    "humidity": 72.3,
    "co2": 850,
    "lightLevel": 5000,
    "soilMoisture": 65
  },
  "actuators": {
    "fan": false,
    "humidifier": true,
    "heater": false,
    "light": true,
    "pump": false
  }
}
```

## 🎛️ Setpoints Message Format

```json
{
  "temperature": 24.0,
  "humidity": 75.0,
  "co2": 900,
  "lightHours": 14,
  "lightIntensity": 80
}
```

## 🔧 Control Logic

### Temperature Control
- **Bang-bang control** with ±0.5°C deadband
- Heater activates when temp < target - 0.5°C
- Fan/cooling when temp > target + 0.5°C

### Humidity Control
- Humidifier ON when humidity < target - 2%
- Ventilation when humidity > target + 2%

### CO₂ Control
- Injection when CO₂ < target - 50ppm
- Safety cutoff at 3000ppm

### Light Control
- PWM intensity control (0-100%)
- Schedule based on lightHours setpoint

## 🛠️ Troubleshooting

### WiFi Connection Issues
```cpp
// Check serial monitor for:
WiFi connected
IP address: 192.168.x.x
```

### MQTT Connection Fails
- Verify broker URL and credentials
- Check firewall/network connectivity
- Ensure MQTT broker is running

### Sensor Reading Errors
- Check I2C connections (SDA/SCL)
- Verify sensor power supply
- Run I2C scanner to detect devices

### Actuators Not Working
- Check relay wiring
- Verify power supply voltage
- Test relays individually

## 📝 Development Notes

### Adding New Sensors
1. Add pin definitions to `config.h`
2. Implement read function in `sensors.cpp`
3. Update `SensorReadings` struct
4. Add to telemetry payload

### Adding New Actuators
1. Add pin definitions to `config.h`
2. Implement control function in `actuators.cpp`
3. Add state tracking
4. Update control logic in `recipe_executor.cpp`

## 📄 License

MIT License - See root LICENSE file

