import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const JsonLdSchema = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const siteUrl = settings.site?.siteUrl || '';
    const siteName = settings.site?.siteName || 'Mantez Reels';
    const contactEmail = settings.site?.contactEmail || '';
    const logoUrl = settings.site?.logoUrl || '';
    const ogImage = settings.seo?.ogImage || '';
    const description = settings.seo?.metaDescription || `${siteName} — professional videographer and photographer portfolio.`;
    const social = settings.social || {};

    const sameAs = [
      social.instagram,
      social.youtube,
      social.vimeo,
      social.tiktok,
      social.linkedin,
      social.twitter,
      social.facebook,
    ].filter(Boolean);

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${siteUrl}/#person`,
          name: siteName,
          url: siteUrl,
          image: ogImage || logoUrl || undefined,
          email: contactEmail || undefined,
          jobTitle: 'Videographer & Photographer',
          description,
          knowsAbout: ['Videography', 'Photography', 'Video Production', 'Cinematography', 'Reels'],
          ...(sameAs.length > 0 && { sameAs }),
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: siteUrl,
          name: siteName,
          description,
          publisher: { '@id': `${siteUrl}/#person` },
        },
        {
          '@type': 'ProfessionalService',
          '@id': `${siteUrl}/#business`,
          name: siteName,
          url: siteUrl,
          logo: logoUrl || undefined,
          email: contactEmail || undefined,
          description,
          serviceType: 'Videography and Photography',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Creative Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Video Production & Cinematography' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Short-form Reels & Social Media Content' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Photography' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Event Videography' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Post-production & Editing' } },
            ],
          },
        },
      ],
    };

    // Remove undefined values for clean JSON
    const cleanSchema = JSON.parse(JSON.stringify(schema, (_k, v) => (v === undefined ? undefined : v)));

    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'json-ld-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(cleanSchema, null, 2);
    document.head.appendChild(script);
  }, [settings]);

  return null;
};

export default JsonLdSchema;
