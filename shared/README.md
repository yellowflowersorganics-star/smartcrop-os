# SmartCrop OS - Shared Schemas and Models

Common data structures, JSON schemas, and protocols used across all components of SmartCrop OS.

## 📁 Structure

```
shared/
├── schemas/              # JSON Schema definitions
│   ├── crop-recipe.schema.json
│   ├── mqtt-message.schema.json
│   └── ...
├── examples/            # Example recipes and data
│   ├── mushroom-recipe.json
│   ├── lettuce-recipe.json
│   └── tomato-recipe.json
├── models/              # Shared data models
└── protocols/           # Communication protocols
```

## 📊 Schemas

### Crop Recipe Schema

Defines the structure for crop growth recipes with environmental parameters per stage.

**Location**: `schemas/crop-recipe.schema.json`

**Key Properties**:
- `cropId`: Unique identifier
- `cropType`: Category (mushroom, vegetable, leafy-green, etc.)
- `stages`: Array of growth stages with parameters
- `requiredSensors`: List of necessary sensors
- `requiredActuators`: List of necessary actuators

### MQTT Message Schema

Defines message formats for device-to-cloud communication.

**Location**: `schemas/mqtt-message.schema.json`

**Message Types**:
- **Telemetry**: Sensor readings and actuator states
- **Setpoints**: Environmental targets
- **Command**: Control commands from cloud
- **Status**: Device health and connectivity
- **Alert**: Warnings and errors

## 🌱 Example Recipes

### Oyster Mushroom
```json
{
  "cropId": "oyster-mushroom-v1",
  "cropType": "mushroom",
  "stages": [
    {
      "name": "Spawn Run",
      "duration": 14,
      "temperature": 24,
      "humidity": 90,
      "co2": 5000,
      "lightHours": 0
    },
    // ... more stages
  ]
}
```

### Butterhead Lettuce (Hydroponic)
```json
{
  "cropId": "butterhead-lettuce-v1",
  "cropType": "leafy-green",
  "stages": [
    {
      "name": "Germination",
      "duration": 3,
      "temperature": 22,
      "humidity": 80,
      "lightHours": 18
    },
    // ... more stages
  ]
}
```

## 🔄 MQTT Topics and Payloads

### Device → Backend

#### Telemetry
**Topic**: `smartcrop/{deviceId}/telemetry`

```json
{
  "deviceId": "ESP32_ABCD1234",
  "zoneId": "zone-uuid",
  "timestamp": 1703001234567,
  "environment": {
    "temperature": 24.5,
    "humidity": 72.3,
    "co2": 850
  },
  "actuators": {
    "fan": false,
    "humidifier": true
  }
}
```

#### Status
**Topic**: `smartcrop/{deviceId}/status`

```json
{
  "status": "running",
  "deviceId": "ESP32_ABCD1234",
  "firmwareVersion": "1.0.0",
  "uptime": 86400,
  "rssi": -65
}
```

### Backend → Device

#### Setpoints
**Topic**: `smartcrop/{deviceId}/setpoints`

```json
{
  "temperature": 24.0,
  "humidity": 75.0,
  "co2": 900,
  "lightHours": 14,
  "lightIntensity": 80
}
```

#### Command
**Topic**: `smartcrop/{deviceId}/command`

```json
{
  "command": "override",
  "actuator": "fan",
  "action": "on",
  "timestamp": "2024-01-01T12:00:00Z",
  "messageId": "cmd_1703001234567"
}
```

## 🧪 Validation

### Validate Recipe

```javascript
const Ajv = require('ajv');
const schema = require('./schemas/crop-recipe.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const recipe = { /* your recipe data */ };
const valid = validate(recipe);

if (!valid) {
  console.error(validate.errors);
}
```

### Python Validation

```python
import json
import jsonschema

with open('schemas/crop-recipe.schema.json') as f:
    schema = json.load(f)

with open('examples/mushroom-recipe.json') as f:
    recipe = json.load(f)

jsonschema.validate(recipe, schema)
```

## 📦 Using in Projects

### Backend (Node.js)

```javascript
const recipeSchema = require('../shared/schemas/crop-recipe.schema.json');
const exampleRecipe = require('../shared/examples/mushroom-recipe.json');
```

### Frontend (React)

```javascript
import recipeSchema from '@/shared/schemas/crop-recipe.schema.json';
```

### ESP32 Firmware

Use ArduinoJson to parse/generate JSON according to schemas:

```cpp
#include <ArduinoJson.h>

DynamicJsonDocument telemetry(512);
telemetry["deviceId"] = deviceId;
telemetry["timestamp"] = millis();
// ... add more fields
```

## 🔒 Versioning

Schemas follow semantic versioning:
- **Major**: Breaking changes
- **Minor**: Backward-compatible additions
- **Patch**: Bug fixes and clarifications

## 📄 License

MIT License

