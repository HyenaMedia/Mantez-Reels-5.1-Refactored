import React from 'react';

/**
 * Secondary bar below AdminTopbar — shows only the page title and subtitle.
 * Search, notifications, and quick actions are now in the main AdminTopbar.
 */
const TopBar = ({ title, subtitle, isCollapsed }) => {
  return (
    <div
      className={`fixed top-12 right-0 h-12 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06] z-30 transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}
    >
      <div className="h-full px-6 flex items-center">
        <div>
          <h1 className="text-base font-semibold text-white leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-gray-500 leading-tight">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
