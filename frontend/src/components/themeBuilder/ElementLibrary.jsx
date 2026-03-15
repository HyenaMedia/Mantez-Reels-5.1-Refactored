import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Type, AlignLeft, MousePointer, Image as ImageIcon, Video, Columns, Box, Minus,
  List, LayoutGrid, Sparkles, Search, Link, Quote, Code, Film, Music, Star,
  ToggleLeft, Calendar, Sliders, Upload, Send, ChevronDown, Layers, Navigation,
  BarChart2, Table, Clock, Tag, AlertCircle, TrendingUp, DollarSign, Share2,
  Youtube, Map, Twitter, Instagram, ChevronRight, CreditCard, ArrowUp, Cookie,
  Hash, Globe, Repeat, Grid, AlignJustify, SlidersHorizontal, CheckSquare,
  Radio, FileText, Phone
} from 'lucide-react';
import { Input } from '../ui/input';

const categories = [
  { id: 'basic',       name: 'Basic',       icon: Sparkles },
  { id: 'text',        name: 'Text',        icon: Type },
  { id: 'media',       name: 'Media',       icon: ImageIcon },
  { id: 'layout',      name: 'Layout',      icon: LayoutGrid },
  { id: 'interactive', name: 'Interactive', icon: MousePointer },
  { id: 'forms',       name: 'Forms',       icon: FileText },
  { id: 'data',        name: 'Data',        icon: BarChart2 },
  { id: 'social',      name: 'Social',      icon: Share2 },
  { id: 'navigation',  name: 'Navigation',  icon: Navigation },
  { id: 'content',     name: 'Content',     icon: Box },
];

const elements = {
  basic: [
    { id: 'heading',  name: 'Heading',  icon: Type,         description: 'H1–H6 headings',       defaultProps: { text: 'New Heading', tag: 'h2' },   defaultStyles: { typography: { fontSize: 32, fontWeight: 700, color: '#1f2937' }, spacing: { marginBottom: 16 } } },
    { id: 'text',     name: 'Text',     icon: AlignLeft,    description: 'Paragraph text',        defaultProps: { text: 'Add your text here...' },    defaultStyles: { typography: { fontSize: 16, color: '#4b5563' }, spacing: { marginBottom: 16 } } },
    { id: 'button',   name: 'Button',   icon: MousePointer, description: 'Call-to-action button', defaultProps: { text: 'Click Me', link: '#', variant: 'primary' }, defaultStyles: { background: '#8b5cf6', color: '#ffffff', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8, fontSize: 16, fontWeight: 600 } },
    { id: 'image',    name: 'Image',    icon: ImageIcon,    description: 'Image with caption',    defaultProps: { src: 'https://via.placeholder.com/600x400', alt: 'Image description' }, defaultStyles: { borderRadius: 8, maxWidth: '100%' } },
    { id: 'divider',  name: 'Divider',  icon: Minus,        description: 'Horizontal line',       defaultProps: {}, defaultStyles: { height: 1, background: '#e5e7eb', margin: { top: 24, bottom: 24 } } },
  ],

  text: [
    { id: 'heading',    name: 'Heading',     icon: Type,          description: 'H1–H6 headings',          defaultProps: { text: 'New Heading', tag: 'h2' },     defaultStyles: { typography: { fontSize: 32, fontWeight: 700, color: '#1f2937' } } },
    { id: 'text',       name: 'Paragraph',   icon: AlignLeft,     description: 'Body paragraph',          defaultProps: { text: 'Add your text here...' },      defaultStyles: { typography: { fontSize: 16, color: '#4b5563' } } },
    { id: 'link',       name: 'Link',        icon: Link,          description: 'Hyperlink text',          defaultProps: { text: 'Click here', href: '#' },      defaultStyles: { typography: { fontSize: 16, color: '#8b5cf6' } } },
    { id: 'list',       name: 'List',        icon: List,          description: 'Ordered / unordered',     defaultProps: { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false }, defaultStyles: { typography: { fontSize: 16, color: '#4b5563' } } },
    { id: 'blockquote', name: 'Blockquote',  icon: Quote,         description: 'Pull quote',              defaultProps: { text: 'Your quote here', author: 'Author Name' }, defaultStyles: { borderLeft: '4px solid #8b5cf6', paddingLeft: 16, fontStyle: 'italic' } },
    { id: 'richtext',   name: 'Rich Text',   icon: AlignJustify,  description: 'Formatted content',       defaultProps: { html: '<p>Start editing...</p>' }, defaultStyles: {} },
    { id: 'code',       name: 'Code Block',  icon: Code,          description: 'Syntax-highlighted code', defaultProps: { code: '// your code here', language: 'javascript' }, defaultStyles: { fontFamily: 'monospace', background: '#1f2937', color: '#f3f4f6', borderRadius: 8, padding: 16 } },
  ],

  media: [
    { id: 'image',    name: 'Image',           icon: ImageIcon, description: 'Photo / illustration',      defaultProps: { src: 'https://via.placeholder.com/600x400', alt: 'Alt text' }, defaultStyles: { borderRadius: 8, maxWidth: '100%' } },
    { id: 'video',    name: 'Video',           icon: Video,     description: 'Upload or embed URL',       defaultProps: { src: '', autoplay: false, controls: true }, defaultStyles: { borderRadius: 8, maxWidth: '100%' } },
    { id: 'youtube',  name: 'YouTube',         icon: Youtube,   description: 'YouTube embed',             defaultProps: { videoId: '', autoplay: false }, defaultStyles: { borderRadius: 8, aspectRatio: '16/9' } },
    { id: 'icon',     name: 'Icon',            icon: Star,      description: 'Lucide icon',               defaultProps: { name: 'star', size: 24, color: '#8b5cf6' }, defaultStyles: {} },
    { id: 'bgimage',  name: 'Background Image',icon: Layers,    description: 'Section background image',  defaultProps: { src: '', overlay: 0.5 }, defaultStyles: { backgroundSize: 'cover', backgroundPosition: 'center' } },
    { id: 'bgvideo',  name: 'Background Video',icon: Film,      description: 'Looping video background',  defaultProps: { src: '', muted: true, loop: true }, defaultStyles: {} },
    { id: 'audio',    name: 'Audio',           icon: Music,     description: 'Audio player',              defaultProps: { src: '', autoplay: false }, defaultStyles: {} },
  ],

  layout: [
    { id: 'section',   name: 'Section',   icon: Box,       description: 'Page section wrapper',  defaultProps: { name: 'New Section' }, defaultStyles: { padding: { top: 80, right: 24, bottom: 80, left: 24 }, background: { type: 'solid', color: '#ffffff' } } },
    { id: 'container', name: 'Container', icon: Box,       description: 'Max-width container',   defaultProps: {}, defaultStyles: { maxWidth: '1200px', margin: { left: 'auto', right: 'auto' }, padding: { left: 24, right: 24 } } },
    { id: 'columns',   name: 'Columns',   icon: Columns,   description: '2-column flex layout',  defaultProps: { columns: 2 }, defaultStyles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 } },
    { id: 'grid',      name: 'Grid',      icon: Grid,      description: 'CSS grid layout',       defaultProps: { cols: 3 }, defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 } },
    { id: 'row',       name: 'Row',       icon: AlignLeft, description: 'Horizontal flex row',   defaultProps: {}, defaultStyles: { display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center' } },
    { id: 'spacer',    name: 'Spacer',    icon: Minus,     description: 'Blank vertical space',  defaultProps: {}, defaultStyles: { height: 48 } },
    { id: 'divider',   name: 'Divider',   icon: Minus,     description: 'Horizontal rule',       defaultProps: {}, defaultStyles: { height: 1, background: '#e5e7eb', margin: { top: 24, bottom: 24 } } },
  ],

  interactive: [
    { id: 'button',      name: 'Button',       icon: MousePointer, description: 'CTA button',             defaultProps: { text: 'Click Me', link: '#', variant: 'primary' }, defaultStyles: { background: '#8b5cf6', color: '#ffffff', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8 } },
    { id: 'buttongroup', name: 'Button Group', icon: Layers,       description: 'Multiple buttons',       defaultProps: { buttons: [{ text: 'Primary', variant: 'primary' }, { text: 'Secondary', variant: 'outline' }] }, defaultStyles: { display: 'flex', gap: 12 } },
    { id: 'accordion',   name: 'Accordion',    icon: ChevronDown,  description: 'Expand / collapse items', defaultProps: { items: [{ title: 'Question 1', content: 'Answer 1' }, { title: 'Question 2', content: 'Answer 2' }] }, defaultStyles: {} },
    { id: 'tabs',        name: 'Tabs',         icon: Layers,       description: 'Tabbed content',         defaultProps: { tabs: [{ label: 'Tab 1', content: 'Content 1' }, { label: 'Tab 2', content: 'Content 2' }] }, defaultStyles: {} },
    { id: 'modal',       name: 'Modal',        icon: Box,          description: 'Popup / dialog',         defaultProps: { triggerText: 'Open Modal', title: 'Modal Title', content: 'Modal content' }, defaultStyles: {} },
    { id: 'dropdown',    name: 'Dropdown',     icon: ChevronDown,  description: 'Select dropdown',        defaultProps: { label: 'Select option', options: ['Option 1', 'Option 2', 'Option 3'] }, defaultStyles: {} },
    { id: 'tooltip',     name: 'Tooltip',      icon: AlertCircle,  description: 'Hover tooltip',          defaultProps: { text: 'Tooltip text', position: 'top' }, defaultStyles: {} },
    { id: 'toggle',      name: 'Toggle',       icon: ToggleLeft,   description: 'On / off switch',        defaultProps: { label: 'Toggle label', checked: false }, defaultStyles: {} },
  ],

  forms: [
    { id: 'form',        name: 'Form',          icon: FileText,      description: 'Form container',      defaultProps: { submitText: 'Submit', successMessage: 'Thank you!' }, defaultStyles: {}, formFields: [] },
    { id: 'input',       name: 'Text Input',    icon: AlignLeft,     description: 'Single-line input',   defaultProps: { label: 'Label', placeholder: 'Enter value...', type: 'text', required: false }, defaultStyles: {} },
    { id: 'textarea',    name: 'Textarea',      icon: AlignJustify,  description: 'Multi-line text',     defaultProps: { label: 'Message', placeholder: 'Your message...', rows: 4 }, defaultStyles: {} },
    { id: 'select',      name: 'Select',        icon: ChevronDown,   description: 'Dropdown select',     defaultProps: { label: 'Select', options: ['Option 1', 'Option 2'] }, defaultStyles: {} },
    { id: 'checkbox',    name: 'Checkbox',      icon: CheckSquare,   description: 'Checkbox input',      defaultProps: { label: 'I agree', checked: false }, defaultStyles: {} },
    { id: 'radio',       name: 'Radio Group',   icon: Radio,         description: 'Radio button group',  defaultProps: { label: 'Choose one', options: ['Option 1', 'Option 2'] }, defaultStyles: {} },
    { id: 'fileupload',  name: 'File Upload',   icon: Upload,        description: 'File picker',         defaultProps: { label: 'Upload file', accept: '*' }, defaultStyles: {} },
    { id: 'datepicker',  name: 'Date Picker',   icon: Calendar,      description: 'Date / time input',   defaultProps: { label: 'Select date', type: 'date' }, defaultStyles: {} },
    { id: 'rangeslider', name: 'Range Slider',  icon: Sliders,       description: 'Numeric slider',      defaultProps: { label: 'Value', min: 0, max: 100, value: 50 }, defaultStyles: {} },
    { id: 'submitbtn',   name: 'Submit Button', icon: Send,          description: 'Form submit',         defaultProps: { text: 'Submit', variant: 'primary' }, defaultStyles: {} },
    { id: 'phone',       name: 'Phone Input',   icon: Phone,         description: 'Phone number field',  defaultProps: { label: 'Phone', placeholder: '+1 234 567 8900' }, defaultStyles: {} },
  ],

  data: [
    { id: 'counter',     name: 'Counter',       icon: Hash,              description: 'Animated number',    defaultProps: { value: 1000, suffix: '+', label: 'Customers' }, defaultStyles: { typography: { fontSize: 48, fontWeight: 700 } } },
    { id: 'progressbar', name: 'Progress Bar',  icon: SlidersHorizontal, description: 'Percentage bar',     defaultProps: { label: 'Skill', value: 80, color: '#8b5cf6' }, defaultStyles: {} },
    { id: 'table',       name: 'Table',         icon: Table,             description: 'Data table',         defaultProps: { headers: ['Name', 'Value'], rows: [['Item 1', '100'], ['Item 2', '200']] }, defaultStyles: {} },
    { id: 'statcard',    name: 'Stat Card',     icon: TrendingUp,        description: 'KPI / metric card',  defaultProps: { label: 'Revenue', value: '$12,400', change: '+12%', positive: true }, defaultStyles: { padding: 24, borderRadius: 12 } },
    { id: 'timeline',    name: 'Timeline',      icon: Clock,             description: 'Vertical timeline',  defaultProps: { items: [{ date: '2024', title: 'Event 1', description: 'Description' }] }, defaultStyles: {} },
    { id: 'pricing',     name: 'Pricing Table', icon: DollarSign,        description: 'Plan comparison',    defaultProps: { plans: [{ name: 'Basic', price: '$9', features: ['Feature 1'] }] }, defaultStyles: {} },
    { id: 'badge',       name: 'Badge',         icon: Tag,               description: 'Label / tag',        defaultProps: { text: 'New', variant: 'success' }, defaultStyles: { borderRadius: 9999, padding: { top: 4, right: 12, bottom: 4, left: 12 } } },
    { id: 'alert',       name: 'Alert',         icon: AlertCircle,       description: 'Notification banner', defaultProps: { message: 'Alert message', type: 'info', dismissible: true }, defaultStyles: { borderRadius: 8, padding: 16 } },
    { id: 'chart',       name: 'Chart',         icon: BarChart2,         description: 'Bar / line chart',   defaultProps: { type: 'bar', labels: ['Jan', 'Feb', 'Mar'], data: [10, 20, 15] }, defaultStyles: {} },
  ],

  social: [
    { id: 'socialshare',    name: 'Social Share',   icon: Share2,    description: 'Share buttons',          defaultProps: { platforms: ['twitter', 'facebook', 'linkedin'] }, defaultStyles: { display: 'flex', gap: 8 } },
    { id: 'socialfollow',   name: 'Social Follow',  icon: Star,      description: 'Follow / subscribe',     defaultProps: { platform: 'instagram', handle: '@youraccount' }, defaultStyles: {} },
    { id: 'youtubeembed',   name: 'YouTube',        icon: Youtube,   description: 'YouTube embed',          defaultProps: { videoId: 'dQw4w9WgXcQ' }, defaultStyles: { borderRadius: 8, aspectRatio: '16/9' } },
    { id: 'twitterembed',   name: 'Twitter / X',    icon: Twitter,   description: 'Tweet embed',            defaultProps: { tweetUrl: '' }, defaultStyles: {} },
    { id: 'instagramembed', name: 'Instagram',      icon: Instagram, description: 'Instagram post embed',   defaultProps: { postUrl: '' }, defaultStyles: {} },
    { id: 'googlemaps',     name: 'Google Maps',    icon: Map,       description: 'Embedded map',           defaultProps: { address: 'New York, NY', zoom: 14 }, defaultStyles: { borderRadius: 8, height: 400 } },
    { id: 'embed',          name: 'Embed',          icon: Globe,     description: 'Generic iframe / script', defaultProps: { code: '<iframe src="..."></iframe>' }, defaultStyles: {} },
  ],

  navigation: [
    { id: 'breadcrumbs',  name: 'Breadcrumbs',   icon: ChevronRight, description: 'Navigation path',      defaultProps: { items: ['Home', 'Blog', 'Article'] }, defaultStyles: {} },
    { id: 'pagination',   name: 'Pagination',    icon: AlignLeft,    description: 'Page numbers',         defaultProps: { total: 10, current: 1 }, defaultStyles: {} },
    { id: 'searchbar',    name: 'Search Bar',    icon: Search,       description: 'Search input',         defaultProps: { placeholder: 'Search...', action: '' }, defaultStyles: {} },
    { id: 'carousel',     name: 'Carousel',      icon: Repeat,       description: 'Sliding content',      defaultProps: { slides: [{ content: 'Slide 1' }, { content: 'Slide 2' }], autoplay: false }, defaultStyles: {} },
    { id: 'imagegallery', name: 'Image Gallery', icon: Grid,         description: 'Grid photo gallery',   defaultProps: { images: [], columns: 3 }, defaultStyles: {} },
    { id: 'countdown',    name: 'Countdown',     icon: Clock,        description: 'Count-down timer',     defaultProps: { targetDate: '', label: 'Launching in' }, defaultStyles: {} },
    { id: 'cookiebanner', name: 'Cookie Banner', icon: Cookie,       description: 'GDPR cookie notice',   defaultProps: { message: 'We use cookies to enhance your experience.' }, defaultStyles: {} },
    { id: 'backtotop',    name: 'Back to Top',   icon: ArrowUp,      description: 'Scroll-to-top button', defaultProps: { label: '' }, defaultStyles: {} },
  ],

  content: [
    { id: 'card',      name: 'Card',       icon: CreditCard, description: 'Content card',    defaultProps: { title: 'Card Title', description: 'Card description goes here' }, defaultStyles: { padding: 24, borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
    { id: 'video',     name: 'Video',      icon: Video,      description: 'Video player',    defaultProps: { src: '', autoplay: false }, defaultStyles: { borderRadius: 8, maxWidth: '100%' } },
    { id: 'queryloop', name: 'Query Loop', icon: Repeat,     description: 'Dynamic content', defaultProps: {}, defaultStyles: {}, query: { postType: 'blog', filters: { category: '', limit: 6 }, sort: { field: 'publishedAt', order: 'desc' } } },
    { id: 'form',      name: 'Form',       icon: FileText,   description: 'Contact form',    defaultProps: {}, defaultStyles: {}, formFields: [], formSettings: { submitText: 'Submit', successMessage: 'Thank you!', sendToEmail: 'admin@example.com' } },
  ],
};

const ElementLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('basic');

  const allElements = Object.values(elements).flat();

  const displayedElements = searchQuery
    ? allElements.filter(el =>
        el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (elements[activeCategory] || []);

  return (
    <div className="w-80 h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Elements</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Category tabs — hidden while searching */}
      {!searchQuery && (
        <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-1 p-2 min-w-max">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.name}
                  aria-current={activeCategory === cat.id ? 'page' : undefined}
                  className={`
                    flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors min-w-[48px]
                    ${activeCategory === cat.id
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon size={15} />
                  <span className="leading-none">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Elements list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {searchQuery && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {displayedElements.length} result{displayedElements.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
        {displayedElements.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8" role="status">No elements found</div>
        ) : (
          displayedElements.map((element, i) => (
            <DraggableElement key={`${activeCategory}-${element.id}-${i}`} element={element} />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Drag elements onto the canvas to add them
        </p>
      </div>
    </div>
  );
};

const DraggableElement = React.memo(({ element }) => {
  // Stable ID per mount — must not change across renders
  const stableId = React.useRef(`library-${element.id}-${Math.random().toString(36).slice(2)}`);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: stableId.current,
    data: {
      type: 'library-element',
      elementType: element.id,
      defaultProps: element.defaultProps,
      defaultStyles: element.defaultStyles,
    }
  });

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20
        cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shrink-0">
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{element.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{element.description}</p>
        </div>
      </div>
    </div>
  );
});

export default ElementLibrary;
