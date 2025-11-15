#!/bin/bash
###############################################################################
# CropWise - Raspberry Pi Gateway Setup Script
# Automated installation for Raspberry Pi 5
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "🍄 CropWise Gateway Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root (don't use sudo)${NC}"
   echo "Run: ./setup-gateway.sh"
   exit 1
fi

echo "📦 Step 1: Updating system..."
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

echo "📡 Step 2: Installing Mosquitto MQTT Broker..."
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
echo -e "${GREEN}✅ Mosquitto installed${NC}"
echo ""

echo "🐍 Step 3: Installing Python dependencies..."
sudo apt install -y python3-pip python3-venv
echo -e "${GREEN}✅ Python tools installed${NC}"
echo ""

echo "📁 Step 4: Creating gateway directory..."
mkdir -p ~/cropwise-gateway
cd ~/cropwise-gateway
echo -e "${GREEN}✅ Directory created: ~/cropwise-gateway${NC}"
echo ""

echo "🔧 Step 5: Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install paho-mqtt requests schedule python-dotenv
deactivate
echo -e "${GREEN}✅ Python environment ready${NC}"
echo ""

echo "⚙️  Step 6: Configuring Mosquitto..."
sudo tee /etc/mosquitto/conf.d/cropwise.conf > /dev/null <<EOF
# CropWise MQTT Configuration
listener 1883
allow_anonymous true

# Persistence
persistence true
persistence_location /var/lib/mosquitto/

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all

# Connection settings
max_connections -1
max_queued_messages 1000
EOF

sudo systemctl restart mosquitto
echo -e "${GREEN}✅ Mosquitto configured${NC}"
echo ""

echo "🧪 Step 7: Testing MQTT broker..."
timeout 2 mosquitto_sub -h localhost -t test/topic -v &
sleep 1
mosquitto_pub -h localhost -t test/topic -m "CropWise Gateway Test"
sleep 1
echo -e "${GREEN}✅ MQTT broker working${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Basic setup complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Get your CropWise API details:"
echo "   - Login to CropWise"
echo "   - Get your auth token (F12 → Network → Authorization header)"
echo "   - Get your server IP/URL"
echo ""
echo "2. Run configuration:"
echo "   cd ~/cropwise-gateway"
echo "   ./configure.sh"
echo ""
echo "3. Gateway files will be created in: ~/cropwise-gateway"
echo ""
echo "Raspberry Pi IP: $(hostname -I | awk '{print $1}')"
echo ""

