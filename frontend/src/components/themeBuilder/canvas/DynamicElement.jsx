import React from 'react';
import {
  Star, Heart, Home, Mail, Phone, User, Users, Settings, Search, Bell,
  Calendar, Camera, Check, Clock, Cloud, Code, Download, Edit2,
  Eye, File, Folder, Globe, Info, Link, List, Lock, MapPin, Menu,
  Music, Play, Send, Share2, ShoppingCart, Smartphone, Sun, Tag, Target,
  ThumbsUp, Type, Upload, Video, Wifi, Zap, AlertCircle, Award,
  BookOpen, Box, Database, DollarSign, Flag, Layers, Lightbulb,
  MessageCircle, Moon, Palette, PieChart, Shield, TrendingUp,
  X, Minus, Plus, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ExternalLink,
  Youtube, Image as ImageIcon, Cpu, Package, RotateCw,
} from 'lucide-react';
import DOMPurify from 'dompurify';

/* -- Icon lookup map for the <icon> element -- */
const ICON_MAP = {
  star: Star, heart: Heart, home: Home, mail: Mail, phone: Phone,
  user: User, users: Users, settings: Settings, search: Search, bell: Bell,
  calendar: Calendar, camera: Camera, check: Check, clock: Clock, cloud: Cloud,
  code: Code, download: Download, edit: Edit2, eye: Eye, file: File,
  folder: Folder, globe: Globe, info: Info, link: Link, list: List,
  lock: Lock, 'map-pin': MapPin, mappin: MapPin, menu: Menu, music: Music,
  play: Play, send: Send, share: Share2, 'shopping-cart': ShoppingCart,
  shoppingcart: ShoppingCart, smartphone: Smartphone, sun: Sun, tag: Tag,
  target: Target, 'thumbs-up': ThumbsUp, thumbsup: ThumbsUp, type: Type,
  upload: Upload, video: Video, wifi: Wifi, zap: Zap, alert: AlertCircle,
  award: Award, book: BookOpen, box: Box, database: Database,
  dollar: DollarSign, flag: Flag, layers: Layers, lightbulb: Lightbulb,
  message: MessageCircle, moon: Moon, palette: Palette, chart: PieChart,
  shield: Shield, trending: TrendingUp, youtube: Youtube, image: ImageIcon,
  cpu: Cpu, package: Package, refresh: RotateCw, x: X, minus: Minus, plus: Plus,
  'arrow-left': ArrowLeft, 'arrow-right': ArrowRight,
  'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  external: ExternalLink, 'external-link': ExternalLink,
};

/* -- Sub-components for interactive elements that need local state -- */

const AccordionElement = ({ items = [], styles }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={styles} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.title}</span>
            <span className={`transition-transform ${open === i ? 'rotate-180' : ''}`}>&#x25BE;</span>
          </button>
          {open === i && (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TabsElement = ({ tabs = [], styles }) => {
  const [active, setActive] = React.useState(0);
  return (
    <div style={styles}>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === i
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
        {tabs[active]?.content || ''}
      </div>
    </div>
  );
};

const CarouselElement = ({ slides = [], styles }) => {
  const [idx, setIdx] = React.useState(0);
  return (
    <div style={styles} className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 min-h-32">
      <div className="flex items-center justify-center h-32 text-gray-600 dark:text-gray-400 text-sm">
        {slides[idx]?.content || `Slide ${idx + 1}`}
      </div>
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3 pb-3">
          <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded shadow">&#x2039;</button>
          <span className="text-xs text-gray-500">{idx + 1} / {slides.length}</span>
          <button onClick={() => setIdx((idx + 1) % slides.length)} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded shadow">&#x203A;</button>
        </div>
      )}
    </div>
  );
};

const CountdownElement = ({ targetDate, label = 'Launching in', styles }) => {
  const calc = () => {
    const diff = Math.max(0, new Date(targetDate) - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]); // eslint-disable-line
  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={styles} className="text-center">
      {label && <p className="text-sm text-gray-500 mb-2">{label}</p>}
      {targetDate ? (
        <div className="flex justify-center gap-4">
          {[['Days', time.d], ['Hours', time.h], ['Min', time.m], ['Sec', time.s]].map(([unit, val]) => (
            <div key={unit} className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 min-w-[56px]">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{pad(val)}</span>
              <span className="text-xs text-gray-500">{unit}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Set a target date in the Inspector</p>
      )}
    </div>
  );
};

/* -- Canvas placeholder wrapper -- */
const CanvasPlaceholder = ({ icon, label, description, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-2 p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center ${className}`}>
    {icon && <span className="text-2xl">{icon}</span>}
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    {description && <span className="text-xs text-gray-400 dark:text-gray-500">{description}</span>}
  </div>
);

/**
 * DynamicElement - Renders element based on type
 */
const DynamicElement = ({ element, styles }) => {
  const p = element.props || {};

  switch (element.type) {

    /* -- BASIC / TEXT -- */

    case 'heading': {
      const Tag = p.tag || 'h2';
      return <Tag style={styles}>{p.text || 'Heading'}</Tag>;
    }

    case 'text':
      return <p style={styles}>{p.text || 'Paragraph text'}</p>;

    case 'link':
      return (
        <a
          href={p.href || '#'}
          style={styles}
          className="underline cursor-pointer hover:opacity-80"
          onClick={e => e.preventDefault()}
        >
          {p.text || 'Link'}
        </a>
      );

    case 'list': {
      const isOrdered = p.listType === 'ordered' || p.ordered === true;
      const Tag = isOrdered ? 'ol' : 'ul';
      const items = p.items || ['Item 1', 'Item 2', 'Item 3'];
      return (
        <Tag style={styles} className={isOrdered ? 'list-decimal pl-5' : 'list-disc pl-5'}>
          {items.map((item, i) => <li key={i} className="mb-1">{item}</li>)}
        </Tag>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '1rem', fontStyle: 'italic', ...styles }}
          className="text-gray-700 dark:text-gray-300"
        >
          <p>{p.text || 'Your quote here'}</p>
          {p.author && <cite className="block mt-2 text-sm text-gray-500 not-italic">&mdash; {p.author}</cite>}
        </blockquote>
      );

    case 'richtext': {
      // Support both p.html (canonical) and p.text (legacy plain-text fallback)
      const html = p.html || (p.text ? `<p>${p.text.replace(/\n/g, '</p><p>')}</p>` : '<p>Start editing rich text\u2026</p>');
      return (
        <div
          style={styles}
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      );
    }

    case 'code':
      return (
        <pre
          style={{ fontFamily: 'monospace', background: '#1f2937', color: '#f3f4f6', borderRadius: 8, padding: 16, overflowX: 'auto', ...styles }}
        >
          <code>{p.code || '// your code here'}</code>
        </pre>
      );

    /* -- BASIC -- */

    case 'button': {
      const variant = p.variant || 'primary';
      const VARIANT_STYLES = {
        primary:   { backgroundColor: '#8b5cf6', color: '#fff', border: '2px solid #8b5cf6', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        secondary: { backgroundColor: '#6b7280', color: '#fff', border: '2px solid #6b7280', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        outline:   { backgroundColor: 'transparent', color: '#8b5cf6', border: '2px solid #8b5cf6', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        ghost:     { backgroundColor: 'transparent', color: '#8b5cf6', border: '2px solid transparent', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        link:      { backgroundColor: 'transparent', color: '#8b5cf6', border: 'none', padding: '0', textDecoration: 'underline', fontWeight: 600 },
      };
      const variantBase = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
      return (
        <a
          href={p.link || '#'}
          style={{ display: 'inline-block', textAlign: 'center', cursor: 'pointer', transition: 'opacity .2s', textDecoration: 'none', ...variantBase, ...styles }}
          onClick={e => e.preventDefault()}
        >
          {p.text || 'Button'}
        </a>
      );
    }

    case 'image':
      return (
        <img
          src={p.src || 'https://via.placeholder.com/600x400'}
          alt={p.alt || ''}
          style={styles}
          className="max-w-full h-auto"
        />
      );

    case 'divider':
      return <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb', ...styles }} />;

    case 'spacer':
      return <div style={{ height: p.height || 48, ...styles }} />;

    /* -- MEDIA -- */

    case 'video':
      return p.src ? (
        <video
          src={p.src}
          controls={p.controls !== false}
          autoPlay={p.autoplay}
          muted={p.autoplay}
          loop={p.loop}
          style={styles}
          className="w-full rounded-lg"
        />
      ) : (
        <CanvasPlaceholder icon="\uD83C\uDFAC" label="Video" description="Set a video URL in the Inspector" />
      );

    case 'youtube':
    case 'youtubeembed': {
      const vid = p.videoId || '';
      return vid ? (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, ...styles }}>
          <iframe
            src={`https://www.youtube.com/embed/${vid}${p.autoplay ? '?autoplay=1&mute=1' : ''}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: 8 }}
          />
        </div>
      ) : (
        <CanvasPlaceholder icon="\u25B6\uFE0F" label="YouTube Embed" description="Set a Video ID in the Inspector" />
      );
    }

    case 'icon': {
      const iconKey = (p.name || p.icon || 'star').toLowerCase().replace(/\s+/g, '-');
      const IconComp = ICON_MAP[iconKey] || ICON_MAP[iconKey.replace(/-/g, '')] || Star;
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...styles }}>
          <IconComp size={p.size || 24} color={p.color || '#8b5cf6'} strokeWidth={p.strokeWidth || 2} />
        </div>
      );
    }

    case 'bgimage':
      return (
        <div
          style={{
            minHeight: 120,
            backgroundImage: p.src ? `url(${p.src})` : 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 8,
            position: 'relative',
            ...styles,
          }}
        >
          {p.overlay > 0 && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlay || 0.3})`, borderRadius: 8 }} />
          )}
          {!p.src && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm opacity-80">Background Image</span>
            </div>
          )}
        </div>
      );

    case 'bgvideo':
      return p.src ? (
        <div style={{ position: 'relative', minHeight: 160, borderRadius: 8, overflow: 'hidden', ...styles }}>
          <video
            src={p.src}
            autoPlay
            muted={p.muted !== false}
            loop={p.loop !== false}
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {(p.overlay > 0) && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlay || 0.4})`, borderRadius: 8 }} />
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            {"\uD83C\uDFA5"} Background Video
          </div>
        </div>
      ) : (
        <CanvasPlaceholder icon={"\uD83C\uDFA5"} label="Background Video" description="Set a video URL in the Inspector" />
      );

    case 'audio':
      return p.src ? (
        <audio src={p.src} controls className="w-full" style={styles} />
      ) : (
        <CanvasPlaceholder icon={"\uD83C\uDFB5"} label="Audio Player" description="Set an audio URL in the Inspector" />
      );

    /* -- LAYOUT -- */

    case 'container':
      return (
        <div
          style={{ maxWidth: p.maxWidth || '1200px', margin: '0 auto', padding: `0 ${p.paddingX || 24}px`, minHeight: 60, ...styles }}
          className="relative border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-md"
        >
          <span className="absolute top-1 left-2 text-[10px] font-mono text-violet-400 dark:text-violet-500 select-none">
            container {p.maxWidth || '1200px'}
          </span>
          <div className="pt-5 pb-2 text-xs text-violet-300 dark:text-violet-600 text-center italic">
            Drop child elements here
          </div>
        </div>
      );

    case 'columns':
    case 'row': {
      const cols = element.type === 'row' ? (p.columns || p.cols || 2) : (p.columns || 2);
      const gapSize = p.gap || 16;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gapSize, ...styles }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-md p-3 min-h-[60px] flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-mono text-blue-400 dark:text-blue-500">col {i + 1}</span>
              <span className="text-[9px] text-blue-300 dark:text-blue-600 italic">Drop elements</span>
            </div>
          ))}
        </div>
      );
    }

    case 'grid': {
      const cols = p.cols || p.columns || 3;
      const rows = p.rows || 2;
      const gapSize = p.gap || 16;
      const total = cols * rows;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gapSize, ...styles }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-md p-3 min-h-[50px] flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-mono text-green-400 dark:text-green-500">cell {i + 1}</span>
            </div>
          ))}
        </div>
      );
    }

    /* -- INTERACTIVE -- */

    case 'buttongroup': {
      const buttons = p.buttons || [{ text: 'Primary', variant: 'primary' }, { text: 'Secondary', variant: 'outline' }];
      return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', ...styles }}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
                btn.variant === 'outline'
                  ? 'border border-violet-500 text-violet-600 bg-transparent'
                  : 'bg-violet-500 text-white'
              }`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      );
    }

    case 'accordion':
      return <AccordionElement items={p.items} styles={styles} />;

    case 'tabs':
      return <TabsElement tabs={p.tabs} styles={styles} />;

    case 'modal':
      return (
        <div style={styles}>
          <button className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium">
            {p.triggerText || 'Open Modal'}
          </button>
          <span className="ml-3 text-xs text-gray-400 italic">Modal: &quot;{p.title || 'Modal Title'}&quot;</span>
        </div>
      );

    case 'dropdown':
      return (
        <div style={styles}>
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-xs">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );

    case 'tooltip':
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...styles }}>
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm border border-gray-200 dark:border-gray-700">Hover me</span>
          <span className="text-xs text-gray-400">&rarr; &quot;{p.text || 'Tooltip text'}&quot;</span>
        </div>
      );

    case 'toggle': {
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', ...styles }}>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${p.checked ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${p.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          {p.label && <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>}
        </label>
      );
    }

    /* -- FORMS -- */

    case 'form':
      return (
        <div style={{ border: '2px dashed #8b5cf6', borderRadius: 8, padding: 16, ...styles }}>
          <p className="text-xs text-violet-500 font-medium mb-2">Form Container</p>
          <button className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg text-sm">{p.submitText || 'Submit'}</button>
        </div>
      );

    case 'input':
    case 'phone':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <input
            type={element.type === 'phone' ? 'tel' : (p.type || 'text')}
            placeholder={p.placeholder || 'Enter value...'}
            disabled
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      );

    case 'textarea':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <textarea
            placeholder={p.placeholder || 'Your message...'}
            rows={p.rows || 4}
            disabled
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </div>
      );

    case 'select':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <select disabled className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...styles }}>
          <input type="checkbox" defaultChecked={p.checked} disabled className="w-4 h-4 accent-violet-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{p.label || 'Checkbox'}</span>
        </label>
      );

    case 'radio':
      return (
        <div style={styles}>
          {p.label && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{p.label}</p>}
          <div className="flex flex-col gap-2">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => (
              <label key={i} className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name={element.id} disabled className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'fileupload':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400">{"\uD83D\uDCCE"} Click or drag to upload</p>
            <p className="text-xs text-gray-400 mt-1">{p.accept || 'Any file'}</p>
          </div>
        </div>
      );

    case 'datepicker':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <input
            type={p.type || 'date'}
            disabled
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      );

    case 'rangeslider':
      return (
        <div style={styles} className="w-full">
          {p.label && (
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.label}</label>
              <span className="text-sm text-gray-500">{p.value ?? 50}</span>
            </div>
          )}
          <input
            type="range"
            min={p.min ?? 0}
            max={p.max ?? 100}
            defaultValue={p.value ?? 50}
            disabled
            className="w-full accent-violet-500"
          />
        </div>
      );

    case 'submitbtn':
      return (
        <button style={styles} className="px-6 py-2.5 bg-violet-500 text-white rounded-lg text-sm font-medium hover:opacity-90">
          {p.text || 'Submit'}
        </button>
      );

    /* -- DATA -- */

    case 'counter':
      return (
        <div style={{ textAlign: 'center', ...styles }}>
          <div className="text-5xl font-bold text-gray-900 dark:text-white">
            {p.prefix || ''}{(p.value ?? p.end ?? 1000).toLocaleString()}{p.suffix ?? '+'}
          </div>
          {p.label && <p className="mt-1 text-sm text-gray-500">{p.label}</p>}
        </div>
      );

    case 'progressbar':
      return (
        <div style={styles} className="w-full">
          {p.label && (
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.label}</span>
              <span className="text-sm text-gray-500">{p.value ?? 80}%</span>
            </div>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${p.value ?? 80}%`, backgroundColor: p.color || '#8b5cf6' }}
            />
          </div>
        </div>
      );

    case 'table': {
      const headers = p.headers || ['Name', 'Value'];
      const rows = p.rows || [['Item 1', '100'], ['Item 2', '200']];
      return (
        <div style={styles} className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="even:bg-gray-50/50 dark:even:bg-gray-800/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'statcard':
      return (
        <div style={{ padding: 24, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', ...styles }} className="dark:bg-gray-800 dark:shadow-none">
          <p className="text-sm text-gray-500 dark:text-gray-400">{p.label || 'Revenue'}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{p.value || '$12,400'}</p>
          {p.change && (
            <p className={`text-sm mt-1 ${p.positive ? 'text-green-500' : 'text-red-500'}`}>
              {p.positive ? '\u2191' : '\u2193'} {p.change}
            </p>
          )}
        </div>
      );

    case 'timeline': {
      const items = p.items || [{ date: '2024', title: 'Event 1', description: 'Description' }];
      return (
        <div style={styles} className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          {items.map((item, i) => (
            <div key={i} className="relative pl-10 pb-6">
              <div className="absolute left-2.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-white dark:border-gray-900" />
              <span className="text-xs text-gray-400">{item.date}</span>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.title}</h4>
              {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    case 'pricing': {
      const plans = p.plans || [{ name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] }];
      return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', ...styles }}>
          {plans.map((plan, i) => (
            <div key={i} className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{plan.name}</h3>
              <div className="text-3xl font-bold text-violet-600 my-3">{plan.price}<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                {(plan.features || []).map((f, j) => <li key={j}>{"\u2713"} {f}</li>)}
              </ul>
              <button className="w-full py-2 bg-violet-500 text-white rounded-lg text-sm">Choose Plan</button>
            </div>
          ))}
        </div>
      );
    }

    case 'badge': {
      const variantClasses = {
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        error:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      };
      return (
        <span
          style={styles}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantClasses[p.variant] || variantClasses.default}`}
        >
          {p.text || 'Badge'}
        </span>
      );
    }

    case 'alert': {
      const alertClasses = {
        info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',    text: 'text-blue-800 dark:text-blue-300',    icon: '\u2139\uFE0F' },
        success: { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-800 dark:text-green-300',  icon: '\u2705' },
        warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-yellow-200 dark:border-yellow-800',text: 'text-yellow-800 dark:text-yellow-300',icon: '\u26A0\uFE0F' },
        error:   { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      text: 'text-red-800 dark:text-red-300',      icon: '\u274C' },
      };
      const a = alertClasses[p.type || 'info'];
      return (
        <div style={{ borderRadius: 8, padding: 16, ...styles }} className={`flex items-start gap-3 border ${a.bg} ${a.border}`}>
          <span>{a.icon}</span>
          <p className={`text-sm ${a.text}`}>{p.message || 'Alert message'}</p>
        </div>
      );
    }

    case 'chart': {
      const data = p.data || [10, 20, 15, 25, 18];
      const labels = p.labels || data.map((_, i) => `${i + 1}`);
      const max = Math.max(...data);
      return (
        <div style={styles} className="w-full">
          <div className="flex items-end gap-1.5 h-24">
            {data.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-violet-400 dark:bg-violet-500 rounded-t transition-all"
                  style={{ height: `${(val / max) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* -- SOCIAL -- */

    case 'socialshare': {
      const platforms = p.platforms || ['twitter', 'facebook', 'linkedin'];
      const icons = { twitter: '\uD83D\uDC26', facebook: '\uD83D\uDCD8', linkedin: '\uD83D\uDCBC', instagram: '\uD83D\uDCF8', youtube: '\u25B6\uFE0F' };
      return (
        <div style={{ display: 'flex', gap: 8, ...styles }}>
          {platforms.map(pl => (
            <button key={pl} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:opacity-80">
              {icons[pl] || '\uD83D\uDD17'} {pl.charAt(0).toUpperCase() + pl.slice(1)}
            </button>
          ))}
        </div>
      );
    }

    case 'socialfollow':
      return (
        <div style={styles} className="inline-flex items-center gap-2">
          <button className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium">
            Follow {p.handle || '@youraccount'}
          </button>
        </div>
      );

    case 'twitterembed':
      return (
        <CanvasPlaceholder icon={"\uD83D\uDC26"} label="Twitter / X Embed" description={p.tweetUrl || 'Set a tweet URL in the Inspector'} />
      );

    case 'instagramembed':
      return (
        <CanvasPlaceholder icon={"\uD83D\uDCF8"} label="Instagram Embed" description={p.postUrl || 'Set a post URL in the Inspector'} />
      );

    case 'googlemaps': {
      const mapAddr = p.address || p.location || 'New York, NY';
      return (
        <div style={{ height: p.height || 300, borderRadius: 8, overflow: 'hidden', ...styles }}>
          <iframe
            title="Google Maps"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddr)}&z=${p.zoom || 14}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      );
    }

    case 'embed': {
      // Support both p.code (canonical) and legacy p.embedCode / p.url
      const embedContent = p.code || p.embedCode || p.url || '';
      return (
        <div style={styles} className="w-full">
          {embedContent ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs font-mono text-gray-500 overflow-x-auto whitespace-pre-wrap break-all border border-gray-200 dark:border-gray-700">
              {embedContent}
            </div>
          ) : (
            <CanvasPlaceholder icon={"\uD83D\uDD17"} label="Embed" description="Paste iframe or script code in the Inspector" />
          )}
        </div>
      );
    }

    /* -- NAVIGATION -- */

    case 'breadcrumbs': {
      const items = p.items || ['Home', 'Blog', 'Article'];
      return (
        <nav style={styles} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          {items.map((item, i) => {
            // Support both string items (library default) and {label, href} objects (inspector)
            const label = typeof item === 'string' ? item : (item.label || 'Link');
            const isLast = i === items.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                <a href="#" onClick={e => e.preventDefault()} className={isLast ? 'text-gray-900 dark:text-white font-medium' : 'hover:text-gray-700'}>
                  {label}
                </a>
              </React.Fragment>
            );
          })}
        </nav>
      );
    }

    case 'pagination': {
      const total = Math.min(p.total || p.totalPages || 10, 10);
      const current = p.current || p.currentPage || 1;
      const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1);
      return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', ...styles }}>
          <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-500">{"\u2039"}</button>
          {pages.map(pg => (
            <button key={pg} className={`px-3 py-1.5 border rounded text-sm ${pg === current ? 'bg-violet-500 text-white border-violet-500' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>{pg}</button>
          ))}
          {total > 7 && <span className="text-gray-400 text-sm">{"\u2026"}{total}</span>}
          <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-500">{"\u203A"}</button>
        </div>
      );
    }

    case 'searchbar':
      return (
        <div style={{ display: 'flex', gap: 0, ...styles }} className="w-full max-w-sm">
          <input
            type="text"
            placeholder={p.placeholder || 'Search...'}
            disabled
            className="flex-1 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button className="px-4 py-2 bg-violet-500 text-white rounded-r-lg text-sm">{"\uD83D\uDD0D"}</button>
        </div>
      );

    case 'carousel':
      return <CarouselElement slides={p.slides} styles={styles} />;

    case 'imagegallery': {
      const cols = p.columns || 3;
      const count = Math.max(cols, (p.images || []).length || cols);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, ...styles }}>
          {Array.from({ length: count }).map((_, i) => (
            p.images?.[i]
              ? <img key={i} src={p.images[i]} alt="" className="w-full h-24 object-cover rounded" />
              : <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-24 flex items-center justify-center text-gray-400 text-xs">Photo {i + 1}</div>
          ))}
        </div>
      );
    }

    case 'countdown':
      return <CountdownElement targetDate={p.targetDate} label={p.label} styles={styles} />;

    case 'cookiebanner':
      return (
        <div style={{ background: '#1f2937', color: '#fff', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, ...styles }}>
          <p className="text-sm">{p.message || 'We use cookies to enhance your experience.'}</p>
          <div className="flex gap-2 shrink-0">
            <button className="px-3 py-1 text-xs border border-gray-500 rounded text-gray-300">Decline</button>
            <button className="px-3 py-1 text-xs bg-violet-500 rounded text-white">Accept</button>
          </div>
        </div>
      );

    case 'backtotop':
      return (
        <div style={styles} className="flex justify-center">
          <button
            className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 transition-colors"
            title="Back to Top"
          >
            {"\u2191"}
          </button>
        </div>
      );

    /* -- CONTENT -- */

    case 'card':
      return (
        <div style={{ padding: 24, borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', ...styles }} className="dark:bg-gray-800">
          {p.image && <img src={p.image} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.title || 'Card Title'}</h3>
          {p.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.description}</p>}
        </div>
      );

    case 'queryloop':
      return (
        <CanvasPlaceholder icon={"\uD83D\uDD04"} label="Query Loop" description="Dynamically renders posts/content from your database" />
      );

    case 'section':
      return (
        <CanvasPlaceholder icon={"\uD83D\uDCCB"} label="Section" description="Drag this to the canvas to add a new section" />
      );

    default:
      return (
        <div style={styles} className="p-4 bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600">
          <span className="text-xs text-gray-500 font-mono">{element.type}</span>
        </div>
      );
  }
};

export default DynamicElement;
