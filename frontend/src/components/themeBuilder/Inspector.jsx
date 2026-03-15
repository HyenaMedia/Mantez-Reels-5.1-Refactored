import React from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Button } from '../ui/button';
import {
  Type,
  Palette,
  Layout,
  X,
  Sliders,
  Zap,
  ArrowLeft,
  Layers,
  Settings,
  Sparkles,
  Monitor,
  Wand2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ConditionalLogic from './ConditionalLogic';
import QueryLoopEditor from './QueryLoopEditor';

/* ── Extracted sub-panels ─────────────────────────────────────── */
import { ContentTab, SettingsTab, MotionTab, ResponsiveTab } from './inspector/ElementPropertiesPanel';
import { StyleTab, StateVariantsPanel, LayoutTab, EffectsTab } from './inspector/ElementStylesPanel';
import SectionPropertiesPanel from './inspector/SectionPropertiesPanel';

/* Panel label → icon map for breadcrumb display */
const PANEL_ICONS = {
  layers:   <Layers size={11} />,
  settings: <Settings size={11} />,
  ai:       <Sparkles size={11} />,
};

const Inspector = ({ onBack = null, backLabel = null }) => {
  const {
    selectedElement, selectedSection, pageState,
    updateElement, setSelectedElement, updateSection, setSelectedSection,
  } = useThemeEditor();

  const element = React.useMemo(() => {
    if (!selectedElement || !pageState?.page?.sections) return null;
    for (const section of pageState.page.sections) {
      const found = section.elements?.find(e => e.id === selectedElement);
      if (found) return found;
    }
    return null;
  }, [selectedElement, pageState]);

  const section = React.useMemo(() => {
    if (!selectedSection || !pageState?.page?.sections) return null;
    return pageState.page.sections.find(s => s.id === selectedSection) || null;
  }, [selectedSection, pageState]);

  // Section inspector (when no element selected)
  if (!selectedElement && selectedSection && section) {
    return <SectionPropertiesPanel section={section} updateSection={updateSection} setSelectedSection={setSelectedSection} onBack={onBack} backLabel={backLabel} />;
  }

  if (!selectedElement || !element) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-3">
        <Sliders className="w-10 h-10 text-gray-300 dark:text-gray-700" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Inspector</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Click any element on the canvas to edit its properties
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800">
          <Zap size={11} className="text-violet-500 shrink-0" />
          <span className="text-xs text-violet-600 dark:text-violet-400">
            Use the ✦ AI tab to generate sections
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Back breadcrumb (shown when navigated from another panel) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 border-b border-gray-200 dark:border-gray-800 transition-colors w-full text-left shrink-0"
        >
          <ArrowLeft size={11} />
          {PANEL_ICONS[backLabel]}
          <span className="capitalize">{backLabel || 'Back'}</span>
        </button>
      )}
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {element.type}
          </h3>
          <p className="text-xs text-gray-400 font-mono truncate max-w-[180px]">{element.id}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedElement(null)} className="h-7 w-7 p-0" title="Deselect (Esc)" aria-label="Deselect element">
          <X size={14} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="w-full">

          <TabsList className="w-full grid grid-cols-7 rounded-none border-b border-gray-200 dark:border-gray-800 h-9">
            <TabsTrigger value="content"    title="Content"    aria-label="Content"    className="text-xs px-0.5"><Type     size={11} /></TabsTrigger>
            <TabsTrigger value="layout"     title="Layout"     aria-label="Layout"     className="text-xs px-0.5"><Layout   size={11} /></TabsTrigger>
            <TabsTrigger value="style"      title="Style"      aria-label="Style"      className="text-xs px-0.5"><Palette  size={11} /></TabsTrigger>
            <TabsTrigger value="motion"     title="Motion"     aria-label="Motion"     className="text-xs px-0.5"><Zap      size={11} /></TabsTrigger>
            <TabsTrigger value="effects"    title="Effects"    aria-label="Effects"    className="text-xs px-0.5"><Wand2    size={11} /></TabsTrigger>
            <TabsTrigger value="settings"   title="Settings"   aria-label="Settings"   className="text-xs px-0.5"><Settings size={11} /></TabsTrigger>
            <TabsTrigger value="responsive" title="Responsive" aria-label="Responsive" className="text-xs px-0.5"><Monitor  size={11} /></TabsTrigger>
          </TabsList>

          <div className="p-3">
            <TabsContent value="content" className="mt-0 space-y-3">
              <ContentTab element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="layout" className="mt-0 space-y-3">
              <LayoutTab element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="style" className="mt-0 space-y-3">
              <StyleTab element={element} updateElement={updateElement} />
              <StateVariantsPanel element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="motion" className="mt-0 space-y-3">
              <MotionTab element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="effects" className="mt-0 space-y-3">
              <EffectsTab element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="settings" className="mt-0 space-y-3">
              <SettingsTab element={element} updateElement={updateElement} />
              <ConditionalLogic element={element} updateElement={updateElement} />
              <QueryLoopEditor element={element} updateElement={updateElement} />
            </TabsContent>
            <TabsContent value="responsive" className="mt-0 space-y-3">
              <ResponsiveTab element={element} updateElement={updateElement} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Inspector;
