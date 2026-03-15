import React, { useState, useEffect, useRef } from 'react';
import { Cookie, Settings, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const CookieConsent = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });
  const { settings } = useSettings();
  const timerRef = useRef(null);

  const cb = settings?.cookieBanner;
  const bannerEnabled = cb?.enabled !== false;
  const colors = {
    backgroundColor: cb?.backgroundColor || '#111827',
    textColor: cb?.textColor || '#9ca3af',
    headingColor: cb?.headingColor || '#ffffff',
    acceptButtonColor: cb?.acceptButtonColor || '#9333ea',
    acceptButtonTextColor: cb?.acceptButtonTextColor || '#ffffff',
    rejectButtonColor: cb?.rejectButtonColor || '#374151',
    rejectButtonTextColor: cb?.rejectButtonTextColor || '#ffffff',
    manageButtonBorderColor: cb?.manageButtonBorderColor || '#4b5563',
    manageButtonTextColor: cb?.manageButtonTextColor || '#d1d5db',
    toggleActiveColor: cb?.toggleActiveColor || '#9333ea',
    toggleInactiveColor: cb?.toggleInactiveColor || '#4b5563',
  };

  // Only show on public frontend pages, not on /login or /admin routes
  const isPublicPage = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/login');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent && isPublicPage) {
      timerRef.current = setTimeout(() => setIsVisible(true), 1500);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (consent) {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        if (saved.analytics) {
          enableAnalytics();
        }
      } catch (e) {
        console.error('Failed to parse cookie consent preferences:', e);
      }
    }
  }, [isPublicPage]);

  const enableAnalytics = () => {
    window.analyticsConsent = true;
    window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
  };

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(allConsent));
    setPreferences(allConsent);
    enableAnalytics();
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    if (preferences.analytics) {
      enableAnalytics();
    }
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(minimalConsent));
    setPreferences(minimalConsent);
    setIsVisible(false);
  };

  if (!isVisible || !bannerEnabled || !isPublicPage) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 md:p-4 animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie consent settings"
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          style={{ backgroundColor: `${colors.backgroundColor}f2` }}
        >
          {/* Compact Main Banner */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.acceptButtonColor}20` }}
              >
                <Cookie style={{ color: colors.acceptButtonColor }} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-medium text-sm mb-1"
                  style={{ color: colors.headingColor }}
                >
                  Cookie Settings
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: colors.textColor }}>
                  We use cookies to enhance your experience.{' '}
                  <Link 
                    to="/privacy" 
                    className="underline hover:opacity-80"
                    style={{ color: colors.acceptButtonColor }}
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Cookie Details (expandable) */}
            {showDetails && (
              <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: colors.headingColor }}>Essential</p>
                    <p className="text-xs truncate" style={{ color: colors.textColor }}>Required for basic functionality</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-green-400 text-xs">Always on</span>
                    <div className="w-8 h-5 bg-green-600 rounded-full flex items-center justify-end px-0.5">
                      <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: colors.headingColor }}>Analytics</p>
                    <p className="text-xs truncate" style={{ color: colors.textColor }}>Help us improve our site</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Toggle analytics cookies"
                    className="w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ml-2"
                    style={{
                      backgroundColor: preferences.analytics ? colors.toggleActiveColor : colors.toggleInactiveColor,
                      justifyContent: preferences.analytics ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: colors.headingColor }}>Marketing</p>
                    <p className="text-xs truncate" style={{ color: colors.textColor }}>Personalized content</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="Toggle marketing cookies"
                    className="w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ml-2"
                    style={{
                      backgroundColor: preferences.marketing ? colors.toggleActiveColor : colors.toggleInactiveColor,
                      justifyContent: preferences.marketing ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {showDetails ? (
                <>
                  <Button
                    onClick={() => setShowDetails(false)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    style={{ 
                      borderColor: colors.manageButtonBorderColor,
                      color: colors.manageButtonTextColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Settings size={14} className="mr-1.5" />
                    Hide
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    size="sm"
                    className="text-xs h-8 px-4 flex-1"
                    style={{ 
                      backgroundColor: colors.rejectButtonColor,
                      color: colors.rejectButtonTextColor
                    }}
                  >
                    Reject All
                  </Button>
                  <Button
                    onClick={handleAcceptSelected}
                    size="sm"
                    className="text-xs h-8 px-4 flex-1"
                    style={{ 
                      backgroundColor: colors.acceptButtonColor,
                      color: colors.acceptButtonTextColor
                    }}
                  >
                    <Check size={14} className="mr-1.5" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setShowDetails(true)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    style={{ 
                      borderColor: colors.manageButtonBorderColor,
                      color: colors.manageButtonTextColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Settings size={14} className="mr-1.5" />
                    Manage Cookies
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="text-xs h-8 px-4 flex-1"
                    style={{ 
                      backgroundColor: colors.acceptButtonColor,
                      color: colors.acceptButtonTextColor
                    }}
                  >
                    Accept All
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export const openCookieSettings = () => {
  localStorage.removeItem('cookie_consent');
  window.location.reload();
};

export default CookieConsent;
