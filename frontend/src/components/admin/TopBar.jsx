import React, { useState, useEffect } from 'react';
import { Bell, Search, Command, Plus, X, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const TopBar = ({ title, subtitle, isCollapsed, activeTab, onNewAction }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const fetchNotificationsWithSignal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/activity/list?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const notifs = response.data.activities.map(activity => ({
          id: activity.id,
          text: `${activity.action} - ${activity.details || ''}`,
          time: formatTimeAgo(new Date(activity.timestamp)),
          timestamp: activity.timestamp,
          unread: !activity.read,
          type: activity.action
        }));

        setNotifications(notifs);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      }
    };
    fetchNotificationsWithSignal();
    const interval = setInterval(fetchNotificationsWithSignal, 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/activity/list?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const notifs = response.data.activities.map(activity => ({
        id: activity.id,
        text: `${activity.action} - ${activity.details || ''}`,
        time: formatTimeAgo(new Date(activity.timestamp)),
        timestamp: activity.timestamp,
        unread: !activity.read,
        type: activity.action
      }));

      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const clearAllNotifications = async () => {
    setLoading(true);
    try {
      // Mark all as read or clear them
      setNotifications([]);
      setShowNotifications(false);
      toast({
        title: 'Notifications cleared',
        description: 'All notifications have been cleared',
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast({
      title: 'Marked as read',
      description: 'All notifications marked as read',
    });
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div
      className={`fixed top-12 right-0 h-16 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06] z-30 transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-12 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl 
                text-white text-sm placeholder-gray-500 
                focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06]
                transition-all duration-200"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 
              bg-white/[0.06] rounded-md border border-white/[0.06]">
              <Command size={10} className="text-gray-500" />
              <span className="text-gray-500 text-[10px]">K</span>
            </div>
          </div>

          {/* Theme & Language Toggles */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-white/[0.06] rounded-xl transition-all duration-200 group"
            >
              <Bell size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full">
                  <span className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-75"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-white/[0.08] 
                  rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearAllNotifications}
                          disabled={loading}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          title="Clear all notifications"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-gray-500 hover:text-green-400 transition-colors p-1"
                          title="Mark all as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors
                            ${notif.unread ? 'bg-violet-500/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-300 text-sm truncate">{notif.text}</p>
                              <p className="text-gray-600 text-xs mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-white/[0.06]">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setShowAllNotifications(true);
                        }}
                        className="w-full py-2 text-violet-400 text-sm font-medium hover:bg-violet-500/10 rounded-lg transition-colors"
                      >
                        View all notifications ({notifications.length})
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/[0.06] mx-1" />

          {/* New Item Button - Context Aware */}
          <div className="relative">
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 
                text-white text-sm font-medium rounded-xl transition-all duration-200 
                shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Context-Aware Dropdown Menu */}
            {showNewMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNewMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#12121a] border border-white/[0.08] 
                  rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {activeTab === 'portfolio' && (
                    <>
                      <button 
                        onClick={() => { setShowNewMenu(false); onNewAction?.('portfolio'); }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3 border-b border-white/[0.04]"
                      >
                        <Plus size={16} className="text-violet-400" />
                        <span className="text-sm">New Portfolio Item</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'media' && (
                    <>
                      <button 
                        onClick={() => { setShowNewMenu(false); onNewAction?.('media'); }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3 border-b border-white/[0.04]"
                      >
                        <Plus size={16} className="text-violet-400" />
                        <span className="text-sm">Upload Media</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <button 
                        onClick={() => { setShowNewMenu(false); onNewAction?.('user'); }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3 border-b border-white/[0.04]"
                      >
                        <Plus size={16} className="text-violet-400" />
                        <span className="text-sm">New User</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'messages' && (
                    <>
                      <button 
                        onClick={() => { setShowNewMenu(false); onNewAction?.('compose'); }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3 border-b border-white/[0.04]"
                      >
                        <Plus size={16} className="text-violet-400" />
                        <span className="text-sm">Compose Message</span>
                      </button>
                    </>
                  )}
                  {/* Default actions available on all tabs */}
                  <button 
                    onClick={() => { setShowNewMenu(false); onNewAction?.('portfolio'); }}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3"
                  >
                    <Plus size={16} className="text-gray-500" />
                    <span className="text-sm">Portfolio Item</span>
                  </button>
                  <button 
                    onClick={() => { setShowNewMenu(false); onNewAction?.('media'); }}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3"
                  >
                    <Plus size={16} className="text-gray-500" />
                    <span className="text-sm">Upload Media</span>
                  </button>
                  <button 
                    onClick={() => { setShowNewMenu(false); onNewAction?.('user'); }}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-3"
                  >
                    <Plus size={16} className="text-gray-500" />
                    <span className="text-sm">Add User</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View All Notifications Modal */}
      <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">All Notifications</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete history of all notifications and activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm rounded-full">
                  {unreadCount} unread
                </span>
              )}
              <span className="text-gray-400 text-sm">
                Total: {notifications.length}
              </span>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  size="sm"
                  variant="outline"
                  className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-white"
                >
                  <Check size={14} className="mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  onClick={clearAllNotifications}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="bg-white/[0.04] border-white/[0.08] hover:bg-red-500/20 hover:border-red-500/50 text-white"
                >
                  <Trash2 size={14} className="mr-2" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium mb-2">No notifications yet</p>
                <p className="text-gray-500 text-sm">
                  Activity and updates will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {notifications.map((notif, _index) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 rounded-xl border border-white/[0.06] cursor-pointer transition-all
                      ${notif.unread ? 'bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/30' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${notif.unread ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {notif.text}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{notif.time}</span>
                          {notif.type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{notif.type}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {notif.unread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="text-gray-500 hover:text-violet-400 transition-colors p-1"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <Button
              onClick={() => setShowAllNotifications(false)}
              className="w-full bg-violet-600 hover:bg-violet-500"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopBar;
