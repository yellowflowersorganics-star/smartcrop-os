import { Link } from 'react-router-dom';
import { Cookie, Settings, Eye, Shield, ToggleLeft } from 'lucide-react';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <Cookie className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains how CropWise uses cookies and similar tracking technologies when you visit our website and use our services. 
              By using CropWise, you consent to the use of cookies as described in this policy.
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">1. What Are Cookies?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Cookies are small text files stored on your device (computer, tablet, smartphone) when you visit a website. 
              They help websites remember your actions and preferences over time, improving your user experience.
            </p>
            <p className="text-gray-700">
              We also use similar technologies like web beacons, pixels, and local storage to collect and store information about your usage.
            </p>
          </section>

          {/* Types of Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. Types of Cookies We Use</h2>
            </div>

            {/* Essential Cookies */}
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Essential Cookies (Required)
              </h3>
              <p className="text-gray-700 mb-3">
                These cookies are necessary for the website to function and cannot be disabled in our systems.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Authentication:</strong> JWT tokens for secure login sessions</li>
                <li><strong>Security:</strong> CSRF protection and session management</li>
                <li><strong>Load Balancing:</strong> Server routing for optimal performance</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Duration:</strong> Session or up to 30 days (for "Remember Me" feature)
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ToggleLeft className="w-5 h-5 text-blue-600" />
                Functional Cookies (Optional)
              </h3>
              <p className="text-gray-700 mb-3">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Preferences:</strong> Language, timezone, display settings</li>
                <li><strong>Farm/Zone Selection:</strong> Remember your last selected zone</li>
                <li><strong>Dashboard Layout:</strong> Save customized dashboard views</li>
                <li><strong>Notification Preferences:</strong> Alert delivery settings</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Duration:</strong> Up to 1 year
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-purple-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Analytics Cookies (Optional)
              </h3>
              <p className="text-gray-700 mb-3">
                These cookies help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Usage Analytics:</strong> Page views, session duration, bounce rate</li>
                <li><strong>Feature Usage:</strong> Which features are most popular</li>
                <li><strong>Error Tracking:</strong> Technical issues and bugs</li>
                <li><strong>Performance Metrics:</strong> Page load times, API response times</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Third-Party Services:</strong> Google Analytics (anonymized IP)
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> Up to 2 years
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies (Optional)</h3>
              <p className="text-gray-700 mb-3">
                These cookies track your visits across websites to deliver relevant ads.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Remarketing:</strong> Show relevant ads on other platforms</li>
                <li><strong>Conversion Tracking:</strong> Measure ad campaign effectiveness</li>
                <li><strong>Social Media Pixels:</strong> Facebook, LinkedIn, Twitter integrations</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Third-Party Services:</strong> Google Ads, Facebook Pixel
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> Up to 2 years
              </p>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              Some third-party services we use may set their own cookies:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-900">Google Analytics</h3>
                <p className="text-sm text-gray-600">Website analytics and performance tracking</p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 underline">
                  Privacy Policy →
                </a>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-900">Google OAuth</h3>
                <p className="text-sm text-gray-600">Third-party authentication</p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy →
                </a>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-semibold text-gray-900">Stripe</h3>
                <p className="text-sm text-gray-600">Payment processing</p>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:text-purple-700 underline">
                  Privacy Policy →
                </a>
              </div>
              <div className="border-l-4 border-cyan-400 pl-4">
                <h3 className="font-semibold text-gray-900">Twilio</h3>
                <p className="text-sm text-gray-600">SMS and WhatsApp notifications</p>
                <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:text-cyan-700 underline">
                  Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">4. Managing Your Cookie Preferences</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              You can control and delete cookies through your browser settings:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Google Chrome</h4>
                <p className="text-sm text-gray-600">Settings → Privacy & Security → Cookies and other site data</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                <p className="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                <p className="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Edge</h4>
                <p className="text-sm text-gray-600">Settings → Privacy, search, and services → Cookies</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">CropWise Cookie Settings</h3>
            <p className="text-gray-700 mb-4">
              You can manage non-essential cookies in your account settings:
            </p>
            <Link to="/settings" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Manage Cookie Preferences →
            </Link>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Opt-Out Tools</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">Google Analytics Opt-Out Browser Add-on</a></li>
              <li><a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">Digital Advertising Alliance (DAA) Opt-Out</a></li>
              <li><a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">European Interactive Digital Advertising Alliance (EDAA)</a></li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Do Not Track (DNT)</h2>
            <p className="text-gray-700">
              Some browsers offer a "Do Not Track" (DNT) signal. Currently, there is no industry standard for how to respond to DNT signals. 
              CropWise does not change its data collection practices in response to DNT signals at this time. 
              You can still control cookies through browser settings or our cookie consent tool.
            </p>
          </section>

          {/* Mobile Devices */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Mobile Devices</h2>
            <p className="text-gray-700 mb-4">
              If you access CropWise via mobile app or mobile browser, we may use:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Device Identifiers:</strong> Unique device IDs for analytics and push notifications</li>
              <li><strong>Location Data:</strong> GPS or IP-based location (with your permission)</li>
              <li><strong>Local Storage:</strong> Similar to cookies, for app functionality</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Manage these permissions in your device settings (iOS: Settings → Privacy, Android: Settings → Apps → Permissions).
            </p>
          </section>

          {/* Changes to Cookie Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time. We will notify you of significant changes via email or prominent notice on our website. 
              The "Last Updated" date at the top of this page indicates when the policy was last revised.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              Questions about our use of cookies? Contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@cropwise.io" className="text-green-600 hover:text-green-700 underline">privacy@cropwise.io</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@cropwise.io" className="text-green-600 hover:text-green-700 underline">support@cropwise.io</a></p>
            </div>
          </section>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
              Privacy Policy →
            </Link>
            <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
              Terms of Service →
            </Link>
            <Link to="/gdpr" className="text-green-600 hover:text-green-700 font-medium">
              GDPR Compliance →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

