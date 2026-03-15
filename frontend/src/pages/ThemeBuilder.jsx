import React, { useState } from 'react';
import { ArrowLeft, Monitor, Tablet, Smartphone, Save, Download, RotateCcw, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ComponentRegistryProvider, useComponentRegistry } from '../contexts/ComponentRegistryContext';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import ReactComponentCanvas from '../components/themeBuilder/ReactComponentCanvas';
import ReactComponentInspector from '../components/themeBuilder/ReactComponentInspector';
import ComponentLayersPanel from '../components/themeBuilder/ComponentLayersPanel';
import BuilderToolbar from '../components/themeBuilder/BuilderToolbar';
import AnimationStudio from '../components/themeBuilder/AnimationStudio';
import RealPerformanceDashboard from '../components/themeBuilder/RealPerformanceDashboard';
import AdvancedExportPanel from '../components/themeBuilder/AdvancedExportPanel';
import TemplateLibrary from '../components/themeBuilder/TemplateLibrary';
import AIDesignAssistant from '../components/themeBuilder/AIDesignAssistant';
import FeatureFlagsPanel from '../components/admin/FeatureFlagsPanel';

const ThemeBuilderContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activePanel, setActivePanel] = useState('inspector'); // Track active panel
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  const {
    pageComponents,
    selectedComponent,
    componentContent,
    saving,
    refreshContent,
    saveComponentOrder,
    updateComponentContentLocal
  } = useComponentRegistry();

  const handleSave = async () => {
    const result = await saveComponentOrder();
    if (result.success) {
      toast({
        title: 'Saved!',
        description: 'Page layout saved successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save page layout',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = async () => {
    await refreshContent();
    toast({
      title: 'Refreshed',
      description: 'Content reloaded from server',
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reload from server? Any unsaved changes will be lost.')) {
      handleRefresh();
    }
  };

  const handleExport = () => {
    // Export handled by export panel
    setActivePanel('export');
    toast({
      title: 'Export Panel',
      description: 'Select your export format'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-12">
      {/* Top Bar */}
      <div className="fixed top-12 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left - Back Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Theme Builder</h1>
          </div>

          {/* Center - Device Preview Switcher */}
          <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg">
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('desktop')}
              className="gap-2"
            >
              <Monitor size={16} />
              Desktop
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('tablet')}
              className="gap-2"
            >
              <Tablet size={16} />
              Tablet
            </Button>
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('mobile')}
              className="gap-2"
            >
              <Smartphone size={16} />
              Mobile
            </Button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo removed - not applicable for component editing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFeaturePanel(true)}
              className="gap-2"
              title="Builder Features"
            >
              <Sliders size={16} />
              <span className="hidden lg:inline">Features</span>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download size={16} />
              <span className="hidden lg:inline">Export</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={saving}
              className="gap-2"
              title="Reload content from server"
            >
              <RotateCcw size={16} />
              <span className="hidden lg:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-screen flex">
        {/* Left Toolbar */}
        <BuilderToolbar 
          onOpenPanel={setActivePanel} 
          activePanel={activePanel}
        />
        
        {/* Center - Canvas with actual React components */}
        <div className="flex-1 overflow-hidden relative">
          <ReactComponentCanvas device={previewDevice} />

        </div>

        {/* Right Panel - Dynamic based on activePanel */}
        {(activePanel === 'inspector' || 
          activePanel === 'layers' ||
          activePanel === 'animations' || 
          activePanel === 'ai-assistant' || 
          activePanel === 'performance' || 
          activePanel === 'export' ||
          activePanel === 'templates') && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 overflow-y-auto shadow-xl">
            {/* Back Navigation Header - Show on all panels except inspector when component is selected */}
            {activePanel !== 'inspector' && selectedComponent && (
              <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setActivePanel('inspector')}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Back to Inspector</span>
                </button>
              </div>
            )}
            
            {activePanel === 'inspector' && <ReactComponentInspector />}
            {activePanel === 'layers' && (
              <div className="h-full bg-gray-900">
                <ComponentLayersPanel 
                  onSelectComponent={() => {
                    // When a component is selected in layers, switch to inspector
                    setActivePanel('inspector');
                  }}
                />
              </div>
            )}
            {activePanel === 'animations' && (
              <div className="h-full bg-gray-900">
                <AnimationStudio 
                  element={selectedComponent ? {
                    id: selectedComponent,
                    name: pageComponents.find(c => c.id === selectedComponent)?.name,
                    animations: componentContent[selectedComponent]?.animations || []
                  } : null}
                  onUpdate={(updatedElement) => {
                    if (selectedComponent && updatedElement.animations) {
                      const currentContent = componentContent[selectedComponent] || {};
                      updateComponentContentLocal(selectedComponent, {
                        ...currentContent,
                        animations: updatedElement.animations
                      });
                    }
                  }} 
                />
              </div>
            )}
            {activePanel === 'ai-assistant' && (
              <div className="h-full bg-gray-900">
                <AIDesignAssistant />
              </div>
            )}
            {activePanel === 'performance' && (
              <div className="h-full bg-gradient-to-b from-gray-900 to-gray-950">
                <RealPerformanceDashboard pageStructure={pageComponents} />
              </div>
            )}
            {activePanel === 'export' && (
              <div className="h-full bg-gray-900">
                <AdvancedExportPanel pageStructure={pageComponents} />
              </div>
            )}
            {activePanel === 'templates' && (
              <div className="h-full bg-gray-900">
                <TemplateLibrary onSelectTemplate={(_t) => {
                  setActivePanel('inspector');
                }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Flags Panel */}
      <FeatureFlagsPanel
        isOpen={showFeaturePanel}
        onClose={() => setShowFeaturePanel(false)}
      />
    </div>
  );
};

const ThemeBuilder = () => {
  return (
    <ComponentRegistryProvider>
      <ThemeBuilderContent />
    </ComponentRegistryProvider>
  );
};

export default ThemeBuilder;