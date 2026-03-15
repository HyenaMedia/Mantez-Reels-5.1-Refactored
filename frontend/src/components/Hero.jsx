import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Hero = ({ editorContent, isInEditor }) => {
  const heroRef = useRef(null);
  const [content, setContent] = useState({
    brandName: 'Mantez Reels',
    tagline: "hello, I'm Manos - a videographer, photographer,",
    tagline2: 'and designer, based in Greece.',
    description: 'I bring ideas to life through cinematic visuals and complete creative direction.',
    availabilityBadge: 'Available for Inquiries',
    ctaText: 'Send me a message',
  });
  const [, setLoading] = useState(true);

  const fetchContent = useCallback(async (signal) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/content/hero`, { signal });
      if (response.data.content) {
        const data = response.data.content;
        setContent({
          brandName: data.brand_name || 'Mantez Reels',
          tagline: data.tagline_line1 || "hello, I'm Manos - a videographer, photographer,",
          tagline2: data.tagline_line2 || 'and designer, based in Greece.',
          description:
            data.description ||
            'I bring ideas to life through cinematic visuals and complete creative direction.',
          availabilityBadge: data.availability_badge || 'Available for Inquiries',
          ctaText: data.cta_button_text || 'Send me a message',
        });
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch hero content:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // If editor content provided, use it immediately
    if (isInEditor && editorContent) {
      setContent({
        brandName: editorContent.brand_name || content.brandName,
        tagline: editorContent.tagline_line1 || content.tagline,
        tagline2: editorContent.tagline_line2 || content.tagline2,
        description: editorContent.description || content.description,
        availabilityBadge: editorContent.availability_badge || content.availabilityBadge,
        ctaText: editorContent.cta_button_text || content.ctaText,
        // Add font families
        brandNameFontFamily: editorContent.brand_name_font_family,
        taglineFontFamily: editorContent.tagline_font_family,
        descriptionFontFamily: editorContent.description_font_family,
      });
      return;
    }

    // Otherwise fetch from API
    const controller = new AbortController();
    fetchContent(controller.signal);
    return () => controller.abort();
  }, [fetchContent, isInEditor, editorContent, content.brandName, content.tagline, content.tagline2, content.description, content.availabilityBadge, content.ctaText]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Simplified Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500">
        {/* Static gradient blobs - only in dark mode */}
        <div className="absolute inset-0 opacity-0 dark:opacity-40 transition-opacity duration-500" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] mix-blend-overlay pointer-events-none transition-opacity duration-500"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      {/* Content */}
      <div
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center opacity-0"
      >
        {/* Main Heading - Responsive sizing */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 tracking-tight leading-[0.9] animate-fade-in-up
                     bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white
                     bg-clip-text text-transparent"
          style={{ 
            animationDelay: '0.2s',
            fontFamily: content.brandNameFontFamily ? `'${content.brandNameFontFamily}', sans-serif` : undefined
          }}
        >
          {content.brandName}
        </h1>

        {/* Tagline - Consolidated into single line on mobile */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 dark:text-gray-300 font-light leading-relaxed max-w-4xl mx-auto rich-text-content"
            style={{
              fontFamily: content.taglineFontFamily ? `'${content.taglineFontFamily}', sans-serif` : undefined
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.tagline) }} />{' '}
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.tagline2) }} />
          </div>
        </div>

        {/* Description - Simplified and more concise */}
        <div
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-gray-400 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up rich-text-content"
          style={{ 
            animationDelay: '0.6s',
            fontFamily: content.descriptionFontFamily ? `'${content.descriptionFontFamily}', sans-serif` : undefined
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.description) }} />
        </div>

        {/* CTA Button - Responsive sizing */}
        <div
          className="mb-8 sm:mb-12 md:mb-16 animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <Button
            onClick={scrollToContact}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 sm:px-10 py-4 sm:py-6 md:py-7 text-base sm:text-lg group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-600/50 w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center">
              {content.ctaText}
              <ArrowRight
                className="ml-2 group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </span>
          </Button>
        </div>

        {/* Scroll Indicator - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex mt-12 lg:mt-16 flex-col items-center gap-2 animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-purple-400 rounded-full animate-scroll"></div>
          </div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
