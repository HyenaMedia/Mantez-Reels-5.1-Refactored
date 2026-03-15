import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import RichTextEditor from './RichTextEditor';
import api from '../../services/api';

const genId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ensureIds = (items) => items.map(item => item._uid ? item : { ...item, _uid: genId() });

// Hero Section Editor Component
const HeroEditor = ({ heroContent, setHeroContent, saveContent, saving }) => (
  <div className="space-y-6">
    <div>
      <Label className="text-white">Brand Name</Label>
      <Input
        value={heroContent.brand_name}
        onChange={(e) => setHeroContent({ ...heroContent, brand_name: e.target.value })}
        className="mt-2 bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Mantez Reels"
      />
    </div>

    <div>
      <Label className="text-white">Tagline Line 1</Label>
      <div className="mt-2">
        <RichTextEditor
          value={heroContent.tagline_line1}
          onChange={(value) => setHeroContent({ ...heroContent, tagline_line1: value })}
          placeholder="hello, I'm Manos - a videographer..."
        />
      </div>
    </div>

    <div>
      <Label className="text-white">Tagline Line 2</Label>
      <div className="mt-2">
        <RichTextEditor
          value={heroContent.tagline_line2}
          onChange={(value) => setHeroContent({ ...heroContent, tagline_line2: value })}
          placeholder="and designer, based in Greece."
        />
      </div>
    </div>

    <div>
      <Label className="text-white">Description</Label>
      <div className="mt-2">
        <RichTextEditor
          value={heroContent.description}
          onChange={(value) => setHeroContent({ ...heroContent, description: value })}
          placeholder="I bring ideas to life through..."
        />
      </div>
    </div>

    <div>
      <Label className="text-white">CTA Button Text</Label>
      <Input
        value={heroContent.cta_button_text}
        onChange={(e) => setHeroContent({ ...heroContent, cta_button_text: e.target.value })}
        className="mt-2 bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Send me a message"
      />
    </div>

    <Button
      onClick={() => saveContent(heroContent)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Hero Section'}
    </Button>
  </div>
);

// Contact Info Editor Component
const ContactInfoEditor = ({ contactInfo, setContactInfo, saveContent, saving }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-white">Email</Label>
        <Input
          value={contactInfo.email}
          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
          className="bg-white/[0.04] border-white/[0.08] text-white"
          placeholder="hello@example.com"
        />
      </div>
      <div>
        <Label className="text-white">Phone</Label>
        <Input
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
          className="bg-white/[0.04] border-white/[0.08] text-white"
          placeholder="+30 210 123 4567"
        />
      </div>
    </div>

    <div>
      <Label className="text-white">Location</Label>
      <Input
        value={contactInfo.location}
        onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Athens, Greece"
      />
    </div>

    {/* Click-to-Action Settings */}
    <div className="border-t border-white/[0.06] pt-6 mt-6">
      <h3 className="text-white font-semibold mb-2">Click-to-Action Settings</h3>
      <p className="text-gray-400 text-sm mb-4">
        Enable or disable clickable actions for contact information
      </p>

      <div className="space-y-4 bg-white/[0.02] p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-white font-medium">Enable Email Click</Label>
            <p className="text-gray-400 text-xs mt-1">Opens default email client when clicked</p>
          </div>
          <Switch
            checked={contactInfo.enable_email_click !== false}
            onCheckedChange={(checked) =>
              setContactInfo({ ...contactInfo, enable_email_click: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-white font-medium">Enable Phone Click</Label>
            <p className="text-gray-400 text-xs mt-1">
              Opens phone app or initiates call when clicked
            </p>
          </div>
          <Switch
            checked={contactInfo.enable_phone_click !== false}
            onCheckedChange={(checked) =>
              setContactInfo({ ...contactInfo, enable_phone_click: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-white font-medium">Enable Location Click</Label>
            <p className="text-gray-400 text-xs mt-1">Opens Google Maps for routing when clicked</p>
          </div>
          <Switch
            checked={contactInfo.enable_location_click !== false}
            onCheckedChange={(checked) =>
              setContactInfo({ ...contactInfo, enable_location_click: checked })
            }
          />
        </div>
      </div>
    </div>

    <div className="border-t border-white/[0.06] pt-6 mt-6">
      <h3 className="text-white font-semibold mb-4">Social Media Links</h3>
      <p className="text-gray-400 text-sm mb-4">Only filled URLs will appear on the website</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Instagram</Label>
          <Input
            value={contactInfo.instagram_url}
            onChange={(e) => setContactInfo({ ...contactInfo, instagram_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <Label className="text-white">YouTube</Label>
          <Input
            value={contactInfo.youtube_url}
            onChange={(e) => setContactInfo({ ...contactInfo, youtube_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://youtube.com/..."
          />
        </div>

        <div>
          <Label className="text-white">LinkedIn</Label>
          <Input
            value={contactInfo.linkedin_url}
            onChange={(e) => setContactInfo({ ...contactInfo, linkedin_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://linkedin.com/..."
          />
        </div>

        <div>
          <Label className="text-white">Facebook</Label>
          <Input
            value={contactInfo.facebook_url}
            onChange={(e) => setContactInfo({ ...contactInfo, facebook_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div>
          <Label className="text-white">Twitter / X</Label>
          <Input
            value={contactInfo.twitter_url}
            onChange={(e) => setContactInfo({ ...contactInfo, twitter_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://x.com/..."
          />
        </div>

        <div>
          <Label className="text-white">TikTok</Label>
          <Input
            value={contactInfo.tiktok_url}
            onChange={(e) => setContactInfo({ ...contactInfo, tiktok_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://tiktok.com/@..."
          />
        </div>

        <div>
          <Label className="text-white">Vimeo</Label>
          <Input
            value={contactInfo.vimeo_url}
            onChange={(e) => setContactInfo({ ...contactInfo, vimeo_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://vimeo.com/..."
          />
        </div>

        <div>
          <Label className="text-white">Behance</Label>
          <Input
            value={contactInfo.behance_url}
            onChange={(e) => setContactInfo({ ...contactInfo, behance_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://behance.net/..."
          />
        </div>

        <div>
          <Label className="text-white">Dribbble</Label>
          <Input
            value={contactInfo.dribbble_url}
            onChange={(e) => setContactInfo({ ...contactInfo, dribbble_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://dribbble.com/..."
          />
        </div>

        <div>
          <Label className="text-white">GitHub</Label>
          <Input
            value={contactInfo.github_url}
            onChange={(e) => setContactInfo({ ...contactInfo, github_url: e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://github.com/..."
          />
        </div>
      </div>
    </div>

    <Button
      onClick={() => saveContent(contactInfo)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Contact Info'}
    </Button>
  </div>
);

// Footer Editor Component
const FooterEditor = ({ footerContent, setFooterContent, saveContent, saving }) => (
  <div className="space-y-6">
    <div>
      <Label className="text-white">Footer Description</Label>
      <RichTextEditor
        value={footerContent.description}
        onChange={(value) => setFooterContent({ ...footerContent, description: value })}
        placeholder="Bringing ideas to life through..."
      />
    </div>

    <div>
      <Label className="text-white">Copyright Text</Label>
      <RichTextEditor
        value={footerContent.copyright_text}
        onChange={(value) => setFooterContent({ ...footerContent, copyright_text: value })}
        placeholder="© 2024 Mantez Reels. All rights reserved."
      />
    </div>

    <Button
      onClick={() => saveContent(footerContent)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Footer'}
    </Button>
  </div>
);

// About Section Editor Component
const AboutEditor = ({ aboutContent, setAboutContent, saveContent, saving }) => {
  const descIdsRef = useRef([]);
  // Ensure we have a stable ID for each description paragraph
  while (descIdsRef.current.length < aboutContent.description.length) {
    descIdsRef.current.push(genId());
  }
  descIdsRef.current.length = aboutContent.description.length;

  return (
  <div className="space-y-6">
    <div>
      <Label className="text-white">Title</Label>
      <RichTextEditor
        value={aboutContent.title}
        onChange={(value) => setAboutContent({ ...aboutContent, title: value })}
        placeholder="About Me"
      />
    </div>

    <div>
      <Label className="text-white">Subtitle</Label>
      <RichTextEditor
        value={aboutContent.subtitle}
        onChange={(value) => setAboutContent({ ...aboutContent, subtitle: value })}
        placeholder="Professional videographer and storyteller"
      />
    </div>

    <div>
      <Label className="text-white">Description Paragraphs</Label>
      {aboutContent.description.map((para, i) => (
        <div key={descIdsRef.current[i]} className="mb-4">
          <RichTextEditor
            value={para}
            onChange={(value) => {
              const newDesc = [...aboutContent.description];
              newDesc[i] = value;
              setAboutContent({ ...aboutContent, description: newDesc });
            }}
            placeholder={`Paragraph ${i + 1}`}
          />
          <Button
            onClick={() => {
              const newDesc = aboutContent.description.filter((_, idx) => idx !== i);
              descIdsRef.current = descIdsRef.current.filter((_, idx) => idx !== i);
              setAboutContent({ ...aboutContent, description: newDesc });
            }}
            variant="ghost"
            size="sm"
            className="mt-2 text-red-500"
          >
            <Trash2 size={14} className="mr-1" /> Remove
          </Button>
        </div>
      ))}
      <Button
        onClick={() => {
          descIdsRef.current.push(genId());
          setAboutContent({ ...aboutContent, description: [...aboutContent.description, ''] });
        }}
        variant="outline"
        size="sm"
        className="border-white/[0.08]"
      >
        <Plus size={14} className="mr-1" /> Add Paragraph
      </Button>
    </div>

    <div>
      <Label className="text-white">Image URL</Label>
      <Input
        value={aboutContent.image_url}
        onChange={(e) => setAboutContent({ ...aboutContent, image_url: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="https://..."
      />
    </div>

    <Button
      onClick={() => saveContent(aboutContent)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save About Section'}
    </Button>
  </div>
  );
};

// Services Editor Component
const ServicesEditor = ({ services, setServices, saveContent, saving }) => (
  <div className="space-y-6">
    {services.map((service, i) => (
      <div key={service._uid || i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-white">Icon Name</Label>
            <Input
              value={service.icon}
              onChange={(e) => {
                const newServices = [...services];
                newServices[i].icon = e.target.value;
                setServices(newServices);
              }}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Video, Camera, etc"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-white">Title</Label>
            <RichTextEditor
              value={service.title}
              onChange={(value) => {
                const newServices = [...services];
                newServices[i].title = value;
                setServices(newServices);
              }}
              placeholder="Service title..."
            />
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-white">Description</Label>
          <RichTextEditor
            value={service.description}
            onChange={(value) => {
              const newServices = [...services];
              newServices[i].description = value;
              setServices(newServices);
            }}
            placeholder="Service description..."
          />
        </div>
        <Button
          onClick={() => setServices(services.filter((_, idx) => idx !== i))}
          variant="ghost"
          size="sm"
          className="text-red-500"
        >
          <Trash2 size={14} className="mr-1" /> Remove Service
        </Button>
      </div>
    ))}

    <Button
      onClick={() => setServices([...services, { _uid: genId(), icon: '', title: '', description: '' }])}
      variant="outline"
      className="border-white/[0.08]"
    >
      <Plus className="mr-2" size={16} /> Add Service
    </Button>

    <Button
      onClick={() => saveContent(services)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700 ml-4"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Services'}
    </Button>
  </div>
);

// FAQs Editor Component
const FAQsEditor = ({ faqs, setFAQs, saveContent, saving }) => (
  <div className="space-y-6">
    {faqs.map((faq, i) => (
      <div key={faq._uid || i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="mb-4">
          <Label className="text-white">Question</Label>
          <RichTextEditor
            value={faq.question}
            onChange={(value) => {
              const newFAQs = [...faqs];
              newFAQs[i].question = value;
              setFAQs(newFAQs);
            }}
            placeholder="Frequently asked question..."
          />
        </div>
        <div className="mb-4">
          <Label className="text-white">Answer</Label>
          <RichTextEditor
            value={faq.answer}
            onChange={(value) => {
              const newFAQs = [...faqs];
              newFAQs[i].answer = value;
              setFAQs(newFAQs);
            }}
            placeholder="Answer to the question..."
          />
        </div>
        <Button
          onClick={() => setFAQs(faqs.filter((_, idx) => idx !== i))}
          variant="ghost"
          size="sm"
          className="text-red-500"
        >
          <Trash2 size={14} className="mr-1" /> Remove FAQ
        </Button>
      </div>
    ))}

    <Button
      onClick={() => setFAQs([...faqs, { _uid: genId(), question: '', answer: '' }])}
      variant="outline"
      className="border-white/[0.08]"
    >
      <Plus className="mr-2" size={16} /> Add FAQ
    </Button>

    <Button
      onClick={() => saveContent(faqs)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700 ml-4"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save FAQs'}
    </Button>
  </div>
);

// Testimonials Editor Component
const TestimonialsEditor = ({ testimonials, setTestimonials, saveContent, saving }) => (
  <div className="space-y-6">
    {testimonials.map((testimonial, i) => (
      <div key={testimonial._uid || i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white">Name</Label>
            <RichTextEditor
              value={testimonial.name}
              onChange={(value) => {
                const newTestimonials = [...testimonials];
                newTestimonials[i].name = value;
                setTestimonials(newTestimonials);
              }}
              placeholder="Customer name..."
            />
          </div>
          <div>
            <Label className="text-white">Role</Label>
            <RichTextEditor
              value={testimonial.role}
              onChange={(value) => {
                const newTestimonials = [...testimonials];
                newTestimonials[i].role = value;
                setTestimonials(newTestimonials);
              }}
              placeholder="Job title..."
            />
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-white">Company</Label>
          <RichTextEditor
            value={testimonial.company}
            onChange={(value) => {
              const newTestimonials = [...testimonials];
              newTestimonials[i].company = value;
              setTestimonials(newTestimonials);
            }}
            placeholder="Company name..."
          />
        </div>
        <div className="mb-4">
          <Label className="text-white">Testimonial</Label>
          <RichTextEditor
            value={testimonial.content}
            onChange={(value) => {
              const newTestimonials = [...testimonials];
              newTestimonials[i].content = value;
              setTestimonials(newTestimonials);
            }}
            placeholder="Customer testimonial..."
          />
        </div>
        <div className="mb-4">
          <Label className="text-white">Avatar URL</Label>
          <Input
            value={testimonial.avatar}
            onChange={(e) => {
              const newTestimonials = [...testimonials];
              newTestimonials[i].avatar = e.target.value;
              setTestimonials(newTestimonials);
            }}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://..."
          />
        </div>
        <Button
          onClick={() => setTestimonials(testimonials.filter((_, idx) => idx !== i))}
          variant="ghost"
          size="sm"
          className="text-red-500"
        >
          <Trash2 size={14} className="mr-1" /> Remove Testimonial
        </Button>
      </div>
    ))}

    <Button
      onClick={() =>
        setTestimonials([
          ...testimonials,
          { _uid: genId(), name: '', role: '', company: '', content: '', avatar: '' },
        ])
      }
      variant="outline"
      className="border-white/[0.08]"
    >
      <Plus className="mr-2" size={16} /> Add Testimonial
    </Button>

    <Button
      onClick={() => saveContent(testimonials)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700 ml-4"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Testimonials'}
    </Button>
  </div>
);

// Blog Editor Component
const BlogEditor = ({ blogPosts, setBlogPosts, saveContent, saving }) => (
  <div className="space-y-6">
    {blogPosts.map((post, i) => (
      <div key={post._uid || i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white">Title</Label>
            <RichTextEditor
              value={post.title}
              onChange={(value) => {
                const newPosts = [...blogPosts];
                newPosts[i].title = value;
                setBlogPosts(newPosts);
              }}
              placeholder="Blog post title..."
            />
          </div>
          <div>
            <Label className="text-white">Category</Label>
            <RichTextEditor
              value={post.category}
              onChange={(value) => {
                const newPosts = [...blogPosts];
                newPosts[i].category = value;
                setBlogPosts(newPosts);
              }}
              placeholder="Tutorial, Tips, etc."
            />
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-white">Excerpt</Label>
          <RichTextEditor
            value={post.excerpt}
            onChange={(value) => {
              const newPosts = [...blogPosts];
              newPosts[i].excerpt = value;
              setBlogPosts(newPosts);
            }}
            placeholder="Short excerpt..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white">Thumbnail URL</Label>
            <Input
              value={post.thumbnail}
              onChange={(e) => {
                const newPosts = [...blogPosts];
                newPosts[i].thumbnail = e.target.value;
                setBlogPosts(newPosts);
              }}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className="text-white">Date</Label>
            <Input
              type="date"
              value={post.date}
              onChange={(e) => {
                const newPosts = [...blogPosts];
                newPosts[i].date = e.target.value;
                setBlogPosts(newPosts);
              }}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>
        </div>
        <Button
          onClick={() => setBlogPosts(blogPosts.filter((_, idx) => idx !== i))}
          variant="ghost"
          size="sm"
          className="text-red-500"
        >
          <Trash2 size={14} className="mr-1" /> Remove Post
        </Button>
      </div>
    ))}

    <Button
      onClick={() =>
        setBlogPosts([
          ...blogPosts,
          {
            _uid: genId(),
            title: '',
            category: '',
            excerpt: '',
            thumbnail: '',
            date: new Date().toISOString().split('T')[0],
          },
        ])
      }
      variant="outline"
      className="border-white/[0.08]"
    >
      <Plus className="mr-2" size={16} /> Add Blog Post
    </Button>

    <Button
      onClick={() => saveContent(blogPosts)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700 ml-4"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Blog Posts'}
    </Button>
  </div>
);

// Section Labels Editor Component
const SectionLabelsEditor = ({ sectionLabels, setSectionLabels, saveContent, saving }) => (
  <div className="space-y-6">
    <p className="text-gray-400 mb-4">
      Customize the badge labels that appear at the top of each section. These labels help users
      identify which section they're viewing.
    </p>

    <div>
      <Label className="text-white">Portfolio Section Label</Label>
      <Input
        value={sectionLabels.portfolio_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, portfolio_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Portfolio"
      />
    </div>

    <div>
      <Label className="text-white">Services Section Label</Label>
      <Input
        value={sectionLabels.services_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, services_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Services"
      />
    </div>

    <div>
      <Label className="text-white">About Section Label</Label>
      <Input
        value={sectionLabels.about_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, about_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="About Me"
      />
    </div>

    <div>
      <Label className="text-white">Testimonials Section Label</Label>
      <Input
        value={sectionLabels.testimonials_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, testimonials_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Testimonials"
      />
    </div>

    <div>
      <Label className="text-white">FAQ Section Label</Label>
      <Input
        value={sectionLabels.faq_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, faq_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="FAQ"
      />
    </div>

    <div>
      <Label className="text-white">Blog/Resources Section Label</Label>
      <Input
        value={sectionLabels.blog_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, blog_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Resources"
      />
    </div>

    <div>
      <Label className="text-white">Contact Section Label</Label>
      <Input
        value={sectionLabels.contact_label}
        onChange={(e) => setSectionLabels({ ...sectionLabels, contact_label: e.target.value })}
        className="bg-white/[0.04] border-white/[0.08] text-white"
        placeholder="Contact"
      />
    </div>

    <Button
      onClick={() => saveContent(sectionLabels)}
      disabled={saving}
      className="bg-purple-600 hover:bg-purple-700"
    >
      <Save className="mr-2" size={16} />
      {saving ? 'Saving...' : 'Save Section Labels'}
    </Button>
  </div>
);

const ContentEditor = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Hero section state
  const [heroContent, setHeroContent] = useState({
    brand_name: '',
    tagline_line1: '',
    tagline_line2: '',
    description: '',
    cta_button_text: '',
  });

  // About section state
  const [aboutContent, setAboutContent] = useState({
    title: '',
    subtitle: '',
    description: [],
    image_url: '',
  });

  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    location: '',
    instagram_url: '',
    youtube_url: '',
    linkedin_url: '',
    facebook_url: '',
    twitter_url: '',
    tiktok_url: '',
    vimeo_url: '',
    behance_url: '',
    dribbble_url: '',
    github_url: '',
  });

  // Footer state
  const [footerContent, setFooterContent] = useState({
    description: '',
    copyright_text: '',
  });

  // Services state
  const [services, setServices] = useState([]);

  // FAQs state
  const [faqs, setFAQs] = useState([]);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState([]);

  // Section Labels state
  const [sectionLabels, setSectionLabels] = useState({
    portfolio_label: 'Portfolio',
    services_label: 'Services',
    about_label: 'About Me',
    testimonials_label: 'Testimonials',
    faq_label: 'FAQ',
    blog_label: 'Resources',
    contact_label: 'Contact',
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/content/${activeSection}`, { signal: controller.signal });

        if (response.data.success) {
          switch (activeSection) {
            case 'hero':
              setHeroContent(response.data.content);
              break;
            case 'about':
              setAboutContent(response.data.content);
              break;
            case 'contact-info':
              setContactInfo(response.data.content);
              break;
            case 'footer':
              setFooterContent(response.data.content);
              break;
            case 'services':
              setServices(ensureIds(response.data.services));
              break;
            case 'faqs':
              setFAQs(ensureIds(response.data.faqs));
              break;
            case 'testimonials':
              setTestimonials(ensureIds(response.data.testimonials));
              break;
            case 'blog':
              setBlogPosts(ensureIds(response.data.posts || []));
              break;
            case 'section-labels':
              setSectionLabels(response.data.content);
              break;
          }
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load content:', error);
        toast({
          title: 'Error loading content',
          description: error.response?.data?.detail || 'Failed to load',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadContent();
    return () => controller.abort();
  }, [activeSection]);

  const saveContent = async (data) => {
    setSaving(true);
    try {
      await api.put(`/api/content/${activeSection}`, data);
      toast({
        title: 'Saved!',
        description: 'Content updated successfully',
      });
    } catch (error) {
      console.error('Failed to save content:', error);
      toast({
        title: 'Save failed',
        description: error.response?.data?.detail || 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Editor components are now defined outside the main component

  // Footer Editor component moved outside

  // About Section Editor
  // About Editor component moved outside

  // Services Editor component moved outside

  // FAQs Editor component moved outside

  // Testimonials Editor component moved outside

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Content Editor</h2>
      <p className="text-gray-400 mb-6">Edit all sections of your website</p>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="bg-white/[0.04] mb-8 flex-wrap">
          <TabsTrigger value="hero" className="data-[state=active]:bg-purple-600">
            Hero
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-600">
            About
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-purple-600">
            Services
          </TabsTrigger>
          <TabsTrigger value="faqs" className="data-[state=active]:bg-purple-600">
            FAQs
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="data-[state=active]:bg-purple-600">
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="blog" className="data-[state=active]:bg-purple-600">
            Blog
          </TabsTrigger>
          <TabsTrigger value="contact-info" className="data-[state=active]:bg-purple-600">
            Contact
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-purple-600">
            Footer
          </TabsTrigger>
          <TabsTrigger value="section-labels" className="data-[state=active]:bg-purple-600">
            Section Labels
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
            <TabsContent value="hero">
              <HeroEditor
                heroContent={heroContent}
                setHeroContent={setHeroContent}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="about">
              <AboutEditor
                aboutContent={aboutContent}
                setAboutContent={setAboutContent}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="services">
              <ServicesEditor
                services={services}
                setServices={setServices}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="faqs">
              <FAQsEditor faqs={faqs} setFAQs={setFAQs} saveContent={saveContent} saving={saving} />
            </TabsContent>
            <TabsContent value="testimonials">
              <TestimonialsEditor
                testimonials={testimonials}
                setTestimonials={setTestimonials}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="blog">
              <BlogEditor
                blogPosts={blogPosts}
                setBlogPosts={setBlogPosts}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="contact-info">
              <ContactInfoEditor
                contactInfo={contactInfo}
                setContactInfo={setContactInfo}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="footer">
              <FooterEditor
                footerContent={footerContent}
                setFooterContent={setFooterContent}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>

            <TabsContent value="section-labels">
              <SectionLabelsEditor
                sectionLabels={sectionLabels}
                setSectionLabels={setSectionLabels}
                saveContent={saveContent}
                saving={saving}
              />
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default ContentEditor;
