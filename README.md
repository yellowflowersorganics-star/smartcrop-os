# 🌱 SmartCrop OS

> A universal IoT platform for controlled-environment agriculture that dynamically adapts to any crop through software-defined environmental parameters.

## 🧠 Core Concept

SmartCrop OS enables farmers to grow **any crop** (mushrooms, tomatoes, lettuce, strawberries, etc.) using the same hardware platform. The secret? **Crop Recipes** — software-defined environmental parameters, irrigation logic, nutrient dosing, and lighting patterns that automatically adjust throughout each growth stage.

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SmartCrop Cloud (SaaS)                   │
│  Multi-tenant Farm Management • Analytics • Billing         │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
                  ▼                           ▼
         ┌────────────────┐         ┌────────────────┐
         │  Operator App  │         │  ML Optimizer  │
         │   Dashboard    │         │  (Phase 5)     │
         └────────────────┘         └────────────────┘
                  │
                  │ MQTT/WebSocket
                  │
         ┌────────▼──────────────────────────────────┐
         │     Edge Controller (ESP32/Pi)            │
         │  ┌──────────────────────────────────┐     │
         │  │   Crop Recipe Engine (Core)      │     │
         │  │  Dynamic Environment Control     │     │
         │  └──────────────────────────────────┘     │
         │                                            │
         │  Sensors: Temp • RH • CO₂ • Soil • Light  │
         │  Actuators: Fan • Pump • Valve • Heater   │
         └────────────────────────────────────────────┘
```

## 📦 Project Structure

```
smartcrop-os/
├── backend/              # Cloud backend (Node.js/Python)
│   ├── api/             # REST APIs
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   └── config/          # Configuration
│
├── edge/                # Edge device firmware
│   ├── esp32/          # ESP32 firmware (Arduino/PlatformIO)
│   ├── node-red/       # Node-RED flows
│   └── common/         # Shared edge libraries
│
├── frontend/           # Web dashboard
│   ├── src/           # React/Vue application
│   └── public/        # Static assets
│
├── shared/            # Shared code/schemas
│   ├── schemas/      # JSON schemas for recipes
│   ├── models/       # Shared data models
│   └── protocols/    # MQTT/API protocols
│
├── ml/               # Machine learning models (Phase 5)
│   ├── models/      # Trained models
│   └── training/    # Training scripts
│
├── docs/            # Documentation
├── scripts/         # Deployment & utility scripts
└── docker/          # Docker configurations
```

## 🌿 Supported Crops

| Crop | Status | Hardware Modules | Key Features |
|:-----|:------:|:-----------------|:-------------|
| 🍄 Mushroom | ✅ Phase 1 | Temp, RH, CO₂ | Climate control, humidity management |
| 🍅 Cherry Tomato | 🚧 Phase 3 | + Soil/EC, Light | Irrigation, nutrients, grow lights |
| 🌶️ Capsicum | 🔜 Phase 3 | + Soil/EC, Temp | Drip irrigation, ventilation |
| 🥬 Leafy Greens | 🔜 Phase 3 | + pH, EC | Hydroponic nutrient control |
| 🍓 Strawberry | 🔜 Phase 3 | + Light, RH | Pollination support |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Python 3.9+
- PostgreSQL or MongoDB
- MQTT Broker (Mosquitto)
- ESP32 DevKit (for edge deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yellowflowers/smartcrop-os.git
cd smartcrop-os

# Install backend dependencies
cd backend
npm install  # or pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev  # or python app.py
```

### Deploy Edge Controller

```bash
cd edge/esp32
pio run -t upload  # PlatformIO
```

## 📊 Crop Recipe Example

Crop recipes define all environmental parameters per growth stage:

```json
{
  "cropId": "cherry-tomato-v1",
  "cropName": "Cherry Tomato",
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
      "irrigation": 500
    }
  ]
}
```

## 🗺️ Roadmap

| Phase | Description | Status | Timeline |
|:------|:------------|:-------|:---------|
| ✅ Phase 1 | Single-crop (Mushroom) POC | Complete | Q1 2025 |
| 🚧 Phase 2 | Crop Recipe Framework | In Progress | Q2 2025 |
| 🌿 Phase 3 | Multi-crop Support | Planned | Q3 2025 |
| ☁️ Phase 4 | Cloud SaaS Platform | Planned | Q4 2025 |
| 🧠 Phase 5 | ML Optimization | Planned | Q1 2026 |
| 🌎 Phase 6 | Marketplace Launch | Planned | Q2 2026 |

## 💰 Business Model

### Subscription Plans

| Crop Type | Plan | Price/Month | Features |
|:----------|:-----|:------------|:---------|
| 🍄 Mushroom | Basic | ₹1,500 | Climate + CO₂ + Light |
| 🍅 Vegetables | Standard | ₹2,500 | + Irrigation + EC sensors |
| 🥬 Hydroponic | Pro | ₹3,500 | + pH, Nutrient Control |
| 🏢 Enterprise | Custom | ₹5,000+ | Multi-zone + AI analytics |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📄 License

Copyright © 2025 Yellow Flowers Technologies  
Licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 📞 Contact

- Website: https://yellowflowers.tech
- Email: support@yellowflowers.tech
- Documentation: https://docs.smartcrop.io

---

**Built with ❤️ for sustainable agriculture**

