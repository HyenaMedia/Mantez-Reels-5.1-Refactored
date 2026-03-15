import React from 'react';
import DOMPurify from 'dompurify';
import { useSettings } from '../contexts/SettingsContext';
import useApiData from '../hooks/useApiData';

const Footer = () => {
  const { settings } = useSettings();

  const logoUrl = settings?.site?.logoUrl || '';
  const siteName = settings?.site?.siteName || 'Mantez Reels';

  const { data: footerContent } = useApiData('/api/content/footer', {
    initialData: null,
    transform: (resp) => (resp.success ? resp.content : null),
  });

  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                width="120"
                height="48"
                className="h-10 md:h-12 w-auto object-contain mb-4"
              />
            ) : (
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {siteName}
                </span>
              </h3>
            )}
            <div className="text-gray-300 leading-relaxed mb-6 rich-text-content">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    footerContent?.description ||
                    'Bringing ideas to life through cinematic visuals and complete creative direction. Based in Greece, working worldwide.'
                  ),
                }}
              />
            </div>
          </div>

          {/* Quick Links - Two Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigate</h3>
            <ul className="space-y-2">
              <li>
                <a href="#work" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">More</h3>
            <ul className="space-y-2">
              <li>
                <a href="#blog" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem('cookie_consent');
                    window.location.reload();
                  }}
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Cookie Settings
                </button>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                  data-testid="footer-admin-link"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          {/* Copyright and HyenaMedia - Single centered line */}
          <div className="text-center">
            <p className="text-gray-400 text-sm whitespace-nowrap flex items-center justify-center flex-wrap gap-1">
              <span>© {new Date().getFullYear()}</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(footerContent?.copyright_text || 'Mantez Reels. All rights reserved.'),
                }}
              />
              <span>•</span>
              <span className="flex items-center gap-1">
                Made with <span className="text-red-500">❤️</span> from
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent font-semibold">
                HyenaMedia
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
