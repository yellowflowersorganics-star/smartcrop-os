import { Link } from 'react-router-dom';
import { Shield, CheckCircle, FileText, Download, Trash2, Lock, Globe, Mail } from 'lucide-react';

export default function GDPR() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GDPR Compliance</h1>
          <p className="text-gray-600">General Data Protection Regulation</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed mb-4">
              SmartCrop is committed to protecting the privacy and personal data of all our users, especially those in the European Union (EU) and European Economic Area (EEA). 
              This page outlines how we comply with the <strong>General Data Protection Regulation (GDPR)</strong>.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-900 font-semibold">✅ GDPR Compliant</p>
              <p className="text-blue-800 text-sm mt-1">
                SmartCrop adheres to all GDPR requirements for data processing, storage, and user rights.
              </p>
            </div>
          </section>

          {/* What is GDPR */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">What is GDPR?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              The GDPR is a comprehensive data protection law that came into effect on May 25, 2018. It applies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Organizations based in the EU/EEA</li>
              <li>Organizations offering goods/services to EU/EEA residents</li>
              <li>Organizations monitoring behavior of EU/EEA residents</li>
            </ul>
            <p className="text-gray-700 mt-4">
              GDPR gives individuals greater control over their personal data and requires organizations to be transparent about data processing activities.
            </p>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Basis for Data Processing</h2>
            <p className="text-gray-700 mb-4">
              We process your personal data under the following legal bases:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Contract Performance (Article 6(1)(b))</h3>
                <p className="text-sm text-gray-700">
                  Processing necessary to provide SmartCrop services you've subscribed to (sensor data collection, analytics, notifications).
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Consent (Article 6(1)(a))</h3>
                <p className="text-sm text-gray-700">
                  For marketing communications, cookies, and optional features. You can withdraw consent at any time.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Legitimate Interests (Article 6(1)(f))</h3>
                <p className="text-sm text-gray-700">
                  Fraud prevention, security monitoring, platform improvement, and customer support.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Legal Obligation (Article 6(1)(c))</h3>
                <p className="text-sm text-gray-700">
                  Compliance with tax, accounting, and anti-money laundering laws.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your GDPR Rights</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Under GDPR, you have the following rights regarding your personal data:
            </p>

            {/* Right to Access */}
            <div className="border-l-4 border-green-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Access (Article 15)</h3>
              </div>
              <p className="text-gray-700 text-sm mb-2">
                You can request a copy of all personal data we hold about you, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Account information (name, email, phone)</li>
                <li>IoT sensor data and telemetry</li>
                <li>Harvest records and inventory transactions</li>
                <li>Usage logs and analytics</li>
              </ul>
              <button className="mt-3 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Request Data Export
              </button>
            </div>

            {/* Right to Rectification */}
            <div className="border-l-4 border-blue-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Rectification (Article 16)</h3>
              </div>
              <p className="text-gray-700 text-sm">
                You can correct inaccurate or incomplete personal data. Update your profile in account settings or contact support.
              </p>
              <Link to="/settings" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 underline">
                Update Profile Settings →
              </Link>
            </div>

            {/* Right to Erasure */}
            <div className="border-l-4 border-red-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Erasure / "Right to be Forgotten" (Article 17)</h3>
              </div>
              <p className="text-gray-700 text-sm mb-2">
                You can request deletion of your personal data when:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Data is no longer necessary for the purpose it was collected</li>
                <li>You withdraw consent</li>
                <li>You object to processing</li>
                <li>Data was unlawfully processed</li>
              </ul>
              <p className="text-gray-600 text-xs mt-2">
                Note: We may retain some data for legal obligations (tax records, payment history).
              </p>
              <button className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Request Account Deletion
              </button>
            </div>

            {/* Right to Portability */}
            <div className="border-l-4 border-purple-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Data Portability (Article 20)</h3>
              </div>
              <p className="text-gray-700 text-sm">
                You can receive your data in a structured, machine-readable format (JSON, CSV) and transfer it to another service.
              </p>
              <button className="mt-3 text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data (CSV/JSON)
              </button>
            </div>

            {/* Right to Restrict Processing */}
            <div className="border-l-4 border-yellow-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Restrict Processing (Article 18)</h3>
              </div>
              <p className="text-gray-700 text-sm">
                You can request to limit how we process your data in certain situations (e.g., while disputing data accuracy).
              </p>
            </div>

            {/* Right to Object */}
            <div className="border-l-4 border-orange-400 pl-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Object (Article 21)</h3>
              </div>
              <p className="text-gray-700 text-sm">
                You can object to processing based on legitimate interests or for direct marketing purposes.
              </p>
              <Link to="/settings" className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-700 underline">
                Manage Marketing Preferences →
              </Link>
            </div>

            {/* Right to Automated Decision-Making */}
            <div className="border-l-4 border-cyan-400 pl-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-semibold text-gray-900">Right to Contest Automated Decisions (Article 22)</h3>
              </div>
              <p className="text-gray-700 text-sm">
                SmartCrop does not make solely automated decisions with legal or significant effects. 
                All critical decisions (stage approvals, equipment control) require manual confirmation.
              </p>
            </div>
          </section>

          {/* How to Exercise Rights */}
          <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Exercise Your Rights</h2>
            <p className="text-gray-700 mb-6">
              To exercise any of your GDPR rights, you can:
            </p>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Our DPO</p>
                  <a href="mailto:dpo@smartcrop.io" className="text-sm text-blue-600 hover:text-blue-700 underline">
                    dpo@smartcrop.io
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Submit a GDPR Request Form</p>
                  <Link to="/gdpr-request" className="text-sm text-green-600 hover:text-green-700 underline">
                    Fill out request form →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Send Written Request</p>
                  <p className="text-sm text-gray-600">
                    SmartCrop, GDPR Compliance Officer, 123 Agriculture Way, Tech Valley, CA 94000, USA
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-6">
              ⏱️ <strong>Response Time:</strong> We will respond to your request within <strong>30 days</strong> (may be extended to 60 days for complex requests).
            </p>
          </section>

          {/* Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              SmartCrop stores data on servers located in the United States (AWS US-East region). 
              To ensure GDPR compliance for EU/EEA data transfers, we use:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved contracts for data transfers</li>
              <li><strong>Adequacy Decisions:</strong> Transfer to countries deemed adequate by EU Commission</li>
              <li><strong>Binding Corporate Rules:</strong> Internal policies for data protection</li>
              <li><strong>Encryption:</strong> Data encrypted in transit (TLS) and at rest (AES-256)</li>
            </ul>
          </section>

          {/* Data Protection Officer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Officer (DPO)</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                We have appointed a Data Protection Officer to oversee GDPR compliance:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Name:</strong> Jane Smith, CIPP/E</p>
                <p><strong>Email:</strong> <a href="mailto:dpo@smartcrop.io" className="text-blue-600 hover:text-blue-700 underline">dpo@smartcrop.io</a></p>
                <p><strong>Address:</strong> SmartCrop, DPO Office, 123 Agriculture Way, Tech Valley, CA 94000, USA</p>
              </div>
            </div>
          </section>

          {/* Supervisory Authority */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Supervisory Authority</h2>
            <p className="text-gray-700 mb-4">
              If you are not satisfied with how we handle your personal data, you have the right to lodge a complaint with your local data protection authority:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ico.org.uk</a></li>
              <li><strong>Ireland:</strong> Data Protection Commission - <a href="https://dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dataprotection.ie</a></li>
              <li><strong>Germany:</strong> Bundesbeauftragte für den Datenschutz - <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">bfdi.bund.de</a></li>
              <li><strong>France:</strong> Commission Nationale de l'Informatique et des Libertés (CNIL) - <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">cnil.fr</a></li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Find your local authority: <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                European Data Protection Board Member List
              </a>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain personal data for different periods depending on the type of data:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Account Information</span>
                <span className="text-gray-900 font-semibold">Until account deletion</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">IoT Sensor Data</span>
                <span className="text-gray-900 font-semibold">2 years (configurable)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Payment Records</span>
                <span className="text-gray-900 font-semibold">7 years (tax law)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Marketing Consent</span>
                <span className="text-gray-900 font-semibold">Until withdrawn</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Support Tickets</span>
                <span className="text-gray-900 font-semibold">3 years</span>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Questions About GDPR?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              For questions about GDPR compliance or to exercise your rights:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@smartcrop.io" className="text-blue-600 hover:text-blue-700 underline">dpo@smartcrop.io</a></p>
              <p><strong>Privacy Team:</strong> <a href="mailto:privacy@smartcrop.io" className="text-blue-600 hover:text-blue-700 underline">privacy@smartcrop.io</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@smartcrop.io" className="text-blue-600 hover:text-blue-700 underline">support@smartcrop.io</a></p>
            </div>
          </section>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy →
            </Link>
            <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service →
            </Link>
            <Link to="/cookies" className="text-blue-600 hover:text-blue-700 font-medium">
              Cookie Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

