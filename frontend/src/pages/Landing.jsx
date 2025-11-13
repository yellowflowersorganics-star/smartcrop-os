import { Link } from 'react-router-dom';
import { 
  Sprout, Cpu, BarChart3, Cloud, Zap, Shield, 
  CheckCircle, TrendingUp, Droplets, Thermometer,
  Users, Globe, Package, ArrowRight
} from 'lucide-react';

export default function Landing() {
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
            <div className="flex items-center space-x-4">
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
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Open-source IoT platform for precision agriculture. Monitor, control, and optimize your crops with real-time data and automation.
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

        {/* Hero Image/Illustration Placeholder */}
        <div className="mt-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-4">🌱</div>
          <p className="text-gray-600 text-lg">IoT-Powered Vertical Farming Platform</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Everything You Need for Smart Farming
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">IoT Integration</h3>
            <p className="text-gray-600">
              Connect ESP32 sensors and controllers for real-time monitoring of temperature, humidity, pH, and more.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Analytics</h3>
            <p className="text-gray-600">
              Visualize your farm data with beautiful charts and dashboards. Make data-driven decisions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automation</h3>
            <p className="text-gray-600">
              Create crop recipes and automate environmental controls based on growth stages and conditions.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Cloud className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cloud & Edge</h3>
            <p className="text-gray-600">
              Hybrid architecture with cloud backend and edge computing for reliable offline operation.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Crop Management</h3>
            <p className="text-gray-600">
              Manage multiple farms, zones, and crop varieties with customizable growing recipes.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Open Source</h3>
            <p className="text-gray-600">
              Fully open-source platform. Customize, extend, and deploy on your own infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* About Section - What We Do */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Revolutionizing Agriculture with IoT Technology
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                SmartCrop OS is an open-source, end-to-end IoT platform designed specifically for modern agriculture. 
                We empower farmers, researchers, and agricultural businesses to optimize crop production through 
                data-driven decisions and intelligent automation.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to make precision agriculture accessible to everyone, from small vertical farms 
                to large commercial operations, by providing enterprise-grade tools at an affordable price.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Real-Time Monitoring</p>
                    <p className="text-gray-600">Track temperature, humidity, pH, EC, and more across all your zones</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Intelligent Automation</p>
                    <p className="text-gray-600">Automated environmental controls based on crop-specific recipes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Scalable Infrastructure</p>
                    <p className="text-gray-600">From single zones to multi-farm operations with thousands of sensors</p>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          All plans include: SSL encryption, automatic backups, 99.9% uptime SLA, and open-source firmware
        </p>
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sprout className="w-6 h-6" />
              <span className="text-lg font-bold">SmartCrop OS</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SmartCrop OS. Open-source agriculture platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

