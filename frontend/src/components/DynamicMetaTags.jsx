import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const DynamicMetaTags = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // Update page title
    if (settings.seo?.siteTitle) {
      document.title = `${settings.seo.siteTitle} | Professional Videographer & Photographer Portfolio`;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && settings.seo?.metaDescription) {
      metaDescription.setAttribute('content', settings.seo.metaDescription);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && settings.seo?.metaKeywords) {
      metaKeywords.setAttribute('content', settings.seo.metaKeywords);
    }

    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && settings.seo?.siteTitle) {
      ogTitle.setAttribute(
        'content',
        `${settings.seo.siteTitle} | Professional Videographer & Photographer`
      );
    }

    // Update OG description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && settings.seo?.ogDescription) {
      ogDescription.setAttribute('content', settings.seo.ogDescription);
    }

    // Update OG image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && settings.seo?.ogImage) {
      ogImage.setAttribute('content', settings.seo.ogImage);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && settings.seo?.siteTitle) {
      twitterTitle.setAttribute(
        'content',
        `${settings.seo.siteTitle} | Professional Videographer & Photographer`
      );
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && settings.seo?.ogDescription) {
      twitterDescription.setAttribute('content', settings.seo.ogDescription);
    }

    // Update Twitter image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && settings.seo?.ogImage) {
      twitterImage.setAttribute('content', settings.seo.ogImage);
    }
  }, [settings]);

  return null; // This component doesn't render anything
};

export default DynamicMetaTags;
