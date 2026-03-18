# Next Session Plan: Wire Up Visual Page Builder

## Context
48 theme builder components exist as files but ThemeBuilder.jsx still uses the old ComponentRegistryContext. The page needs to be rewritten to use the new DnD-powered builder system.

## Priority Order

### Phase 1: Core Builder Integration (CRITICAL — do this first)
**Goal:** ThemeBuilder page uses the new DnD system, users can drag elements onto canvas

1. **Rewrite ThemeBuilder.jsx** to use `ThemeEditorProvider` + `DndProvider` instead of `ComponentRegistryProvider`
   - File: `frontend/src/pages/ThemeBuilder.jsx`
   - Import ThemeEditorContext, DndProvider
   - Replace ReactComponentCanvas with DroppableCanvas
   - Keep ComponentRegistryContext for the public-facing site (don't break the homepage)

2. **Add ElementLibrary + SectionLibrary panels**
   - Left sidebar should have tabs: Layers | Elements | Sections
   - Elements = 40+ draggable items from ElementLibrary.jsx
   - Sections = pre-built templates from SectionLibrary.jsx

3. **Wire up the Inspector**
   - Replace ReactComponentInspector with the new Inspector
   - Use ElementPropertiesPanel + ElementStylesPanel from inspector/
   - Selected element → show properties on the right

4. **Test drag-and-drop flow**
   - Drag element from library → drop on canvas
   - Drag section from library → add to page
   - Reorder sections by dragging
   - Reorder elements within sections

### Phase 2: Global Settings & Toolbar
5. **Add GlobalSettings panel** (colors, typography, spacing, breakpoints)
6. **Wire up BuilderToolbar** save/export buttons to ThemeEditorContext methods
7. **Add VersionHistory** panel for save/restore snapshots

### Phase 3: Advanced Builder Features
8. **FormBuilder** — drag-and-drop form creation
9. **ConditionalLogic** — show/hide rules per element
10. **AnimationStudio** — entrance/scroll/hover animations per element
11. **AI Design Assistant** — generate sections via AI

### Phase 4: Polish & Testing
12. **Responsive preview** — mobile/tablet/desktop in canvas
13. **Keyboard shortcuts** — Cmd+K (quick switcher via cmdk), Cmd+S (save), Delete, Esc
14. **Performance** — lazy load heavy panels, optimize canvas rendering
15. **Export** — React/Next.js/Vue/HTML/WordPress via AdvancedExportPanel

## Key Architecture Notes

### Two context systems (keep both):
- **ComponentRegistryContext** — used by the PUBLIC site to render page sections (Hero, Portfolio, etc.). Don't break this.
- **ThemeEditorContext** — used by the BUILDER for editing. JSON-driven page structure with sections → elements → styles.

### DndProvider handles 3 cases:
1. Library → Canvas (add new element/section)
2. Section reorder (drag sections up/down)
3. Element reorder (drag elements within or across sections)

### Page structure (JSON):
```
page.meta.settings.globalStyles (colors, typography, spacing)
page.sections[] → each has: id, type, name, styles, elements[]
page.sections[].elements[] → each has: id, type, props, styles
```

## Files to read first
- `frontend/src/contexts/ThemeEditorContext.jsx` (572 lines) — understand the state model
- `frontend/src/contexts/DndProvider.jsx` (280+ lines) — understand drag-and-drop handlers
- `frontend/src/components/themeBuilder/DroppableCanvas.jsx` — the new canvas
- `frontend/src/components/themeBuilder/ElementLibrary.jsx` — element types and categories
- `frontend/src/components/themeBuilder/SectionLibrary.jsx` — section templates
- `frontend/src/pages/ThemeBuilder.jsx` — the page to rewrite
