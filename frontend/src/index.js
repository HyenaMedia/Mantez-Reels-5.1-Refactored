import React from 'react';
import { createRoot } from 'react-dom/client';
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

// Clear any pre-rendered content from react-snap to avoid hydration mismatches.
// Dynamic components (Portfolio, Blog, etc.) start with loading states that differ
// from the pre-rendered final state, causing React error #418 and potential crashes.
// The app-shell loading screen covers the brief re-render, so UX is unaffected.
if (rootElement.hasChildNodes()) {
  rootElement.innerHTML = '';
}

const AppTree = (
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);

createRoot(rootElement).render(AppTree);
