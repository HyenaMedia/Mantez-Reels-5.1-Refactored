import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  Video, Film, Scissors, Sparkles, Palette, Camera, Music, Paintbrush,
  Monitor, Pen, Image, Layers, Zap, Eye, Globe, Heart, Star, Award,
  Target, Users, Play, Mic, Headphones, Aperture, Clapperboard, Tv,
  Wand2, Brush, PenTool, Layout, Code, Smartphone, Box, Megaphone,
} from 'lucide-react';

// Curated icon map for service icons (admin-configurable)
const iconMap = {
  Video, Film, Scissors, Sparkles, Palette, Camera, Music, Paintbrush,
  Monitor, Pen, Image, Layers, Zap, Eye, Globe, Heart, Star, Award,
  Target, Users, Play, Mic, Headphones, Aperture, Clapperboard, Tv,
  Wand2, Brush, PenTool, Layout, Code, Smartphone, Box, Megaphone,
};

import useApiData from '../hooks/useApiData';

const ServiceCard = ({ service, index }) => {
  const cardRef = useRef(null);
  const IconComponent = iconMap[service.icon];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) rotateX(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-600/20 transition-all duration-500 opacity-0 hover:-translate-y-2"
      style={{
        transform: 'translateY(30px)',
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative w-16 h-16 rounded-xl bg-purple-600/20 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-all duration-300 overflow-hidden">
        {/* Shimmer effect - use will-change for compositor */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 will-change-transform"></div>
        {IconComponent && (
          <IconComponent
            className="text-purple-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10"
            size={30}
          />
        )}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors rich-text-content">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.title) }} />
      </h3>
      <div className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors rich-text-content">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.description) }} />
      </div>
    </div>
  );
};

const Services = () => {
  const titleRef = useRef(null);

  const { data: services } = useApiData('/api/content/services', {
    initialData: [],
    transform: (resp) => resp.services || [],
  });

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

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      className="pt-12 pb-20 md:pt-14 md:pb-24 px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden scroll-mt-20"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div ref={titleRef} className="text-center mb-16 opacity-0">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              Services
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Services that bring your
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-[1.15] pb-2"
              style={{
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              vision to life
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light">My creative toolbox</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* Tools section temporarily disabled - can be re-enabled by adding tools to ContentEditor */}
      </div>
    </section>
  );
};

export default Services;
