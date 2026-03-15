import React, { useState, useRef, useEffect } from 'react';

/**
 * CanvasContextMenu - Right-click context menu for canvas elements
 */
const CanvasContextMenu = ({ x, y, items, onClose }) => {
  const ref = useRef(null);
  const [focusedIdx, setFocusedIdx] = useState(0);

  // Collect indices of actionable (non-separator, non-disabled) items
  const actionIndices = items.reduce((acc, item, i) => {
    if (item !== 'separator' && !item.disabled) acc.push(i);
    return acc;
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Auto-focus first actionable item on mount
  useEffect(() => {
    const firstBtn = ref.current?.querySelector('[role="menuitem"]:not([disabled])');
    firstBtn?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentPos = actionIndices.indexOf(focusedIdx);
      let nextPos;
      if (e.key === 'ArrowDown') {
        nextPos = currentPos < actionIndices.length - 1 ? currentPos + 1 : 0;
      } else {
        nextPos = currentPos > 0 ? currentPos - 1 : actionIndices.length - 1;
      }
      const nextIdx = actionIndices[nextPos];
      setFocusedIdx(nextIdx);
      // Focus the corresponding button
      const btns = ref.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
      btns?.[nextPos]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = items[focusedIdx];
      if (item && item !== 'separator' && !item.disabled) {
        item.action();
        onClose();
      }
    }
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Element actions"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{ position: 'fixed', top: y, left: x, zIndex: 9999 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-[170px] outline-none"
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={`sep-${i}`} role="separator" className="my-1 border-t border-gray-100 dark:border-gray-700" />
        ) : (
          <button
            key={item.label ?? i}
            role="menuitem"
            aria-disabled={item.disabled}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
            onFocus={() => setFocusedIdx(i)}
            disabled={item.disabled}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors focus:outline-none focus:bg-violet-50 dark:focus:bg-violet-900/20 ${
              item.danger
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {item.icon && <item.icon size={14} className={item.danger ? 'text-red-500' : 'text-gray-400'} />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-[10px] text-gray-400">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
};

export default CanvasContextMenu;
