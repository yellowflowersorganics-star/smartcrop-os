#!/bin/bash
###############################################################################
# SmartCrop OS Gateway Configuration Script
###############################################################################

set -e

echo "=========================================="
echo "⚙️  SmartCrop OS Gateway Configuration"
echo "=========================================="
echo ""

# Get Raspberry Pi IP
RPI_IP=$(hostname -I | awk '{print $1}')

echo "Your Raspberry Pi IP address: $RPI_IP"
echo ""
echo "📝 Please provide the following information:"
echo ""

# Get API URL
read -p "SmartCrop OS API URL (e.g., http://192.168.1.10:3000/api): " API_URL
if [ -z "$API_URL" ]; then
    echo "❌ API URL is required"
    exit 1
fi

# Get Auth Token
echo ""
echo "To get your AUTH_TOKEN:"
echo "1. Open SmartCrop OS in browser and login"
echo "2. Press F12 to open Developer Tools"
echo "3. Go to Network tab"
echo "4. Refresh the page"
echo "5. Click any API request"
echo "6. Look for 'Authorization: Bearer <TOKEN>'"
echo "7. Copy the token value (the long string after 'Bearer ')"
echo ""
read -p "AUTH_TOKEN: " AUTH_TOKEN
if [ -z "$AUTH_TOKEN" ]; then
    echo "⚠️  Warning: No AUTH_TOKEN provided. Gateway will run but not send data to API."
fi

# Gateway ID
read -p "Gateway ID (default: RPI5-GATEWAY-001): " GATEWAY_ID
GATEWAY_ID=${GATEWAY_ID:-RPI5-GATEWAY-001}

# Send interval
read -p "Send interval in seconds (default: 300 = 5 minutes): " SEND_INTERVAL
SEND_INTERVAL=${SEND_INTERVAL:-300}

# Create .env file
cat > ~/smartcrop-gateway/.env <<EOF
# SmartCrop OS Gateway Configuration
# Generated: $(date)

# API Configuration
API_URL=$API_URL
AUTH_TOKEN=$AUTH_TOKEN

# Gateway Configuration
GATEWAY_ID=$GATEWAY_ID
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_TOPIC_PREFIX=smartcrop
SEND_INTERVAL=$SEND_INTERVAL
EOF

echo ""
echo "✅ Configuration saved to ~/smartcrop-gateway/.env"
echo ""

# Copy gateway.py if not exists
if [ ! -f ~/smartcrop-gateway/gateway.py ]; then
    echo "📥 Copying gateway.py..."
    # User should have uploaded this file
    echo "⚠️  Please upload gateway.py to ~/smartcrop-gateway/"
    echo ""
fi

# Setup systemd service
echo "🔧 Setting up auto-start service..."

sudo tee /etc/systemd/system/smartcrop-gateway.service > /dev/null <<EOF
[Unit]
Description=SmartCrop OS Gateway Service
After=network.target mosquitto.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/smartcrop-gateway
ExecStart=$HOME/smartcrop-gateway/venv/bin/python3 $HOME/smartcrop-gateway/gateway.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable smartcrop-gateway

echo "✅ Service configured"
echo ""

echo "=========================================="
echo "🎉 Configuration Complete!"
echo "=========================================="
echo ""
echo "📋 Summary:"
echo "   API URL: $API_URL"
echo "   Gateway ID: $GATEWAY_ID"
echo "   Send Interval: $SEND_INTERVAL seconds"
echo "   Raspberry Pi IP: $RPI_IP"
echo ""
echo "🚀 To start the gateway:"
echo "   sudo systemctl start smartcrop-gateway"
echo ""
echo "📊 To view logs:"
echo "   sudo journalctl -u smartcrop-gateway -f"
echo ""
echo "🧪 To test manually first:"
echo "   cd ~/smartcrop-gateway"
echo "   source venv/bin/activate"
echo "   python3 gateway.py"
echo ""
echo "ESP32 Configuration:"
echo "   MQTT_BROKER: $RPI_IP"
echo "   MQTT_PORT: 1883"
echo ""

