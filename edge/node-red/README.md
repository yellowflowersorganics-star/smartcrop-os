# SmartCrop OS - Node-RED Flows

Advanced automation and integration flows for SmartCrop OS.

## 📋 Overview

Node-RED provides a visual programming interface for:
- Advanced automation rules
- Integration with third-party services
- Custom dashboards
- Data transformation and routing
- Alert management

## 🚀 Getting Started

### 1. Install Node-RED

```bash
# Install globally
npm install -g --unsafe-perm node-red

# Or run via Docker (recommended)
docker run -it -p 1880:1880 -v node_red_data:/data nodered/node-red
```

### 2. Install Required Nodes

```bash
cd ~/.node-red
npm install node-red-dashboard
npm install node-red-contrib-mqtt-broker
npm install node-red-contrib-influxdb
npm install node-red-node-email
npm install node-red-node-twilio
```

### 3. Start Node-RED

```bash
node-red

# Access UI at: http://localhost:1880
```

## 📊 Example Flows

### Basic Monitoring Flow
1. MQTT Input (subscribe to telemetry)
2. JSON Parser
3. Dashboard Gauges (temp, humidity, CO₂)
4. InfluxDB Output (historical data)

### Alert Flow
1. MQTT Input (telemetry)
2. Function (check thresholds)
3. Switch (route if alert)
4. Email/SMS notification
5. Dashboard notification

### Recipe Automation Flow
1. Inject (timer/schedule)
2. Function (calculate setpoints)
3. MQTT Output (publish setpoints)

## 🎯 Use Cases

### 1. Advanced Scheduling
- Time-based recipe transitions
- Sunrise/sunset automation
- Multi-zone coordination

### 2. External Integrations
- Weather API integration
- Email/SMS alerts
- Cloud storage
- Analytics platforms

### 3. Custom Dashboards
- Real-time monitoring
- Historical charts
- Control panels
- Mobile-friendly UI

### 4. Data Processing
- Moving averages
- Anomaly detection
- Predictive alerts
- Data aggregation

## 📁 Flow Examples

Import these flows into Node-RED:

- `basic-monitoring.json` - Simple dashboard
- `alert-system.json` - Threshold-based alerts
- `recipe-scheduler.json` - Automated recipe control
- `data-logger.json` - TimescaleDB/InfluxDB logging

## 🔗 Integration Points

### MQTT Topics
- Subscribe: `smartcrop/+/telemetry`
- Publish: `smartcrop/{deviceId}/command`

### HTTP APIs
- SmartCrop Backend: `http://localhost:3000/api`
- Authentication: Bearer token

### Databases
- PostgreSQL: Relational data
- InfluxDB: Time-series data
- Redis: Caching

## 📝 Best Practices

1. **Error Handling**: Always add catch nodes
2. **Rate Limiting**: Avoid overwhelming MQTT broker
3. **Data Validation**: Validate sensor readings
4. **Security**: Use authentication for HTTP endpoints
5. **Modularity**: Create reusable subflows

## 📄 License

MIT License

