import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Main global store using Zustand
const useStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: !!localStorage.getItem('token'),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token, isAuthenticated: !!token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Theme State
      theme: null,
      themeLoading: false,
      
      setTheme: (theme) => set({ theme }),
      setThemeLoading: (loading) => set({ themeLoading: loading }),

      // UI State
      sidebarOpen: true,
      activePanel: 'inspector',
      selectedComponent: null,
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setSelectedComponent: (component) => set({ selectedComponent: component }),

      // Toast/Notification State
      toasts: [],
      addToast: (toast) => set((state) => ({ 
        toasts: [...state.toasts, { ...toast, id: Date.now() }] 
      })),
      removeToast: (id) => set((state) => ({ 
        toasts: state.toasts.filter(t => t.id !== id) 
      })),

      // Content Cache
      contentCache: {},
      setContentCache: (section, data) => set((state) => ({
        contentCache: { ...state.contentCache, [section]: data }
      })),
      clearContentCache: () => set({ contentCache: {} }),
    }),
    {
      name: 'mantez-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        token: state.token,
        sidebarOpen: state.sidebarOpen,
      }), // only persist certain fields
    }
  )
);

export default useStore;
