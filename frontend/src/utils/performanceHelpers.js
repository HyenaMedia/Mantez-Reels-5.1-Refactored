// Performance Monitoring and Optimization Utilities
import DOMPurify from 'dompurify';

export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 16.67) { // Slower than 60fps
      }
      return duration;
    };
  },

  // Measure API call performance
  measureAPI: async (apiName, apiCall) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      return result;
    } catch (error) {
      console.error(`API call "${apiName}" failed after ${(performance.now() - start).toFixed(1)}ms:`, error);
      throw error;
    }
  },

  // Get Lighthouse-style score
  getPerformanceScore: () => {
    if (!window.performance || !window.performance.timing) {
      return null;
    }

    const timing = window.performance.timing;
    const metrics = {
      // Time to First Byte
      ttfb: timing.responseStart - timing.requestStart,
      // DOM Content Loaded
      dcl: timing.domContentLoadedEventEnd - timing.navigationStart,
      // Load Complete
      load: timing.loadEventEnd - timing.navigationStart,
      // First Paint (if available)
      fp: null,
      // First Contentful Paint (if available)
      fcp: null,
    };

    // Get paint timing if available
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.fp = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
      });
    }

    // Calculate score (simplified Lighthouse-like scoring)
    let score = 100;
    if (metrics.fcp > 3000) score -= 20;
    else if (metrics.fcp > 1800) score -= 10;
    
    if (metrics.load > 8000) score -= 20;
    else if (metrics.load > 4000) score -= 10;
    
    if (metrics.ttfb > 600) score -= 10;
    else if (metrics.ttfb > 200) score -= 5;

    return {
      score: Math.max(0, score),
      metrics,
      rating: score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor'
    };
  },

  // Report Core Web Vitals
  reportWebVitals: (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      // Optional: install web-vitals package for detailed metrics
      // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      //   getCLS(onPerfEntry);
      //   getFID(onPerfEntry);
      //   getFCP(onPerfEntry);
      //   getLCP(onPerfEntry);
      //   getTTFB(onPerfEntry);
      // });
    }
  }
};

export const optimizationHelpers = {
  // Debounce function calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function calls
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images with Intersection Observer
  lazyLoadImages: (imageSelector = 'img[data-src]') => {
    const images = document.querySelectorAll(imageSelector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  // Optimize image URL with responsive sizing
  optimizeImageUrl: (url, width, quality = 80) => {
    // Add query params for image optimization service
    // This assumes you have an image optimization service
    const params = new URLSearchParams({
      w: width,
      q: quality,
      auto: 'format', // Auto-convert to WebP/AVIF if supported
    });
    return `${url}?${params.toString()}`;
  },

  // Preload critical resources
  preloadResource: (href, as, type) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Prefetch next page
  prefetchPage: (url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  // Measure memory usage
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      };
    }
    return null;
  },

  // Generate critical CSS
  extractCriticalCSS: (html) => {
    // This is a simplified version
    // In production, use libraries like critical or penthouse
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    
    const usedSelectors = new Set();
    const elements = tempDiv.querySelectorAll('*');
    
    elements.forEach(el => {
      // Get all classes
      el.classList.forEach(cls => usedSelectors.add(`.${cls}`));
      // Get ID
      if (el.id) usedSelectors.add(`#${el.id}`);
      // Get tag
      usedSelectors.add(el.tagName.toLowerCase());
    });
    
    return Array.from(usedSelectors);
  },

  // Code splitting helper
  dynamicImport: async (modulePath) => {
    return import(modulePath);
  },

  // Bundle size analyzer (for build stats)
  analyzeBundleSize: (stats) => {
    const totalSize = stats.reduce((acc, chunk) => acc + chunk.size, 0);
    const largChunks = stats.filter(chunk => chunk.size > 244000); // 244KB threshold
    
    return {
      total: (totalSize / 1024).toFixed(2) + ' KB',
      chunks: stats.length,
      warnings: largChunks.length > 0 ? `${largChunks.length} chunks exceed 244KB` : null,
      largeChunks: largChunks.map(c => ({ name: c.name, size: (c.size / 1024).toFixed(2) + ' KB' }))
    };
  }
};

export const cacheHelpers = {
  // Service Worker registration
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register('/sw.js');
    }
  },

  // Cache API helpers
  cacheResource: async (cacheName, url) => {
    if ('caches' in window) {
      const cache = await caches.open(cacheName);
      await cache.add(url);
    }
  },

  getCachedResource: async (cacheName, url) => {
    if ('caches' in window) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      return response;
    }
    return null;
  },

  clearCache: async (cacheName) => {
    if ('caches' in window) {
      await caches.delete(cacheName);
    }
  }
};

export default {
  performanceMonitor,
  optimizationHelpers,
  cacheHelpers
};