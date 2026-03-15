/**
 * Image Optimization Utilities
 * Provides lazy loading and responsive image loading
 */

/**
 * Lazy load images with Intersection Observer
 * @param {string} selector - CSS selector for images to lazy load
 */
export const initLazyLoading = (selector = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          const srcset = img.getAttribute('data-srcset');

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll(selector).forEach((img) => {
      const src = img.getAttribute('data-src');
      const srcset = img.getAttribute('data-srcset');
      
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
    });
  }
};

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Generate responsive image srcset
 * @param {string} baseUrl - Base URL of the image
 * @param {number[]} widths - Array of widths for responsive images
 * @returns {string} - srcset string
 */
export const generateSrcSet = (baseUrl, widths = [320, 640, 960, 1280, 1920]) => {
  return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
};

/**
 * Check if WebP is supported
 * @returns {Promise<boolean>}
 */
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimized image URL based on device pixel ratio
 * @param {string} url - Original image URL
 * @param {number} dpr - Device pixel ratio (default: window.devicePixelRatio)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, dpr = window.devicePixelRatio || 1) => {
  if (!url) return '';
  
  // If it's a backend URL, add quality and width parameters
  if (url.startsWith('/media/') || url.startsWith('/api/')) {
    const separator = url.includes('?') ? '&' : '?';
    const quality = dpr > 1 ? 80 : 85;
    return `${url}${separator}q=${quality}&dpr=${Math.min(dpr, 2)}`;
  }
  
  return url;
};

/**
 * Decode images for smoother rendering
 * @param {HTMLImageElement} img - Image element to decode
 * @returns {Promise<void>}
 */
export const decodeImage = async (img) => {
  if ('decode' in img) {
    try {
      await img.decode();
    } catch (error) {
      console.error('Failed to decode image:', error);
    }
  }
};
