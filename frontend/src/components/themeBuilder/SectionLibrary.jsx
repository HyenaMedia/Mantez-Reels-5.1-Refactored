import React, { useState } from 'react';
import { X, Search, Plus, Layout, Star, Briefcase, Users, MessageSquare, HelpCircle, Rss, Mail, Megaphone, Image, Navigation } from 'lucide-react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';

/* ─────────────────────────────────────────────────────────────────────────
   Pre-built section templates
   Each template produces a full section object ready for pageState.sections
───────────────────────────────────────────────────────────────────────── */

const mkId = (prefix = 'el') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const TEMPLATES = [
  // ── NAVBAR ─────────────────────────────────────────────────────────────
  {
    id: 'navbar-glass',
    category: 'navbar',
    label: 'Navbar – Glass',
    description: 'Glassmorphism sticky navbar, transparent blur',
    icon: Navigation,
    preview: 'bg-gradient-to-r from-gray-900 to-gray-800',
    build: () => ({
      id: mkId('section'),
      type: 'navbar',
      name: 'Navigation',
      position: 'sticky',
      backgroundType: 'glass',
      backgroundColor: 'rgba(17,24,39,0.7)',
      backdropBlur: 16,
      textColor: '#ffffff',
      textHoverColor: '#a855f7',
      siteName: 'My Site',
      logoWidth: 120,
      logoUrl: '',
      menuItems: [
        { id: mkId('item'), label: 'Home',     url: '/',        target: '_self', children: [] },
        { id: mkId('item'), label: 'Work',     url: '#work',    target: '_self', children: [] },
        { id: mkId('item'), label: 'About',    url: '#about',   target: '_self', children: [] },
        { id: mkId('item'), label: 'Contact',  url: '#contact', target: '_self', children: [] },
      ],
      showCta: true,
      ctaText: 'Get in Touch',
      ctaUrl: '#contact',
      ctaStyle: 'filled',
      ctaBackground: '#8b5cf6',
      ctaTextColor: '#ffffff',
      shadow: 'sm',
      borderBottom: true,
      mobileBreakpoint: 768,
      hamburgerStyle: 'bars',
      animationOnLoad: 'fade',
      zIndex: 50,
      _preset: 'glass',
      elements: []
    })
  },
  {
    id: 'navbar-minimal',
    category: 'navbar',
    label: 'Navbar – Minimal',
    description: 'Clean transparent navbar, text links only',
    icon: Navigation,
    preview: 'bg-white border border-gray-200',
    build: () => ({
      id: mkId('section'),
      type: 'navbar',
      name: 'Navigation',
      position: 'sticky',
      backgroundType: 'transparent',
      backgroundColor: 'transparent',
      backdropBlur: 0,
      textColor: '#111827',
      textHoverColor: '#8b5cf6',
      siteName: 'My Site',
      logoWidth: 120,
      logoUrl: '',
      menuItems: [
        { id: mkId('item'), label: 'Home',     url: '/',        target: '_self', children: [] },
        { id: mkId('item'), label: 'Work',     url: '#work',    target: '_self', children: [] },
        { id: mkId('item'), label: 'About',    url: '#about',   target: '_self', children: [] },
        { id: mkId('item'), label: 'Contact',  url: '#contact', target: '_self', children: [] },
      ],
      showCta: false,
      ctaText: 'Contact',
      ctaUrl: '#contact',
      ctaStyle: 'text',
      shadow: 'none',
      borderBottom: false,
      mobileBreakpoint: 768,
      hamburgerStyle: 'bars',
      animationOnLoad: 'none',
      zIndex: 50,
      _preset: 'minimal-transparent',
      elements: []
    })
  },
  {
    id: 'navbar-solid',
    category: 'navbar',
    label: 'Navbar – Solid',
    description: 'Dark solid navbar with a prominent CTA',
    icon: Navigation,
    preview: 'bg-gray-900',
    build: () => ({
      id: mkId('section'),
      type: 'navbar',
      name: 'Navigation',
      position: 'sticky',
      backgroundType: 'solid',
      backgroundColor: 'rgba(17,24,39,1)',
      backdropBlur: 0,
      textColor: '#e5e7eb',
      textHoverColor: '#ffffff',
      siteName: 'My Site',
      logoWidth: 120,
      logoUrl: '',
      menuItems: [
        { id: mkId('item'), label: 'Home',     url: '/',        target: '_self', children: [] },
        { id: mkId('item'), label: 'Work',     url: '#work',    target: '_self', children: [] },
        { id: mkId('item'), label: 'About',    url: '#about',   target: '_self', children: [] },
        { id: mkId('item'), label: 'Contact',  url: '#contact', target: '_self', children: [] },
      ],
      showCta: true,
      ctaText: 'Get Started',
      ctaUrl: '#contact',
      ctaStyle: 'filled',
      ctaBackground: '#7c3aed',
      ctaTextColor: '#ffffff',
      shadow: 'lg',
      borderBottom: false,
      mobileBreakpoint: 768,
      hamburgerStyle: 'bars',
      animationOnLoad: 'fade',
      zIndex: 50,
      _preset: 'classic-solid',
      elements: []
    })
  },

  // ── BLANK ──────────────────────────────────────────────────────────────
  {
    id: 'blank',
    category: 'basic',
    label: 'Blank Section',
    description: 'Empty section, start from scratch',
    icon: Layout,
    preview: 'bg-gray-100',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Blank Section',
      styles: {
        background: { type: 'solid', color: '#ffffff' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: []
    })
  },

  // ── HERO ───────────────────────────────────────────────────────────────
  {
    id: 'hero-centered',
    category: 'hero',
    label: 'Hero – Centered',
    description: 'Bold headline centred with a CTA button',
    icon: Star,
    preview: 'bg-gradient-to-br from-violet-600 to-purple-700',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Hero – Centered',
      styles: {
        background: { type: 'gradient', gradient: { colors: ['#7c3aed', '#a855f7'], angle: 135 } },
        padding: { top: 120, right: 24, bottom: 120, left: 24 },
        minHeight: '100vh'
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Build Something Amazing', tag: 'h1' }, styles: { typography: { fontSize: 56, fontWeight: 800, color: '#ffffff', textAlign: 'center' }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'text', props: { text: 'A beautiful, modern platform designed to help you create stunning experiences.' }, styles: { typography: { fontSize: 20, color: '#e9d5ff', textAlign: 'center' }, spacing: { marginBottom: 40 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Get Started Free', link: '#', variant: 'primary' }, styles: { background: '#ffffff', color: '#7c3aed', padding: { top: 14, right: 32, bottom: 14, left: 32 }, borderRadius: 8, fontSize: 16, fontWeight: 700, display: 'inline-block' } }
      ]
    })
  },
  {
    id: 'hero-split',
    category: 'hero',
    label: 'Hero – Split',
    description: 'Text left, image right layout',
    icon: Star,
    preview: 'bg-gradient-to-r from-slate-900 to-slate-800',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Hero – Split',
      styles: {
        background: { type: 'solid', color: '#0f172a' },
        padding: { top: 100, right: 80, bottom: 100, left: 80 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Your Vision, Realized.', tag: 'h1' }, styles: { typography: { fontSize: 52, fontWeight: 800, color: '#f1f5f9' }, spacing: { marginBottom: 20 } } },
        { id: mkId('el'), type: 'text', props: { text: 'We craft digital products that inspire and convert. From concept to launch, we\'ve got you covered.' }, styles: { typography: { fontSize: 18, color: '#94a3b8', lineHeight: 1.7 }, spacing: { marginBottom: 36 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Start Your Project', link: '#', variant: 'primary' }, styles: { background: '#8b5cf6', color: '#fff', padding: { top: 14, right: 28, bottom: 14, left: 28 }, borderRadius: 8, fontSize: 16, fontWeight: 600 } }
      ]
    })
  },
  {
    id: 'hero-minimal',
    category: 'hero',
    label: 'Hero – Minimal',
    description: 'Clean white hero with subtle headline',
    icon: Star,
    preview: 'bg-white border-2 border-gray-200',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Hero – Minimal',
      styles: {
        background: { type: 'solid', color: '#ffffff' },
        padding: { top: 100, right: 24, bottom: 100, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Simple. Powerful. Yours.', tag: 'h1' }, styles: { typography: { fontSize: 60, fontWeight: 900, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'text', props: { text: 'No complexity, just results. Start building in minutes.' }, styles: { typography: { fontSize: 18, color: '#6b7280', textAlign: 'center' }, spacing: { marginBottom: 36 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Try It Free', link: '#', variant: 'outline' }, styles: { background: 'transparent', color: '#111827', border: '2px solid #111827', padding: { top: 12, right: 28, bottom: 12, left: 28 }, borderRadius: 6, fontSize: 16, fontWeight: 600 } }
      ]
    })
  },

  // ── ABOUT ──────────────────────────────────────────────────────────────
  {
    id: 'about-simple',
    category: 'about',
    label: 'About – Simple',
    description: 'Centered heading with body text',
    icon: Users,
    preview: 'bg-slate-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'About',
      styles: {
        background: { type: 'solid', color: '#f8fafc' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'About Us', tag: 'h2' }, styles: { typography: { fontSize: 40, fontWeight: 700, color: '#1e293b', textAlign: 'center' }, spacing: { marginBottom: 12 } } },
        { id: mkId('el'), type: 'divider', props: {}, styles: { border: { color: '#8b5cf6', width: 3 }, sizing: { width: '60px' }, spacing: { marginBottom: 24 } } },
        { id: mkId('el'), type: 'text', props: { text: 'We are a passionate team of designers, developers, and strategists dedicated to creating exceptional digital experiences. Our mission is to turn your ideas into reality.' }, styles: { typography: { fontSize: 17, color: '#475569', textAlign: 'center', lineHeight: 1.8 }, sizing: { maxWidth: '680px' } } }
      ]
    })
  },
  {
    id: 'about-bio',
    category: 'about',
    label: 'About – Bio / Profile',
    description: 'Personal bio layout with name & title',
    icon: Users,
    preview: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'About – Bio',
      styles: {
        background: { type: 'solid', color: '#faf5ff' },
        padding: { top: 80, right: 48, bottom: 80, left: 48 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Hi, I\'m Alex Johnson', tag: 'h2' }, styles: { typography: { fontSize: 42, fontWeight: 800, color: '#1e1b4b' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'heading', props: { text: 'Full-Stack Developer & Designer', tag: 'h4' }, styles: { typography: { fontSize: 20, fontWeight: 500, color: '#8b5cf6' }, spacing: { marginBottom: 24 } } },
        { id: mkId('el'), type: 'text', props: { text: 'With over 8 years of experience building digital products, I specialize in creating elegant solutions to complex problems. I believe great design and clean code go hand in hand.' }, styles: { typography: { fontSize: 17, color: '#4c4f69', lineHeight: 1.8 }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Download Resume', link: '#', variant: 'primary' }, styles: { background: '#7c3aed', color: '#fff', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8, fontSize: 15, fontWeight: 600 } }
      ]
    })
  },

  // ── SERVICES ───────────────────────────────────────────────────────────
  {
    id: 'services-grid',
    category: 'services',
    label: 'Services – Grid',
    description: '3-column feature/service grid',
    icon: Briefcase,
    preview: 'bg-white',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Services',
      styles: {
        background: { type: 'solid', color: '#ffffff' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'What We Do', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Comprehensive solutions tailored to your needs' }, styles: { typography: { fontSize: 17, color: '#6b7280', textAlign: 'center' }, spacing: { marginBottom: 48 } } },
        { id: mkId('el'), type: 'heading', props: { text: '🎨  Design', tag: 'h3' }, styles: { typography: { fontSize: 20, fontWeight: 700, color: '#111827' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Stunning UI/UX design that converts visitors into customers.' }, styles: { typography: { fontSize: 15, color: '#6b7280' }, spacing: { marginBottom: 24 } } },
        { id: mkId('el'), type: 'heading', props: { text: '⚡  Development', tag: 'h3' }, styles: { typography: { fontSize: 20, fontWeight: 700, color: '#111827' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Fast, scalable applications built with modern technology.' }, styles: { typography: { fontSize: 15, color: '#6b7280' }, spacing: { marginBottom: 24 } } },
        { id: mkId('el'), type: 'heading', props: { text: '📈  Strategy', tag: 'h3' }, styles: { typography: { fontSize: 20, fontWeight: 700, color: '#111827' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Data-driven strategies that grow your business online.' }, styles: { typography: { fontSize: 15, color: '#6b7280' } } }
      ]
    })
  },
  {
    id: 'services-list',
    category: 'services',
    label: 'Services – List',
    description: 'Vertical list of services with descriptions',
    icon: Briefcase,
    preview: 'bg-slate-900',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Services – List',
      styles: {
        background: { type: 'solid', color: '#0f172a' },
        padding: { top: 80, right: 48, bottom: 80, left: 48 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Our Services', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#f1f5f9' }, spacing: { marginBottom: 48 } } },
        { id: mkId('el'), type: 'heading', props: { text: '01 — Brand Identity', tag: 'h3' }, styles: { typography: { fontSize: 22, fontWeight: 700, color: '#a78bfa' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Logos, color palettes, and brand guidelines that make you unforgettable.' }, styles: { typography: { fontSize: 16, color: '#94a3b8', lineHeight: 1.7 }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'heading', props: { text: '02 — Web Design', tag: 'h3' }, styles: { typography: { fontSize: 22, fontWeight: 700, color: '#a78bfa' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Pixel-perfect websites that delight users and drive conversions.' }, styles: { typography: { fontSize: 16, color: '#94a3b8', lineHeight: 1.7 }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'heading', props: { text: '03 — Content Strategy', tag: 'h3' }, styles: { typography: { fontSize: 22, fontWeight: 700, color: '#a78bfa' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Compelling content that resonates with your audience and ranks on Google.' }, styles: { typography: { fontSize: 16, color: '#94a3b8', lineHeight: 1.7 } } }
      ]
    })
  },

  // ── PORTFOLIO ──────────────────────────────────────────────────────────
  {
    id: 'portfolio-grid',
    category: 'portfolio',
    label: 'Portfolio – Grid',
    description: 'Project showcase in a clean grid',
    icon: Image,
    preview: 'bg-gray-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Portfolio',
      styles: {
        background: { type: 'solid', color: '#f9fafb' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Our Work', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'A selection of projects we\'re proud of' }, styles: { typography: { fontSize: 17, color: '#6b7280', textAlign: 'center' }, spacing: { marginBottom: 48 } } },
        { id: mkId('el'), type: 'image', props: { src: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Project+1', alt: 'Project 1' }, styles: { sizing: { width: '100%' }, border: { radius: 12 }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'heading', props: { text: 'Project Alpha', tag: 'h3' }, styles: { typography: { fontSize: 20, fontWeight: 700, color: '#111827' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Brand identity & web design for a SaaS startup.' }, styles: { typography: { fontSize: 15, color: '#6b7280' }, spacing: { marginBottom: 32 } } }
      ]
    })
  },
  {
    id: 'portfolio-featured',
    category: 'portfolio',
    label: 'Portfolio – Featured',
    description: 'Single featured project with details',
    icon: Image,
    preview: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Portfolio – Featured',
      styles: {
        background: { type: 'gradient', gradient: { colors: ['#1e1b4b', '#4c1d95'], angle: 135 } },
        padding: { top: 80, right: 48, bottom: 80, left: 48 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Featured Project', tag: 'h4' }, styles: { typography: { fontSize: 14, fontWeight: 600, color: '#a78bfa', letterSpacing: 3 }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'heading', props: { text: 'Redesigning the Future of Finance', tag: 'h2' }, styles: { typography: { fontSize: 44, fontWeight: 800, color: '#f1f5f9' }, spacing: { marginBottom: 20 } } },
        { id: mkId('el'), type: 'text', props: { text: 'A complete UX overhaul for a fintech platform serving 2M+ users. Reduced churn by 40% and increased onboarding completion to 87%.' }, styles: { typography: { fontSize: 17, color: '#cbd5e1', lineHeight: 1.8 }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'button', props: { text: 'View Case Study', link: '#', variant: 'outline' }, styles: { background: 'transparent', color: '#a78bfa', border: '2px solid #a78bfa', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8, fontSize: 15, fontWeight: 600 } }
      ]
    })
  },

  // ── TESTIMONIALS ───────────────────────────────────────────────────────
  {
    id: 'testimonials',
    category: 'testimonials',
    label: 'Testimonials',
    description: 'Customer quotes with attribution',
    icon: MessageSquare,
    preview: 'bg-violet-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Testimonials',
      styles: {
        background: { type: 'solid', color: '#f5f3ff' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'What Our Clients Say', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#1e1b4b', textAlign: 'center' }, spacing: { marginBottom: 48 } } },
        { id: mkId('el'), type: 'text', props: { text: '"Working with this team was a game-changer. Our conversion rate doubled in just 3 months after the redesign."' }, styles: { typography: { fontSize: 20, color: '#4c1d95', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7 }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'text', props: { text: '— Sarah Chen, CEO at Nexus AI' }, styles: { typography: { fontSize: 15, fontWeight: 600, color: '#8b5cf6', textAlign: 'center' }, spacing: { marginBottom: 40 } } },
        { id: mkId('el'), type: 'text', props: { text: '"Exceptional attention to detail and communication throughout the project. Highly recommend!"' }, styles: { typography: { fontSize: 20, color: '#4c1d95', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7 }, spacing: { marginBottom: 16 } } },
        { id: mkId('el'), type: 'text', props: { text: '— Marcus Rivera, Founder at Bloom Studio' }, styles: { typography: { fontSize: 15, fontWeight: 600, color: '#8b5cf6', textAlign: 'center' } } }
      ]
    })
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────
  {
    id: 'faq',
    category: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    icon: HelpCircle,
    preview: 'bg-white',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'FAQ',
      styles: {
        background: { type: 'solid', color: '#ffffff' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Frequently Asked Questions', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 48 } } },
        {
          id: mkId('el'), type: 'accordion',
          props: {
            items: [
              { title: 'How does the process work?', content: 'We start with a discovery call to understand your goals, then create a proposal with timeline and pricing. Once approved, we begin design and development in sprints.' },
              { title: 'What is your typical turnaround time?', content: 'Most projects take 4–8 weeks depending on scope. We\'ll give you a precise timeline during our initial consultation.' },
              { title: 'Do you offer ongoing support?', content: 'Yes! We offer monthly retainer packages for updates, maintenance, and new feature development.' },
              { title: 'What payment methods do you accept?', content: 'We accept bank transfer, credit card, and PayPal. We typically split billing 50% upfront, 50% on delivery.' }
            ]
          },
          styles: {}
        }
      ]
    })
  },

  // ── BLOG ────────────────────────────────────────────────────────────────
  {
    id: 'blog',
    category: 'blog',
    label: 'Blog / News',
    description: 'Latest posts grid layout',
    icon: Rss,
    preview: 'bg-gray-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Blog',
      styles: {
        background: { type: 'solid', color: '#f9fafb' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Latest Insights', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Thoughts on design, technology and business' }, styles: { typography: { fontSize: 17, color: '#6b7280', textAlign: 'center' }, spacing: { marginBottom: 48 } } },
        { id: mkId('el'), type: 'heading', props: { text: 'The Future of Web Design in 2025', tag: 'h3' }, styles: { typography: { fontSize: 22, fontWeight: 700, color: '#111827' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Mar 10, 2025 · 5 min read' }, styles: { typography: { fontSize: 13, color: '#9ca3af' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'AI-assisted design tools, immersive 3D experiences, and accessibility-first development are reshaping how we build for the web...' }, styles: { typography: { fontSize: 15, color: '#4b5563', lineHeight: 1.7 }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Read All Posts →', link: '#', variant: 'ghost' }, styles: { background: 'transparent', color: '#7c3aed', fontSize: 15, fontWeight: 600 } }
      ]
    })
  },

  // ── CONTACT ─────────────────────────────────────────────────────────────
  {
    id: 'contact-simple',
    category: 'contact',
    label: 'Contact – Simple',
    description: 'Email & contact info layout',
    icon: Mail,
    preview: 'bg-white',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Contact',
      styles: {
        background: { type: 'solid', color: '#ffffff' },
        padding: { top: 80, right: 24, bottom: 80, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Get In Touch', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 700, color: '#111827', textAlign: 'center' }, spacing: { marginBottom: 8 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Have a project in mind? We\'d love to hear from you.' }, styles: { typography: { fontSize: 17, color: '#6b7280', textAlign: 'center' }, spacing: { marginBottom: 40 } } },
        { id: mkId('el'), type: 'text', props: { text: '📧  hello@example.com' }, styles: { typography: { fontSize: 18, color: '#7c3aed', textAlign: 'center', fontWeight: 600 }, spacing: { marginBottom: 12 } } },
        { id: mkId('el'), type: 'text', props: { text: '📞  +1 (555) 000-0000' }, styles: { typography: { fontSize: 18, color: '#7c3aed', textAlign: 'center', fontWeight: 600 }, spacing: { marginBottom: 40 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Send Us a Message', link: 'mailto:hello@example.com', variant: 'primary' }, styles: { background: '#7c3aed', color: '#fff', padding: { top: 14, right: 32, bottom: 14, left: 32 }, borderRadius: 8, fontSize: 16, fontWeight: 600, display: 'block', textAlign: 'center' } }
      ]
    })
  },
  {
    id: 'contact-form',
    category: 'contact',
    label: 'Contact – With Form',
    description: 'Contact section with input form',
    icon: Mail,
    preview: 'bg-slate-50',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'Contact Form',
      styles: {
        background: { type: 'solid', color: '#f8fafc' },
        padding: { top: 80, right: 48, bottom: 80, left: 48 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Let\'s Work Together', tag: 'h2' }, styles: { typography: { fontSize: 40, fontWeight: 800, color: '#0f172a' }, spacing: { marginBottom: 12 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Fill out the form and we\'ll get back to you within 24 hours.' }, styles: { typography: { fontSize: 16, color: '#64748b', lineHeight: 1.6 }, spacing: { marginBottom: 36 } } },
        { id: mkId('el'), type: 'form', props: { fields: [{ type: 'text', label: 'Your Name', placeholder: 'John Doe' }, { type: 'email', label: 'Email Address', placeholder: 'john@example.com' }, { type: 'textarea', label: 'Message', placeholder: 'Tell us about your project...' }], submitLabel: 'Send Message' }, styles: {} }
      ]
    })
  },

  // ── CTA ─────────────────────────────────────────────────────────────────
  {
    id: 'cta-banner',
    category: 'cta',
    label: 'CTA – Banner',
    description: 'Full-width call-to-action strip',
    icon: Megaphone,
    preview: 'bg-gradient-to-r from-violet-600 to-purple-600',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'CTA Banner',
      styles: {
        background: { type: 'gradient', gradient: { colors: ['#7c3aed', '#9333ea'], angle: 90 } },
        padding: { top: 60, right: 24, bottom: 60, left: 24 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Ready to Get Started?', tag: 'h2' }, styles: { typography: { fontSize: 38, fontWeight: 800, color: '#ffffff', textAlign: 'center' }, spacing: { marginBottom: 12 } } },
        { id: mkId('el'), type: 'text', props: { text: 'Join thousands of businesses that trust us to power their online presence.' }, styles: { typography: { fontSize: 18, color: '#e9d5ff', textAlign: 'center' }, spacing: { marginBottom: 32 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Start Free Trial', link: '#', variant: 'white' }, styles: { background: '#ffffff', color: '#7c3aed', padding: { top: 14, right: 36, bottom: 14, left: 36 }, borderRadius: 8, fontSize: 16, fontWeight: 700, display: 'inline-block' } }
      ]
    })
  },
  {
    id: 'cta-split',
    category: 'cta',
    label: 'CTA – Split',
    description: 'Text left, buttons right',
    icon: Megaphone,
    preview: 'bg-gray-900',
    build: () => ({
      id: mkId('section'),
      type: 'section',
      name: 'CTA – Split',
      styles: {
        background: { type: 'solid', color: '#111827' },
        padding: { top: 60, right: 48, bottom: 60, left: 48 }
      },
      elements: [
        { id: mkId('el'), type: 'heading', props: { text: 'Take the Next Step', tag: 'h2' }, styles: { typography: { fontSize: 36, fontWeight: 800, color: '#f9fafb' }, spacing: { marginBottom: 12 } } },
        { id: mkId('el'), type: 'text', props: { text: 'No credit card required. Cancel anytime.' }, styles: { typography: { fontSize: 16, color: '#9ca3af' }, spacing: { marginBottom: 28 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Get Started Free', link: '#', variant: 'primary' }, styles: { background: '#7c3aed', color: '#fff', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8, fontSize: 15, fontWeight: 600, spacing: { marginRight: 12 } } },
        { id: mkId('el'), type: 'button', props: { text: 'Book a Demo', link: '#', variant: 'outline' }, styles: { background: 'transparent', color: '#d1d5db', border: '2px solid #374151', padding: { top: 12, right: 24, bottom: 12, left: 24 }, borderRadius: 8, fontSize: 15, fontWeight: 600 } }
      ]
    })
  }
];

const CATEGORIES = [
  { id: 'all',          label: 'All',          icon: Layout },
  { id: 'navbar',       label: 'Navbar',       icon: Navigation },
  { id: 'basic',        label: 'Basic',        icon: Layout },
  { id: 'hero',         label: 'Hero',         icon: Star },
  { id: 'about',        label: 'About',        icon: Users },
  { id: 'services',     label: 'Services',     icon: Briefcase },
  { id: 'portfolio',    label: 'Portfolio',    icon: Image },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'faq',          label: 'FAQ',          icon: HelpCircle },
  { id: 'blog',         label: 'Blog',         icon: Rss },
  { id: 'contact',      label: 'Contact',      icon: Mail },
  { id: 'cta',          label: 'CTA',          icon: Megaphone },
];

/* ─────────────────────────────────────────────────────────────────────────
   SectionLibrary component
───────────────────────────────────────────────────────────────────────── */
const SectionLibrary = ({ onClose, insertAtIndex = null }) => {
  const { addSection } = useThemeEditor();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState(null); // id of last-added template

  const filtered = TEMPLATES.filter(t => {
    const matchCat = category === 'all' || t.category === category;
    const matchSearch = !search || t.label.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (template) => {
    const section = template.build();
    addSection(section, insertAtIndex);
    setAdded(template.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Section Library</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{TEMPLATES.length} ready-to-use sections — click to add</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar: categories */}
          <div className="w-44 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto py-3">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={15} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Main: search + grid */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search sections…"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Layout size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No sections match your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(template => {
                    const Icon = template.icon;
                    const justAdded = added === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleAdd(template)}
                        className={`group relative text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                          justAdded
                            ? 'border-green-400 shadow-green-100 dark:shadow-green-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-violet-400'
                        }`}
                      >
                        {/* Preview swatch */}
                        <div className={`h-24 ${template.preview} flex items-center justify-center relative`}>
                          <Icon size={28} className="text-white/60 drop-shadow" />
                          {justAdded && (
                            <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">Added!</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white rounded-full p-1.5 shadow-lg">
                              <Plus size={16} className="text-violet-600" />
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-white dark:bg-gray-800">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{template.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLibrary;
