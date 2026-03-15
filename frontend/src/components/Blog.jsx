import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import useApiData from '../hooks/useApiData';

const BlogCard = ({ post, index }) => {
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
      className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-500 opacity-0"
      style={{
        transform: 'translateY(30px)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={post.thumbnail}
          srcSet={
            post.thumbnail.includes('unsplash')
              ? `
            ${post.thumbnail.split('?')[0]}?w=400&q=65&fm=webp 400w,
            ${post.thumbnail.split('?')[0]}?w=800&q=65&fm=webp 800w,
            ${post.thumbnail.split('?')[0]}?w=1200&q=65&fm=webp 1200w
          `
              : undefined
          }
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary" className="bg-purple-600/80 text-white rich-text-content">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.category) }} />
          </Badge>
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar size={14} className="mr-1" />
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors rich-text-content">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title) }} />
        </h3>
        <div className="text-gray-400 mb-4 leading-relaxed rich-text-content">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt) }} />
        </div>
        <Button variant="ghost" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
          Read More <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
};

const Blog = () => {
  const titleRef = useRef(null);

  const { data: blogPosts } = useApiData('/api/content/blog', {
    initialData: [],
    transform: (resp) => resp.posts || [],
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
      id="blog"
      className="pt-12 pb-20 md:pt-14 px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-12 opacity-0">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              Resources
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Curated Insights &
            <span className="block mt-2 pb-2 leading-[1.15] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              creative resources
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">Tips, tutorials, and behind-the-scenes content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id || `blog-${index}`} post={post} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600"
          >
            View All Articles
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
