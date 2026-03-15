import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitter,
  Music2,
  Video,
  Dribbble,
  Github,
  Send,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import api from '../services/api';
import useApiData from '../hooks/useApiData';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef(null);
  const { toast } = useToast();

  const { data: contactInfo } = useApiData('/api/content/contact-info', {
    initialData: null,
    transform: (resp) => (resp.success ? resp.content : null),
  });

  const { data: settings } = useApiData('/api/settings/', {
    initialData: null,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: Instagram,
      youtube: Youtube,
      linkedin: Linkedin,
      facebook: Facebook,
      twitter: Twitter,
      tiktok: Music2,
      vimeo: Video,
      behance: Dribbble,
      dribbble: Dribbble,
      github: Github,
    };
    return icons[platform] || Mail;
  };

  const getPrimaryColor = () => {
    return settings?.site?.primaryColor || '#9333ea'; // Default to purple-600
  };

  const getPrimaryColorClass = (opacity = '') => {
    const color = getPrimaryColor();
    // Convert hex to RGB for opacity support
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return opacity ? `rgba(${r}, ${g}, ${b}, ${opacity})` : color;
  };

  const renderSocialLinks = () => {
    if (!contactInfo) return null;

    const socialPlatforms = [
      { key: 'instagram_url', label: 'Instagram' },
      { key: 'youtube_url', label: 'YouTube' },
      { key: 'linkedin_url', label: 'LinkedIn' },
      { key: 'facebook_url', label: 'Facebook' },
      { key: 'twitter_url', label: 'Twitter' },
      { key: 'tiktok_url', label: 'TikTok' },
      { key: 'vimeo_url', label: 'Vimeo' },
      { key: 'behance_url', label: 'Behance' },
      { key: 'dribbble_url', label: 'Dribbble' },
      { key: 'github_url', label: 'GitHub' },
    ];

    const activeSocials = socialPlatforms.filter(
      (platform) => contactInfo[platform.key] && contactInfo[platform.key].trim() !== ''
    );

    if (activeSocials.length === 0) return null;

    return (
      <div className="pt-8 border-t border-gray-800">
        <h3 className="text-white font-semibold mb-4">Follow Me</h3>
        <div className="flex flex-wrap gap-4">
          {activeSocials.map((platform) => {
            const Icon = getSocialIcon(platform.key.replace('_url', ''));
            return (
              <a
                key={platform.key}
                href={contactInfo[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center transition-colors"
                style={{ '--hover-bg': getPrimaryColor() }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = getPrimaryColor())}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '')}
                aria-label={platform.label}
              >
                <Icon className="text-white" size={20} />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/contact/submit', formData);

      if (response.data.success) {
        toast({
          title: 'Message sent!',
          description: response.data.message,
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Failed to send contact message:', error);
      toast({
        title: 'Failed to send message',
        description: error.response?.data?.detail || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="pt-12 pb-20 md:pt-14 px-6 lg:px-8 bg-black relative overflow-hidden scroll-mt-20"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: getPrimaryColor() }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div ref={sectionRef} className="text-center mb-12 opacity-0">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              Contact
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Let&apos;s create
            <span
              className="block mt-2 pb-2 leading-[1.15] bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${getPrimaryColorClass('0.8')}, #ec4899)`,
              }}
            >
              something amazing
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Have a project in mind? Get in touch and let&apos;s bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Email */}
            <div className="group cursor-pointer">
              {contactInfo?.enable_email_click !== false ? (
                <a
                  href={`mailto:${contactInfo?.email || settings?.site?.contactEmail || 'hello@mantezreels.com'}`}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = getPrimaryColor())}
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = getPrimaryColorClass('0.2'))
                    }
                  >
                    <Mail
                      className="group-hover:text-white transition-colors"
                      style={{ color: getPrimaryColorClass('0.8') }}
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <span
                      className="text-gray-300 group-hover:text-white transition-colors underline decoration-transparent"
                      style={{ '--hover-color': getPrimaryColor() }}
                      onMouseEnter={(e) => (e.target.style.color = getPrimaryColor())}
                      onMouseLeave={(e) => (e.target.style.color = '')}
                    >
                      {contactInfo?.email ||
                        settings?.site?.contactEmail ||
                        'hello@mantezreels.com'}
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                  >
                    <Mail style={{ color: getPrimaryColorClass('0.8') }} size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <span className="text-gray-300">
                      {contactInfo?.email ||
                        settings?.site?.contactEmail ||
                        'hello@mantezreels.com'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="group cursor-pointer">
              {contactInfo?.enable_phone_click !== false ? (
                <a
                  href={`tel:${contactInfo?.phone || '+302101234567'}`}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = getPrimaryColor())}
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = getPrimaryColorClass('0.2'))
                    }
                  >
                    <Phone
                      className="group-hover:text-white transition-colors"
                      style={{ color: getPrimaryColorClass('0.8') }}
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <span
                      className="text-gray-300 group-hover:text-white transition-colors underline decoration-transparent"
                      onMouseEnter={(e) => (e.target.style.color = getPrimaryColor())}
                      onMouseLeave={(e) => (e.target.style.color = '')}
                    >
                      {contactInfo?.phone || '+30 210 123 4567'}
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                  >
                    <Phone style={{ color: getPrimaryColorClass('0.8') }} size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <span className="text-gray-300">
                      {contactInfo?.phone || '+30 210 123 4567'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="group cursor-pointer">
              {contactInfo?.enable_location_click !== false ? (
                <a
                  href={
                    contactInfo?.location
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.location)}`
                      : 'https://www.google.com/maps/search/?api=1&query=Athens,Greece'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = getPrimaryColor())}
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = getPrimaryColorClass('0.2'))
                    }
                  >
                    <MapPin
                      className="group-hover:text-white transition-colors"
                      style={{ color: getPrimaryColorClass('0.8') }}
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <span
                      className="text-gray-300 group-hover:text-white transition-colors underline decoration-transparent"
                      onMouseEnter={(e) => (e.target.style.color = getPrimaryColor())}
                      onMouseLeave={(e) => (e.target.style.color = '')}
                    >
                      {contactInfo?.location || 'Athens, Greece'}
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: getPrimaryColorClass('0.2'),
                    }}
                  >
                    <MapPin style={{ color: getPrimaryColorClass('0.8') }} size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <span className="text-gray-300">
                      {contactInfo?.location || 'Athens, Greece'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {renderSocialLinks()}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-white font-semibold mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 transition-all"
                    style={{
                      '--focus-color': getPrimaryColor(),
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = getPrimaryColor();
                      e.target.style.boxShadow = `0 0 0 2px ${getPrimaryColorClass('0.2')}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white font-semibold mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 transition-all"
                    style={{
                      '--focus-color': getPrimaryColor(),
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = getPrimaryColor();
                      e.target.style.boxShadow = `0 0 0 2px ${getPrimaryColorClass('0.2')}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-white font-semibold mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--focus-color': getPrimaryColor(),
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = getPrimaryColor();
                    e.target.style.boxShadow = `0 0 0 2px ${getPrimaryColorClass('0.2')}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                  placeholder="Project inquiry"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-white font-semibold mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white py-6 text-lg font-semibold transition-colors"
                style={{
                  backgroundColor: getPrimaryColor(),
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    const color = getPrimaryColor();
                    // Darken the color on hover
                    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 30);
                    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 30);
                    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 30);
                    e.target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = getPrimaryColor();
                  }
                }}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2" size={20} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
