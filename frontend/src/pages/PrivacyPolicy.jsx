import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Cookie, Database, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PrivacyPolicy = () => {
  const [siteName, setSiteName] = useState('Mantez Reels');
  const [contactEmail, setContactEmail] = useState('hello@mantezreels.com');

  useEffect(() => {
    const controller = new AbortController();
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/`, { signal: controller.signal });
        if (response.data.site?.siteName) {
          setSiteName(response.data.site.siteName);
        }
        if (response.data.site?.contactEmail) {
          setContactEmail(response.data.site.contactEmail);
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch privacy policy settings:', error);
      }
    };
    fetchSettings();
    return () => controller.abort();
  }, []);

  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you:
        • Fill out our contact form (name, email, message)
        • Subscribe to our newsletter
        • Request our services
        
        We also automatically collect certain information when you visit our website, including:
        • Browser type and version
        • Pages visited and time spent
        • Referring website
        • Device information`
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
        • Respond to your inquiries and requests
        • Send you updates about our services (with your consent)
        • Improve our website and services
        • Analyze website usage and trends
        • Protect against fraud and unauthorized access`
    },
    {
      icon: Cookie,
      title: 'Cookies & Tracking',
      content: `We use cookies and similar technologies to:
        • Remember your preferences
        • Analyze website traffic (via analytics tools)
        • Improve user experience
        
        You can control cookies through your browser settings. Disabling cookies may affect some website functionality.
        
        We use analytics services to understand how visitors interact with our website. This data is anonymized and used solely for improvement purposes.`
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: `We implement appropriate security measures to protect your personal information, including:
        • Encrypted data transmission (HTTPS)
        • Secure database storage
        • Regular security updates
        • Access controls and authentication
        
        However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      icon: Shield,
      title: 'Your Rights',
      content: `You have the right to:
        • Access the personal data we hold about you
        • Request correction of inaccurate data
        • Request deletion of your data
        • Opt-out of marketing communications
        • Withdraw consent at any time
        
        To exercise these rights, please contact us using the information below.`
    },
    {
      icon: Mail,
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:\n\n${contactEmail}`
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
              <Shield className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-400 mt-1">{siteName}</p>
            </div>
          </div>
          
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-12">
            At {siteName}, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you 
            visit our website.
          </p>

          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <Icon className="text-purple-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  </div>
                  <div className="text-gray-400 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-purple-600/10 border border-purple-500/20 rounded-2xl">
            <p className="text-gray-300 text-center">
              By using our website, you consent to this Privacy Policy. 
              We may update this policy from time to time, and changes will be posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
