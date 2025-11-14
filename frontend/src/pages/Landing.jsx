import { Link } from 'react-router-dom';
import { 
  Sprout, Cpu, BarChart3, Cloud, Zap, Shield, 
  CheckCircle, TrendingUp, Droplets, Thermometer,
  Users, Globe, Package, ArrowRight, Bell, CheckSquare,
  Clock, DollarSign, ClipboardCheck, FileText, Microscope,
  Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Github,
  Send, Home, Building, Factory, Award
} from 'lucide-react';

export default function Landing() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">SmartCrop OS</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Features
              </button>
              <Link
                to="/about"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                FAQ
              </Link>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Contact
              </button>
              <Link
                to="/login"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile - Just show login buttons */}
            <div className="md:hidden flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Agriculture,
            <br />
            <span className="text-green-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete farm management platform with revolutionary <span className="font-semibold text-green-600">Hierarchical IoT Architecture</span>. From ESP32-powered environmental control to harvest tracking, inventory management to profitability analytics - everything you need in one powerful, scalable system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg inline-flex items-center justify-center"
            >
              Start Free Trial
              <Zap className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg border-2 border-gray-300 hover:border-green-600 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl shadow-2xl p-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Sprout className="w-20 h-20 text-green-600" />
            </div>
            <p className="text-gray-700 text-xl font-semibold">IoT-Powered Precision Agriculture</p>
          </div>
          
          {/* Architecture Highlight */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <Cloud className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">1 ESP32</div>
              <div className="text-sm text-gray-600">Master Gateway</div>
              <div className="text-xs text-gray-500 mt-2">MQTT to Cloud</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <Cpu className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">5 ESP32s</div>
              <div className="text-sm text-gray-600">Slave Nodes</div>
              <div className="text-xs text-gray-500 mt-2">ESP-NOW (&lt;10ms)</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <Zap className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-2">$75-$250</div>
              <div className="text-sm text-gray-600">Per Zone</div>
              <div className="text-xs text-gray-500 mt-2">Scalable 1-6 nodes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Complete Farm Management Solution
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Every tool you need to run a professional mushroom farm - from IoT monitoring to financial analytics
        </p>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Core Features */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Sprout className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Farm & Zone Management</h3>
            <p className="text-gray-600 text-sm">
              Organize multiple farms, zones, and growing areas with detailed tracking
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Growing Recipes</h3>
            <p className="text-gray-600 text-sm">
              Stage-based cultivation protocols with environmental parameters
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Batch Tracking</h3>
            <p className="text-gray-600 text-sm">
              Track individual growing cycles from inoculation to harvest
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <ClipboardCheck className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Harvest Recording</h3>
            <p className="text-gray-600 text-sm">
              Per-flush yield tracking with quality grading and bio-efficiency
            </p>
          </div>

          {/* IoT & Monitoring */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-cyan-200">
            <div className="bg-cyan-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Cpu className="w-7 h-7 text-cyan-600" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">Hierarchical IoT</h3>
              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-semibold">NEW</span>
            </div>
            <p className="text-gray-600 text-sm">
              Master-Slave ESP32 architecture - 1 MQTT connection, 5 ESP-NOW slaves, <10ms latency
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Thermometer className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Environmental Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Real-time data with recipe-based threshold alerts and charts
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Bell className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Alerts & Notifications</h3>
            <p className="text-gray-600 text-sm">
              Multi-channel alerts for environmental, inventory, and task events
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <BarChart3 className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics & Reporting</h3>
            <p className="text-gray-600 text-sm">
              Yield trends, quality distribution, and batch performance insights
            </p>
          </div>

          {/* Operations */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Inventory Management</h3>
            <p className="text-gray-600 text-sm">
              Track substrate, spawn, supplies with low stock alerts
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-violet-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <CheckSquare className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Task Management</h3>
            <p className="text-gray-600 text-sm">
              Schedule recurring tasks with reminders and checklists
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Labor Tracking</h3>
            <p className="text-gray-600 text-sm">
              Clock in/out, work logs, and labor cost calculations
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <DollarSign className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cost & Revenue Tracking</h3>
            <p className="text-gray-600 text-sm">
              Complete financial tracking with expense and sales management
            </p>
          </div>

          {/* Advanced Features */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Profitability Analytics</h3>
            <p className="text-gray-600 text-sm">
              ROI, profit margins, cost breakdowns, and batch comparisons
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Microscope className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Control</h3>
            <p className="text-gray-600 text-sm">
              Inspection tracking, defect management, compliance reporting
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">SOP Management</h3>
            <p className="text-gray-600 text-sm">
              Standard operating procedures with step-by-step execution tracking
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-gray-600 text-sm">
              Google OAuth, JWT tokens, role-based access control
            </p>
          </div>
        </div>
      </section>

      {/* IoT Architecture Section - NEW! */}
      <section id="iot-architecture" className="bg-gradient-to-br from-cyan-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" /> Revolutionary Technology
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hierarchical Master-Slave IoT Architecture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The world's first agricultural IoT platform with distributed intelligence. 
              Scale from 1 to 6 ESP32s per zone without changing a single line of backend code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Single Point of Contact */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Single MQTT Connection
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Only the Master ESP32 connects to the cloud. All slaves communicate locally via ESP-NOW.
              </p>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">83%</div>
                <div className="text-xs text-gray-600">Network Load Reduction</div>
              </div>
            </div>

            {/* Edge Intelligence */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Distributed Intelligence
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Local data aggregation, PID control, and decision-making at the edge.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">&lt;10ms</div>
                <div className="text-xs text-gray-600">Inter-Node Latency</div>
              </div>
            </div>

            {/* Cost Effective */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Cost Optimized
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                ESP32 modules ($7) cheaper than long sensor cables ($50+). Battery operation possible.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">$75-$250</div>
                <div className="text-xs text-gray-600">Per Zone (1-6 ESP32s)</div>
              </div>
            </div>
          </div>

          {/* Scalability Tiers */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Scalable from Hobby to Commercial
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-2">
                  <Home className="w-12 h-12 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900 mb-1">Small</div>
                <div className="text-sm text-gray-600 mb-3">1 ESP32</div>
                <div className="text-2xl font-bold text-green-600">$75</div>
                <div className="text-xs text-gray-500 mt-2">&lt;500 sq ft</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-2">
                  <Building className="w-12 h-12 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900 mb-1">Medium</div>
                <div className="text-sm text-gray-600 mb-3">2 ESP32s</div>
                <div className="text-2xl font-bold text-green-600">$105</div>
                <div className="text-xs text-gray-500 mt-2">500-1,000 sq ft</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-2">
                  <Factory className="w-12 h-12 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900 mb-1">Large</div>
                <div className="text-sm text-gray-600 mb-3">4 ESP32s</div>
                <div className="text-2xl font-bold text-green-600">$165</div>
                <div className="text-xs text-gray-500 mt-2">1-2,000 sq ft</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <div className="flex justify-center mb-2">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
                <div className="font-bold text-gray-900 mb-1">Professional</div>
                <div className="text-sm text-gray-600 mb-3">6 ESP32s</div>
                <div className="text-2xl font-bold text-green-600">$250</div>
                <div className="text-xs text-gray-500 mt-2">Commercial ops</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - What We Do */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Revolutionizing Agriculture with IoT Technology
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                SmartCrop OS is a comprehensive, end-to-end IoT platform designed specifically for modern agriculture. 
                We empower farmers, researchers, and agricultural businesses to optimize crop production through 
                data-driven decisions and intelligent automation.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our breakthrough <strong>Hierarchical Master-Slave Architecture</strong> reduces costs by 83% while 
                providing enterprise-grade reliability. Scale from small hobby farms to large commercial operations 
                with the same proven technology.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Multi-Point Monitoring</p>
                    <p className="text-gray-600">Aggregate sensor data from multiple locations for accurate environmental control</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Stage-Based Automation</p>
                    <p className="text-gray-600">Recipe-driven environmental transitions with manual manager approval</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Plug & Play Scalability</p>
                    <p className="text-gray-600">Add sensors and equipment without backend changes - true modularity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <Thermometer className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">98.5%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">35%</p>
                  <p className="text-sm text-gray-600">Avg. Yield Increase</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">40%</p>
                  <p className="text-sm text-gray-600">Water Savings</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <Globe className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">50+</p>
                  <p className="text-sm text-gray-600">Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          How SmartCrop OS Works
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          A complete ecosystem connecting your hardware, data, and decisions in real-time
        </p>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Install Sensors</h3>
            <p className="text-gray-600">
              Deploy ESP32-based IoT sensors across your growing zones to monitor environmental conditions
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect & Stream</h3>
            <p className="text-gray-600">
              Data streams via MQTT protocol to our cloud platform or your private edge gateway
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze & Act</h3>
            <p className="text-gray-600">
              AI-powered insights and automated controls adjust conditions based on your crop recipes
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">4</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Optimize & Grow</h3>
            <p className="text-gray-600">
              Continuously improve yields with data-driven decisions and harvest analytics
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Choose SmartCrop OS?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Transform your farming operation with proven benefits
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Increase Yields by 25-40%</h3>
              <p className="text-gray-600">
                Optimize growing conditions with precision control, leading to healthier crops and better harvests
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <Droplets className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reduce Water Usage by 40%</h3>
              <p className="text-gray-600">
                Smart irrigation based on real-time soil moisture and weather data minimizes waste
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <Zap className="w-10 h-10 text-yellow-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cut Energy Costs by 30%</h3>
              <p className="text-gray-600">
                Automated climate control reduces unnecessary heating, cooling, and lighting expenses
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <BarChart3 className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Data-Driven Decisions</h3>
              <p className="text-gray-600">
                Historical analytics and trends help you make informed choices about crop selection and timing
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <Shield className="w-10 h-10 text-red-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Early Problem Detection</h3>
              <p className="text-gray-600">
                Real-time alerts notify you of issues before they become costly problems
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <Users className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Remote Management</h3>
              <p className="text-gray-600">
                Monitor and control your farms from anywhere with our mobile-responsive dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Choose the plan that fits your farming operation
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">Perfect for small vertical farms</p>
              <div className="text-4xl font-bold text-gray-900">Free</div>
              <p className="text-gray-600 mt-2">Forever</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Up to 2 farms</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">10 growing zones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">5 IoT devices</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Basic analytics</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Community support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">7-day data retention</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="w-full block text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Get Started Free
            </Link>
          </div>

          {/* Professional Plan - Featured */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-2xl p-8 border-2 border-green-500 transform md:scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-green-100 mb-4">For growing operations</p>
              <div className="text-4xl font-bold text-white">$49</div>
              <p className="text-green-100 mt-2">per month</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">Up to 10 farms</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">Unlimited zones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">50 IoT devices</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">Advanced analytics & AI insights</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">Priority email support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">90-day data retention</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">Custom crop recipes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">API access</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="w-full block text-center bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">For large-scale operations</p>
              <div className="text-4xl font-bold text-gray-900">Custom</div>
              <p className="text-gray-600 mt-2">Contact us</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited farms & zones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited devices</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">White-label solution</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">On-premise deployment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">24/7 phone support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited data retention</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Custom integrations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Dedicated account manager</span>
              </li>
            </ul>

            <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
              Contact Sales
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 mt-8">
          All plans include: SSL encryption, automatic backups, 99.9% uptime SLA, and mobile app access
        </p>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us about your farming operation and how we can help..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">support@smartcropos.com</p>
                      <p className="text-gray-600">sales@smartcropos.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Office</h4>
                      <p className="text-gray-600">
                        123 Agriculture Tech Park<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday:</span>
                    <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday:</span>
                    <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday:</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-100 p-3 rounded-lg hover:bg-green-100 transition-colors">
                    <Twitter className="w-5 h-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-lg hover:bg-green-100 transition-colors">
                    <Facebook className="w-5 h-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-lg hover:bg-green-100 transition-colors">
                    <Linkedin className="w-5 h-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-lg hover:bg-green-100 transition-colors">
                    <Github className="w-5 h-5 text-gray-700" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join farmers around the world using SmartCrop OS for precision agriculture
          </p>
          <Link
            to="/register"
            className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center"
          >
            Create Free Account
            <Sprout className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="w-8 h-8 text-green-500" />
                <span className="text-xl font-bold">SmartCrop OS</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Revolutionary IoT platform for modern agriculture. Empowering farmers with data-driven precision farming solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Pricing
                  </button>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    User Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Video Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Community Forum
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Press Kit
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Partners
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} SmartCrop OS. All rights reserved. Professional IoT agriculture platform.
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
                <Link to="/gdpr" className="text-gray-400 hover:text-white transition-colors">
                  GDPR Compliance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

