import React, { useState, useEffect, useRef, useCallback } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, className = '' }) => {
  const [QuillComponent, setQuillComponent] = useState(null);
  const quillRef = useRef(null);

  // Dynamic import to avoid concurrent rendering issues with React 19
  useEffect(() => {
    let cancelled = false;
    import('react-quill-new').then((mod) => {
      if (!cancelled) {
        // Also import the CSS
        import('react-quill-new/dist/quill.snow.css');
        setQuillComponent(() => mod.default);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Stable onChange handler
  const handleChange = useCallback((val) => {
    if (onChange) onChange(val);
  }, [onChange]);

  // Toolbar configuration
  const modules = React.useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  }), []);

  const formats = React.useMemo(() => [
    'header', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'align', 'link',
  ], []);

  if (!QuillComponent) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="min-h-[42px] bg-white/[0.04] border border-white/[0.08] rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <QuillComponent
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-white rounded-md"
      />
    </div>
  );
};

export default RichTextEditor;
