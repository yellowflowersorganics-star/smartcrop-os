import { Link } from 'react-router-dom';
import { 
  Sprout, Target, Eye, Heart, Users, Award, 
  TrendingUp, Globe, Zap, Shield, Cpu, Leaf,
  Linkedin, Mail
} from 'lucide-react';

export default function About() {
  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      image: '👩‍💼',
      bio: 'PhD in Agricultural Engineering. 15+ years in precision farming and IoT solutions.',
      linkedin: '#'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      image: '👨‍💻',
      bio: 'Former lead engineer at AgriTech Corp. Expert in embedded systems and MQTT protocols.',
      linkedin: '#'
    },
    {
      name: 'Emily Watson',
      role: 'Head of Product',
      image: '👩‍🔬',
      bio: 'Mushroom cultivation specialist with 10+ years experience in vertical farming operations.',
      linkedin: '#'
    },
    {
      name: 'David Kim',
      role: 'Head of Engineering',
      image: '👨‍🔧',
      bio: 'Full-stack developer and IoT architect. Built sensor networks for 200+ farms worldwide.',
      linkedin: '#'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Sustainability First',
      description: 'We believe in farming practices that protect our planet for future generations. Every feature is designed with environmental impact in mind.'
    },
    {
      icon: Users,
      title: 'Farmer-Centric',
      description: 'Built by farmers, for farmers. We listen to our community and continuously improve based on real-world feedback.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Pushing the boundaries of agricultural technology with cutting-edge IoT, AI, and automation solutions.'
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Your farm data is precious. We use enterprise-grade encryption and never share your information without permission.'
    }
  ];

  const milestones = [
    { year: '2020', event: 'CropWise founded by agricultural engineers', icon: Sprout },
    { year: '2021', event: 'First 100 farms onboarded, raised seed funding', icon: TrendingUp },
    { year: '2022', event: 'Expanded to 15 countries, launched mobile app', icon: Globe },
    { year: '2023', event: 'Reached 1,000+ active farms, Series A funding', icon: Award },
    { year: '2025', event: 'AI-powered insights launched, 50+ team members', icon: Cpu }
  ];

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
              <Link to="/faq" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                FAQ
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-green-600">CropWise</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're on a mission to revolutionize agriculture through intelligent IoT solutions, 
            making precision farming accessible to everyone from small vertical farms to large commercial operations.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To empower farmers worldwide with intelligent, data-driven tools that maximize yields, 
                minimize environmental impact, and make precision agriculture accessible to operations of all sizes.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe that every farmer deserves access to enterprise-grade technology, regardless of 
                their farm's size or location. By combining IoT sensors, real-time analytics, and intuitive 
                interfaces, we're democratizing smart farming.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                A world where every farm operates at peak efficiency, using data-driven insights to 
                produce more food with fewer resources, while preserving our planet for future generations.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We envision a global agricultural ecosystem where farmers collaborate, share best practices, 
                and leverage collective intelligence to solve humanity's biggest challenges: feeding a growing 
                population sustainably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From a small mushroom farm to a global agri-tech platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              CropWise was born in 2020 when co-founders Dr. Sarah Chen and Michael Rodriguez met at 
              an agricultural technology conference. Sarah, a PhD in Agricultural Engineering, had spent 
              years researching precision farming techniques for small-scale operations. Michael, a seasoned 
              IoT engineer, had just left his position at a major tech company to pursue his passion for 
              sustainable agriculture.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              The idea sparked when Sarah shared her frustration: enterprise farming solutions were too 
              expensive and complex for small and medium farms, yet these farms produced a significant 
              portion of the world's specialty crops. Meanwhile, Michael had been building sensor networks 
              for industrial applications and saw an opportunity to bring the same technology to agriculture 
              at an affordable price point.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              They started with a single mushroom farm in California, installing custom ESP32-based sensors 
              and building the first version of CropWise on nights and weekends. Within three months, 
              the farm saw a 35% increase in yield and 40% reduction in water usage. Word spread quickly 
              through the local farming community.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
              Today, CropWise powers over 1,000 farms across 15 countries, from small urban vertical 
              farms to large commercial mushroom operations. Our platform has helped farmers collectively 
              save millions of gallons of water, reduce energy costs by 30%, and increase average yields 
              by 35%. But we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth</p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-6 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <milestone.icon className="w-10 h-10 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-green-600 mb-1">{milestone.year}</div>
                  <div className="text-lg text-gray-900">{milestone.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate experts combining agriculture, engineering, and technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-green-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-green-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a href={member.linkedin} className="text-gray-400 hover:text-green-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">1,000+</div>
              <div className="text-green-100 text-lg">Active Farms</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-green-100 text-lg">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">35%</div>
              <div className="text-green-100 text-lg">Avg. Yield Increase</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10M+</div>
              <div className="text-green-100 text-lg">Data Points/Day</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of the agricultural revolution. Start optimizing your farm today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center justify-center"
            >
              Start Free Trial
              <Sprout className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/faq"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-green-600 transition-colors font-semibold text-lg"
            >
              Learn More
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

