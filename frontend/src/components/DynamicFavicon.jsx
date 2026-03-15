import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const DynamicFavicon = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    const faviconUrl = settings.site?.faviconUrl;
    
    if (faviconUrl) {
      const existingLink = document.querySelector("link[rel='icon']");
      const existingAppleLink = document.querySelector("link[rel='apple-touch-icon']");

      if (existingLink) {
        existingLink.setAttribute('href', faviconUrl);
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }

      if (existingAppleLink) {
        if (faviconUrl.includes('192') || faviconUrl.includes('512')) {
          existingAppleLink.setAttribute('href', faviconUrl);
        }
      }
    }
  }, [settings]);

  return null;
};

export default DynamicFavicon;
