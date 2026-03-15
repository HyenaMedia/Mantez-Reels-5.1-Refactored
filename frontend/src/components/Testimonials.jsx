import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from './ui/button';
import useApiData from '../hooks/useApiData';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);

  const { data: testimonials } = useApiData('/api/content/testimonials', {
    initialData: [],
    transform: (resp) => resp.testimonials || [],
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials.length > 0 ? testimonials[currentIndex] : null;

  if (!currentTestimonial) {
    return null; // Don't render if no testimonials
  }

  return (
    <section
      id="testimonials"
      className="pt-12 pb-20 md:pt-14 px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto">
        <div ref={sectionRef} className="text-center mb-12 opacity-0">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Trusted by <span className="text-purple-400">many</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">What clients say about working with me</p>
        </div>

        <div className="relative">
          {/* Testimonial Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700 relative overflow-hidden">
            {/* Quote Icon - Smaller and more subtle */}
            <Quote className="absolute top-6 right-6 text-purple-600/10" size={60} />

            <div className="relative z-10">
              {/* Quote marks inline with text */}
              <div className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                <span className="text-purple-400 text-2xl font-serif">"</span>
                <span
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTestimonial.content) }}
                />
                <span className="text-purple-400 text-2xl font-serif">"</span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.avatar}
                  srcSet={
                    currentTestimonial.avatar.includes('unsplash')
                      ? `
                    ${currentTestimonial.avatar.split('?')[0]}?w=64&q=65&fm=webp 64w,
                    ${currentTestimonial.avatar.split('?')[0]}?w=128&q=65&fm=webp 128w
                  `
                      : undefined
                  }
                  sizes="64px"
                  alt={currentTestimonial.name}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div>
                  <p className="text-white font-semibold text-base">
                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTestimonial.name) }} />
                  </p>
                  <div className="text-gray-400 text-sm">
                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTestimonial.role) }} />
                  </div>
                  <div className="text-purple-400 text-xs">
                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTestimonial.company) }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              onClick={prevTestimonial}
              variant="outline"
              size="icon"
              className="border-gray-700 hover:border-purple-500 hover:bg-purple-600/20"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="text-white" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-purple-500 w-8' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextTestimonial}
              variant="outline"
              size="icon"
              className="border-gray-700 hover:border-purple-500 hover:bg-purple-600/20"
              aria-label="Next testimonial"
            >
              <ChevronRight className="text-white" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
