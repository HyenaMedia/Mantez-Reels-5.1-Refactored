import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setShowScrollTop(scrollPercentage > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollTop) return null;

  // Use React Portal to render button directly in body, bypassing React tree
  return ReactDOM.createPortal(
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 group animate-fade-in cursor-pointer"
      aria-label="Scroll to top"
      style={{
        pointerEvents: 'auto !important',
        zIndex: 99999,
        position: 'fixed',
      }}
    >
      <ArrowUp
        className="text-white group-hover:translate-y-[-2px] transition-transform"
        size={24}
      />
    </button>,
    document.body
  );
};

export default ScrollToTopButton;
