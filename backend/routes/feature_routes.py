import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import require_auth
from database import db

router = APIRouter(prefix="/api/admin/features", tags=["features"])
logger = logging.getLogger(__name__)

COLLECTION = "feature_flags"


class FeatureFlag(BaseModel):
    enabled: bool = False
    label: str
    description: str = ""
    category: str = "core"  # core, navigation, advanced, premium


class FeatureFlagsModel(BaseModel):
    drag_and_drop: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=True,
            label="Drag & Drop",
            description="Reorder sections and elements with drag & drop",
            category="core"
        )
    )
    element_library: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=True,
            label="Element Library",
            description="Add elements from the library to your pages",
            category="core"
        )
    )
    inspector_panel: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=True,
            label="Inspector Panel",
            description="Edit element properties in the inspector",
            category="core"
        )
    )
    section_management: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=True,
            label="Section Management",
            description="Add, duplicate, and delete page sections",
            category="core"
        )
    )
    navbar_editor: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=True,
            label="Navbar Editor",
            description="Edit the navigation bar in the builder",
            category="core"
        )
    )
    global_settings: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Global Settings",
            description="Manage site-wide typography, colors, and spacing",
            category="advanced"
        )
    )
    quick_switcher: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Quick Switcher (Cmd+K)",
            description="Fast navigation with command palette",
            category="navigation"
        )
    )
    keyboard_shortcuts: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Keyboard Shortcuts",
            description="Enhanced keyboard navigation and actions",
            category="navigation"
        )
    )
    back_navigation: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Back Navigation",
            description="Navigate back through inspector panels",
            category="navigation"
        )
    )
    resizable_panels: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Resizable Panels",
            description="Resize sidebar panels by dragging",
            category="advanced"
        )
    )
    component_variants: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Component Variants",
            description="Create hover, active, and other state variants",
            category="advanced"
        )
    )
    version_history: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Version History",
            description="View and restore previous versions",
            category="premium"
        )
    )
    comments: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Collaborative Comments",
            description="Add comments to components for team collaboration",
            category="premium"
        )
    )
    smart_animate: FeatureFlag = Field(
        default_factory=lambda: FeatureFlag(
            enabled=False,
            label="Smart Animate",
            description="Automatic smooth transitions between states",
            category="premium"
        )
    )


class FeatureFlagsDocument(BaseModel):
    id: str = "feature_flags"
    flags: FeatureFlagsModel = Field(default_factory=FeatureFlagsModel)
    updated_at: datetime | None = None
    updated_by: str = "admin"


DEFAULT_FLAGS = FeatureFlagsDocument(
    id="feature_flags",
    flags=FeatureFlagsModel(),
    updated_at=datetime.now(UTC),
    updated_by="system"
)


@router.get("")
async def get_feature_flags(user: dict = Depends(require_auth)):
    """Get all feature flags (requires authentication)"""
    try:
        doc = await db[COLLECTION].find_one({"id": "feature_flags"}, {"_id": 0})
        
        if not doc:
            # Initialize with defaults
            default_doc = DEFAULT_FLAGS.model_dump()
            default_doc["updated_at"] = default_doc["updated_at"].isoformat()
            await db[COLLECTION].insert_one(default_doc)
            return {"flags": DEFAULT_FLAGS.flags.model_dump()}
        
        # Serialize datetime if present
        if "updated_at" in doc and hasattr(doc["updated_at"], "isoformat"):
            doc["updated_at"] = doc["updated_at"].isoformat()
        
        return {"flags": doc.get("flags", DEFAULT_FLAGS.flags.model_dump())}
    
    except Exception as e:
        logger.error(f"Error fetching feature flags: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feature flags")


@router.put("")
async def update_feature_flags(
    flags: dict,
    user: dict = Depends(require_auth)
):
    """Update feature flags (requires authentication)"""
    try:
        doc = {
            "id": "feature_flags",
            "flags": flags,
            "updated_at": datetime.now(UTC),
            "updated_by": user.get("username", "admin")
        }
        
        await db[COLLECTION].update_one(
            {"id": "feature_flags"},
            {"$set": doc},
            upsert=True
        )
        
        return {"success": True, "message": "Feature flags updated successfully"}
    
    except Exception as e:
        logger.error(f"Error updating feature flags: {e}")
        raise HTTPException(status_code=500, detail="Failed to update feature flags")


@router.post("/reset")
async def reset_feature_flags(user: dict = Depends(require_auth)):
    """Reset feature flags to defaults (requires authentication)"""
    try:
        default_doc = DEFAULT_FLAGS.model_dump()
        default_doc["updated_at"] = datetime.now(UTC)
        default_doc["updated_by"] = user.get("username", "admin")
        
        await db[COLLECTION].update_one(
            {"id": "feature_flags"},
            {"$set": default_doc},
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Feature flags reset to defaults",
            "flags": DEFAULT_FLAGS.flags.model_dump()
        }
    
    except Exception as e:
        logger.error(f"Error resetting feature flags: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset feature flags")
