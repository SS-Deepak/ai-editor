import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available editor themes
export type EditorTheme = 
  | 'light' 
  | 'dark' 
  | 'midnight' 
  | 'dracula' 
  | 'nord' 
  | 'forest' 
  | 'sunset'
  | 'ocean';

export interface ThemeConfig {
  name: string;
  label: string;
  mode: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };
}

export const EDITOR_THEMES: Record<EditorTheme, ThemeConfig> = {
  light: {
    name: 'light',
    label: 'Light',
    mode: 'light',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      primary: '262 83% 58%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16% 47%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      border: '214.3 31.8% 91.4%',
      ring: '262 83% 58%',
    },
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    mode: 'dark',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      primary: '262 83% 58%',
      primaryForeground: '210 40% 98%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      ring: '262 83% 58%',
    },
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    mode: 'dark',
    colors: {
      background: '230 25% 7%',
      foreground: '220 15% 90%',
      card: '230 25% 10%',
      cardForeground: '220 15% 90%',
      primary: '210 100% 60%',
      primaryForeground: '220 15% 98%',
      secondary: '230 20% 15%',
      secondaryForeground: '220 15% 90%',
      muted: '230 20% 15%',
      mutedForeground: '220 10% 55%',
      accent: '200 100% 50%',
      accentForeground: '220 15% 98%',
      border: '230 20% 18%',
      ring: '210 100% 60%',
    },
  },
  dracula: {
    name: 'dracula',
    label: 'Dracula',
    mode: 'dark',
    colors: {
      background: '231 15% 18%',
      foreground: '60 30% 96%',
      card: '232 14% 21%',
      cardForeground: '60 30% 96%',
      primary: '265 89% 78%',
      primaryForeground: '231 15% 18%',
      secondary: '232 14% 25%',
      secondaryForeground: '60 30% 96%',
      muted: '232 14% 25%',
      mutedForeground: '60 20% 70%',
      accent: '135 94% 65%',
      accentForeground: '231 15% 18%',
      border: '232 14% 28%',
      ring: '265 89% 78%',
    },
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    mode: 'dark',
    colors: {
      background: '220 16% 22%',
      foreground: '218 27% 92%',
      card: '220 17% 25%',
      cardForeground: '218 27% 92%',
      primary: '193 43% 67%',
      primaryForeground: '220 16% 22%',
      secondary: '220 16% 28%',
      secondaryForeground: '218 27% 92%',
      muted: '220 16% 28%',
      mutedForeground: '219 14% 65%',
      accent: '179 25% 65%',
      accentForeground: '220 16% 22%',
      border: '220 16% 32%',
      ring: '193 43% 67%',
    },
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    mode: 'dark',
    colors: {
      background: '150 20% 8%',
      foreground: '140 15% 90%',
      card: '150 20% 11%',
      cardForeground: '140 15% 90%',
      primary: '142 70% 45%',
      primaryForeground: '150 20% 98%',
      secondary: '150 15% 15%',
      secondaryForeground: '140 15% 90%',
      muted: '150 15% 15%',
      mutedForeground: '140 10% 55%',
      accent: '84 60% 50%',
      accentForeground: '150 20% 98%',
      border: '150 15% 18%',
      ring: '142 70% 45%',
    },
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    mode: 'dark',
    colors: {
      background: '20 15% 10%',
      foreground: '30 20% 90%',
      card: '20 15% 13%',
      cardForeground: '30 20% 90%',
      primary: '25 95% 55%',
      primaryForeground: '30 20% 98%',
      secondary: '20 10% 18%',
      secondaryForeground: '30 20% 90%',
      muted: '20 10% 18%',
      mutedForeground: '30 10% 55%',
      accent: '45 90% 50%',
      accentForeground: '20 15% 10%',
      border: '20 10% 22%',
      ring: '25 95% 55%',
    },
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    mode: 'light',
    colors: {
      background: '200 30% 96%',
      foreground: '200 50% 15%',
      card: '200 30% 100%',
      cardForeground: '200 50% 15%',
      primary: '200 100% 40%',
      primaryForeground: '200 30% 98%',
      secondary: '200 20% 90%',
      secondaryForeground: '200 50% 15%',
      muted: '200 20% 90%',
      mutedForeground: '200 20% 45%',
      accent: '175 70% 40%',
      accentForeground: '200 30% 98%',
      border: '200 20% 85%',
      ring: '200 100% 40%',
    },
  },
};

interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  // Theme
  theme: EditorTheme;
  
  // Modals
  modals: Modal[];
  
  // Toasts
  toasts: Toast[];
  
  // Drag state
  isDragging: boolean;
  draggedElementType: string | null;
  
  // Context menu
  contextMenu: {
    open: boolean;
    x: number;
    y: number;
    elementId: string | null;
  };
  
  // Save state
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

interface UIActions {
  // Theme
  setTheme: (theme: EditorTheme) => void;
  getThemeConfig: () => ThemeConfig;
  
  // Modals
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id?: string) => void;
  
  // Toasts
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  
  // Drag
  startDragging: (elementType: string) => void;
  stopDragging: () => void;
  
  // Context menu
  openContextMenu: (x: number, y: number, elementId: string | null) => void;
  closeContextMenu: () => void;
  
  // Save state
  setSaving: (isSaving: boolean) => void;
  markSaved: () => void;
  markUnsaved: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark' as EditorTheme,
      modals: [],
      toasts: [],
      isDragging: false,
      draggedElementType: null,
      contextMenu: {
        open: false,
        x: 0,
        y: 0,
        elementId: null,
      },
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,

      // Theme
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        applyTheme(theme);
      },
      
      getThemeConfig: () => EDITOR_THEMES[get().theme],

      // Modals
      openModal: (modal) => set((state) => ({
        modals: [...state.modals, { ...modal, id: `modal_${Date.now()}` }],
      })),
      
      closeModal: (id) => set((state) => ({
        modals: id 
          ? state.modals.filter((m) => m.id !== id)
          : state.modals.slice(0, -1),
      })),

      // Toasts
      showToast: (toast) => {
        const id = `toast_${Date.now()}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        
        // Auto-hide after duration
        setTimeout(() => {
          get().hideToast(id);
        }, toast.duration || 4000);
      },
      
      hideToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      // Drag
      startDragging: (elementType) => set({ 
        isDragging: true, 
        draggedElementType: elementType 
      }),
      
      stopDragging: () => set({ 
        isDragging: false, 
        draggedElementType: null 
      }),

      // Context menu
      openContextMenu: (x, y, elementId) => set({
        contextMenu: { open: true, x, y, elementId },
      }),
      
      closeContextMenu: () => set({
        contextMenu: { open: false, x: 0, y: 0, elementId: null },
      }),

      // Save state
      setSaving: (isSaving) => set({ isSaving }),
      
      markSaved: () => set({ 
        isSaving: false, 
        lastSaved: new Date(), 
        hasUnsavedChanges: false 
      }),
      
      markUnsaved: () => set({ hasUnsavedChanges: true }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply theme when storage is rehydrated
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// Apply theme to document root
function applyTheme(theme: EditorTheme) {
  const config = EDITOR_THEMES[theme];
  const root = document.documentElement;
  
  // Set light/dark mode class
  root.classList.remove('light', 'dark');
  root.classList.add(config.mode);
  
  // Set theme name as data attribute
  root.setAttribute('data-theme', theme);
  
  // Apply CSS custom properties
  Object.entries(config.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssKey}`, value);
  });
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  // Get stored theme or default
  const stored = localStorage.getItem('ui-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme) {
        applyTheme(parsed.state.theme);
      }
    } catch {
      applyTheme('dark');
    }
  } else {
    applyTheme('dark');
  }
}
