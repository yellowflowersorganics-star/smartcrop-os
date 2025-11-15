import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ChevronDown, ChevronUp, Search,
  HelpCircle, Zap, Shield, Cpu, DollarSign,
  Users, Globe, Mail
} from 'lucide-react';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    {
      name: 'Getting Started',
      icon: Zap,
      color: 'green',
      faqs: [
        {
          question: 'What is CropWise?',
          answer: 'CropWise is a comprehensive IoT-powered farm management platform designed specifically for mushroom cultivation and vertical farming. It provides real-time environmental monitoring, batch tracking, harvest recording, inventory management, and profitability analytics - all in one integrated system.'
        },
        {
          question: 'Do I need technical knowledge to use CropWise?',
          answer: 'No! CropWise is designed to be user-friendly for farmers of all technical levels. Our intuitive interface requires no coding or technical expertise. We provide step-by-step guides, video tutorials, and 24/7 support to help you get started.'
        },
        {
          question: 'How long does it take to set up?',
          answer: 'You can create an account and start using CropWise immediately. For IoT sensor integration, setup typically takes 1-2 hours per zone, depending on your farm size. Our quick-start guide walks you through the entire process, and our support team is available to assist.'
        },
        {
          question: 'Can I import my existing farm data?',
          answer: 'Yes! CropWise supports CSV imports for farms, zones, inventory items, and historical data. We also offer a data migration service for enterprise customers transitioning from other systems.'
        }
      ]
    },
    {
      name: 'IoT & Hardware',
      icon: Cpu,
      color: 'blue',
      faqs: [
        {
          question: 'What sensors does CropWise support?',
          answer: 'CropWise works with ESP32-based sensors for temperature, humidity, CO2, light intensity, soil moisture, and pH. We provide detailed wiring guides for DHT22, BH1750, MQ-135, and other common sensors. Our MQTT-based architecture also supports custom sensor integrations.'
        },
        {
          question: 'Do I need to buy sensors from you?',
          answer: 'No! You can use any ESP32-compatible sensors. We provide open-source Arduino code and comprehensive guides for DIY sensor setup. This keeps costs low - typically $20-40 per sensor node. We also partner with hardware suppliers if you prefer pre-assembled solutions.'
        },
        {
          question: 'How do sensors connect to CropWise?',
          answer: 'Sensors connect via WiFi to a local MQTT broker (like Mosquitto on a Raspberry Pi), which then forwards data to CropWise via our REST API. This architecture works on-premise or in the cloud, ensuring your data stays secure and operations continue even during internet outages.'
        },
        {
          question: 'What if I don\'t have IoT sensors yet?',
          answer: 'You can still use CropWise! All features work with manual data entry. The platform provides simulated environmental data for testing. You can add IoT sensors later at your own pace - the system is designed to grow with your operation.'
        }
      ]
    },
    {
      name: 'Pricing & Plans',
      icon: DollarSign,
      color: 'purple',
      faqs: [
        {
          question: 'How much does CropWise cost?',
          answer: 'We offer three plans: Starter (Free forever, up to 2 farms, 10 zones, 5 devices), Professional ($49/month, up to 10 farms, unlimited zones, 50 devices), and Enterprise (custom pricing for large operations). All plans include core features, with Professional and Enterprise adding advanced analytics and priority support.'
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes! All new Professional and Enterprise customers get a 30-day free trial with full access to all features. No credit card required to start. Our Starter plan is free forever with no trial period needed.'
        },
        {
          question: 'Can I upgrade or downgrade my plan?',
          answer: 'Absolutely! You can change plans at any time from your account settings. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle, and you\'ll retain access to all features until then.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and wire transfers for Enterprise customers. All payments are processed securely through Stripe with 256-bit encryption.'
        }
      ]
    },
    {
      name: 'Features & Capabilities',
      icon: HelpCircle,
      color: 'orange',
      faqs: [
        {
          question: 'What features does CropWise include?',
          answer: 'CropWise includes: Farm & Zone Management, Growing Recipes, Batch Tracking, Harvest Recording, Real-time Environmental Monitoring, Alerts & Notifications, Inventory Management, Task Management, Labor Tracking, Cost & Revenue Tracking, Profitability Analytics, Quality Control, SOP Management, and comprehensive Analytics & Reporting.'
        },
        {
          question: 'Can I manage multiple farms?',
          answer: 'Yes! CropWise is designed for multi-farm operations. You can manage unlimited farms (depending on your plan), each with multiple zones, different crop recipes, and separate teams. The dashboard provides a consolidated view across all your operations.'
        },
        {
          question: 'Does it work for crops other than mushrooms?',
          answer: 'While CropWise was originally designed for mushroom cultivation, it works for any crop that requires environmental monitoring and stage-based growing protocols. Many customers use it for leafy greens, herbs, microgreens, and other specialty crops in vertical farms.'
        },
        {
          question: 'Can I create custom growing recipes?',
          answer: 'Yes! You can create unlimited custom recipes with multiple stages, each specifying optimal temperature, humidity, CO2, light, and airflow parameters. The system will track your progress and alert you when conditions deviate from your recipe.'
        }
      ]
    },
    {
      name: 'Security & Privacy',
      icon: Shield,
      color: 'red',
      faqs: [
        {
          question: 'Is my farm data secure?',
          answer: 'Yes! We use enterprise-grade security: 256-bit SSL encryption for data in transit, AES-256 encryption for data at rest, regular security audits, SOC 2 Type II compliance, and daily encrypted backups stored in multiple geographic locations. Your data is never shared without explicit permission.'
        },
        {
          question: 'Where is my data stored?',
          answer: 'Data is stored in secure AWS data centers with redundancy across multiple availability zones. Enterprise customers can choose their preferred region (US, EU, Asia-Pacific) for compliance with local data residency requirements. On-premise deployment is also available for Enterprise plans.'
        },
        {
          question: 'Who can access my farm data?',
          answer: 'Only authorized users on your account can access your data. You control user permissions with role-based access control (RBAC). CropWise staff never access your data without explicit permission, and then only to provide technical support or resolve specific issues.'
        },
        {
          question: 'Do you sell my data?',
          answer: 'Never. Your farm data is yours and yours alone. We do not sell, rent, or share any customer data with third parties. Our business model is based on subscription fees, not data monetization. This is clearly stated in our privacy policy and terms of service.'
        }
      ]
    },
    {
      name: 'Support & Training',
      icon: Users,
      color: 'indigo',
      faqs: [
        {
          question: 'What kind of support do you offer?',
          answer: 'Starter: Community forum and email support (48-hour response). Professional: Priority email support (24-hour response) and live chat. Enterprise: 24/7 phone support, dedicated account manager, and on-site training. All plans include comprehensive documentation and video tutorials.'
        },
        {
          question: 'Do you provide training?',
          answer: 'Yes! All customers get access to our online training portal with video tutorials, webinars, and step-by-step guides. Professional customers receive onboarding training sessions. Enterprise customers get custom training programs, including on-site visits and team workshops.'
        },
        {
          question: 'Is there a user community?',
          answer: 'Yes! Our active community forum has 5,000+ farmers sharing tips, best practices, and growing recipes. We also host monthly webinars, regional meetups, and an annual CropWise Conference where users connect and learn from each other.'
        },
        {
          question: 'Can I request new features?',
          answer: 'Absolutely! We actively listen to our users. Submit feature requests through the platform or forum. Our product roadmap is heavily influenced by customer feedback. Many of our best features started as user suggestions.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const toggleFAQ = (categoryIndex, faqIndex) => {
    const index = `${categoryIndex}-${faqIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">CropWise</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                About
              </Link>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="text-green-600">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find answers to common questions about CropWise. Can't find what you're looking for? 
            <Link to="/#contact" className="text-green-600 hover:underline ml-1">Contact us</Link>
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No results found for "{searchTerm}"</p>
            <p className="text-gray-500 mt-2">Try a different search term or browse all questions below</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category Header */}
                <div className="flex items-center mb-6">
                  <div className={`${colorClasses[category.color]} w-12 h-12 rounded-lg flex items-center justify-center mr-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{category.name}</h2>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const isOpen = openIndex === `${categoryIndex}-${faqIndex}`;
                    return (
                      <div
                        key={faqIndex}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="w-6 h-6 text-green-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Still Have Questions */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our team is here to help! Reach out and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/#contact"
              className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Support
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-green-600 transition-colors font-semibold text-lg"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="w-6 h-6 text-green-500" />
            <span className="text-lg font-bold">CropWise</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CropWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

