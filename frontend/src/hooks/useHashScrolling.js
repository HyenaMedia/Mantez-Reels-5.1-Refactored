import { useEffect } from 'react';

/**
 * Custom hook to handle hash-based navigation and smooth scrolling
 * Automatically scrolls to elements based on URL hash
 */
export const useHashScrolling = () => {
  useEffect(() => {
    // Handle hash-based navigation from other pages
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash) {

      const timeoutIds = [];

      // Function to attempt scroll
      const scrollToHash = () => {
        const element = document.getElementById(hash);
        if (element) {
          // Scroll to element with a delay to ensure rendering
          const scrollTimeout = setTimeout(() => {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 80; // Minimal offset to show label at top

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }, 100);
          timeoutIds.push(scrollTimeout);
          return true;
        }
        return false;
      };

      // Try multiple times with increasing delays
      if (!scrollToHash()) {
        timeoutIds.push(setTimeout(scrollToHash, 800));
        timeoutIds.push(setTimeout(scrollToHash, 1500));
      }

      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
      };
    }
  }, []);
};
