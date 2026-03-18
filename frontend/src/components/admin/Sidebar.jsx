import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Image,
  FolderOpen,
  Mail,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Palette,
  BarChart3,
  Plug,
  Activity,
  Layers,
  PenLine,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const controller = new AbortController();
    const fetchUnreadWithSignal = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/contact/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal,
        });
        if (response.data && response.data.messages) {
          const unread = response.data.messages.filter(m => !m.read && m.status === 'new').length;
          setUnreadCount(unread);
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch unread messages count', error);
      }
    };
    fetchUnreadWithSignal();
    const interval = setInterval(fetchUnreadWithSignal, 60000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/contact/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.messages) {
        const unread = response.data.messages.filter(m => !m.read && m.status === 'new').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch unread messages count', error);
    }
  };

  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard',
          color: '#8b5cf6',
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          id: 'pages',
          icon: Layers,
          label: 'Pages',
          color: '#8b5cf6',
        },
        {
          id: 'blog',
          icon: PenLine,
          label: 'Blog',
          color: '#06b6d4',
        },
        {
          id: 'content',
          icon: FileText,
          label: 'Content',
          color: '#3b82f6',
        },
        {
          id: 'portfolio',
          icon: Image,
          label: 'Portfolio',
          color: '#10b981',
        },
        {
          id: 'media',
          icon: FolderOpen,
          label: 'Media Library',
          color: '#f59e0b',
        },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          id: 'messages',
          icon: Mail,
          label: 'Messages',
          color: '#ec4899',
          badge: unreadCount > 0 ? unreadCount : null,
        },
      ],
    },
    {
      title: 'Insights',
      items: [
        {
          id: 'analytics',
          icon: BarChart3,
          label: 'Analytics',
          color: '#f97316',
        },
      ],
    },
    {
      title: 'Customization',
      items: [
        {
          id: 'theme-builder',
          icon: Palette,
          label: 'Theme Builder',
          color: '#a855f7',
          isSpecial: true,
        },
        {
          id: 'visual-builder',
          icon: Sparkles,
          label: 'Visual Builder',
          color: '#8b5cf6',
          isSpecial: true,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          id: 'users',
          icon: Users,
          label: 'Users',
          color: '#6366f1',
        },
        {
          id: 'security',
          icon: Shield,
          label: 'Security',
          color: '#14b8a6',
        },
        {
          id: 'integrations',
          icon: Plug,
          label: 'Integrations',
          color: '#f97316',
        },
        {
          id: 'activity',
          icon: Activity,
          label: 'Activity Log',
          color: '#ec4899',
        },
        {
          id: 'settings',
          icon: Settings,
          label: 'Settings',
          color: '#64748b',
        },
      ],
    },
  ];

  return (
    <div
      className={`fixed left-0 top-12 h-[calc(100vh-3rem)] z-50 transition-all duration-300 ease-out
        bg-[#0a0a0f]/95 backdrop-blur-2xl border-r border-white/[0.06]
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#1a1a24] border border-white/10 
          flex items-center justify-center text-gray-400 hover:text-white hover:bg-violet-600 
          transition-all duration-200 shadow-lg z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 h-[calc(100vh-4rem)]">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Title */}
            {!isCollapsed && (
              <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">
                {section.title}
              </p>
            )}
            {isCollapsed && sectionIndex > 0 && (
              <div className="w-8 h-px bg-white/10 mx-auto mb-3" />
            )}

            {/* Menu Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'theme-builder') {
                        navigate('/admin/theme-builder');
                      } else if (item.id === 'visual-builder') {
                        navigate('/admin/visual-builder');
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-white/[0.08] text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }
                      ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isActive ? '' : 'group-hover:scale-110'}`}
                      style={{ 
                        backgroundColor: isActive ? `${item.color}20` : 'transparent',
                      }}
                    >
                      <Icon 
                        size={18} 
                        style={{ color: isActive ? item.color : undefined }}
                        className={!isActive ? 'group-hover:text-slate-900 dark:group-hover:text-white' : ''}
                      />
                    </div>

                    {/* Label */}
                    {!isCollapsed && (
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {item.badge && !isCollapsed && (
                      <span 
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badge && isCollapsed && (
                      <span 
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-gray-900 border border-white/10 
                        text-white text-sm font-medium whitespace-nowrap opacity-0 invisible 
                        group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                          border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
