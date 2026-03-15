import logging
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth

router = APIRouter(prefix="/api/animations", tags=["animations"])
logger = logging.getLogger(__name__)

# Sanitize CSS identifiers to prevent injection
_CSS_IDENT_RE = re.compile(r'[^a-zA-Z0-9_-]')
def _safe_css_ident(value: str) -> str:
    """Strip any char that isn't safe in a CSS identifier."""
    return _CSS_IDENT_RE.sub('', value)

_CSS_VALUE_RE = re.compile(r'[^a-zA-Z0-9_.() -]')
def _safe_css_value(value: str) -> str:
    """Strip unsafe chars from CSS values (easing, etc.)."""
    return _CSS_VALUE_RE.sub('', value)

# Animation Models
class Animation(BaseModel):
    id: str
    name: str
    type: str
    duration: float
    delay: float
    trigger: str
    easing: str
    loop: bool
    loopCount: int

class AnimationPreset(BaseModel):
    name: str
    animations: list[Animation]
    description: str | None = None
    thumbnail: str | None = None

# Get animation presets library
@router.get("/presets")
async def get_animation_presets(user: dict = Depends(require_auth)):
    """
    Get library of animation presets
    """
    presets = [
        {
            "id": "fade-in-up",
            "name": "Fade In Up",
            "description": "Smooth fade in with upward motion",
            "animations": [
                {
                    "type": "fadeIn",
                    "duration": 0.8,
                    "delay": 0,
                    "trigger": "onScroll",
                    "easing": "ease-out"
                },
                {
                    "type": "slideInUp",
                    "duration": 0.8,
                    "delay": 0,
                    "trigger": "onScroll",
                    "easing": "ease-out"
                }
            ]
        },
        {
            "id": "scale-bounce",
            "name": "Scale Bounce",
            "description": "Playful bouncy entrance",
            "animations": [
                {
                    "type": "bounceIn",
                    "duration": 1.2,
                    "delay": 0,
                    "trigger": "onScroll",
                    "easing": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                }
            ]
        },
        {
            "id": "parallax",
            "name": "Parallax Scroll",
            "description": "Smooth parallax effect on scroll",
            "animations": [
                {
                    "type": "parallax",
                    "duration": 0,
                    "delay": 0,
                    "trigger": "onScroll",
                    "easing": "linear",
                    "speed": 0.5
                }
            ]
        }
    ]

    return {"success": True, "presets": presets}

# Generate animation CSS
@router.post("/generate-css")
async def generate_animation_css(
    animations: list[Animation],
    user: dict = Depends(require_auth)
):
    """
    Generate CSS code for animations
    """
    try:
        css_rules = []

        for anim in animations:
            # Sanitize all values before interpolating into CSS
            safe_type = _safe_css_ident(anim.type)
            safe_id = _safe_css_ident(anim.id)
            safe_easing = _safe_css_value(anim.easing)
            safe_duration = max(0, min(anim.duration, 60))
            safe_delay = max(0, min(anim.delay, 30))

            # Generate keyframe
            keyframe = f"""
@keyframes {safe_type} {{
  /* Animation keyframes for {safe_type} */
}}
"""
            css_rules.append(keyframe)

            # Generate animation rule
            animation_rule = f"""
.animated-{safe_id} {{
  animation: {safe_type} {safe_duration}s {safe_easing} {safe_delay}s;
  animation-fill-mode: both;
  {f'animation-iteration-count: {anim.loopCount};' if anim.loop and anim.loopCount > 0 else ''}
  {'animation-iteration-count: infinite;' if anim.loop and anim.loopCount == 0 else ''}
}}
"""
            css_rules.append(animation_rule)

        return {
            "success": True,
            "css": "\n".join(css_rules)
        }

    except Exception as e:
        logger.error(f"CSS generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate animation CSS")

# Validate animation timeline
@router.post("/validate-timeline")
async def validate_timeline(
    animations: list[Animation],
    user: dict = Depends(require_auth)
):
    """
    Validate animation timeline for conflicts and performance
    """
    try:
        warnings = []
        errors = []

        # Check for performance issues
        total_duration = sum(a.duration + a.delay for a in animations)
        if total_duration > 10:
            warnings.append({
                "type": "performance",
                "message": f"Total animation duration ({total_duration}s) is quite long"
            })

        # Check for too many simultaneous animations
        if len(animations) > 5:
            warnings.append({
                "type": "performance",
                "message": f"Too many animations ({len(animations)}) may impact performance"
            })

        # Check for conflicting animations
        for i, anim1 in enumerate(animations):
            for anim2 in animations[i+1:]:
                if anim1.trigger == anim2.trigger and abs(anim1.delay - anim2.delay) < 0.1:
                    warnings.append({
                        "type": "conflict",
                        "message": f"Animations '{anim1.type}' and '{anim2.type}' may conflict"
                    })

        return {
            "success": True,
            "valid": len(errors) == 0,
            "warnings": warnings,
            "errors": errors
        }

    except Exception as e:
        logger.error(f"Timeline validation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate animation timeline")
