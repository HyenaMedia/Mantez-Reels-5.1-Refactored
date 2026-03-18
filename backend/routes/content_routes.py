import os
import sys

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import require_auth
from services.cache_service import cache

# Add parent directory to path to import security_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.constants import utcnow

router = APIRouter(prefix="/api/content", tags=["content"])

from database import db

CONTENT_CACHE_TTL = 120  # seconds


# Models for different content sections
class HeroContent(BaseModel):
    brand_name: str
    tagline_line1: str
    tagline_line2: str
    description: str
    availability_badge: str
    cta_button_text: str
    # Optional style fields
    brand_name_font_family: str | None = None
    brand_name_font_size: str | None = None
    brand_name_font_weight: str | None = None
    tagline_font_family: str | None = None
    tagline_font_size: str | None = None
    description_font_family: str | None = None
    description_font_size: str | None = None
    text_color: str | None = None
    background_color: str | None = None
    animations: list[dict] | None = None  # For animation data

    class Config:
        extra = "allow"  # Allow extra fields that aren't defined

class AboutContent(BaseModel):
    title: str
    subtitle: str
    description: list[str]  # Array of paragraphs
    image_url: str | None = None

class ServiceItem(BaseModel):
    icon: str
    title: str
    description: str

class FAQItem(BaseModel):
    question: str
    answer: str

class TestimonialItem(BaseModel):
    name: str
    role: str
    company: str
    content: str
    avatar: str

class BlogPost(BaseModel):
    title: str
    excerpt: str
    thumbnail: str
    date: str
    category: str

class ContactInfo(BaseModel):
    email: str
    phone: str
    location: str
    # Click-to-action settings
    enable_email_click: bool | None = True
    enable_phone_click: bool | None = True
    enable_location_click: bool | None = True
    # Social media URLs
    instagram_url: str | None = None
    youtube_url: str | None = None
    linkedin_url: str | None = None
    facebook_url: str | None = None
    twitter_url: str | None = None
    tiktok_url: str | None = None
    vimeo_url: str | None = None
    behance_url: str | None = None
    dribbble_url: str | None = None
    github_url: str | None = None

class FooterContent(BaseModel):
    description: str
    copyright_text: str

class SectionLabels(BaseModel):
    portfolio_label: str = "Portfolio"
    services_label: str = "Services"
    about_label: str = "About Me"
    testimonials_label: str = "Testimonials"
    faq_label: str = "FAQ"
    blog_label: str = "Resources"
    contact_label: str = "Contact"

class NavbarContent(BaseModel):
    site_name: str
    logo_url: str | None = None
    show_theme_toggle: bool = True
    show_language_switcher: bool = True

class ScrollProgressContent(BaseModel):
    enabled: bool = True
    gradient_start_color: str = "#9333ea"  # purple-600
    gradient_end_color: str = "#ec4899"    # pink-500
    height: str = "1"  # in px


# Get/Update Hero Section
@router.get("/hero")
async def get_hero():
    """Get Hero section content"""
    cached = cache.get("content:hero")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'hero'}, {"_id": 0})
    if not content:
        result = {
            'success': True,
            'content': {
                'brand_name': 'Mantez Reels',
                'tagline_line1': "hello, I'm Manos - a videographer, photographer,",
                'tagline_line2': 'and designer, based in Greece.',
                'description': 'I bring ideas to life through cinematic visuals and complete creative direction.',
                'availability_badge': 'Available for Inquiries',
                'cta_button_text': 'Send me a message'
            }
        }
        cache.set("content:hero", result, CONTENT_CACHE_TTL)
        return result

    # Remove internal fields that shouldn't be sent to frontend
    if 'section' in content:
        del content['section']
    if 'updated_at' in content:
        del content['updated_at']
    if 'updated_by' in content:
        del content['updated_by']

    result = {'success': True, 'content': content}
    cache.set("content:hero", result, CONTENT_CACHE_TTL)
    return result

@router.put("/hero")
async def update_hero(content: HeroContent, current_user: dict = Depends(require_auth)):
    """Update Hero section content - Admin only"""
    cache.delete("content:hero")
    await db.content.update_one(
        {'section': 'hero'},
        {
            '$set': {
                'section': 'hero',
                **content.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Hero section updated'}


# Get/Update About Section
@router.get("/about")
async def get_about():
    """Get About section content"""
    cached = cache.get("content:about")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'about'})
    if not content:
        # Return default content
        return {
            'success': True,
            'content': {
                'title': 'A modern approach to',
                'subtitle': 'visual storytelling',
                'description': [
                    'I picked up a camera over a decade ago — and never looked back. What started as capturing moments for memories grew into cinematic videos, brand campaigns, and visual storytelling that moves people.',
                    'Based in Greece, I work with clients worldwide to create content that stands out. From concept to final delivery, I\'m hands-on with every project — directing, shooting, editing, color grading, and sound design.',
                    'Being a modern creator means pushing boundaries. Whether it\'s cinematic brand films, social content, or documentary work, I aim to build visuals that break the scroll and make people pause.',
                    'Details matter because they carry intention. Every frame, every cut, every beat serves the story. If it doesn\'t, it doesn\'t stay.'
                ],
                'image_url': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80'
            }
        }

    content['_id'] = str(content['_id'])
    # Remove internal fields
    for key in ['_id', 'section', 'updated_at', 'updated_by']:
        content.pop(key, None)
    result = {'success': True, 'content': content}
    cache.set("content:about", result, CONTENT_CACHE_TTL)
    return result

@router.put("/about")
async def update_about(content: AboutContent, current_user: dict = Depends(require_auth)):
    """Update About section content - Admin only"""
    cache.delete("content:about")
    await db.content.update_one(
        {'section': 'about'},
        {
            '$set': {
                'section': 'about',
                'title': content.title,
                'subtitle': content.subtitle,
                'description': content.description,
                'image_url': content.image_url,
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'About section updated'}


# Get/Update Contact Info
@router.get("/contact-info")
async def get_contact_info():
    """Get Contact information"""
    cached = cache.get("content:contact-info")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'contact-info'})
    if not content:
        return {
            'success': True,
            'content': {
                'email': 'hello@mantezreels.com',
                'phone': '+30 210 123 4567',
                'location': 'Athens, Greece',
                'instagram_url': '',
                'youtube_url': '',
                'linkedin_url': '',
                'facebook_url': '',
                'twitter_url': '',
                'tiktok_url': '',
                'vimeo_url': '',
                'behance_url': '',
                'dribbble_url': '',
                'github_url': ''
            }
        }

    content['_id'] = str(content['_id'])
    # Remove internal fields
    for key in ['_id', 'section', 'updated_at', 'updated_by']:
        content.pop(key, None)
    result = {'success': True, 'content': content}
    cache.set("content:contact-info", result, CONTENT_CACHE_TTL)
    return result

@router.put("/contact-info")
async def update_contact_info(content: ContactInfo, current_user: dict = Depends(require_auth)):
    """Update Contact information - Admin only"""
    cache.delete("content:contact-info")
    await db.content.update_one(
        {'section': 'contact-info'},
        {
            '$set': {
                'section': 'contact-info',
                **content.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Contact info updated'}


# Get/Update Footer
@router.get("/footer")
async def get_footer():
    """Get Footer content"""
    cached = cache.get("content:footer")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'footer'})
    if not content:
        return {
            'success': True,
            'content': {
                'description': 'Bringing ideas to life through cinematic visuals and complete creative direction. Based in Greece, working worldwide.',
                'copyright_text': 'Mantez Reels. All rights reserved.'
            }
        }

    content['_id'] = str(content['_id'])
    # Remove internal fields
    for key in ['_id', 'section', 'updated_at', 'updated_by']:
        content.pop(key, None)
    result = {'success': True, 'content': content}
    cache.set("content:footer", result, CONTENT_CACHE_TTL)
    return result

@router.put("/footer")
async def update_footer(content: FooterContent, current_user: dict = Depends(require_auth)):
    """Update Footer content - Admin only"""
    cache.delete("content:footer")
    await db.content.update_one(
        {'section': 'footer'},
        {
            '$set': {
                'section': 'footer',
                **content.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Footer updated'}


# Get/Update Services
@router.get("/services")
async def get_services():
    """Get Services list"""
    cached = cache.get("content:services")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'services'})
    if not content:
        # Return default services
        return {
            'success': True,
            'services': [
                {'icon': 'Video', 'title': 'Videography', 'description': 'Cinematic storytelling through stunning visuals'},
                {'icon': 'Film', 'title': 'Shot Planning', 'description': 'Strategic pre-production and creative direction'},
                {'icon': 'Scissors', 'title': 'Video Editing', 'description': 'Precision editing that brings stories to life'},
                {'icon': 'Sparkles', 'title': 'Motion Design', 'description': 'Dynamic animations and visual effects'},
                {'icon': 'Palette', 'title': 'Color Grading', 'description': 'Professional color correction and mood setting'},
                {'icon': 'Camera', 'title': 'Photography', 'description': 'High-quality stills and portrait photography'},
                {'icon': 'Music', 'title': 'Sound Design', 'description': 'Audio mixing and atmospheric soundscapes'},
                {'icon': 'Paintbrush', 'title': 'Graphic Design', 'description': 'Visual identity and brand materials'}
            ]
        }

    result = {'success': True, 'services': content.get('services', [])}
    cache.set("content:services", result, CONTENT_CACHE_TTL)
    return result

@router.put("/services")
async def update_services(services: list[ServiceItem], current_user: dict = Depends(require_auth)):
    """Update Services list - Admin only"""
    cache.delete("content:services")
    await db.content.update_one(
        {'section': 'services'},
        {
            '$set': {
                'section': 'services',
                'services': [s.model_dump() for s in services],
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Services updated'}


# Get/Update FAQs
@router.get("/faqs")
async def get_faqs():
    """Get FAQ list"""
    cached = cache.get("content:faqs")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'faqs'})
    if not content:
        return {
            'success': True,
            'faqs': [
                {
                    'question': 'What types of projects do you specialize in?',
                    'answer': 'I specialize in cinematic videography, commercial content, brand campaigns, event coverage, and creative photography.'
                },
                {
                    'question': 'How involved are you in the creative process?',
                    'answer': 'I\'m hands-on from start to finish - from initial concept and shot planning, through filming and direction, all the way to editing, color grading, and sound design.'
                }
            ]
        }

    result = {'success': True, 'faqs': content.get('faqs', [])}
    cache.set("content:faqs", result, CONTENT_CACHE_TTL)
    return result

@router.put("/faqs")
async def update_faqs(faqs: list[FAQItem], current_user: dict = Depends(require_auth)):
    """Update FAQ list - Admin only"""
    cache.invalidate_pattern("content:faq")
    await db.content.update_one(
        {'section': 'faqs'},
        {
            '$set': {
                'section': 'faqs',
                'faqs': [f.model_dump() for f in faqs],
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'FAQs updated'}


# Get/Update Testimonials
@router.get("/testimonials")
async def get_testimonials():
    """Get Testimonials list"""
    cached = cache.get("content:testimonials")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'testimonials'})
    if not content:
        return {
            'success': True,
            'testimonials': [
                {
                    'name': 'Sofia Papadopoulos',
                    'role': 'Marketing Director',
                    'company': 'Aegean Paradise Resort',
                    'content': 'Manos delivered exceptional work that exceeded our expectations.',
                    'avatar': 'https://i.pravatar.cc/150?img=1'
                }
            ]
        }

    result = {'success': True, 'testimonials': content.get('testimonials', [])}
    cache.set("content:testimonials", result, CONTENT_CACHE_TTL)
    return result

@router.put("/testimonials")
async def update_testimonials(testimonials: list[TestimonialItem], current_user: dict = Depends(require_auth)):
    """Update Testimonials list - Admin only"""
    cache.delete("content:testimonials")
    await db.content.update_one(
        {'section': 'testimonials'},
        {
            '$set': {
                'section': 'testimonials',
                'testimonials': [t.model_dump() for t in testimonials],
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Testimonials updated'}


# Get/Update Blog Posts
@router.get("/blog")
async def get_blog():
    """Get Blog posts"""
    cached = cache.get("content:blog")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'blog'})
    if not content:
        return {
            'success': True,
            'posts': [
                {
                    'title': 'Essential Gear for Cinematic Videography',
                    'excerpt': 'A breakdown of my camera setup and why I chose each piece of equipment.',
                    'thumbnail': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
                    'date': '2024-02-15',
                    'category': 'Gear'
                }
            ]
        }

    result = {'success': True, 'posts': content.get('posts', [])}
    cache.set("content:blog", result, CONTENT_CACHE_TTL)
    return result

@router.put("/blog")
async def update_blog(posts: list[BlogPost], current_user: dict = Depends(require_auth)):
    """Update Blog posts - Admin only"""
    cache.delete("content:blog")
    await db.content.update_one(
        {'section': 'blog'},
        {
            '$set': {
                'section': 'blog',
                'posts': [p.model_dump() for p in posts],
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Blog posts updated'}


# Section Labels endpoints
@router.get("/section-labels")
async def get_section_labels():
    """Get section labels"""
    cached = cache.get("content:section-labels")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'section_labels'})
    if not content:
        return {
            'success': True,
            'content': {
                'portfolio_label': 'Portfolio',
                'services_label': 'Services',
                'about_label': 'About Me',
                'testimonials_label': 'Testimonials',
                'faq_label': 'FAQ',
                'blog_label': 'Resources',
                'contact_label': 'Contact'
            }
        }

    content['_id'] = str(content['_id'])
    # Remove internal fields
    for key in ['_id', 'section', 'updated_at', 'updated_by']:
        content.pop(key, None)
    result = {'success': True, 'content': content}
    cache.set("content:section-labels", result, CONTENT_CACHE_TTL)
    return result

@router.put("/section-labels")
async def update_section_labels(labels: SectionLabels, current_user: dict = Depends(require_auth)):
    """Update section labels - Admin only"""
    cache.delete("content:section-labels")
    await db.content.update_one(
        {'section': 'section_labels'},
        {
            '$set': {
                'section': 'section_labels',
                **labels.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Section labels updated'}


# Navbar Content
@router.get("/navbar")
async def get_navbar():
    """Get Navbar content"""
    cached = cache.get("content:navbar")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'navbar'}, {"_id": 0})
    if not content:
        return {
            'success': True,
            'content': {
                'site_name': 'Mantez Reels',
                'logo_url': '',
                'show_theme_toggle': True,
                'show_language_switcher': True
            }
        }

    result = {'success': True, 'content': content}
    cache.set("content:navbar", result, CONTENT_CACHE_TTL)
    return result

@router.put("/navbar")
async def update_navbar(content: NavbarContent, current_user: dict = Depends(require_auth)):
    """Update Navbar content - Admin only"""
    cache.delete("content:navbar")
    await db.content.update_one(
        {'section': 'navbar'},
        {
            '$set': {
                'section': 'navbar',
                **content.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Navbar updated'}


# Scroll Progress Content
@router.get("/scroll-progress")
async def get_scroll_progress():
    """Get Scroll Progress bar content"""
    cached = cache.get("content:scroll-progress")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'scroll_progress'}, {"_id": 0})
    if not content:
        return {
            'success': True,
            'content': {
                'enabled': True,
                'gradient_start_color': '#9333ea',
                'gradient_end_color': '#ec4899',
                'height': '1'
            }
        }

    result = {'success': True, 'content': content}
    cache.set("content:scroll-progress", result, CONTENT_CACHE_TTL)
    return result

@router.put("/scroll-progress")
async def update_scroll_progress(content: ScrollProgressContent, current_user: dict = Depends(require_auth)):
    """Update Scroll Progress bar content - Admin only"""
    cache.delete("content:scroll-progress")
    await db.content.update_one(
        {'section': 'scroll_progress'},
        {
            '$set': {
                'section': 'scroll_progress',
                **content.model_dump(),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Scroll progress updated'}


# Portfolio, Services, FAQ - Return format fix
@router.get("/portfolio")
async def get_portfolio():
    """Get Portfolio content - Returns list format"""
    cached = cache.get("content:portfolio")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'portfolio'}, {"_id": 0})
    if not content:
        return {
            'success': True,
            'content': {
                'title': 'Portfolio',
                'subtitle': 'Featured Work',
                'description': 'Cinematic stories that captivate and inspire'
            }
        }

    result = {'success': True, 'content': content}
    cache.set("content:portfolio", result, CONTENT_CACHE_TTL)
    return result

@router.put("/portfolio")
async def update_portfolio(content: dict, current_user: dict = Depends(require_auth)):
    """Update Portfolio section metadata - Admin only"""
    cache.delete("content:portfolio")
    # Filter out MongoDB internal fields and protected keys to prevent injection
    safe_content = {k: v for k, v in content.items() if not k.startswith('_') and k not in ('section', 'updated_at', 'updated_by')}
    await db.content.update_one(
        {'section': 'portfolio'},
        {
            '$set': {
                'section': 'portfolio',
                **safe_content,
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Portfolio updated'}


@router.get("/faq")
async def get_faq():
    """Get FAQ section content - wrapper around faqs"""
    cached = cache.get("content:faq")
    if cached is not None:
        return cached
    faq_content = await db.content.find_one({'section': 'faqs'}, {"_id": 0})

    result = {
        'success': True,
        'content': {
            'title': 'FAQ',
            'subtitle': 'Frequently Asked Questions',
            'faqs': faq_content.get('faqs', []) if faq_content else []
        }
    }
    cache.set("content:faq", result, CONTENT_CACHE_TTL)
    return result

@router.put("/faq")
async def update_faq(content: dict, current_user: dict = Depends(require_auth)):
    """Update FAQ section - Admin only"""
    cache.invalidate_pattern("content:faq")
    # Update the title/subtitle in faq wrapper
    await db.content.update_one(
        {'section': 'faq'},
        {
            '$set': {
                'section': 'faq',
                'title': content.get('title', 'FAQ'),
                'subtitle': content.get('subtitle', 'Frequently Asked Questions'),
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'FAQ section updated'}


@router.get("/contact")
async def get_contact():
    """Get Contact section"""
    cached = cache.get("content:contact")
    if cached is not None:
        return cached
    content = await db.content.find_one({'section': 'contact'}, {"_id": 0})
    if not content:
        return {
            'success': True,
            'content': {
                'title': 'Get In Touch',
                'subtitle': "Let's work together",
                'description': 'Ready to bring your project to life? Get in touch.'
            }
        }

    result = {'success': True, 'content': content}
    cache.set("content:contact", result, CONTENT_CACHE_TTL)
    return result

@router.put("/contact")
async def update_contact(content: dict, current_user: dict = Depends(require_auth)):
    """Update Contact section - Admin only"""
    cache.delete("content:contact")
    # Filter out MongoDB internal fields and protected keys to prevent injection
    safe_content = {k: v for k, v in content.items() if not k.startswith('_') and k not in ('section', 'updated_at', 'updated_by')}
    await db.content.update_one(
        {'section': 'contact'},
        {
            '$set': {
                'section': 'contact',
                **safe_content,
                'updated_at': utcnow(),
                'updated_by': current_user['user_id']
            }
        },
        upsert=True
    )

    return {'success': True, 'message': 'Contact section updated'}

