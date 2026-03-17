import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Paintbrush,
  Settings,
  Eye,
  Save,
  ChevronDown,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import CacheIndicator from './CacheIndicator';

const AdminTopbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const logoUrl = settings?.site?.logoUrl || '';
  const siteName = settings?.site?.siteName || 'Mantez Reels';
  const isAdminPage = location.pathname.includes('/admin');
  const isBuilderPage = location.pathname.includes('/theme-builder');

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-[9999] flex items-center px-4 gap-4">
        {/* Left Section - Site Logo + Navigation */}
        <div className="flex items-center gap-2">
          {/* Site logo — links to homepage */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mr-1"
            title="View site"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-5 w-auto object-contain" />
            ) : (
              <span className="font-semibold text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {siteName}
              </span>
            )}
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>

          <div className="w-px h-5 bg-gray-700" />

          <Link
            to="/admin"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              isAdminPage
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            to="/admin/theme-builder"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              isBuilderPage
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span className="hidden sm:inline">Builder</span>
          </Link>
        </div>

        {/* Center Section - Status Indicators */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {isBuilderPage && (
            <>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Preview</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors">
                <Save className="w-4 h-4" />
                <span className="hidden md:inline">Saved</span>
              </button>
            </>
          )}
        </div>

        {/* Cache Performance Indicator */}
        <CacheIndicator />

        {/* Right Section - User Profile */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                {user.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:inline">{user.username}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTopbar;
