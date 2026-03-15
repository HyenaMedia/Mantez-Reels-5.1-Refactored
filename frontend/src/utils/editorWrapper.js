/**
 * EditorWrapper for Hero component
 * Overrides Hero's internal content fetch with editor-provided content
 */
import React, { useEffect, useState } from 'react';

export const withEditorContent = (Component) => {
  return function EditorWrappedComponent({ editorContent, isInEditor, ...props }) {
    if (!isInEditor) {
      // Not in editor, render normally
      return <Component {...props} />;
    }

    // In editor mode - we need to override the content
    // We'll use a wrapper that intercepts the fetch
    return <EditorContentProvider content={editorContent}>
      <Component {...props} />
    </EditorContentProvider>;
  };
};

const EditorContentProvider = ({ content, children }) => {
  useEffect(() => {
    if (!content) return;

    // Monkey-patch fetch for this component
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      
      // Intercept Hero content API call
      if (url && url.includes('/api/content/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content })
        });
      }
      
      // Other calls go through normally
      return originalFetch.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [content]);

  return children;
};

export default withEditorContent;
