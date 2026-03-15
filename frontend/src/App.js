import React, { useEffect, lazy, Suspense } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollProgress from './components/ScrollProgress';
import DynamicMetaTags from './components/DynamicMetaTags';
import DynamicFavicon from './components/DynamicFavicon';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import Analytics from './components/Analytics';
import JsonLdSchema from './components/JsonLdSchema';
import { useHashScrolling } from './hooks/useHashScrolling';
import AdminTopbar from './components/admin/AdminTopbar';

// Lazy load heavy components for better performance
const Portfolio = lazy(() => import('./components/Portfolio'));
const Services = lazy(() => import('./components/Services'));
const About = lazy(() => import('./components/About'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const FAQ = lazy(() => import('./components/FAQ'));
const Blog = lazy(() => import('./components/Blog'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ThemeBuilder = lazy(() => import('./pages/ThemeBuilder'));
const ThemePreview = lazy(() => import('./pages/ThemePreview'));
const VisualBuilder = lazy(() => import('./pages/VisualBuilder'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const HomePage = () => {
  // Use custom hook for hash-based scrolling
  useHashScrolling();
  
  const [sections, setSections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  // Check if user is logged in (state reserved for future use)
  const [, setIsLoggedIn] = React.useState(false);
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Component mapping
  const componentMap = {
    hero: Hero,
    portfolio: Portfolio,
    services: Services,
    about: About,
    testimonials: Testimonials,
    faq: FAQ,
    blog: Blog,
    contact: Contact,
    footer: Footer
  };

  React.useEffect(() => {
    const loadSectionOrder = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pages/home/public`);
        const data = await response.json();
        
        if (data.page?.sections && data.page.sections.length > 0) {
          // Use saved order
          setSections(data.page.sections.filter(s => s.visible !== false));
        } else {
          // Fall back to default order
          setSections([
            { id: 'hero', visible: true, order: 0 },
            { id: 'portfolio', visible: true, order: 1 },
            { id: 'services', visible: true, order: 2 },
            { id: 'about', visible: true, order: 3 },
            { id: 'testimonials', visible: true, order: 4 },
            { id: 'faq', visible: true, order: 5 },
            { id: 'blog', visible: true, order: 6 },
            { id: 'contact', visible: true, order: 7 },
            { id: 'footer', visible: true, order: 8 }
          ]);
        }
      } catch (error) {
        console.error('Error loading section order:', error);
        // Fall back to default order on error
        setSections([
          { id: 'hero', visible: true, order: 0 },
          { id: 'portfolio', visible: true, order: 1 },
          { id: 'services', visible: true, order: 2 },
          { id: 'about', visible: true, order: 3 },
          { id: 'testimonials', visible: true, order: 4 },
          { id: 'faq', visible: true, order: 5 },
          { id: 'blog', visible: true, order: 6 },
          { id: 'contact', visible: true, order: 7 },
          { id: 'footer', visible: true, order: 8 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSectionOrder();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <>
      <DynamicMetaTags />
      <ScrollProgress />
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        {sections.map((section) => {
          const Component = componentMap[section.id];
          return Component ? <Component key={section.id} /> : null;
        })}
      </Suspense>
    </>
  );
};

function App() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Fade out the loading shell once React has fully hydrated
    // Use requestAnimationFrame to ensure this runs AFTER hydration completes
    const rafId = requestAnimationFrame(() => {
      const shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.transition = 'opacity 0.35s ease';
        shell.style.opacity = '0';
        timeoutId = setTimeout(() => {
          shell.remove();
        }, 380);
      }
    });
    let timeoutId;
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FeatureFlagProvider>
          <SettingsProvider>
            <div className="App bg-black">
              <DynamicFavicon />
              <JsonLdSchema />
              <Analytics />
              <AdminTopbar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/preview" element={<ThemePreview />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/theme-builder"
                    element={
                      <ProtectedRoute>
                        <ThemeBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/visual-builder"
                    element={
                      <ProtectedRoute>
                        <VisualBuilder />
                      </ProtectedRoute>
                    }
                  />
                  {/* 404 - Catch all unmatched routes */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
              <CookieConsent />
              <Toaster />
            </div>
          </SettingsProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
