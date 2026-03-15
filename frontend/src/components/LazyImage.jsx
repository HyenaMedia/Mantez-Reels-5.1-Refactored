import React, { useEffect, useRef, useState } from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

/**
 * Optimized Image Component with Lazy Loading
 * Automatically handles lazy loading, responsive images, and WebP support
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  srcSet,
  sizes,
  loading = 'lazy',
  placeholder = 'blur',
  onLoad,
  ...props
}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgElement);

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const optimizedSrc = getOptimizedImageUrl(src);

  // Derive meaningful alt text: use provided alt, fall back to filename from src, or generic description
  const meaningfulAlt = alt || (src ? decodeURIComponent(src.split('/').pop().split('?')[0].replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '')) : 'Image');

  return (
    <div
      ref={imgRef}
      role="img"
      aria-label={meaningfulAlt}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"
          style={{ backdropFilter: 'blur(20px)' }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={meaningfulAlt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
