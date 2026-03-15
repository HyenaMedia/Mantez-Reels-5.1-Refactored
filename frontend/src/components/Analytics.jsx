import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Analytics = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [posthogKey, setPosthogKey] = useState('');
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const checkAnalytics = () => {
      try {
        const consent = localStorage.getItem('user_preferences');
        if (!consent) return;
        
        const consentData = JSON.parse(consent);
        if (!consentData.analytics) return;

        if (settings.seo?.enableAnalytics && settings.seo?.posthogApiKey) {
          setAnalyticsEnabled(true);
          setPosthogKey(settings.seo.posthogApiKey);
        }
      } catch (_error) {
        console.error('Failed to check analytics preferences:', _error);
      }
    };

    checkAnalytics();

    const handleConsentChange = () => checkAnalytics();
    window.addEventListener('user-preferences-updated', handleConsentChange);
    return () => window.removeEventListener('user-preferences-updated', handleConsentChange);
  }, [settings]);

  useEffect(() => {
    if (analyticsEnabled && posthogKey) {
      // Load PostHog
      loadPostHog(posthogKey);
    }
  }, [analyticsEnabled, posthogKey]);

  const loadPostHog = (apiKey) => {
    // Check if already loaded
    if (window.posthog) return;

    // PostHog snippet
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    
    // Use backend proxy with neutral path to bypass ad blockers
    window.posthog.init(apiKey, {
      api_host: BACKEND_URL + '/api/proxy/stats',  // Neutral proxy path
      loaded: function(_posthog) {
      },
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
    });
  };

  // This component doesn't render anything visible
  return null;
};

export default Analytics;
