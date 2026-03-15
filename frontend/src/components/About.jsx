import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const About = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const [content, setContent] = useState({
    title: 'About Me',
    description:
      "I'm a passionate videographer and photographer dedicated to capturing life's most beautiful moments.",
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=50&auto=format&fit=crop&fm=webp',
  });
  const [, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/about`, { signal: controller.signal });
        if (response.data.content) {
          const data = response.data.content;
          setContent({
            title: data.title || 'About Me',
            description: Array.isArray(data.description)
              ? data.description.join('\n\n')
              : data.description,
            imageUrl:
              data.image_url ||
              'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=50&auto=format&fit=crop&fm=webp',
          });
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    return () => controller.abort();
  }, []);

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

    [sectionRef.current, imageRef.current].forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="pt-12 pb-20 md:pt-14 px-6 lg:px-8 bg-black relative overflow-hidden scroll-mt-20"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Label */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              About Me
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="opacity-0 order-2 lg:order-1"
            style={{ transform: `translateY(${scrollY * -0.3}px)` }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={content.imageUrl}
                srcSet={
                  content.imageUrl.includes('unsplash')
                    ? `
                  ${content.imageUrl.split('?')[0]}?w=600&q=65&fm=webp 600w,
                  ${content.imageUrl.split('?')[0]}?w=900&q=65&fm=webp 900w,
                  ${content.imageUrl.split('?')[0]}?w=1200&q=65&fm=webp 1200w
                `
                    : undefined
                }
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={content.title}
                width="600"
                height="400"
                loading="lazy"
                className="relative rounded-2xl w-full object-cover shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Content */}
          <div
            ref={sectionRef}
            className="opacity-0 order-1 lg:order-2"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 rich-text-content">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.title) }} />
            </h2>

            <div className="space-y-6 text-gray-300 leading-relaxed text-lg rich-text-content">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.description) }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
