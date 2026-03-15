import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Accordion = ({ title, icon: Icon, children, defaultOpen = false, isOpen, onToggle }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-2">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          isOpen
            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} />}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
