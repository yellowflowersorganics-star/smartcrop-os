import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Sparkles, 
  Calendar, 
  Bell, 
  ArrowLeft,
  Mail,
  Sprout
} from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-6 rounded-full shadow-lg">
            <Rocket className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Coming Soon
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>

          <p className="text-xl text-gray-600 mb-8">
            We're working hard to bring you this feature!
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <Calendar className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's in the Pipeline?
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Native Mobile Apps (iOS & Android)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    AI-Powered Yield Predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Advanced Reporting Dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Marketplace Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Community Features & Blog
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Video Tutorials & Case Studies
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notify Me Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">
                Get Notified When We Launch
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Be the first to know when this feature goes live!
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notify Me
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We'll only send you updates about this feature. No spam!
            </p>
          </div>

          {/* Expected Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">Q1 2025</div>
              <div className="text-sm text-gray-600">Mobile Apps</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">Q2 2025</div>
              <div className="text-sm text-gray-600">AI Features</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">Q3 2025</div>
              <div className="text-sm text-gray-600">Marketplace</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              <Sprout className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-600">
          <p>
            Have a feature request?{' '}
            <a href="mailto:support@cropwise.io" className="text-green-600 hover:text-green-700 font-medium">
              Let us know
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

