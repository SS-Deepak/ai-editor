import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: 'admin' | 'user';
  preferences: {
    defaultPalette?: string;
    theme: 'light' | 'dark' | 'system';
    editorSettings: {
      showGrid: boolean;
      snapToGrid: boolean;
      autoSave: boolean;
    };
  };
  projects: string[];
  permissions?: {
    canManageElements?: boolean;
    canManageLayouts?: boolean;
    canManagePalettes?: boolean;
    canPublishGlobally?: boolean;
  };
}

// Mock users for development
const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'user_admin',
    email: 'admin@editor.com',
    name: 'Admin User',
    avatar: null,
    role: 'admin',
    preferences: {
      defaultPalette: 'palette_ocean_blue',
      theme: 'light',
      editorSettings: {
        showGrid: true,
        snapToGrid: true,
        autoSave: true,
      },
    },
    projects: [],
    permissions: {
      canManageElements: true,
      canManageLayouts: true,
      canManagePalettes: true,
      canPublishGlobally: true,
    },
  },
  user: {
    id: 'user_demo',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar: null,
    role: 'user',
    preferences: {
      defaultPalette: 'palette_ocean_blue',
      theme: 'light',
      editorSettings: {
        showGrid: true,
        snapToGrid: true,
        autoSave: true,
      },
    },
    projects: ['project_demo'],
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  loginAsAdmin: () => void;
  loginAsUser: () => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      loginAsAdmin: () => {
        set({
          user: MOCK_USERS.admin,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      loginAsUser: () => {
        set({
          user: MOCK_USERS.user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updatePreferences: (preferences) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              preferences: {
                ...user.preferences,
                ...preferences,
              },
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};

export const useCanManageElements = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' && user?.permissions?.canManageElements;
};

export const useCanManageLayouts = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' && user?.permissions?.canManageLayouts;
};

export const useCanManagePalettes = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' && user?.permissions?.canManagePalettes;
};

