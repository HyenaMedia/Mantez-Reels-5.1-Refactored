import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useSettings } from '../contexts/SettingsContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { settings } = useSettings();

  const logoUrl = settings?.site?.logoUrl || '';
  const siteName = settings?.site?.siteName || 'Mantez Reels';

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      if (isHomePage) {
        const sections = ['hero', 'services', 'about', 'portfolio', 'contact'];
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const scrollToSection = (id) => {
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 80; // Minimal offset to show label at top with navbar clearance

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        setIsMobileMenuOpen(false);
      }
    } else {
      // Navigate to homepage with hash, which will trigger scroll on load
      setIsMobileMenuOpen(false);
      navigate(`/#${id}`);
    }
  };

  return (
    <nav
      className={`fixed ${isLoggedIn ? 'top-12' : 'top-0'} left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => {
              if (isHomePage) {
                // Clear hash and scroll to top on homepage
                window.history.replaceState(null, '', '/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                // Navigate to homepage without hash
                navigate('/', { replace: true });
                // After navigation, scroll to top and clear any hash
                setTimeout(() => {
                  window.history.replaceState(null, '', '/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                width="120" 
                height="40"
                className="h-8 md:h-10 w-auto object-contain" 
              />
            ) : (
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {siteName}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/projects"
              className="relative text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group outline-none focus:outline-none focus-visible:outline-none active:outline-none"
              aria-label="View all projects"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              Projects
              <span className={`absolute -bottom-1 left-0 h-[3px] bg-purple-600 transition-all duration-300 ease-out ${
                location.pathname === '/projects' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <button
              onClick={() => scrollToSection('services')}
              className="relative text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group outline-none focus:outline-none focus-visible:outline-none active:outline-none"
              aria-label="View our services"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              Services
              <span className={`absolute -bottom-1 left-0 h-[3px] bg-purple-600 transition-all duration-300 ease-out ${
                activeSection === 'services' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="relative text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group outline-none focus:outline-none focus-visible:outline-none active:outline-none"
              aria-label="Learn about us"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              About
              <span className={`absolute -bottom-1 left-0 h-[3px] bg-purple-600 transition-all duration-300 ease-out ${
                activeSection === 'about' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="relative text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group outline-none focus:outline-none focus-visible:outline-none active:outline-none"
              aria-label="Read resources and blog posts"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              Resources
              <span className={`absolute -bottom-1 left-0 h-[3px] bg-purple-600 transition-all duration-300 ease-out ${
                activeSection === 'blog' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
            
            {/* Theme & Language */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            
            <Button
              onClick={() => scrollToSection('contact')}
              className="bg-purple-600 hover:bg-purple-700 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              aria-label="Get in contact with us"
            >
              Contact
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white bg-gray-900/80 p-2 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-all backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            onKeyDown={(e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); }}
            className="md:hidden bg-black/95 backdrop-blur-lg py-6 px-4 space-y-2 border-t border-gray-700"
          >
            <Link
              to="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left text-white font-medium hover:text-purple-400 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg"
            >
              Projects
            </Link>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-white font-medium hover:text-purple-400 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-white font-medium hover:text-purple-400 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="block w-full text-left text-white font-medium hover:text-purple-400 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg"
            >
              Resources
            </button>
            <Button
              onClick={() => scrollToSection('contact')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4 py-6 text-base font-semibold"
            >
              Contact
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
