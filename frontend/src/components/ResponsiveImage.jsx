import React from 'react';

/**
 * Responsive Image Component with srcset for optimal performance
 * Automatically generates different image sizes for various viewports
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  _aspectRatio = 'aspect-video',
}) => {
  // Generate responsive image URLs (for Unsplash images)
  const generateSrcSet = (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('unsplash')) {
      return null;
    }

    // Extract base URL without query params
    const baseUrl = imageUrl.split('?')[0];

    // Generate different widths
    return `
      ${baseUrl}?w=400&q=65&fm=webp 400w,
      ${baseUrl}?w=800&q=65&fm=webp 800w,
      ${baseUrl}?w=1200&q=65&fm=webp 1200w,
      ${baseUrl}?w=1600&q=75 1600w
    `.trim();
  };

  const srcSet = generateSrcSet(src);

  return (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      className={className}
    />
  );
};

export default ResponsiveImage;
