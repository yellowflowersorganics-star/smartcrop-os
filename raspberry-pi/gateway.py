#!/usr/bin/env python3
"""
SmartCrop OS - Raspberry Pi Gateway
Receives data from ESP32 devices via MQTT and forwards to SmartCrop OS API
"""

import json
import time
import requests
import paho.mqtt.client as mqtt
from datetime import datetime
from collections import defaultdict
import os
import sys
from pathlib import Path

# Add current directory to path for .env file
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv not installed, using environment variables only")

# Configuration
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
MQTT_TOPIC_PREFIX = os.getenv('MQTT_TOPIC_PREFIX', 'smartcrop')

API_BASE_URL = os.getenv('API_URL', 'http://localhost:3000/api')
AUTH_TOKEN = os.getenv('AUTH_TOKEN', '')
GATEWAY_ID = os.getenv('GATEWAY_ID', 'RPI5-GATEWAY-001')
SEND_INTERVAL = int(os.getenv('SEND_INTERVAL', 300))  # Default: 5 minutes

# Store latest readings per zone
latest_readings = defaultdict(dict)
last_send_time = defaultdict(float)
message_count = defaultdict(int)

class SmartCropGateway:
    def __init__(self):
        self.mqtt_client = mqtt.Client(client_id=GATEWAY_ID)
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.on_disconnect = self.on_disconnect
        self.start_time = time.time()
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print(f"✅ Connected to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}")
            # Subscribe to all zone sensor data
            client.subscribe(f"{MQTT_TOPIC_PREFIX}/zone/+/sensors")
            client.subscribe(f"{MQTT_TOPIC_PREFIX}/zone/+/status")
            print(f"📡 Subscribed to: {MQTT_TOPIC_PREFIX}/zone/+/sensors")
            print(f"📡 Subscribed to: {MQTT_TOPIC_PREFIX}/zone/+/status")
        else:
            error_messages = {
                1: "Connection refused - incorrect protocol version",
                2: "Connection refused - invalid client identifier",
                3: "Connection refused - server unavailable",
                4: "Connection refused - bad username or password",
                5: "Connection refused - not authorized"
            }
            print(f"❌ Failed to connect to MQTT Broker, rc={rc}: {error_messages.get(rc, 'Unknown error')}")
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        if rc != 0:
            print(f"⚠️  Unexpected MQTT disconnect (rc={rc}). Reconnecting...")
        else:
            print("📴 Disconnected from MQTT broker")
            
    def on_message(self, client, userdata, msg):
        """Callback when message received from ESP32"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            # Extract zone ID from topic: smartcrop/zone/<zone_id>/sensors
            parts = topic.split('/')
            if len(parts) >= 3 and parts[2]:
                zone_id = parts[2]
                message_count[zone_id] += 1
                
                if 'sensors' in topic:
                    # Store latest sensor readings
                    latest_readings[zone_id] = {
                        'zoneId': zone_id,
                        'deviceId': payload.get('device_id', 'unknown'),
                        'temperature': payload.get('temperature'),
                        'humidity': payload.get('humidity'),
                        'co2': payload.get('co2'),
                        'light': payload.get('light'),
                        'airflow': payload.get('airflow'),
                        'soilMoisture': payload.get('soil_moisture'),
                        'source': 'sensor',
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    print(f"📊 Zone {zone_id}: T={payload.get('temperature')}°C, "
                          f"H={payload.get('humidity')}%, "
                          f"CO2={payload.get('co2')}ppm, "
                          f"Light={payload.get('light')}lux "
                          f"(#{message_count[zone_id]})")
                    
                    # Send to API if interval elapsed
                    current_time = time.time()
                    if current_time - last_send_time[zone_id] >= SEND_INTERVAL:
                        self.send_to_api(latest_readings[zone_id])
                        last_send_time[zone_id] = current_time
                        
                elif 'status' in topic:
                    # Handle device status messages
                    print(f"📱 Device {payload.get('device_id')}: "
                          f"Status={payload.get('status')}, "
                          f"Uptime={payload.get('uptime')}s, "
                          f"RSSI={payload.get('rssi')}dBm")
                    
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON from {msg.topic}: {e}")
        except Exception as e:
            print(f"❌ Error processing message: {e}")
    
    def send_to_api(self, data):
        """Send sensor data to SmartCrop OS API"""
        if not AUTH_TOKEN:
            print("⚠️  No AUTH_TOKEN configured, skipping API send")
            return
            
        try:
            url = f"{API_BASE_URL}/telemetry/readings"
            headers = {
                "Authorization": f"Bearer {AUTH_TOKEN}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code == 201:
                print(f"✅ Sent to API: Zone {data['zoneId']} at {datetime.now().strftime('%H:%M:%S')}")
            elif response.status_code == 401:
                print(f"🔐 API Authentication failed - check AUTH_TOKEN")
            else:
                print(f"⚠️  API Error {response.status_code}: {response.text[:100]}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to API at {API_BASE_URL}")
        except requests.exceptions.Timeout:
            print(f"⏱️  API request timeout")
        except requests.exceptions.RequestException as e:
            print(f"❌ API request error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
    
    def print_status(self):
        """Print gateway status"""
        uptime = int(time.time() - self.start_time)
        hours = uptime // 3600
        minutes = (uptime % 3600) // 60
        seconds = uptime % 60
        
        print("\n" + "="*60)
        print(f"📊 Gateway Status ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
        print(f"⏱️  Uptime: {hours}h {minutes}m {seconds}s")
        print(f"📡 Active zones: {len(latest_readings)}")
        for zone_id, count in message_count.items():
            print(f"   • Zone {zone_id}: {count} messages")
        print("="*60 + "\n")
    
    def run(self):
        """Start the gateway"""
        print("=" * 60)
        print("🚀 SmartCrop OS Gateway Starting...")
        print(f"📡 Gateway ID: {GATEWAY_ID}")
        print(f"🔌 MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}")
        print(f"🌐 API Server: {API_BASE_URL}")
        print(f"⏰ Send Interval: {SEND_INTERVAL}s ({SEND_INTERVAL//60} minutes)")
        print("=" * 60)
        print()
        
        # Validate configuration
        if not AUTH_TOKEN:
            print("⚠️  WARNING: No AUTH_TOKEN configured!")
            print("   Data will be collected but not sent to API")
            print()
        
        # Connect to MQTT broker
        try:
            self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
            
            # Status reporting timer
            last_status_time = time.time()
            status_interval = 300  # 5 minutes
            
            # Start MQTT loop in background
            self.mqtt_client.loop_start()
            
            # Keep running and print status periodically
            print("✨ Gateway is running! Press Ctrl+C to stop")
            print()
            
            while True:
                time.sleep(1)
                if time.time() - last_status_time >= status_interval:
                    self.print_status()
                    last_status_time = time.time()
                    
        except KeyboardInterrupt:
            print("\n🛑 Gateway stopped by user")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        except Exception as e:
            print(f"❌ Fatal error: {e}")
            self.mqtt_client.loop_stop()

if __name__ == "__main__":
    gateway = SmartCropGateway()
    gateway.run()

