import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Globe, Users, FileText, Mail } from 'lucide-react';

export default function Privacy() {
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
          <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              At SmartCrop, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our IoT agriculture platform and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Company or farm name and address</li>
              <li>Payment and billing information</li>
              <li>Account credentials (encrypted)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">IoT & Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Environmental sensor data (temperature, humidity, CO₂, light)</li>
              <li>Equipment operation logs and commands</li>
              <li>Harvest records and batch tracking data</li>
              <li>Inventory transactions and stock levels</li>
              <li>Labor tracking and work logs</li>
              <li>Platform usage analytics and interaction logs</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Device Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>ESP32 device IDs and MAC addresses</li>
              <li>IP addresses and network information</li>
              <li>Browser type and operating system</li>
              <li>Device location (if enabled)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide, operate, and maintain our services</li>
              <li>Process IoT sensor data and environmental monitoring</li>
              <li>Generate analytics, insights, and recommendations</li>
              <li>Send automated alerts and notifications</li>
              <li>Process payments and prevent fraud</li>
              <li>Improve our platform and develop new features</li>
              <li>Communicate with you about updates, support, and marketing (with consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">3. Data Storage & Security</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS encryption</li>
              <li><strong>Authentication:</strong> JWT tokens with secure session management</li>
              <li><strong>Access Control:</strong> Role-based permissions (RBAC)</li>
              <li><strong>Data Centers:</strong> AWS infrastructure with SOC 2 compliance</li>
              <li><strong>Backups:</strong> Regular automated backups with encryption at rest</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Your IoT sensor data is stored on secure cloud servers (AWS RDS) with regular backups. 
              We retain data for as long as your account is active or as needed to provide services.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing & Disclosure</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We do <strong>not</strong> sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Service Providers:</strong> AWS (hosting), Twilio (notifications), payment processors</li>
              <li><strong>Analytics Partners:</strong> Anonymized usage data for platform improvement</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All third-party services are bound by strict confidentiality agreements and GDPR-compliant data processing agreements.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">5. Your Privacy Rights</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Restrict:</strong> Limit how we use your data</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@smartcrop.io" className="text-green-600 hover:text-green-700 underline">privacy@smartcrop.io</a>
            </p>
          </section>

          {/* Cookies & Tracking */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">6. Cookies & Tracking Technologies</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Maintain your login session</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Prevent fraud and improve security</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings. For more details, see our <Link to="/cookies" className="text-green-600 hover:text-green-700 underline">Cookie Policy</Link>.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">7. International Data Transfers</h2>
            </div>
            <p className="text-gray-700">
              Your data may be transferred to and processed in countries other than your own. We ensure adequate safeguards through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
              <li>EU Standard Contractual Clauses (SCCs)</li>
              <li>Privacy Shield Framework (where applicable)</li>
              <li>Binding Corporate Rules</li>
              <li>Data Processing Agreements with all vendors</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              SmartCrop is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. 
              If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent notice on our platform. 
              Continued use of SmartCrop after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@smartcrop.io" className="text-green-600 hover:text-green-700 underline">privacy@smartcrop.io</a></p>
              <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@smartcrop.io" className="text-green-600 hover:text-green-700 underline">dpo@smartcrop.io</a></p>
              <p><strong>Mail:</strong> SmartCrop, Privacy Department, 123 Agriculture Way, Tech Valley, CA 94000, USA</p>
            </div>
          </section>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
              Terms of Service →
            </Link>
            <Link to="/cookies" className="text-green-600 hover:text-green-700 font-medium">
              Cookie Policy →
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

