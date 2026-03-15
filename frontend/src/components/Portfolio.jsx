import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import portfolioService from '../services/portfolioService';
import { DEMO_PROJECTS } from '../data/portfolioData';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';

const PortfolioCard = ({ item, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
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
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cardRef.current?.querySelector('button')?.click();
        }
      }}
      className="group relative overflow-hidden rounded-3xl bg-gray-900 opacity-0 transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-900/30 cursor-pointer"
      style={{
        transform: 'translateY(30px)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={item.thumbnail}
          srcSet={
            item.thumbnail.includes('unsplash')
              ? `
            ${item.thumbnail.split('?')[0]}?w=400&q=45&fm=webp 400w,
            ${item.thumbnail.split('?')[0]}?w=600&q=45&fm=webp 600w
          `
              : undefined
          }
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />

        {/* Subtle overlay on image - only darkens on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>

        {/* Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      {/* Centered Play Button - Only appears on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 pointer-events-none">
        <div className="relative">
          {/* Animated ripple rings */}
          <div className="absolute -inset-8">
            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping"></div>
            <div
              className="absolute inset-2 border-2 border-purple-400/30 rounded-full animate-pulse"
              style={{ animationDuration: '2s' }}
            ></div>
          </div>

          {/* Play button with glassmorphism */}
          <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-110 hover:border-purple-400/50 transition-all duration-300" aria-label={`Play ${item.title}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
            <Play className="text-white relative z-10 ml-1.5" size={36} fill="white" />
          </div>
        </div>
      </div>

      {/* Bottom Content Card with Glassmorphism */}
      <div className="absolute inset-x-0 bottom-0 z-10 group-hover:opacity-80 transition-opacity duration-500">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent"></div>

        {/* Content container */}
        <div className="relative backdrop-blur-sm border-t border-white/10 p-6">
          {/* Category Badge */}
          <Badge
            variant="secondary"
            className="mb-3 bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-600/30 text-xs px-3 py-1 transition-colors"
          >
            {item.category}
          </Badge>

          {/* Title - Always visible */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 line-clamp-1">
            {item.title}
          </h3>

          {/* Description - Expands on hover */}
          <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
            <p className="text-gray-300 mb-2 text-sm line-clamp-2">{item.description}</p>
            <p className="text-gray-400 text-xs mb-3 flex items-center gap-2">
              <span className="text-purple-400">{item.client}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span>{item.year}</span>
            </p>
          </div>

          {/* View Project Link - Appears on hover */}
          <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-12 opacity-0 group-hover:opacity-100 pt-2 border-t border-white/5">
            <button className="text-white hover:text-purple-300 text-sm font-medium flex items-center gap-2 transition-colors">
              View Project
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const titleRef = useRef(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioService.getAll();
      if (response.data.items && response.data.items.length > 0) {
        setPortfolioItems(response.data.items);
      } else {
        setPortfolioItems(DEMO_PROJECTS);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      toast({ title: 'Failed to load portfolio', variant: 'destructive' });
      setPortfolioItems(DEMO_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <section id="work" className="py-24 px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Latest projects</h2>
          </div>
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-800 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="work"
      className="pt-12 pb-20 md:pt-14 md:pb-24 px-6 lg:px-8 bg-black relative overflow-hidden scroll-mt-20"
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              Portfolio
            </span>
          </div>
          <h2 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span style={{ color: '#ffffff' }}>Latest </span>
            <span style={{ color: '#c084fc' }}>Projects</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            Cinematic stories that captivate and inspire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {portfolioItems.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/projects">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-600/50 px-8"
            >
              View All Projects
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
