import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';

export default function Terms() {
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
          <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to SmartCrop! These Terms of Service ("Terms") govern your access to and use of our IoT agriculture platform, 
              including our website, mobile applications, hardware integrations, and all related services (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By accessing or using SmartCrop, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">1. Account Registration</h2>
            </div>
            <p className="text-gray-700 mb-4">
              To use SmartCrop, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
              <li>Provide accurate, complete, and current information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You may register using Google OAuth or email/password. We reserve the right to suspend or terminate accounts that 
              violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. Acceptable Use</h2>
            </div>
            <p className="text-gray-700 mb-4">
              You agree to use SmartCrop only for lawful purposes. You may <strong>NOT</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe intellectual property rights of others</li>
              <li>Upload malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service for illegal cultivation or production of controlled substances</li>
              <li>Scrape, harvest, or mine data from the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Reverse engineer, decompile, or disassemble our software</li>
            </ul>
          </section>

          {/* IoT Hardware & Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. IoT Hardware & Sensor Data</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hardware Compatibility</h3>
            <p className="text-gray-700 mb-4">
              SmartCrop supports ESP32-based IoT devices. We provide firmware and documentation for self-installation. 
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Purchasing compatible ESP32 hardware</li>
              <li>Properly installing and configuring devices</li>
              <li>Maintaining network connectivity (WiFi, MQTT broker)</li>
              <li>Ensuring electrical safety and compliance with local codes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Ownership</h3>
            <p className="text-gray-700 mb-4">
              <strong>You retain all ownership rights to your sensor data, harvest records, and agricultural information.</strong> 
              We collect and process this data solely to provide the Service. We may use anonymized, aggregated data for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Platform improvements and analytics</li>
              <li>Research and development (with your consent)</li>
              <li>Industry benchmarking (anonymized)</li>
            </ul>
          </section>

          {/* Subscription & Payment */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription & Payment</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Tiers</h3>
            <p className="text-gray-700 mb-4">
              SmartCrop offers multiple subscription plans (Free, Professional, Enterprise). 
              Pricing is available on our website and subject to change with 30 days' notice.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Subscriptions renew automatically unless cancelled</li>
              <li>Payment is processed via secure third-party processors (Stripe, PayPal)</li>
              <li>You authorize recurring charges to your payment method</li>
              <li>Refunds are provided at our discretion, typically within 30 days of purchase</li>
              <li>We reserve the right to suspend service for non-payment</li>
            </ul>
          </section>

          {/* Service Level Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Level Agreement (SLA)</h2>
            <p className="text-gray-700 mb-4">
              For paid subscriptions, we commit to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Uptime:</strong> 99.5% monthly uptime guarantee (excluding scheduled maintenance)</li>
              <li><strong>Support Response:</strong> Email support within 24 hours (business days)</li>
              <li><strong>Data Retention:</strong> Minimum 90 days of historical sensor data</li>
              <li><strong>Backups:</strong> Daily automated backups with 30-day retention</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Free plan users receive best-effort support with no guaranteed SLA.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              SmartCrop and all related software, firmware, documentation, trademarks, and logos are owned by us or our licensors. 
              We grant you a limited, non-exclusive, non-transferable license to use the Service for your personal or commercial agriculture operations.
            </p>
            <p className="text-gray-700">
              You may <strong>not</strong> copy, modify, distribute, sell, or create derivative works without written permission.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">7. Disclaimer of Warranties</h2>
            </div>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Merchantability or fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of sensor data</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security against unauthorized access or data breaches</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>IMPORTANT:</strong> SmartCrop provides monitoring and automation tools, but <strong>you remain solely responsible</strong> 
              for the safety, quality, and compliance of your agricultural operations. We are not liable for crop losses, equipment failures, 
              or regulatory violations.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-red-50 border-l-4 border-red-400 p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">8. Limitation of Liability</h2>
            </div>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMARTCROP OS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, revenue, data, or goodwill</li>
              <li>Crop losses or agricultural production failures</li>
              <li>Equipment damage or malfunction</li>
              <li>Third-party hardware or network failures</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, 
              or $100, whichever is greater.</strong>
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless SmartCrop, its affiliates, officers, directors, and employees from any claims, 
              liabilities, damages, losses, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
              <li>Your use of the Service</li>
              <li>Violation of these Terms</li>
              <li>Infringement of third-party rights</li>
              <li>Your agricultural operations or crop production</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time by contacting support. We may suspend or terminate your access for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Prolonged inactivity (free accounts)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Upon termination, you may export your data within 30 days. After 30 days, we may permanently delete your account and data.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">11. Governing Law & Disputes</h2>
            </div>
            <p className="text-gray-700 mb-4">
              These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. 
              Any disputes shall be resolved through:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Good-faith negotiation between parties (30 days)</li>
              <li>Binding arbitration under AAA Commercial Arbitration Rules</li>
              <li>Arbitration location: San Francisco, California</li>
            </ol>
            <p className="text-gray-700 mt-4">
              You waive the right to participate in class-action lawsuits or class-wide arbitration.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms at any time. We will notify you of material changes via email or prominent notice on the Service. 
              Continued use after changes constitutes acceptance. If you disagree, you must stop using the Service.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:legal@smartcrop.io" className="text-green-600 hover:text-green-700 underline">legal@smartcrop.io</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@smartcrop.io" className="text-green-600 hover:text-green-700 underline">support@smartcrop.io</a></p>
              <p><strong>Mail:</strong> SmartCrop, Legal Department, 123 Agriculture Way, Tech Valley, CA 94000, USA</p>
            </div>
          </section>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
              Privacy Policy →
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

