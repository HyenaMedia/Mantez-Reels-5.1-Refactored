import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import require_auth
from database import db

router = APIRouter(prefix="/api/theme", tags=["theme"])
logger = logging.getLogger(__name__)

COLLECTION = "global_styles"


# --- Global Styles Models ---

class TypographyScale(BaseModel):
    headingFont: str = "Inter"
    bodyFont: str = "Inter"
    h1: dict = Field(default_factory=lambda: {"fontSize": 48, "fontWeight": 700, "lineHeight": 1.2})
    h2: dict = Field(default_factory=lambda: {"fontSize": 36, "fontWeight": 600, "lineHeight": 1.3})
    h3: dict = Field(default_factory=lambda: {"fontSize": 30, "fontWeight": 600, "lineHeight": 1.3})
    h4: dict = Field(default_factory=lambda: {"fontSize": 24, "fontWeight": 600, "lineHeight": 1.4})
    h5: dict = Field(default_factory=lambda: {"fontSize": 20, "fontWeight": 500, "lineHeight": 1.4})
    h6: dict = Field(default_factory=lambda: {"fontSize": 18, "fontWeight": 500, "lineHeight": 1.5})
    body: dict = Field(default_factory=lambda: {"fontSize": 16, "fontWeight": 400, "lineHeight": 1.6})
    small: dict = Field(default_factory=lambda: {"fontSize": 14, "fontWeight": 400, "lineHeight": 1.5})


class ColorPalette(BaseModel):
    primary: str = "#8b5cf6"
    secondary: str = "#7c3aed"
    accent: str = "#a855f7"
    success: str = "#10b981"
    warning: str = "#f59e0b"
    error: str = "#ef4444"
    info: str = "#3b82f6"
    background: str = "#000000"
    surface: str = "#111827"
    text: str = "#ffffff"
    textMuted: str = "#9ca3af"


class SpacingScale(BaseModel):
    xs: int = 4
    sm: int = 8
    md: int = 16
    lg: int = 24
    xl: int = 32
    xxl: int = 48


class GlobalStylesModel(BaseModel):
    colors: ColorPalette = Field(default_factory=ColorPalette)
    typography: TypographyScale = Field(default_factory=TypographyScale)
    spacing: SpacingScale = Field(default_factory=SpacingScale)
    borderRadius: dict = Field(default_factory=lambda: {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999})
    shadows: dict = Field(default_factory=lambda: {
        "sm": "0 1px 2px rgba(0,0,0,0.3)",
        "md": "0 4px 6px rgba(0,0,0,0.3)",
        "lg": "0 10px 15px rgba(0,0,0,0.3)",
        "xl": "0 20px 25px rgba(0,0,0,0.3)",
    })


class SectionConfigModel(BaseModel):
    backgroundType: str = "solid"
    solidColor: str | None = "#000000"
    gradientColors: list[str] | None = Field(default=["#9333ea", "#ec4899"])
    gradientOpacity: int | None = Field(default=40, ge=0, le=100)
    gradientAngle: int | None = Field(default=135, ge=0, le=360)
    imageUrl: str | None = ""
    headingColor: str = "#ffffff"
    bodyColor: str = "#e5e7eb"
    padding: dict = Field(default_factory=lambda: {"top": 80, "bottom": 80})


class ThemeConfigModel(BaseModel):
    id: str = "theme_config"
    name: str = "Default"
    globalStyles: GlobalStylesModel = Field(default_factory=GlobalStylesModel)
    sections: dict[str, SectionConfigModel] = Field(default_factory=dict)
    updated_at: datetime | None = None


DEFAULT_THEME = ThemeConfigModel(
    id="theme_config",
    name="Default",
    globalStyles=GlobalStylesModel(),
    sections={
        "hero": SectionConfigModel(
            backgroundType="gradient",
            gradientColors=["#9333ea", "#ec4899"],
            gradientOpacity=40,
            gradientAngle=135,
            headingColor="#ffffff",
            bodyColor="#e5e7eb",
            padding={"top": 120, "bottom": 120},
        ),
        "about": SectionConfigModel(solidColor="#111827"),
        "portfolio": SectionConfigModel(solidColor="#000000"),
        "services": SectionConfigModel(solidColor="#111827"),
        "contact": SectionConfigModel(
            backgroundType="gradient",
            gradientColors=["#1e293b", "#0f172a"],
            gradientAngle=180,
        ),
    },
)


@router.get("/config")
async def get_theme_config(user: dict = Depends(require_auth)):
    """Get current global styles / theme configuration"""
    try:
        theme = await db[COLLECTION].find_one({"id": "theme_config"}, {"_id": 0})
        if not theme:
            return DEFAULT_THEME.model_dump()
        return theme
    except Exception as e:
        logger.error(f"Error fetching theme config: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch theme configuration")


@router.put("/config")
async def update_theme_config(
    theme_data: ThemeConfigModel,
    user: dict = Depends(require_auth),
):
    """Update global styles / theme configuration"""
    try:
        theme_dict = theme_data.model_dump()
        theme_dict["updated_at"] = datetime.now(UTC)
        theme_dict["updated_by"] = user.get("username", "admin")

        await db[COLLECTION].update_one(
            {"id": "theme_config"}, {"$set": theme_dict}, upsert=True
        )

        return {"success": True, "message": "Theme configuration updated"}
    except Exception as e:
        logger.error(f"Error updating theme config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update theme configuration")


@router.get("/config/public")
async def get_public_theme_config():
    """Get global styles (public, no auth)"""
    try:
        theme = await db[COLLECTION].find_one({"id": "theme_config"}, {"_id": 0})
        if not theme:
            return DEFAULT_THEME.model_dump()
        return theme
    except Exception as e:
        logger.error(f"Error fetching public theme config: {e}")
        return DEFAULT_THEME.model_dump()


@router.post("/reset")
async def reset_theme_to_default(user: dict = Depends(require_auth)):
    """Reset theme to default"""
    try:
        theme_dict = DEFAULT_THEME.model_dump()
        theme_dict["updated_at"] = datetime.now(UTC)
        theme_dict["updated_by"] = user.get("username", "admin")

        await db[COLLECTION].update_one(
            {"id": "theme_config"}, {"$set": theme_dict}, upsert=True
        )

        return {"success": True, "message": "Theme reset to default"}
    except Exception as e:
        logger.error(f"Error resetting theme: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset theme")


@router.get("/presets")
async def get_theme_presets(user: dict = Depends(require_auth)):
    """Get available theme presets"""
    base = DEFAULT_THEME.model_dump()
    presets = [
        {"name": "Default", "description": "Purple gradient dark theme", "config": base},
        {
            "name": "Ocean",
            "description": "Cool blue oceanic vibes",
            "config": {
                **base,
                "name": "Ocean",
                "globalStyles": {
                    **base["globalStyles"],
                    "colors": {**base["globalStyles"]["colors"], "primary": "#3b82f6", "secondary": "#06b6d4", "accent": "#0ea5e9"},
                },
            },
        },
        {
            "name": "Sunset",
            "description": "Warm orange and pink",
            "config": {
                **base,
                "name": "Sunset",
                "globalStyles": {
                    **base["globalStyles"],
                    "colors": {**base["globalStyles"]["colors"], "primary": "#f97316", "secondary": "#ec4899", "accent": "#fb923c"},
                },
            },
        },
    ]
    return {"presets": presets}
