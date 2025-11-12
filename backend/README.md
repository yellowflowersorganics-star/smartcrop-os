# SmartCrop OS - Backend

Multi-tenant SaaS platform for smart crop management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Python 3.9+
- PostgreSQL 15+
- Redis 7+
- MQTT Broker (Mosquitto)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

### Production Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Application entry point
│   ├── routes/               # API routes
│   │   ├── index.js         # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── cropRecipe.routes.js
│   │   ├── farm.routes.js
│   │   └── ...
│   ├── controllers/          # Request handlers
│   │   ├── cropRecipe.controller.js
│   │   ├── auth.controller.js
│   │   └── ...
│   ├── models/               # Database models (Sequelize)
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── CropRecipe.js
│   │   ├── Farm.js
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── recipeEngine.js  # Core recipe execution engine
│   │   ├── mqtt.js          # MQTT communication
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── config/               # Configuration files
│   │   ├── database.js
│   │   └── redis.js
│   └── utils/                # Utility functions
│       └── logger.js
├── scripts/                  # Utility scripts
│   ├── migrate.js
│   └── seed.js
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Crop Recipes
- `GET /api/crop-recipes` - Get all recipes
- `GET /api/crop-recipes/:id` - Get recipe by ID
- `POST /api/crop-recipes` - Create new recipe
- `PUT /api/crop-recipes/:id` - Update recipe
- `DELETE /api/crop-recipes/:id` - Delete recipe
- `POST /api/crop-recipes/:id/clone` - Clone recipe

### Farms
- `GET /api/farms` - Get all farms
- `GET /api/farms/:id` - Get farm details
- `POST /api/farms` - Create new farm
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Zones
- `GET /api/zones` - Get all zones
- `POST /api/zones/:id/assign-recipe` - Assign crop recipe to zone
- `POST /api/zones/:id/start-batch` - Start crop batch
- `GET /api/zones/:id/status` - Get zone status

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices/register` - Register new device
- `GET /api/devices/:id/status` - Get device status

### Telemetry
- `GET /api/telemetry/zone/:zoneId` - Get zone telemetry
- `GET /api/telemetry/zone/:zoneId/latest` - Get latest readings
- `GET /api/telemetry/zone/:zoneId/history` - Get historical data

### Analytics
- `GET /api/analytics/dashboard/:farmId` - Get farm dashboard
- `GET /api/analytics/zone/:zoneId/performance` - Get zone performance
- `GET /api/analytics/zone/:zoneId/predictions` - Get yield predictions

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/subscribe` - Create subscription

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌱 Crop Recipe Format

```json
{
  "cropId": "cherry-tomato-v1",
  "cropName": "Cherry Tomato",
  "cropType": "vegetable",
  "description": "Optimized recipe for cherry tomatoes",
  "stages": [
    {
      "name": "Germination",
      "duration": 5,
      "temperature": 26,
      "humidity": 85,
      "co2": 1000,
      "lightHours": 0,
      "irrigation": 100
    },
    {
      "name": "Vegetative",
      "duration": 20,
      "temperature": 24,
      "humidity": 75,
      "co2": 900,
      "lightHours": 14,
      "irrigation": 500,
      "nutrients": "A"
    }
  ]
}
```

## 🔄 MQTT Topics

### Device → Backend
- `smartcrop/{deviceId}/telemetry` - Sensor data
- `smartcrop/{deviceId}/status` - Device status
- `smartcrop/{deviceId}/alert` - Alerts/warnings
- `smartcrop/{deviceId}/response` - Command responses

### Backend → Device
- `smartcrop/{deviceId}/command` - Control commands
- `smartcrop/{deviceId}/setpoints` - Environmental setpoints
- `smartcrop/{deviceId}/config` - Configuration updates

## 📊 Database Schema

### Core Tables
- `users` - User accounts
- `farms` - Farm information
- `zones` - Growing zones within farms
- `devices` - IoT devices
- `crop_recipes` - Crop growth recipes
- `telemetry` - Time-series sensor data (TimescaleDB)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📝 License

MIT License - See LICENSE file

