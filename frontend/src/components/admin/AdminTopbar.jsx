import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Paintbrush, Settings, Eye, Save, ChevronDown, LogOut,
  ExternalLink, Plus, Search, Bell, X, Check,
  AlertTriangle, Image, Users, Mail, FolderOpen, Shield,
  FileText, Upload, UserPlus, Wrench, Power, BarChart3, Globe
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import CacheIndicator from './CacheIndicator';
import PageSpeedIndicator from './PageSpeedIndicator';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/* ── tiny reusable dropdown backdrop ── */
const Backdrop = ({ onClick }) => (
  <div className="fixed inset-0 z-[9998]" onClick={onClick} />
);

/* ── server health dot (polls /api/dashboard/cache-status which is lightweight) ── */
const ServerHealthDot = ({ status }) => {
  const color = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-500';
  return (
    <span className="relative flex h-2 w-2" title={`Server: ${status || 'unknown'}`}>
      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${color} ${status === 'healthy' ? 'animate-ping' : ''}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
};

/* ══════════════════════════════════════════════ */
const AdminTopbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) return null;

  const logoUrl = settings?.site?.logoUrl || '';
  const siteName = settings?.site?.siteName || 'Mantez Reels';
  const isAdminPage = location.pathname.includes('/admin');
  const isBuilderPage = location.pathname.includes('/theme-builder');

  return (
    <AdminTopbarInner
      user={user} logout={logout} logoUrl={logoUrl} siteName={siteName}
      isAdminPage={isAdminPage} isBuilderPage={isBuilderPage}
      navigate={navigate} toast={toast}
    />
  );
};

/* Separate inner component so hooks work without conditional returns */
const AdminTopbarInner = ({ user, logout, logoUrl, siteName, isAdminPage, isBuilderPage, navigate, toast }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState({ serverStatus: 'unknown', errorCount: 0 });

  /* ── fetch server metrics (lightweight) ── */
  const fetchMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${BACKEND_URL}/api/dashboard/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const i = res.data.insights;
        setMetrics({
          serverStatus: i.server_status.status,
          errorCount: i.errors_24h.count,
        });
      }
    } catch { /* silent */ }
  }, []);

  /* ── fetch notifications ── */
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${BACKEND_URL}/api/activity/list?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifs = (res.data.activities || []).map(a => ({
        id: a.id,
        text: `${a.action}${a.details ? ' — ' + a.details : ''}`,
        time: formatTimeAgo(new Date(a.timestamp)),
        unread: !a.read,
      }));
      setNotifications(notifs);
    } catch { setNotifications([]); }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchNotifications();
    const id = setInterval(() => { fetchMetrics(); fetchNotifications(); }, 30000);
    return () => clearInterval(id);
  }, [fetchMetrics, fetchNotifications]);

  /* ── keyboard shortcut: Cmd+K for search ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const closeAll = () => {
    setShowProfileMenu(false);
    setShowNewMenu(false);
    setShowNotifications(false);
    setShowSearch(false);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast({ title: 'Marked as read' });
  };

  /* ── "+" menu items ── */
  const newMenuSections = [
    {
      label: 'Content',
      items: [
        { icon: FolderOpen, label: 'New Project', action: () => navigate('/admin?tab=portfolio&action=new') },
        { icon: FileText, label: 'New Blog Post', action: () => navigate('/admin?tab=content&section=blog') },
        { icon: FileText, label: 'Edit Page', action: () => navigate('/admin/theme-builder') },
      ],
    },
    {
      label: 'Media & Users',
      items: [
        { icon: Upload, label: 'Upload Media', action: () => navigate('/admin?tab=media') },
        { icon: UserPlus, label: 'Add User', action: () => navigate('/admin?tab=users&action=new') },
        { icon: Mail, label: 'View Messages', action: () => navigate('/admin?tab=messages') },
      ],
    },
    {
      label: 'Tools',
      items: [
        { icon: Wrench, label: 'Flush Cache', action: async () => {
          try {
            const token = localStorage.getItem('token');
            await axios.post(`${BACKEND_URL}/api/settings/flush-cache`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast({ title: 'Cache flushed' });
          } catch { toast({ title: 'Failed', variant: 'destructive' }); }
        }},
        { icon: Shield, label: 'Security', action: () => navigate('/admin?tab=security') },
        { icon: Power, label: 'Maintenance Mode', action: () => navigate('/admin?tab=settings') },
      ],
    },
    {
      label: 'Navigate',
      items: [
        { icon: Image, label: 'Media Library', action: () => navigate('/admin?tab=media') },
        { icon: Users, label: 'Users', action: () => navigate('/admin?tab=users') },
        { icon: BarChart3, label: 'Activity Log', action: () => navigate('/admin?tab=activity') },
        { icon: Settings, label: 'Settings', action: () => navigate('/admin?tab=settings') },
      ],
    },
    {
      label: 'External',
      items: [
        { icon: Globe, label: 'View Site', action: () => window.open('/', '_blank') },
      ],
    },
  ];

  /* ── search results (simple page filter) ── */
  const searchPages = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Content', path: '/admin?tab=content' },
    { label: 'Portfolio', path: '/admin?tab=portfolio' },
    { label: 'Media Library', path: '/admin?tab=media' },
    { label: 'Messages', path: '/admin?tab=messages' },
    { label: 'Users', path: '/admin?tab=users' },
    { label: 'Security', path: '/admin?tab=security' },
    { label: 'Integrations', path: '/admin?tab=integrations' },
    { label: 'Activity Log', path: '/admin?tab=activity' },
    { label: 'Settings', path: '/admin?tab=settings' },
    { label: 'Theme Builder', path: '/admin/theme-builder' },
    { label: 'View Site', path: '/' },
  ];
  const filteredPages = searchQuery
    ? searchPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchPages;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-[9999] flex items-center px-3 gap-1">

        {/* ─── LEFT: Logo + Nav ─── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link to="/" className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" title="View site">
            {logoUrl
              ? <img src={logoUrl} alt={siteName} className="h-5 w-auto object-contain" />
              : <span className="font-semibold text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{siteName}</span>
            }
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>

          <div className="w-px h-5 bg-gray-700 mx-0.5" />

          <Link to="/admin" className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${isAdminPage ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>

          <Link to="/admin/theme-builder" className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${isBuilderPage ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Paintbrush className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Builder</span>
          </Link>

          {/* + Quick actions button */}
          <div className="relative">
            <button onClick={() => { closeAll(); setShowNewMenu(s => !s); }} className="flex items-center px-1.5 py-1 rounded-md text-xs bg-purple-600/80 hover:bg-purple-600 text-white transition-colors" title="Quick actions">
              <Plus className="w-3.5 h-3.5" />
            </button>
            {showNewMenu && (
              <>
                <Backdrop onClick={() => setShowNewMenu(false)} />
                <div className="absolute left-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[10000] py-1 max-h-[70vh] overflow-y-auto">
                  {newMenuSections.map((section, si) => (
                    <div key={si}>
                      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{section.label}</div>
                      {section.items.map((item, ii) => (
                        <button key={ii} onClick={() => { setShowNewMenu(false); item.action(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                          <item.icon className="w-4 h-4 text-gray-500" />
                          {item.label}
                        </button>
                      ))}
                      {si < newMenuSections.length - 1 && <div className="border-b border-gray-700 my-1" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── CENTER: Builder controls (only on builder page) ─── */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {isBuilderPage && (
            <>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <Eye className="w-3.5 h-3.5" /> <span className="hidden md:inline">Preview</span>
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors">
                <Save className="w-3.5 h-3.5" /> <span className="hidden md:inline">Saved</span>
              </button>
            </>
          )}
        </div>

        {/* ─── RIGHT: Status indicators + Search + Notifications + Cache + Profile ─── */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Server health dot */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-gray-400" title={`Server: ${metrics.serverStatus}`}>
            <ServerHealthDot status={metrics.serverStatus} />
            <span className="hidden xl:inline text-gray-500">Server</span>
          </div>

          {/* Error count */}
          <Link to="/admin?tab=activity" className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-colors ${metrics.errorCount > 0 ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:bg-gray-800'}`} title={`${metrics.errorCount} errors (24h)`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {metrics.errorCount > 0 && <span className="tabular-nums">{metrics.errorCount}</span>}
          </Link>

          {/* Cache indicator */}
          <CacheIndicator />

          {/* Page speed monitor */}
          <PageSpeedIndicator />

          <div className="w-px h-5 bg-gray-700 mx-0.5" />

          {/* Search */}
          <button onClick={() => { closeAll(); setShowSearch(s => !s); }} className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" title="Search (Ctrl+K)">
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { closeAll(); setShowNotifications(s => !s); }} className="relative flex items-center px-1.5 py-1 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" title="Notifications">
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <>
                <Backdrop onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[10000] overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Notifications</span>
                      {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] rounded-full">{unreadCount}</span>}
                    </div>
                    <div className="flex gap-1">
                      {unreadCount > 0 && <button onClick={markAllRead} className="p-1 text-gray-500 hover:text-green-400"><Check className="w-3.5 h-3.5" /></button>}
                      <button onClick={() => setShowNotifications(false)} className="p-1 text-gray-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0
                      ? <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                      : notifications.slice(0, 8).map(n => (
                        <div key={n.id} className={`px-3 py-2.5 border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer text-xs ${n.unread ? 'bg-purple-600/5' : ''}`}>
                          <div className="flex items-start gap-2">
                            {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-300 truncate">{n.text}</p>
                              <p className="text-gray-600 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-3 py-2 border-t border-gray-700">
                      <Link to="/admin?tab=activity" onClick={() => setShowNotifications(false)} className="block text-center text-xs text-purple-400 hover:text-purple-300">
                        View all activity
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-5 bg-gray-700 mx-0.5" />

          {/* Profile */}
          <div className="relative">
            <button onClick={() => { closeAll(); setShowProfileMenu(s => !s); }} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:inline text-xs">{user.username}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
            {showProfileMenu && (
              <>
                <Backdrop onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-1 z-[10000]">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <Link to="/admin?tab=settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setShowProfileMenu(false)}>
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Search Overlay (Cmd+K) ─── */}
      {showSearch && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[10000]" onClick={() => setShowSearch(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-[10001] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-400">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredPages.map((p, i) => (
                <button key={i} onClick={() => { setShowSearch(false); setSearchQuery(''); navigate(p.path); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  {p.label}
                </button>
              ))}
              {filteredPages.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">No results</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default AdminTopbar;
