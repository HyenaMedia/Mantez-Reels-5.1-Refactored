import React from 'react';
import {
  Settings,
  Layers,
  Zap,
  Wand2,
  Film,
  Download,
  Eye,
  Palette,
  Moon,
  Sun
} from 'lucide-react';

const BuilderToolbar = ({ onOpenPanel, activePanel, theme, toggleTheme }) => {
  const tools = [
    {
      id: 'inspector',
      label: 'Inspector',
      icon: Settings,
      description: 'Edit element properties',
      shortcut: 'I'
    },
    {
      id: 'layers',
      label: 'Layers',
      icon: Layers,
      description: 'Page structure',
      shortcut: 'L'
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Wand2,
      description: 'Generate with AI',
      badge: 'AI',
      gradient: true
    },
    {
      id: 'animations',
      label: 'Animations',
      icon: Film,
      description: 'Add animations',
      shortcut: 'A'
    },

    {
      id: 'performance',
      label: 'Performance',
      icon: Zap,
      description: 'Optimize speed',
      shortcut: 'P'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      description: 'Export anywhere',
      shortcut: 'E'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Palette,
      description: 'Browse templates'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: Eye,
      description: 'Preview site',
      shortcut: 'Space'
    },
  ];

  return (
    <div className="builder-toolbar bg-gray-900 border-r border-gray-800 w-20 flex flex-col items-center py-6 gap-3" role="toolbar" aria-label="Builder tools">
      {/* Theme Toggle Button */}
      {toggleTheme && (
        <>
          <button
            onClick={toggleTheme}
            className="relative w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={22} strokeWidth={2.5} /> : <Moon size={22} strokeWidth={2.5} />}
            <span className="text-[9px] font-medium mt-1.5 tracking-wide">Theme</span>
            
            {/* Enhanced Tooltip */}
            <div className="absolute left-full ml-3 px-4 py-3 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
              <div className="font-semibold text-white">Theme Mode</div>
              <div className="text-xs text-slate-300 mt-1">Toggle light/dark preview</div>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900/95" />
            </div>
          </button>
          
          {/* Divider */}
          <div className="w-12 h-px bg-gray-700 my-1" role="separator" aria-hidden="true" />
        </>
      )}
      
      {/* Tool Buttons */}
      {tools.map(tool => {
        const Icon = tool.icon;
        const isActive = activePanel === tool.id;
        
        return (
          <button
            key={tool.id}
            onClick={() => onOpenPanel(tool.id)}
            className={`relative w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group ${
              isActive
                ? tool.gradient
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'text-gray-400 hover:bg-gray-800 hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
            aria-label={`${tool.label}: ${tool.description}${tool.shortcut ? '. Shortcut: ' + tool.shortcut : ''}`}
            aria-pressed={isActive}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-medium mt-1.5 tracking-wide">{tool.label.split(' ')[0]}</span>
            
            {tool.badge && (
              <span className={`absolute -top-1 -right-1 text-[7px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${
                tool.gradient
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse'
              }`}>
                {tool.badge}
              </span>
            )}
            
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
            )}
            
            {/* Enhanced Tooltip */}
            <div className="absolute left-full ml-3 px-4 py-3 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
              <div className="font-semibold text-white">{tool.label}</div>
              <div className="text-xs text-slate-300 mt-1">{tool.description}</div>
              {tool.shortcut && (
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span className="opacity-70">Shortcut:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">{tool.shortcut}</kbd>
                </div>
              )}
              {/* Tooltip arrow */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900/95" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BuilderToolbar;