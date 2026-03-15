import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@/index.css';
import App from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/i18n'; // Initialize i18n

// Suppress non-fatal errors in development that trigger the CRA error overlay
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver loop')) {
      e.stopImmediatePropagation();
    }
  });
}

const rootElement = document.getElementById('root');

const AppTree = (
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);

// If react-snap pre-rendered this route, hydrate the existing DOM.
// Otherwise do a normal SPA mount (admin, login, etc.)
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, AppTree);
} else {
  createRoot(rootElement).render(AppTree);
}
