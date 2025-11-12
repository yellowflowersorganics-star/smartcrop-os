# 🍓 SmartCrop OS - Raspberry Pi Gateway (Node-RED)

Node-RED flows for the Raspberry Pi gateway to manage local ESP32 controllers and bridge to SmartCrop Cloud.

---

## 📋 Overview

The Raspberry Pi acts as a **local hub** for your unit/building:

```
ESP32 Controllers (Zones)
    ↓ WiFi → Local MQTT (port 1883)
Raspberry Pi Gateway (Node-RED)
    ↓ Internet → Cloud MQTT/TLS (port 8883)
SmartCrop Cloud Backend
```

---

## 🚀 Quick Start

### 1. Install Node-RED on Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Node-RED
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)

# Enable Node-RED to start on boot
sudo systemctl enable nodered.service

# Start Node-RED
sudo systemctl start nodered.service
```

### 2. Install Required Node-RED Nodes

```bash
# Go to Node-RED directory
cd ~/.node-red

# Install required nodes
npm install node-red-dashboard
npm install node-red-contrib-sqlite
npm install node-red-contrib-schedex

# Restart Node-RED
sudo systemctl restart nodered.service
```

### 3. Install Mosquitto (Local MQTT Broker)

```bash
# Install Mosquitto
sudo apt install -y mosquitto mosquitto-clients

# Enable and start
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Test local MQTT
mosquitto_sub -h localhost -t "#" -v
```

### 4. Configure SmartCrop Gateway

```bash
# Create configuration directory
sudo mkdir -p /etc/smartcrop

# Create environment file
sudo nano /etc/smartcrop/gateway.env
```

**Add configuration**:
```bash
# SmartCrop Configuration
ORGANIZATION_ID=org_abc123
UNIT_ID=unit_001
GATEWAY_ID=rpi_b827eb123456

# API Configuration
API_URL=https://api.smartcrop.cloud
API_TOKEN=your_jwt_token_here

# Cloud MQTT Configuration
CLOUD_MQTT_BROKER=mqtt.smartcrop.cloud
CLOUD_MQTT_PORT=8883
CLOUD_MQTT_USERNAME=gateway_unit_001
CLOUD_MQTT_PASSWORD=your_mqtt_password

# Local MQTT Configuration
LOCAL_MQTT_PORT=1883
```

### 5. Import Node-RED Flow

1. **Access Node-RED**:
   - Open browser: `http://raspberry-pi-ip:1880`
   - Default: `http://192.168.1.100:1880`

2. **Import Flow**:
   - Menu (☰) → Import
   - Paste contents of `flows/smartcrop-gateway.json`
   - Click "Import"

3. **Configure MQTT Brokers**:
   - Double-click any MQTT node
   - Click pencil icon next to "Broker"
   - **Local Broker**:
     - Server: `localhost`
     - Port: `1883`
   - **Cloud Broker**:
     - Server: `mqtt.smartcrop.cloud`
     - Port: `8883`
     - Enable TLS
     - Username/Password from `gateway.env`

4. **Deploy**:
   - Click "Deploy" button (top right)

---

## 📡 MQTT Topics

### Local Topics (ESP32 → Raspberry Pi)

**ESP32 publishes**:
```
unit1/zone_a/telemetry         → Sensor data
unit1/zone_a/status            → Device status
unit1/zone_a/alert             → Warnings/errors
```

**Raspberry Pi publishes**:
```
unit1/zone_a/setpoints         → Environmental targets
unit1/zone_a/command           → Control commands
unit1/zone_a/config            → Configuration updates
```

### Cloud Topics (Raspberry Pi → Cloud)

**Raspberry Pi publishes**:
```
yfcloud/org_abc123/unit_001/telemetry_aggregated  → All zones combined
yfcloud/org_abc123/unit_001/gateway_status        → Pi health
```

**Cloud publishes**:
```
yfcloud/org_abc123/unit_001/setpoints_bulk        → Update all zones
yfcloud/org_abc123/unit_001/command               → Gateway commands
yfcloud/org_abc123/unit_001/firmware_update       → OTA trigger
```

---

## 🔧 Node-RED Flow Components

### 1. **Telemetry Aggregation**
- **Input**: ESP32 telemetry from all zones
- **Process**: Aggregate into single payload
- **Output**: Forward to cloud every 60 seconds
- **Offline**: Buffer locally in SQLite

### 2. **Gateway Heartbeat**
- **Frequency**: Every 60 seconds
- **Data**: System info (CPU temp, memory, uptime)
- **Zone Status**: Online/offline status of all ESP32s
- **API Call**: POST to `/api/units/:id/gateway-heartbeat`

### 3. **Setpoint Distribution**
- **Input**: Bulk setpoints from cloud
- **Process**: Parse and distribute to individual zones
- **Output**: Publish to each ESP32 on local MQTT
- **Retain**: Yes (ESP32s get setpoints on reconnect)

### 4. **Command Handling**
- **Input**: Commands from cloud (restart, update, logs)
- **Process**: Execute locally or forward to ESP32
- **Output**: Acknowledgment back to cloud

### 5. **Local Storage (Offline Buffer)**
- **Storage**: SQLite database
- **Retention**: Last 1000 records or 72 hours
- **Sync**: Auto-forward to cloud when online

---

## 🎛️ Node-RED Dashboard (Optional)

Access local dashboard: `http://raspberry-pi-ip:1880/ui`

**Features**:
- Real-time zone status
- Temperature/humidity charts
- Manual control overrides
- System health monitoring
- Log viewer

**To enable**, install dashboard:
```bash
cd ~/.node-red
npm install node-red-dashboard
sudo systemctl restart nodered
```

---

## 🔐 Security Configuration

### 1. Enable Node-RED Authentication

```bash
# Generate password hash
node-red admin hash-pw

# Edit settings.js
nano ~/.node-red/settings.js
```

Add:
```javascript
adminAuth: {
    type: "credentials",
    users: [{
        username: "admin",
        password: "<paste_hash_here>",
        permissions: "*"
    }]
}
```

### 2. Configure Mosquitto Authentication

```bash
# Create password file
sudo mosquitto_passwd -c /etc/mosquitto/passwd esp32_user

# Edit mosquitto config
sudo nano /etc/mosquitto/mosquitto.conf
```

Add:
```
allow_anonymous false
password_file /etc/mosquitto/passwd
```

```bash
# Restart
sudo systemctl restart mosquitto
```

### 3. Enable HTTPS for Node-RED

```bash
# Generate self-signed certificate (or use Let's Encrypt)
cd ~/.node-red
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Edit settings.js
nano ~/.node-red/settings.js
```

Add:
```javascript
https: {
    key: require("fs").readFileSync('key.pem'),
    cert: require("fs").readFileSync('cert.pem')
}
```

---

## 🧪 Testing

### Test Local MQTT (ESP32 → Pi)

**Terminal 1 - Subscribe**:
```bash
mosquitto_sub -h localhost -t "unit1/#" -v
```

**Terminal 2 - Publish (simulate ESP32)**:
```bash
mosquitto_pub -h localhost -t "unit1/zone_a/telemetry" \
  -m '{"temperature":24.5,"humidity":72.3,"co2":850}'
```

### Test Cloud MQTT (Pi → Cloud)

**Subscribe to cloud**:
```bash
mosquitto_sub -h mqtt.smartcrop.cloud -p 8883 \
  --cafile ca.crt \
  -u gateway_unit_001 -P your_password \
  -t "yfcloud/org_abc123/unit_001/#" -v
```

### Test API Heartbeat

```bash
curl -X POST http://localhost:1880/api/heartbeat \
  -H "Content-Type: application/json"
```

---

## 📊 Monitoring

### View Node-RED Logs

```bash
# Live logs
sudo journalctl -u nodered -f

# Last 100 lines
sudo journalctl -u nodered -n 100

# Today's logs
sudo journalctl -u nodered --since today
```

### View Mosquitto Logs

```bash
sudo journalctl -u mosquitto -f
```

### System Health

```bash
# CPU temperature
vcgencmd measure_temp

# Memory usage
free -h

# Disk usage
df -h

# Network status
ifconfig
```

---

## 🐛 Troubleshooting

### Node-RED won't start

```bash
# Check status
sudo systemctl status nodered

# Check logs for errors
sudo journalctl -u nodered -n 50

# Reinstall
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
```

### MQTT Connection Issues

```bash
# Test local broker
mosquitto_sub -h localhost -t test

# Test cloud broker
mosquitto_sub -h mqtt.smartcrop.cloud -p 8883 -t test --insecure

# Check Mosquitto status
sudo systemctl status mosquitto

# Restart Mosquitto
sudo systemctl restart mosquitto
```

### ESP32s Not Connecting

1. **Check WiFi**: Verify Pi is connected
2. **Check MQTT**: `sudo systemctl status mosquitto`
3. **Check Firewall**: `sudo ufw status`
4. **Check IP**: Verify Pi IP matches ESP32 config
5. **Check Credentials**: Verify MQTT username/password

### Cloud Not Receiving Data

1. **Check Internet**: `ping google.com`
2. **Check Cloud Broker**: `ping mqtt.smartcrop.cloud`
3. **Check Credentials**: Verify `gateway.env` settings
4. **Check Logs**: `sudo journalctl -u nodered -f`
5. **Test Manually**: Use `mosquitto_pub` to test

---

## 🚀 Production Deployment

### Auto-start on Boot

```bash
# Enable services
sudo systemctl enable nodered
sudo systemctl enable mosquitto

# Verify
sudo systemctl is-enabled nodered
sudo systemctl is-enabled mosquitto
```

### Automatic Updates

```bash
# Create update script
sudo nano /usr/local/bin/update-smartcrop.sh
```

```bash
#!/bin/bash
cd /home/pi/smartcrop-gateway
git pull origin main
sudo systemctl restart nodered
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/update-smartcrop.sh

# Add to cron (daily at 3 AM)
sudo crontab -e
```

Add:
```
0 3 * * * /usr/local/bin/update-smartcrop.sh >> /var/log/smartcrop-update.log 2>&1
```

### Watchdog (Auto-restart if crashed)

```bash
# Install watchdog
sudo apt install watchdog

# Configure
sudo nano /etc/watchdog.conf
```

Add:
```
watchdog-device = /dev/watchdog
max-load-1 = 24
```

```bash
# Enable
sudo systemctl enable watchdog
sudo systemctl start watchdog
```

---

## 📝 Configuration Files

- **Node-RED settings**: `~/.node-red/settings.js`
- **Flow file**: `~/.node-red/smartcrop-flows.json`
- **Mosquitto config**: `/etc/mosquitto/mosquitto.conf`
- **SmartCrop config**: `/etc/smartcrop/gateway.env`
- **Certificates**: `/etc/smartcrop/*.crt`, `*.key`

---

## 🤝 Support

- **Documentation**: `/docs/ARCHITECTURE_EDGE_GATEWAY.md`
- **GitHub Issues**: https://github.com/yellowflowersorganics-star/smartcrop-os/issues
- **Email**: support@yellowflowers.tech

---

**Last Updated**: November 12, 2025
