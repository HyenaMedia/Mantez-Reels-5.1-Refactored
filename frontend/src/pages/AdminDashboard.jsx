import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { AdminThemeProvider } from '../contexts/AdminThemeContext';
import { Button } from '../components/ui/button';
import SectionErrorBoundary from '../components/SectionErrorBoundary';
import Sidebar from '../components/admin/Sidebar';
// TopBar removed — page title now shown in the main AdminTopbar
import DashboardOverview from '../components/admin/DashboardOverview';
import ChangePasswordModal from '../components/admin/ChangePasswordModal';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

// Lazy-load heavy admin sub-views (only loaded when their tab is active)
const PortfolioEditor = lazy(() => import('../components/admin/PortfolioEditor'));
const PortfolioGrid = lazy(() => import('../components/admin/PortfolioGrid'));
const MediaLibrary = lazy(() => import('../components/admin/MediaLibrary'));
const UserManager = lazy(() => import('../components/admin/UserManager'));
const SecurityManager = lazy(() => import('../components/admin/SecurityManager'));
const ContentEditor = lazy(() => import('../components/admin/ContentEditor'));
const Settings = lazy(() => import('../components/admin/Settings'));
const AnalyticsDashboard = lazy(() => import('../components/admin/AnalyticsDashboard'));
const IntegrationsManager = lazy(() => import('../components/admin/IntegrationsManager'));
const ActivityLogViewer = lazy(() => import('../components/admin/ActivityLogViewer'));
const MessagesManager = lazy(() => import('../components/admin/MessagesManager'));

const AdminFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
  </div>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Page titles now shown in AdminTopbar via PAGE_TITLES lookup

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  // Portfolio editor state
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Password warning
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const checkDefaultPassword = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API}/auth/security-check`, { headers: { Authorization: `Bearer ${token}` } });
        setIsDefaultPassword(res.data.is_default_password === true);
      } catch (error) { console.error('Failed to check default password status:', error); toast({ title: 'Failed to load dashboard data', variant: 'destructive' }); }
    };
    checkDefaultPassword();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolio/list?published_only=false`);
      setPortfolioItems(response.data.items || []);
    } catch (error) { console.error('Failed to load portfolio items:', error); toast({ title: 'Failed to load dashboard data', variant: 'destructive' }); }
  };

  useEffect(() => {
    if (activeTab === 'portfolio') loadPortfolio();
  }, [activeTab]);

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-black relative overflow-hidden transition-colors duration-300 pt-12">
        {/* Background layers */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-950/30 via-black to-pink-950/20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,0,255,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,128,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div className={`transition-all duration-300 pt-12 ${isCollapsed ? 'ml-20' : 'ml-64'} relative z-0`}>
          <div className="p-6 lg:p-8">

            {/* Default Password Warning */}
            {isDefaultPassword && (
              <div data-testid="default-password-banner" className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <p className="text-amber-300 font-semibold text-sm">Security Alert: Default Password Active</p>
                    <p className="text-amber-400/70 text-xs mt-0.5">You're using the default <code className="bg-black/30 px-1 rounded">admin123</code> password. Change it now before going live.</p>
                  </div>
                </div>
                <Button onClick={() => setShowChangePasswordModal(true)} size="sm" data-testid="change-password-banner-btn" className="shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                  <Lock className="w-4 h-4 mr-2" />Change Password
                </Button>
              </div>
            )}

            <SectionErrorBoundary name="Admin Panel">
              <Suspense fallback={<AdminFallback />}>
                {activeTab === 'dashboard' && <DashboardOverview />}
                {activeTab === 'content' && <ContentEditor />}
                {activeTab === 'portfolio' && (
                  showEditor ? (
                    <PortfolioEditor
                      item={editingItem}
                      onSave={() => { setShowEditor(false); setEditingItem(null); loadPortfolio(); }}
                      onCancel={() => { setShowEditor(false); setEditingItem(null); }}
                    />
                  ) : (
                    <PortfolioGrid
                      items={portfolioItems}
                      loading={false}
                      onEdit={(item) => { setEditingItem(item); setShowEditor(true); }}
                      onRefresh={loadPortfolio}
                    />
                  )
                )}
                {activeTab === 'media' && <MediaLibrary />}
                {activeTab === 'messages' && <MessagesManager />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                {activeTab === 'users' && <UserManager />}
                {activeTab === 'security' && <SecurityManager />}
                {activeTab === 'integrations' && <IntegrationsManager />}
                {activeTab === 'activity' && <ActivityLogViewer />}
                {activeTab === 'settings' && <Settings />}
              </Suspense>
            </SectionErrorBoundary>
          </div>
        </div>

        <ChangePasswordModal
          open={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChanged={() => setIsDefaultPassword(false)}
        />
      </div>
    </AdminThemeProvider>
  );
};

export default AdminDashboard;
