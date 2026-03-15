import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Portfolio from '../components/Portfolio';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const ThemePreview = () => {
  const [themeConfig, setThemeConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First try to get theme from sessionStorage (for live preview)
    const previewTheme = sessionStorage.getItem('previewTheme');

    if (previewTheme) {
      try {
        const parsed = JSON.parse(previewTheme);
        setThemeConfig(parsed);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to parse preview theme from sessionStorage:', error);
      }
    } else {
      // Fallback: fetch from backend
      const controller = new AbortController();
      const fetchThemeConfigInit = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/theme/config/public`, { signal: controller.signal });
          const data = await response.json();
          setThemeConfig(data);
        } catch (error) {
          if (error.name === 'AbortError') return;
          console.error('Failed to fetch theme config:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchThemeConfigInit();
      return () => controller.abort();
    }
  }, []);

  const fetchThemeConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/theme/config/public`);
      const data = await response.json();
      setThemeConfig(data);
    } catch (error) {
      console.error('Failed to fetch theme config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply theme styles dynamically
  useEffect(() => {
    if (!themeConfig) return;

    const style = document.createElement('style');
    style.id = 'dynamic-theme-styles';
    
    const { sections, typography, globalColors } = themeConfig;
    
    let css = `
      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        font-family: ${typography.headingFont}, sans-serif !important;
      }
      body, p, span, div {
        font-family: ${typography.bodyFont}, sans-serif !important;
      }
      html {
        font-size: ${typography.scale}% !important;
      }

      /* Global Colors */
      :root {
        --color-primary: ${globalColors.primary};
        --color-secondary: ${globalColors.secondary};
        --color-accent: ${globalColors.accent};
      }
    `;

    // Apply section-specific styles
    Object.entries(sections).forEach(([sectionId, config]) => {
      const sectionClass = `.preview-${sectionId}`;
      
      // Background styles
      if (config.backgroundType === 'gradient') {
        const angle = config.gradientAngle || 135;
        const color1 = config.gradientColors[0];
        const color2 = config.gradientColors[1];
        css += `
          ${sectionClass} {
            background: linear-gradient(${angle}deg, ${color1}, ${color2}) !important;
            padding-top: ${config.padding.top}px !important;
            padding-bottom: ${config.padding.bottom}px !important;
          }
        `;
      } else if (config.backgroundType === 'solid') {
        css += `
          ${sectionClass} {
            background-color: ${config.solidColor} !important;
            padding-top: ${config.padding.top}px !important;
            padding-bottom: ${config.padding.bottom}px !important;
          }
        `;
      }
      
      // Text colors
      css += `
        ${sectionClass} h1, ${sectionClass} h2, ${sectionClass} h3, 
        ${sectionClass} h4, ${sectionClass} h5, ${sectionClass} h6 {
          color: ${config.headingColor} !important;
        }
        ${sectionClass} p, ${sectionClass} span, ${sectionClass} div {
          color: ${config.bodyColor} !important;
        }
      `;
      
      if (config.linkColor) {
        css += `
          ${sectionClass} a {
            color: ${config.linkColor} !important;
          }
        `;
      }
    });

    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('dynamic-theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [themeConfig]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="theme-preview">
      <Navbar />
      <div className="preview-hero">
        <Hero />
      </div>
      <div className="preview-portfolio">
        <Portfolio />
      </div>
      <div className="preview-services">
        <Services />
      </div>
      <div className="preview-about">
        <About />
      </div>
      <div className="preview-contact">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default ThemePreview;
