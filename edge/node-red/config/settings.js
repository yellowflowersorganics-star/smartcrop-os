/**
 * CropWise - Node-RED Configuration for Raspberry Pi Gateway
 * 
 * This configuration file is used by Node-RED running on the Raspberry Pi
 * to manage local ESP32 controllers and forward data to CropWise Cloud
 */

module.exports = {
    // ==================================================
    // Server Configuration
    // ==================================================
    uiPort: process.env.PORT || 1880,
    uiHost: "0.0.0.0",
    
    // ==================================================
    // Flow Configuration
    // ==================================================
    flowFile: 'cropwise-flows.json',
    flowFilePretty: true,
    
    // ==================================================
    // User Directory (where flows and configs are stored)
    // ==================================================
    userDir: '/home/pi/.node-red/',
    
    // ==================================================
    // Security
    // ==================================================
    adminAuth: {
        type: "credentials",
        users: [{
            username: process.env.NODERED_USERNAME || "admin",
            password: process.env.NODERED_PASSWORD_HASH || "$2b$08$...", // bcrypt hash
            permissions: "*"
        }]
    },
    
    // Disable editor for production (uncomment for production)
    // httpAdminRoot: false,
    
    // ==================================================
    // HTTPS (optional - enable in production)
    // ==================================================
    // https: {
    //     key: require("fs").readFileSync('/etc/cropwise/gateway-key.pem'),
    //     cert: require("fs").readFileSync('/etc/cropwise/gateway-cert.pem')
    // },
    
    // ==================================================
    // Environment Variables (accessible in flows via env.get())
    // ==================================================
    functionGlobalContext: {
        // CropWise Configuration
        ORGANIZATION_ID: process.env.ORGANIZATION_ID || 'org_abc123',
        UNIT_ID: process.env.UNIT_ID || 'unit_001',
        GATEWAY_ID: process.env.GATEWAY_ID || 'unknown',
        GATEWAY_VERSION: '1.0.0',
        
        // API Configuration
        API_URL: process.env.API_URL || 'https://api.cropwise.cloud',
        API_TOKEN: process.env.API_TOKEN || '',
        
        // MQTT Configuration
        CLOUD_MQTT_BROKER: process.env.CLOUD_MQTT_BROKER || 'mqtt.cropwise.cloud',
        CLOUD_MQTT_PORT: process.env.CLOUD_MQTT_PORT || 8883,
        CLOUD_MQTT_USERNAME: process.env.CLOUD_MQTT_USERNAME || '',
        CLOUD_MQTT_PASSWORD: process.env.CLOUD_MQTT_PASSWORD || '',
        
        LOCAL_MQTT_PORT: process.env.LOCAL_MQTT_PORT || 1883,
        
        // Optional: Add database connection for local storage
        // sqlite3: require('sqlite3')
    },
    
    // ==================================================
    // Logging
    // ==================================================
    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false
        },
        file: {
            level: "info",
            metrics: false,
            audit: false,
            file: "/var/log/cropwise/node-red.log"
        }
    },
    
    // ==================================================
    // Context Storage (for flow variables)
    // ==================================================
    contextStorage: {
        default: {
            module: "memory"
        },
        persistent: {
            module: "localfilesystem",
            config: {
                dir: "/home/pi/.node-red/context",
                cache: false
            }
        }
    },
    
    // ==================================================
    // Editor Configuration
    // ==================================================
    editorTheme: {
        projects: {
            enabled: false
        },
        page: {
            title: "CropWise Gateway - Node-RED",
            favicon: "/absolute/path/to/theme/icon"
        },
        header: {
            title: "CropWise Gateway",
            image: "/absolute/path/to/header/image"
        }
    },
    
    // ==================================================
    // Node Configuration
    // ==================================================
    functionExternalModules: true,
    
    // ==================================================
    // HTTP Node Configuration
    // ==================================================
    httpNodeRoot: '/api',
    httpNodeAuth: {user:"user",pass:"$2b$08$..."},
    httpNodeMiddleware: function(req,res,next) {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    },
    
    // ==================================================
    // Dashboard UI Configuration
    // ==================================================
    ui: {
        path: "ui",
        middleware: function(req,res,next) {
            next();
        }
    },
    
    // ==================================================
    // Debugging
    // ==================================================
    debugMaxLength: 1000,
    
    // ==================================================
    // Performance
    // ==================================================
    runtimeState: {
        enabled: false,
        ui: false
    }
};

