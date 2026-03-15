import React, { useState } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Sparkles, Wand2, Loader2, ChevronDown, Clock, Trash2, Plus } from 'lucide-react';
import axios from 'axios';

const SECTION_TYPES = [
  { value: 'hero',        label: 'Hero',         emoji: '🚀' },
  { value: 'features',    label: 'Features',      emoji: '⚡' },
  { value: 'about',       label: 'About',         emoji: '👥' },
  { value: 'cta',         label: 'Call to Action', emoji: '🎯' },
  { value: 'testimonial', label: 'Testimonials',  emoji: '💬' },
  { value: 'stats',       label: 'Stats',         emoji: '📊' },
  { value: 'gallery',     label: 'Gallery',       emoji: '🖼️' },
];

const QUICK_SUGGESTIONS = [
  { prompt: 'Dark tech hero for a SaaS startup with blue accents', type: 'hero' },
  { prompt: 'Minimal white features section for a productivity app', type: 'features' },
  { prompt: 'Warm gradient CTA for restaurant booking', type: 'cta' },
  { prompt: 'Dark testimonials for a creative agency', type: 'testimonial' },
  { prompt: 'Purple gradient stats for a marketing platform', type: 'stats' },
  { prompt: 'Photography gallery with dark background', type: 'gallery' },
];

const AIDesignAssistant = () => {
  const { addSection } = useThemeEditor();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [sectionType, setSectionType] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const handleGenerate = async (overridePrompt, overrideType) => {
    const finalPrompt = overridePrompt || prompt;
    const finalType = overrideType || sectionType;
    if (!finalPrompt.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate-section`,
        { prompt: finalPrompt, sectionType: finalType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.section) {
        addSection(response.data.section);
        // Add to history
        setHistory(prev => [{
          prompt: finalPrompt,
          type: finalType,
          sectionName: response.data.section.name,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);
        if (!overridePrompt) setPrompt('');
        toast({
          title: 'Section added',
          description: `"${response.data.section.name}" was added to the canvas.`
        });
      }
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error.response?.data?.detail || 'Failed to generate section',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="ai-design-assistant">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-violet-500/10">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Design Assistant</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Describe a section in plain English</p>
        </div>
      </div>

      {/* Section type picker */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Section Type</Label>
        <div className="grid grid-cols-2 gap-1">
          {SECTION_TYPES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setSectionType(value)}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
                sectionType === value
                  ? 'bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-750'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt textarea */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Describe what you want</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
          placeholder={`e.g. "Dark tech hero for a SaaS startup with blue accents"`}
          rows={3}
          className="text-sm resize-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">⌘ + Enter to generate</p>
      </div>

      {/* Generate button */}
      <Button
        onClick={() => handleGenerate()}
        disabled={!prompt.trim() || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        data-testid="generate-ai-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Section
          </>
        )}
      </Button>

      {/* Quick suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Start</p>
        <div className="space-y-1.5">
          {QUICK_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleGenerate(s.prompt, s.type)}
              disabled={loading}
              className="w-full flex items-start gap-2 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-violet-200 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 leading-relaxed">
                {s.prompt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Recent ({history.length})
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>

          {showHistory && (
            <div className="space-y-1">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(item.prompt); setSectionType(item.type); }}
                  disabled={loading}
                  className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.sectionName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.prompt}</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600">{item.timestamp}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setHistory([])}
                className="w-full flex items-center justify-center gap-1.5 p-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear history
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-violet-500 dark:text-violet-400 text-center">
        Generated sections are added directly to the canvas
      </p>
    </div>
  );
};

export default AIDesignAssistant;
