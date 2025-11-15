# 🍄 CropWise - IoT Setup Guide

## Quick Start - Raspberry Pi 5 Setup

### Step 1: Flash Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Insert your microSD card
3. Flash **Raspberry Pi OS Lite (64-bit)** or **Raspberry Pi OS (64-bit)**
4. **IMPORTANT:** Before writing:
   - Click ⚙️ (Settings)
   - ✅ Enable SSH
   - ✅ Set username and password (username: `pi`)
   - ✅ Configure WiFi (optional but recommended)
5. Click **Write** and wait

### Step 2: Boot Raspberry Pi

1. Insert microSD card into Raspberry Pi 5
2. Connect power
3. Wait 2-3 minutes for first boot
4. Find IP address:
   - Check your router's admin page
   - Or connect monitor/keyboard and run: `hostname -I`

### Step 3: Connect via SSH

```bash
# From your computer
ssh pi@192.168.1.XXX
# Enter password when prompted
```

### Step 4: Upload Setup Files

From your computer (in the `cropwise/raspberry-pi` directory):

```bash
# Copy files to Raspberry Pi
scp setup-gateway.sh gateway.py configure.sh pi@192.168.1.XXX:~/

# SSH into Raspberry Pi
ssh pi@192.168.1.XXX
```

### Step 5: Run Setup

```bash
# Make scripts executable
chmod +x setup-gateway.sh configure.sh

# Run setup (takes 5-10 minutes)
./setup-gateway.sh

# Configure gateway
./configure.sh
```

Follow the prompts:
1. **API URL**: Your CropWise server (e.g., `http://192.168.1.10:3000/api`)
2. **AUTH_TOKEN**: Get from CropWise (see below)
3. **Gateway ID**: Default is fine (`RPI5-GATEWAY-001`)
4. **Send Interval**: Default 300 seconds (5 minutes) is recommended

#### How to Get AUTH_TOKEN:

1. Open CropWise in browser
2. Login
3. Press **F12** (Developer Tools)
4. Go to **Network** tab
5. Refresh the page
6. Click any API request
7. Find **Authorization** header
8. Copy the token (long string after "Bearer ")

### Step 6: Start Gateway

```bash
# Start service
sudo systemctl start cropwise-gateway

# Check if running
sudo systemctl status cropwise-gateway

# View live logs
sudo journalctl -u cropwise-gateway -f
```

You should see:
```
✅ Connected to MQTT Broker at localhost:1883
📡 Subscribed to: cropwise/zone/+/sensors
```

### Step 7: Test MQTT Broker

Open a new SSH session and run:

```bash
# Subscribe to all messages
mosquitto_sub -h localhost -t "cropwise/#" -v
```

Leave this running - you'll see messages when ESP32 connects!

---

## ESP32 Setup

### Hardware Requirements (Per Zone)

- ESP32 Dev Board
- DHT22 Temperature/Humidity Sensor
- MQ-135 Air Quality/CO2 Sensor  
- BH1750 Light Sensor (I2C)
- Jumper wires
- USB cable for programming
- 5V power supply

### Wiring Diagram

```
ESP32 Dev Board:
┌─────────────────────────┐
│                         │
│  3.3V ─┬─ DHT22 VCC     │
│        └─ BH1750 VCC    │
│                         │
│  GPIO4 ── DHT22 DATA    │
│                         │
│  GPIO21 ─ BH1750 SDA    │
│  GPIO22 ─ BH1750 SCL    │
│                         │
│  GPIO34 ─ MQ-135 AOUT   │
│  5V ───── MQ-135 VCC    │
│                         │
│  GND ───┬─ DHT22 GND    │
│         ├─ BH1750 GND   │
│         └─ MQ-135 GND   │
│                         │
└─────────────────────────┘
```

### Software Setup

1. **Install Arduino IDE**
   - Download from [arduino.cc](https://www.arduino.cc/en/software)

2. **Add ESP32 Board Support**
   - File → Preferences
   - Additional Board Manager URLs:
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager
   - Search "ESP32" → Install

3. **Install Libraries**
   - Sketch → Include Library → Manage Libraries
   - Install:
     - `PubSubClient` by Nick O'Leary
     - `DHT sensor library` by Adafruit
     - `Adafruit Unified Sensor`
     - `BH1750` by Christopher Laws
     - `ArduinoJson` by Benoit Blanchon

4. **Open ESP32 Code**
   - Open `ESP32_Zone_Sensor/ESP32_Zone_Sensor.ino`

5. **Configure**
   
   Update these lines at the top:
   
   ```cpp
   const char* WIFI_SSID = "YourWiFiName";
   const char* WIFI_PASSWORD = "YourPassword";
   const char* MQTT_BROKER = "192.168.1.XXX";  // Your Raspberry Pi IP
   const char* DEVICE_ID = "ESP32-ZONE-001";
   const char* ZONE_ID = "abc-123-def-456";    // From CropWise
   ```

   **To get ZONE_ID:**
   - Login to CropWise
   - Go to Zones page
   - Click on a zone
   - Copy ID from URL: `http://localhost:5173/zones/<ZONE_ID>`

6. **Upload**
   - Connect ESP32 via USB
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → (select your COM/USB port)
   - Click Upload button (→)
   - Wait for "Done uploading"

7. **Monitor**
   - Tools → Serial Monitor
   - Set baud rate to **115200**
   - You should see:

   ```
   🚀 CropWise ESP32 Sensor Node
   ✅ WiFi connected!
   ✅ MQTT Connected!
   📊 Reading sensors...
      Temperature: 24.5°C
      Humidity: 65.0%
      CO2: 450 ppm
      Light: 120 lux
   ✅ Published to MQTT
   ```

---

## Verification

### 1. Check MQTT Messages

On Raspberry Pi terminal:

```bash
mosquitto_sub -h localhost -t "cropwise/#" -v
```

You should see messages every 60 seconds:
```
cropwise/zone/abc-123/sensors {"device_id":"ESP32-ZONE-001",...}
```

### 2. Check Gateway Logs

```bash
sudo journalctl -u cropwise-gateway -f
```

You should see:
```
📊 Zone abc-123: T=24.5°C, H=65%, CO2=450ppm
✅ Sent to API: Zone abc-123 at 14:30:15
```

### 3. Check CropWise

1. Login to CropWise
2. Go to Zones → Select your zone
3. Scroll to "Environmental Monitoring"
4. You should see real-time data updating!

---

## Useful Commands

### Raspberry Pi

```bash
# Check gateway status
sudo systemctl status cropwise-gateway

# Start/Stop/Restart gateway
sudo systemctl start cropwise-gateway
sudo systemctl stop cropwise-gateway
sudo systemctl restart cropwise-gateway

# View logs
sudo journalctl -u cropwise-gateway -f

# Check Mosquitto status
sudo systemctl status mosquitto

# Restart Mosquitto
sudo systemctl restart mosquitto

# Test MQTT
mosquitto_sub -h localhost -t "cropwise/#" -v

# Find Raspberry Pi IP
hostname -I

# Edit configuration
cd ~/cropwise-gateway
nano .env

# After editing config, restart:
sudo systemctl restart cropwise-gateway
```

### ESP32 Serial Monitor Commands

After opening Serial Monitor (115200 baud), you'll see:
- WiFi connection status
- MQTT connection status
- Sensor readings every 60 seconds
- Any errors or warnings

---

## Troubleshooting

### ESP32 Won't Connect to WiFi

✅ **Check:**
- SSID and password are correct
- WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- WiFi signal is strong enough
- No special characters in password

### ESP32 Won't Connect to MQTT

✅ **Check:**
- Raspberry Pi IP is correct
- Raspberry Pi is on same network
- Mosquitto is running: `sudo systemctl status mosquitto`
- Test with: `mosquitto_pub -h <RPI_IP> -t test -m "hello"`

### No Data in CropWise

✅ **Check:**
1. ESP32 is sending to MQTT (check Serial Monitor)
2. Gateway is receiving (check `mosquitto_sub`)
3. Gateway is forwarding to API (check `journalctl`)
4. AUTH_TOKEN is valid (may need to login again)
5. API_URL is correct in `.env`

### Gateway Service Won't Start

✅ **Check:**
```bash
# Check service status
sudo systemctl status cropwise-gateway

# Check logs for errors
sudo journalctl -u cropwise-gateway -n 50

# Test manually
cd ~/cropwise-gateway
source venv/bin/activate
python3 gateway.py
```

---

## Multiple Zones

To add more zones:

1. Flash additional ESP32 with unique IDs:
   ```cpp
   const char* DEVICE_ID = "ESP32-ZONE-002";  // Increment number
   const char* ZONE_ID = "different-zone-id"; // Different zone
   ```

2. No changes needed on Raspberry Pi!
   - Gateway automatically handles multiple zones
   - Each ESP32 publishes to its own topic

---

## Production Tips

### 1. Static IP for Raspberry Pi

```bash
sudo nano /etc/dhcpcd.conf
```

Add at the end:
```
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8
```

Reboot: `sudo reboot`

### 2. Enable MQTT Authentication

```bash
# Create password file
sudo mosquitto_passwd -c /etc/mosquitto/passwd cropwise

# Edit config
sudo nano /etc/mosquitto/conf.d/cropwise.conf

# Change:
# allow_anonymous false
# password_file /etc/mosquitto/passwd

# Restart
sudo systemctl restart mosquitto
```

Update ESP32 code to include username/password.

### 3. Firewall (Optional)

```bash
sudo apt install ufw -y
sudo ufw allow 22    # SSH
sudo ufw allow 1883  # MQTT
sudo ufw enable
```

### 4. Regular Updates

```bash
# Update system monthly
sudo apt update && sudo apt upgrade -y
```

---

## Next Steps

✅ **You're all set!**

Your CropWise now has:
- Real-time environmental monitoring
- Professional MQTT-based IoT architecture
- Scalable to 100+ zones
- Reliable offline operation

**Want to add more?**
- Add more sensors (soil moisture, pH, etc.)
- Add actuators (fans, heaters, lights)
- Set up automated control loops
- Create custom alerts

See `docs/IOT_INTEGRATION_GUIDE.md` for advanced features!

---

## Support

For issues:
1. Check logs: `sudo journalctl -u cropwise-gateway -f`
2. Test MQTT: `mosquitto_sub -h localhost -t "cropwise/#" -v`
3. Review this guide's Troubleshooting section

Happy farming! 🍄🚀

