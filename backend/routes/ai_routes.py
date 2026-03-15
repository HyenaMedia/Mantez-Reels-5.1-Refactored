import logging
import os
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AIDesignRequest(BaseModel):
    prompt: str
    sectionType: str | None = 'hero'
    style: str | None = 'modern'


class AIResponsiveRequest(BaseModel):
    desktopLayout: dict[str, Any]
    targetDevice: str


class AISEORequest(BaseModel):
    content: str
    targetKeywords: list[str] | None = []


class AIAccessibilityRequest(BaseModel):
    pageStructure: dict[str, Any]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _extract_color_hints(prompt: str) -> dict:
    """Parse prompt for color keywords and return bg/text colors."""
    p = prompt.lower()
    palettes = {
        'dark':      {'bg': ['#111827', '#1f2937'], 'text': '#f9fafb', 'accent': '#8b5cf6'},
        'light':     {'bg': ['#f9fafb', '#ffffff'],  'text': '#111827', 'accent': '#8b5cf6'},
        'purple':    {'bg': ['#7c3aed', '#4c1d95'],  'text': '#ffffff', 'accent': '#c4b5fd'},
        'blue':      {'bg': ['#1d4ed8', '#1e3a8a'],  'text': '#ffffff', 'accent': '#93c5fd'},
        'green':     {'bg': ['#065f46', '#064e3b'],  'text': '#ffffff', 'accent': '#6ee7b7'},
        'red':       {'bg': ['#991b1b', '#7f1d1d'],  'text': '#ffffff', 'accent': '#fca5a5'},
        'warm':      {'bg': ['#92400e', '#78350f'],  'text': '#ffffff', 'accent': '#fcd34d'},
        'minimal':   {'bg': ['#ffffff', '#f3f4f6'],  'text': '#111827', 'accent': '#6b7280'},
        'gradient':  {'bg': ['#9333ea', '#ec4899'],  'text': '#ffffff', 'accent': '#f9a8d4'},
        'gold':      {'bg': ['#92400e', '#451a03'],  'text': '#fef3c7', 'accent': '#f59e0b'},
        'teal':      {'bg': ['#0f766e', '#134e4a'],  'text': '#ffffff', 'accent': '#5eead4'},
        'italian':   {'bg': ['#7f1d1d', '#450a0a'],  'text': '#fef2f2', 'accent': '#f59e0b'},
        'restaurant': {'bg': ['#292524', '#1c1917'], 'text': '#fef3c7', 'accent': '#f59e0b'},
        'tech':      {'bg': ['#0f172a', '#1e293b'],  'text': '#e2e8f0', 'accent': '#38bdf8'},
        'creative':  {'bg': ['#4c1d95', '#701a75'],  'text': '#ffffff', 'accent': '#f0abfc'},
        'corporate': {'bg': ['#1e3a5f', '#0f2744'],  'text': '#ffffff', 'accent': '#60a5fa'},
    }
    for key, palette in palettes.items():
        if key in p:
            return palette
    # default violet gradient
    return {'bg': ['#9333ea', '#7c3aed'], 'text': '#ffffff', 'accent': '#c4b5fd'}


def _extract_title(prompt: str, section_type: str) -> str:
    """Extract a title from the prompt or generate a default."""
    p = prompt.strip()
    # If prompt is short, use it directly
    if len(p) < 50 and not p.lower().startswith(('create', 'make', 'build', 'generate', 'add', 'design')):
        return p.title()
    # Extract first quoted string
    if '"' in p:
        start = p.index('"') + 1
        end = p.index('"', start) if '"' in p[start:] else len(p)
        return p[start:end]
    # Default titles by section type
    defaults = {
        'hero': 'Welcome to Our World',
        'features': 'Everything You Need',
        'about': 'About Us',
        'cta': 'Ready to Get Started?',
        'testimonial': 'What Our Clients Say',
        'pricing': 'Simple, Transparent Pricing',
        'gallery': 'Our Work',
        'faq': 'Frequently Asked Questions',
        'contact': 'Get in Touch',
        'team': 'Meet the Team',
        'stats': 'Our Numbers Speak',
        'services': 'What We Offer',
    }
    return defaults.get(section_type, 'New Section')


def _extract_subtitle(prompt: str, section_type: str) -> str:
    """Generate a subtitle based on prompt and type."""
    subtitles = {
        'hero': 'Discover what makes us unique and why thousands of customers trust us.',
        'features': 'Powerful tools and features designed to help you succeed.',
        'about': 'We are a passionate team dedicated to delivering exceptional results.',
        'cta': 'Join thousands of satisfied customers and start your journey today.',
        'testimonial': 'Real stories from real customers who love what we do.',
        'pricing': 'Choose the plan that works best for you with no hidden fees.',
        'gallery': 'Browse through our portfolio of amazing work.',
        'faq': 'Find answers to the most common questions we receive.',
        'contact': "We'd love to hear from you. Send us a message and we'll respond soon.",
        'team': 'The talented people behind our success.',
        'stats': 'Numbers that demonstrate our impact and commitment.',
        'services': 'Comprehensive solutions tailored to your needs.',
    }
    return subtitles.get(section_type, 'Compelling content that engages your audience.')


def _build_hero_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'hero')
    subtitle = _extract_subtitle(prompt, 'hero')
    return {
        'id': sid,
        'type': 'section',
        'name': 'Hero Section',
        'styles': {
            'background': {
                'type': 'gradient',
                'gradient': {'colors': colors['bg'], 'angle': 135, 'opacity': 40, 'blur': 70}
            },
            'padding': {'top': 120, 'right': 24, 'bottom': 120, 'left': 24},
            'minHeight': '100vh'
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h1'},
                'styles': {
                    'typography': {'fontSize': 52, 'fontWeight': 700, 'color': colors['text'], 'textAlign': 'center'},
                    'spacing': {'marginBottom': 16}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'text',
                'props': {'text': subtitle},
                'styles': {
                    'typography': {'fontSize': 18, 'color': colors['accent'], 'textAlign': 'center'},
                    'spacing': {'marginBottom': 32}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'button',
                'props': {'text': 'Get Started', 'link': '#contact', 'variant': 'primary'},
                'styles': {
                    'background': colors['accent'],
                    'color': '#111827',
                    'padding': {'top': 14, 'right': 28, 'bottom': 14, 'left': 28},
                    'borderRadius': 8,
                    'fontSize': 16,
                    'fontWeight': 600
                }
            }
        ]
    }


def _build_features_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'features')
    subtitle = _extract_subtitle(prompt, 'features')
    is_dark = colors['text'] == '#ffffff' or colors['text'] == '#f9fafb' or colors['text'].startswith('#f')
    bg_color = '#0f172a' if is_dark else '#f9fafb'
    text_color = '#f1f5f9' if is_dark else '#111827'
    sub_color = '#94a3b8' if is_dark else '#6b7280'
    card_bg = '#1e293b' if is_dark else '#ffffff'
    card_border = '#334155' if is_dark else '#e5e7eb'
    return {
        'id': sid,
        'type': 'section',
        'name': 'Features Section',
        'styles': {
            'background': {'type': 'solid', 'color': bg_color},
            'padding': {'top': 80, 'right': 24, 'bottom': 80, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h2'},
                'styles': {
                    'typography': {'fontSize': 36, 'fontWeight': 700, 'color': text_color, 'textAlign': 'center'},
                    'spacing': {'marginBottom': 8}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'text',
                'props': {'text': subtitle},
                'styles': {
                    'typography': {'fontSize': 16, 'color': sub_color, 'textAlign': 'center'},
                    'spacing': {'marginBottom': 48}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'feature-card',
                'props': {
                    'icon': '⚡',
                    'title': 'Lightning Fast',
                    'description': 'Optimized for performance with industry-leading speed and reliability.'
                },
                'styles': {
                    'background': card_bg,
                    'border': f'1px solid {card_border}',
                    'borderRadius': 12,
                    'padding': {'top': 24, 'right': 24, 'bottom': 24, 'left': 24}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'feature-card',
                'props': {
                    'icon': '🎯',
                    'title': 'Precision Focused',
                    'description': 'Every detail crafted with care to deliver exactly what you need.'
                },
                'styles': {
                    'background': card_bg,
                    'border': f'1px solid {card_border}',
                    'borderRadius': 12,
                    'padding': {'top': 24, 'right': 24, 'bottom': 24, 'left': 24}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'feature-card',
                'props': {
                    'icon': '🔒',
                    'title': 'Secure & Reliable',
                    'description': 'Enterprise-grade security protecting your data around the clock.'
                },
                'styles': {
                    'background': card_bg,
                    'border': f'1px solid {card_border}',
                    'borderRadius': 12,
                    'padding': {'top': 24, 'right': 24, 'bottom': 24, 'left': 24}
                }
            }
        ]
    }


def _build_about_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'about')
    return {
        'id': sid,
        'type': 'section',
        'name': 'About Section',
        'styles': {
            'background': {'type': 'solid', 'color': '#ffffff'},
            'padding': {'top': 80, 'right': 24, 'bottom': 80, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h2'},
                'styles': {
                    'typography': {'fontSize': 36, 'fontWeight': 700, 'color': '#111827', 'textAlign': 'center'},
                    'spacing': {'marginBottom': 16}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'text',
                'props': {'text': 'We are a passionate team of professionals dedicated to delivering exceptional results. Our journey began with a simple mission: to create meaningful experiences that resonate with people.'},
                'styles': {
                    'typography': {'fontSize': 16, 'color': '#6b7280', 'textAlign': 'center', 'lineHeight': 1.8},
                    'spacing': {'marginBottom': 24, 'marginLeft': 'auto', 'marginRight': 'auto'},
                    'layout': {'maxWidth': '640px'}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'button',
                'props': {'text': 'Learn More', 'link': '#contact', 'variant': 'outline'},
                'styles': {
                    'background': 'transparent',
                    'color': colors['bg'][0],
                    'border': f'2px solid {colors["bg"][0]}',
                    'padding': {'top': 12, 'right': 24, 'bottom': 12, 'left': 24},
                    'borderRadius': 8,
                    'fontSize': 16,
                    'fontWeight': 600
                }
            }
        ]
    }


def _build_cta_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'cta')
    return {
        'id': sid,
        'type': 'section',
        'name': 'Call to Action',
        'styles': {
            'background': {
                'type': 'gradient',
                'gradient': {'colors': colors['bg'], 'angle': 135, 'opacity': 100, 'blur': 0}
            },
            'padding': {'top': 80, 'right': 24, 'bottom': 80, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h2'},
                'styles': {
                    'typography': {'fontSize': 40, 'fontWeight': 700, 'color': colors['text'], 'textAlign': 'center'},
                    'spacing': {'marginBottom': 16}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'text',
                'props': {'text': 'Take the next step and see why thousands of customers choose us every day.'},
                'styles': {
                    'typography': {'fontSize': 18, 'color': colors['accent'], 'textAlign': 'center'},
                    'spacing': {'marginBottom': 32}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'button',
                'props': {'text': 'Start Free Trial', 'link': '#contact', 'variant': 'primary'},
                'styles': {
                    'background': '#ffffff',
                    'color': colors['bg'][0],
                    'padding': {'top': 14, 'right': 32, 'bottom': 14, 'left': 32},
                    'borderRadius': 8,
                    'fontSize': 16,
                    'fontWeight': 700
                }
            }
        ]
    }


def _build_testimonial_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'testimonial')
    is_dark = colors['text'] in ('#ffffff', '#f9fafb', '#fef3c7', '#fef2f2', '#f1f5f9', '#e2e8f0')
    bg_color = '#0f172a' if is_dark else '#f9fafb'
    text_color = '#f1f5f9' if is_dark else '#111827'
    card_bg = '#1e293b' if is_dark else '#ffffff'
    card_border = '#334155' if is_dark else '#e5e7eb'
    return {
        'id': sid,
        'type': 'section',
        'name': 'Testimonials',
        'styles': {
            'background': {'type': 'solid', 'color': bg_color},
            'padding': {'top': 80, 'right': 24, 'bottom': 80, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h2'},
                'styles': {
                    'typography': {'fontSize': 36, 'fontWeight': 700, 'color': text_color, 'textAlign': 'center'},
                    'spacing': {'marginBottom': 8}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'testimonial-card',
                'props': {
                    'quote': 'This is absolutely incredible! It transformed our business and saved us countless hours.',
                    'author': 'Sarah Johnson',
                    'role': 'CEO, TechCorp',
                    'rating': 5
                },
                'styles': {
                    'background': card_bg,
                    'border': f'1px solid {card_border}',
                    'borderRadius': 12,
                    'padding': {'top': 24, 'right': 24, 'bottom': 24, 'left': 24}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'testimonial-card',
                'props': {
                    'quote': 'Outstanding quality and service. Highly recommend to anyone looking for excellence.',
                    'author': 'Mark Davis',
                    'role': 'Founder, StartupXYZ',
                    'rating': 5
                },
                'styles': {
                    'background': card_bg,
                    'border': f'1px solid {card_border}',
                    'borderRadius': 12,
                    'padding': {'top': 24, 'right': 24, 'bottom': 24, 'left': 24}
                }
            }
        ]
    }


def _build_stats_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    return {
        'id': sid,
        'type': 'section',
        'name': 'Stats Section',
        'styles': {
            'background': {
                'type': 'gradient',
                'gradient': {'colors': colors['bg'], 'angle': 135, 'opacity': 100, 'blur': 0}
            },
            'padding': {'top': 60, 'right': 24, 'bottom': 60, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'stat',
                'props': {'value': '10K+', 'label': 'Happy Customers'},
                'styles': {'typography': {'color': colors['text'], 'textAlign': 'center'}}
            },
            {
                'id': _new_id('element'),
                'type': 'stat',
                'props': {'value': '99%', 'label': 'Satisfaction Rate'},
                'styles': {'typography': {'color': colors['text'], 'textAlign': 'center'}}
            },
            {
                'id': _new_id('element'),
                'type': 'stat',
                'props': {'value': '5 Years', 'label': 'Industry Experience'},
                'styles': {'typography': {'color': colors['text'], 'textAlign': 'center'}}
            },
            {
                'id': _new_id('element'),
                'type': 'stat',
                'props': {'value': '24/7', 'label': 'Customer Support'},
                'styles': {'typography': {'color': colors['text'], 'textAlign': 'center'}}
            }
        ]
    }


def _build_gallery_section(prompt: str, colors: dict) -> dict:
    sid = _new_id('section')
    title = _extract_title(prompt, 'gallery')
    return {
        'id': sid,
        'type': 'section',
        'name': 'Gallery Section',
        'styles': {
            'background': {'type': 'solid', 'color': '#111827'},
            'padding': {'top': 80, 'right': 24, 'bottom': 80, 'left': 24}
        },
        'elements': [
            {
                'id': _new_id('element'),
                'type': 'heading',
                'props': {'text': title, 'tag': 'h2'},
                'styles': {
                    'typography': {'fontSize': 36, 'fontWeight': 700, 'color': '#f9fafb', 'textAlign': 'center'},
                    'spacing': {'marginBottom': 48}
                }
            },
            {
                'id': _new_id('element'),
                'type': 'image',
                'props': {
                    'src': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
                    'alt': 'Gallery image 1'
                },
                'styles': {'borderRadius': 8, 'objectFit': 'cover'}
            },
            {
                'id': _new_id('element'),
                'type': 'image',
                'props': {
                    'src': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                    'alt': 'Gallery image 2'
                },
                'styles': {'borderRadius': 8, 'objectFit': 'cover'}
            },
            {
                'id': _new_id('element'),
                'type': 'image',
                'props': {
                    'src': 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=600',
                    'alt': 'Gallery image 3'
                },
                'styles': {'borderRadius': 8, 'objectFit': 'cover'}
            }
        ]
    }


SECTION_BUILDERS = {
    'hero':        _build_hero_section,
    'features':    _build_features_section,
    'about':       _build_about_section,
    'cta':         _build_cta_section,
    'testimonial': _build_testimonial_section,
    'testimonials': _build_testimonial_section,
    'stats':       _build_stats_section,
    'gallery':     _build_gallery_section,
}


def _generate_section(prompt: str, section_type: str) -> dict:
    colors = _extract_color_hints(prompt)
    builder = SECTION_BUILDERS.get(section_type, _build_hero_section)
    return builder(prompt, colors)


async def _try_claude_generate(prompt: str, section_type: str) -> dict | None:
    """Attempt to use Claude API if ANTHROPIC_API_KEY is configured."""
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return None
    try:
        import httpx
        system = """You are a web design assistant. Generate a JSON section for a visual page builder.
The section must follow this exact schema:
{
  "id": "section-<unique8chars>",
  "type": "section",
  "name": "<descriptive name>",
  "styles": {
    "background": { "type": "gradient"|"solid", "gradient": {"colors": ["#hex","#hex"], "angle": 135, "opacity": 40, "blur": 70} },
    "padding": {"top": 80, "right": 24, "bottom": 80, "left": 24}
  },
  "elements": [
    {
      "id": "element-<unique8chars>",
      "type": "heading"|"text"|"button"|"image",
      "props": { ... },
      "styles": { "typography": { "fontSize": 36, "fontWeight": 700, "color": "#hex", "textAlign": "center" }, "spacing": {"marginBottom": 16} }
    }
  ]
}
Return ONLY valid JSON. No markdown, no explanation."""

        user_msg = f"Generate a {section_type} section. User request: {prompt}"

        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': api_key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                json={
                    'model': 'claude-haiku-4-5-20251001',
                    'max_tokens': 1500,
                    'system': system,
                    'messages': [{'role': 'user', 'content': user_msg}]
                }
            )
        if resp.status_code != 200:
            return None
        data = resp.json()
        text = data['content'][0]['text'].strip()
        # Strip markdown code blocks if present
        if text.startswith('```'):
            text = text.split('\n', 1)[1]
            text = text.rsplit('```', 1)[0].strip()
        import json
        return json.loads(text)
    except Exception as e:
        logger.error(f"AI content generation failed: {e}")
        return None


@router.post("/generate-section")
async def generate_section(
    request: AIDesignRequest,
    user: dict = Depends(require_auth)
):
    """Generate a page section from a text prompt.

    Uses Claude API if ANTHROPIC_API_KEY is set, otherwise uses
    smart template-based generation.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    section_type = (request.sectionType or 'hero').lower()

    # Try Claude API first (optional enhancement)
    ai_section = await _try_claude_generate(request.prompt, section_type)
    if ai_section:
        return {
            'success': True,
            'section': ai_section,
            'source': 'claude'
        }

    # Fallback: template-based generation
    section = _generate_section(request.prompt, section_type)
    return {
        'success': True,
        'section': section,
        'source': 'template'
    }


@router.post("/optimize-responsive")
async def optimize_responsive(
    request: AIResponsiveRequest,
    user: dict = Depends(require_auth)
):
    raise HTTPException(
        status_code=501,
        detail="AI Responsive Optimizer is not configured."
    )


@router.post("/analyze-seo")
async def analyze_seo(
    request: AISEORequest,
    user: dict = Depends(require_auth)
):
    raise HTTPException(
        status_code=501,
        detail="AI SEO Analysis is not configured."
    )


@router.post("/check-accessibility")
async def check_accessibility(
    request: AIAccessibilityRequest,
    user: dict = Depends(require_auth)
):
    raise HTTPException(
        status_code=501,
        detail="AI Accessibility Check is not configured."
    )


@router.post("/fix-accessibility")
async def fix_accessibility(
    request: AIAccessibilityRequest,
    user: dict = Depends(require_auth)
):
    raise HTTPException(
        status_code=501,
        detail="AI Accessibility Fix is not configured."
    )
