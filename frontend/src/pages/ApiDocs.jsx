import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Book, Lock, Unlock, Copy, Check, 
  ChevronDown, ChevronRight, Home, ArrowLeft 
} from 'lucide-react';

export default function ApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    auth: true,
    farms: false,
    zones: false,
    recipes: false,
    batches: false,
    harvests: false,
    telemetry: false,
    inventory: false,
    tasks: false,
    employees: false,
    analytics: false
  });

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CodeBlock = ({ code, language = 'javascript' }) => (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <pre className="text-sm text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );

  const EndpointCard = ({ method, path, description, auth = true, request, response }) => {
    const methodColors = {
      GET: 'bg-green-100 text-green-700',
      POST: 'bg-blue-100 text-blue-700',
      PUT: 'bg-yellow-100 text-yellow-700',
      PATCH: 'bg-orange-100 text-orange-700',
      DELETE: 'bg-red-100 text-red-700'
    };

    const fullUrl = `${baseUrl}/api${path}`;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-md font-semibold text-sm ${methodColors[method]}`}>
                {method}
              </span>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-800">
                {path}
              </code>
              {auth ? (
                <Lock className="w-4 h-4 text-yellow-600" title="Requires authentication" />
              ) : (
                <Unlock className="w-4 h-4 text-green-600" title="Public endpoint" />
              )}
            </div>
            <p className="text-gray-700">{description}</p>
          </div>
          <button
            onClick={() => copyToClipboard(fullUrl, path)}
            className="ml-4 p-2 hover:bg-gray-100 rounded transition-colors"
            title="Copy URL"
          >
            {copiedEndpoint === path ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {request && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body:</h4>
            <CodeBlock code={JSON.stringify(request, null, 2)} />
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Response (200):</h4>
            <CodeBlock code={JSON.stringify(response, null, 2)} />
          </div>
        )}
      </div>
    );
  };

  const Section = ({ id, title, children }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center gap-2 w-full text-left bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 rounded-lg hover:from-green-100 hover:to-blue-100 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </button>
        {isExpanded && <div className="mt-4">{children}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <Book className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">API Documentation</h1>
              <p className="text-green-100 text-lg">SmartCrop REST API v1.0</p>
            </div>
          </div>
          
          <div className="bg-green-800 bg-opacity-50 rounded-lg p-4 mt-6">
            <p className="text-sm mb-2">Base URL:</p>
            <code className="text-lg font-mono bg-green-900 bg-opacity-50 px-4 py-2 rounded inline-block">
              {baseUrl}/api
            </code>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-green-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Quick Start</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Authentication</h3>
              <p className="text-gray-700 mb-3">
                Most endpoints require JWT authentication. Include the token in the Authorization header:
              </p>
              <CodeBlock code={`// Login to get token
const response = await fetch('${baseUrl}/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await response.json();

// Use token in subsequent requests
const data = await fetch('${baseUrl}/api/farms', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});`} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Response Format</h3>
              <p className="text-gray-700 mb-3">All responses follow this structure:</p>
              <CodeBlock code={`// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": { /* error details */ }
}`} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Rate Limiting</h3>
              <p className="text-gray-700">
                API requests are limited to <strong>100 requests per 15 minutes</strong> per IP address.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <Section id="auth" title="🔐 Authentication">
          <EndpointCard
            method="POST"
            path="/auth/register"
            description="Register a new user account"
            auth={false}
            request={{
              email: "user@example.com",
              password: "securePassword123",
              firstName: "John",
              lastName: "Doe",
              organizationName: "Green Farms Inc"
            }}
            response={{
              success: true,
              data: {
                user: {
                  id: 1,
                  email: "user@example.com",
                  firstName: "John",
                  lastName: "Doe"
                },
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              },
              message: "User registered successfully"
            }}
          />

          <EndpointCard
            method="POST"
            path="/auth/login"
            description="Login with email and password"
            auth={false}
            request={{
              email: "user@example.com",
              password: "securePassword123"
            }}
            response={{
              success: true,
              data: {
                user: {
                  id: 1,
                  email: "user@example.com",
                  firstName: "John",
                  lastName: "Doe"
                },
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              }
            }}
          />

          <EndpointCard
            method="GET"
            path="/auth/google"
            description="Initiate Google OAuth 2.0 login flow"
            auth={false}
            response={{
              note: "Redirects to Google OAuth consent screen"
            }}
          />

          <EndpointCard
            method="GET"
            path="/auth/me"
            description="Get current authenticated user details"
            auth={true}
            response={{
              success: true,
              data: {
                id: 1,
                email: "user@example.com",
                firstName: "John",
                lastName: "Doe",
                organization: {
                  id: 1,
                  name: "Green Farms Inc"
                }
              }
            }}
          />
        </Section>

        {/* Farms */}
        <Section id="farms" title="🏡 Farm Management">
          <EndpointCard
            method="GET"
            path="/farms"
            description="Get all farms for authenticated user"
            response={{
              success: true,
              data: [
                {
                  id: 1,
                  name: "North Farm",
                  type: "indoor",
                  area: 500,
                  unit: "sq_ft",
                  location: "Building A",
                  active_zones: 5,
                  total_zones: 8
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/farms"
            description="Create a new farm"
            request={{
              name: "East Greenhouse",
              type: "greenhouse",
              area: 1000,
              unit: "sq_ft",
              location: "Plot 23, Green Valley",
              description: "Large commercial greenhouse"
            }}
            response={{
              success: true,
              data: {
                id: 2,
                name: "East Greenhouse",
                type: "greenhouse",
                area: 1000,
                unit: "sq_ft",
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="GET"
            path="/farms/:id"
            description="Get farm by ID with zones and statistics"
            response={{
              success: true,
              data: {
                id: 1,
                name: "North Farm",
                type: "indoor",
                zones: [
                  { id: 1, name: "Zone A", status: "active" },
                  { id: 2, name: "Zone B", status: "maintenance" }
                ],
                stats: {
                  total_batches: 45,
                  active_batches: 12,
                  total_yield_kg: 2340
                }
              }
            }}
          />

          <EndpointCard
            method="PUT"
            path="/farms/:id"
            description="Update farm details"
            request={{
              name: "North Farm - Upgraded",
              area: 600,
              description: "Expanded facility"
            }}
            response={{
              success: true,
              data: {
                id: 1,
                name: "North Farm - Upgraded",
                area: 600,
                updated_at: "2025-11-14T11:00:00Z"
              }
            }}
          />

          <EndpointCard
            method="DELETE"
            path="/farms/:id"
            description="Delete a farm (only if no active zones)"
            response={{
              success: true,
              message: "Farm deleted successfully"
            }}
          />
        </Section>

        {/* Zones */}
        <Section id="zones" title="📍 Zone Management">
          <EndpointCard
            method="GET"
            path="/zones"
            description="Get all zones (optionally filter by farm_id)"
            response={{
              success: true,
              data: [
                {
                  id: 1,
                  name: "Zone A - Incubation",
                  farm_id: 1,
                  status: "active",
                  area: 100,
                  unit: "sq_ft",
                  current_batch: {
                    id: 15,
                    batch_number: "B-2025-015",
                    recipe_name: "Oyster Mushroom - Standard"
                  }
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/zones"
            description="Create a new zone"
            request={{
              name: "Zone C - Fruiting",
              farm_id: 1,
              area: 120,
              unit: "sq_ft",
              description: "High-humidity fruiting chamber"
            }}
            response={{
              success: true,
              data: {
                id: 3,
                name: "Zone C - Fruiting",
                farm_id: 1,
                status: "idle",
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="PATCH"
            path="/zones/:id/status"
            description="Update zone status"
            request={{
              status: "maintenance"
            }}
            response={{
              success: true,
              data: {
                id: 1,
                status: "maintenance",
                updated_at: "2025-11-14T11:00:00Z"
              }
            }}
          />
        </Section>

        {/* Recipes */}
        <Section id="recipes" title="📖 Growing Recipes">
          <EndpointCard
            method="GET"
            path="/recipes"
            description="Get all growing recipes"
            response={{
              success: true,
              data: [
                {
                  id: 1,
                  name: "Oyster Mushroom - Standard",
                  crop_type: "Oyster Mushroom",
                  total_duration: 28,
                  stages: [
                    {
                      id: 1,
                      name: "Incubation",
                      duration: 15,
                      temperature_min: 20,
                      temperature_max: 24,
                      humidity_min: 85,
                      humidity_max: 95
                    },
                    {
                      id: 2,
                      name: "Fruiting",
                      duration: 13,
                      temperature_min: 16,
                      temperature_max: 20,
                      humidity_min: 90,
                      humidity_max: 95
                    }
                  ]
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/recipes"
            description="Create a new growing recipe"
            request={{
              name: "Shiitake - Premium",
              crop_type: "Shiitake Mushroom",
              description: "High-quality shiitake cultivation",
              stages: [
                {
                  name: "Spawn Run",
                  duration: 20,
                  temperature_min: 22,
                  temperature_max: 26,
                  humidity_min: 80,
                  humidity_max: 90,
                  co2_max: 5000,
                  light_hours: 0
                },
                {
                  name: "Pinning",
                  duration: 5,
                  temperature_min: 16,
                  temperature_max: 18,
                  humidity_min: 95,
                  humidity_max: 100,
                  co2_max: 1000,
                  light_hours: 12
                }
              ]
            }}
            response={{
              success: true,
              data: {
                id: 5,
                name: "Shiitake - Premium",
                total_duration: 25,
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />
        </Section>

        {/* Batches */}
        <Section id="batches" title="📦 Batch Tracking">
          <EndpointCard
            method="GET"
            path="/batches"
            description="Get all batches (filter by status, zone, date)"
            response={{
              success: true,
              data: [
                {
                  id: 15,
                  batch_number: "B-2025-015",
                  zone_id: 1,
                  recipe_id: 1,
                  status: "in_progress",
                  start_date: "2025-11-01T08:00:00Z",
                  expected_harvest_date: "2025-11-29T08:00:00Z",
                  progress_percent: 45
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/batches"
            description="Start a new batch"
            request={{
              zone_id: 1,
              recipe_id: 1,
              substrate_type: "Straw",
              substrate_kg: 50,
              spawn_kg: 5,
              notes: "Using local organic straw"
            }}
            response={{
              success: true,
              data: {
                id: 16,
                batch_number: "B-2025-016",
                status: "in_progress",
                start_date: "2025-11-14T10:30:00Z",
                expected_harvest_date: "2025-12-12T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="POST"
            path="/batches/:id/complete"
            description="Mark batch as completed"
            response={{
              success: true,
              data: {
                id: 15,
                status: "completed",
                end_date: "2025-11-14T12:00:00Z",
                total_yield_kg: 125.5,
                bio_efficiency: 251
              }
            }}
          />
        </Section>

        {/* Harvests */}
        <Section id="harvests" title="🍄 Harvest Recording">
          <EndpointCard
            method="POST"
            path="/harvests"
            description="Record a harvest"
            request={{
              batch_id: 15,
              flush_number: 1,
              yield_kg: 45.5,
              grade: "A",
              notes: "Excellent quality, uniform caps"
            }}
            response={{
              success: true,
              data: {
                id: 78,
                batch_id: 15,
                flush_number: 1,
                yield_kg: 45.5,
                grade: "A",
                harvested_at: "2025-11-14T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="GET"
            path="/harvests"
            description="Get harvest records (filter by batch, date range)"
            response={{
              success: true,
              data: [
                {
                  id: 78,
                  batch_id: 15,
                  batch_number: "B-2025-015",
                  flush_number: 1,
                  yield_kg: 45.5,
                  grade: "A",
                  harvested_at: "2025-11-14T10:30:00Z"
                }
              ]
            }}
          />
        </Section>

        {/* Telemetry */}
        <Section id="telemetry" title="📊 Environmental Telemetry">
          <EndpointCard
            method="POST"
            path="/telemetry"
            description="Submit sensor data from IoT devices"
            request={{
              zone_id: 1,
              device_id: "ESP32-001",
              temperature: 22.5,
              humidity: 87.3,
              co2: 1200,
              light_level: 500
            }}
            response={{
              success: true,
              data: {
                id: 12345,
                zone_id: 1,
                timestamp: "2025-11-14T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="GET"
            path="/telemetry/zone/:zoneId"
            description="Get telemetry history for a zone"
            response={{
              success: true,
              data: [
                {
                  timestamp: "2025-11-14T10:30:00Z",
                  temperature: 22.5,
                  humidity: 87.3,
                  co2: 1200,
                  light_level: 500
                },
                {
                  timestamp: "2025-11-14T10:25:00Z",
                  temperature: 22.4,
                  humidity: 87.1,
                  co2: 1180,
                  light_level: 495
                }
              ]
            }}
          />
        </Section>

        {/* Inventory */}
        <Section id="inventory" title="📦 Inventory Management">
          <EndpointCard
            method="GET"
            path="/inventory"
            description="Get all inventory items"
            response={{
              success: true,
              data: [
                {
                  id: 1,
                  name: "Straw Substrate",
                  category: "substrate",
                  quantity: 500,
                  unit: "kg",
                  low_stock_threshold: 100,
                  supplier: "Local Farm Supply"
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/inventory/transactions"
            description="Record inventory transaction (add/remove/adjust)"
            request={{
              item_id: 1,
              type: "remove",
              quantity: 50,
              unit_cost: 2.5,
              notes: "Used for batch B-2025-016",
              reference_type: "batch",
              reference_id: 16
            }}
            response={{
              success: true,
              data: {
                id: 234,
                item_id: 1,
                type: "remove",
                quantity: 50,
                new_stock_level: 450,
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />
        </Section>

        {/* Tasks */}
        <Section id="tasks" title="✅ Task Management">
          <EndpointCard
            method="GET"
            path="/tasks"
            description="Get tasks (filter by status, assigned_to, due_date)"
            response={{
              success: true,
              data: [
                {
                  id: 45,
                  title: "Check Zone A humidity levels",
                  description: "Ensure humidity stays above 85%",
                  priority: "high",
                  status: "pending",
                  due_date: "2025-11-14T18:00:00Z",
                  assigned_to: {
                    id: 5,
                    name: "John Doe"
                  },
                  zone: {
                    id: 1,
                    name: "Zone A"
                  }
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/tasks"
            description="Create a new task"
            request={{
              title: "Water substrate bags",
              description: "Mist bags in Zone B twice daily",
              priority: "medium",
              due_date: "2025-11-15T08:00:00Z",
              assigned_to: 5,
              zone_id: 2,
              recurrence: "daily"
            }}
            response={{
              success: true,
              data: {
                id: 46,
                title: "Water substrate bags",
                status: "pending",
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />

          <EndpointCard
            method="PATCH"
            path="/tasks/:id"
            description="Update task status or details"
            request={{
              status: "completed",
              completion_notes: "Task completed successfully"
            }}
            response={{
              success: true,
              data: {
                id: 45,
                status: "completed",
                completed_at: "2025-11-14T11:00:00Z"
              }
            }}
          />
        </Section>

        {/* Employees */}
        <Section id="employees" title="👥 Employee Management">
          <EndpointCard
            method="GET"
            path="/employees"
            description="Get all employees in organization"
            response={{
              success: true,
              data: [
                {
                  id: 5,
                  first_name: "John",
                  last_name: "Doe",
                  email: "john.doe@greenfarms.com",
                  phone: "+1-555-0123",
                  department: "Operations",
                  role: "Farm Technician",
                  hire_date: "2025-01-15",
                  status: "active"
                }
              ]
            }}
          />

          <EndpointCard
            method="POST"
            path="/employees"
            description="Create employee record"
            request={{
              first_name: "Jane",
              last_name: "Smith",
              email: "jane.smith@greenfarms.com",
              phone: "+1-555-0124",
              department_id: 2,
              role_id: 3,
              hire_date: "2025-11-14",
              hourly_rate: 18.50
            }}
            response={{
              success: true,
              data: {
                id: 6,
                first_name: "Jane",
                last_name: "Smith",
                status: "active",
                created_at: "2025-11-14T10:30:00Z"
              }
            }}
          />
        </Section>

        {/* Analytics */}
        <Section id="analytics" title="📈 Analytics & Reporting">
          <EndpointCard
            method="GET"
            path="/analytics/overview"
            description="Get dashboard overview metrics"
            response={{
              success: true,
              data: {
                active_batches: 12,
                total_zones: 8,
                active_zones: 6,
                monthly_yield_kg: 345.8,
                monthly_revenue: 8645.50,
                monthly_profit: 5234.20,
                average_quality_score: 87.5,
                pending_tasks: 15
              }
            }}
          />

          <EndpointCard
            method="GET"
            path="/analytics/yield-trends"
            description="Get yield trends over time"
            response={{
              success: true,
              data: [
                { month: "2025-08", total_yield_kg: 289.5, avg_quality: 85 },
                { month: "2025-09", total_yield_kg: 312.8, avg_quality: 88 },
                { month: "2025-10", total_yield_kg: 345.2, avg_quality: 87 }
              ]
            }}
          />

          <EndpointCard
            method="GET"
            path="/profitability/summary"
            description="Get profitability summary"
            response={{
              success: true,
              data: {
                total_revenue: 45230.50,
                total_costs: 28456.75,
                total_profit: 16773.75,
                profit_margin_percent: 37.1,
                roi_percent: 58.9,
                top_batches: [
                  {
                    batch_number: "B-2025-015",
                    revenue: 2456.00,
                    costs: 856.50,
                    profit: 1599.50
                  }
                ]
              }
            }}
          />
        </Section>

        {/* Error Codes */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">⚠️ Error Codes</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">400</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Bad Request</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Invalid request parameters or body</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">401</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Unauthorized</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Missing or invalid authentication token</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">403</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Forbidden</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Insufficient permissions for this resource</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">404</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Not Found</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Resource does not exist</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">429</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Too Many Requests</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">500</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Internal Server Error</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Server error, please contact support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SDKs & Examples */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🛠️ SDK Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">JavaScript / Node.js</h3>
              <CodeBlock code={`// Install axios
npm install axios

// Example API client
const axios = require('axios');

const apiClient = axios.create({
  baseURL: '${baseUrl}/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${YOUR_TOKEN}\`
  }
});

// Get all farms
const farms = await apiClient.get('/farms');
console.log(farms.data);

// Create a batch
const newBatch = await apiClient.post('/batches', {
  zone_id: 1,
  recipe_id: 1,
  substrate_kg: 50
});`} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Python</h3>
              <CodeBlock code={`# Install requests
pip install requests

import requests

BASE_URL = '${baseUrl}/api'
TOKEN = 'your_jwt_token_here'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Get all farms
response = requests.get(f'{BASE_URL}/farms', headers=headers)
farms = response.json()
print(farms)

# Create a batch
batch_data = {
    'zone_id': 1,
    'recipe_id': 1,
    'substrate_kg': 50
}
response = requests.post(f'{BASE_URL}/batches', json=batch_data, headers=headers)
print(response.json())`} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">cURL</h3>
              <CodeBlock code={`# Get farms
curl -X GET ${baseUrl}/api/farms \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"

# Create a batch
curl -X POST ${baseUrl}/api/batches \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "zone_id": 1,
    "recipe_id": 1,
    "substrate_kg": 50
  }'`} />
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-lg text-green-100 mb-6">
            Contact our support team or check out additional resources
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="https://github.com/yourusername/smartcrop-os"
              className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} SmartCrop. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

