import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentLayout, ComponentLayoutCategory, LayoutCategoryInfo } from '@/types';

// Category metadata
export const LAYOUT_CATEGORIES: LayoutCategoryInfo[] = [
  { id: 'buttons', name: 'Buttons', icon: 'MousePointer2' },
  { id: 'heroes', name: 'Hero Sections', icon: 'Sparkles' },
  { id: 'cards', name: 'Cards', icon: 'CreditCard' },
  { id: 'sections', name: 'Sections', icon: 'Layout' },
  { id: 'headers', name: 'Headers', icon: 'PanelTop' },
  { id: 'footers', name: 'Footers', icon: 'PanelBottom' },
  { id: 'navigation', name: 'Navigation', icon: 'Navigation' },
  { id: 'forms', name: 'Forms', icon: 'FormInput' },
  { id: 'features', name: 'Features', icon: 'Zap' },
  { id: 'testimonials', name: 'Testimonials', icon: 'Quote' },
  { id: 'pricing', name: 'Pricing', icon: 'DollarSign' },
  { id: 'cta', name: 'Call to Action', icon: 'Megaphone' },
];

interface LayoutsState {
  // Data
  layouts: ComponentLayout[];
  customLayouts: ComponentLayout[]; // User-created layouts (persisted locally)
  isLoading: boolean;
  error: string | null;
  
  // Filters
  selectedCategory: ComponentLayoutCategory | 'all';
  searchQuery: string;
  showCustomOnly: boolean;
  
  // UI
  editingLayout: ComponentLayout | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDesignerModalOpen: boolean;
}

interface LayoutsActions {
  // Data loading
  loadLayouts: () => Promise<void>;
  
  // CRUD operations (admin only)
  createLayout: (layout: Omit<ComponentLayout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLayout: (id: string, updates: Partial<ComponentLayout>) => Promise<void>;
  deleteLayout: (id: string) => Promise<void>;
  duplicateLayout: (id: string) => Promise<void>;
  togglePublished: (id: string) => Promise<void>;
  
  // Custom layout operations (for regular users)
  createCustomLayout: (layout: Omit<ComponentLayout, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>, userId: string) => void;
  updateCustomLayout: (id: string, updates: Partial<ComponentLayout>) => void;
  deleteCustomLayout: (id: string) => void;
  
  // Filtering
  setSelectedCategory: (category: ComponentLayoutCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setShowCustomOnly: (show: boolean) => void;
  
  // UI
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (layout: ComponentLayout) => void;
  closeEditModal: () => void;
  openDesignerModal: (layout: ComponentLayout) => void;
  closeDesignerModal: () => void;
  
  // Getters
  getLayoutById: (id: string) => ComponentLayout | undefined;
  getFilteredLayouts: () => ComponentLayout[];
  getLayoutsByCategory: (category: ComponentLayoutCategory) => ComponentLayout[];
  getCustomLayouts: (userId: string) => ComponentLayout[];
  getAllLayoutsForUser: (userId: string, isAdmin: boolean) => ComponentLayout[];
}

// Helper function to generate unique ID
const generateId = () => `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useLayoutsStore = create<LayoutsState & LayoutsActions>()(
  persist(
    (set, get) => ({
  // Initial state
  layouts: [],
  customLayouts: [],
  isLoading: false,
  error: null,
  selectedCategory: 'all',
  searchQuery: '',
  showCustomOnly: false,
  editingLayout: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDesignerModalOpen: false,
  
  // Load all layouts from JSON files
  loadLayouts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/layouts');
      if (!response.ok) throw new Error('Failed to load layouts');
      
      const data = await response.json();
      set({ layouts: data.layouts, isLoading: false });
    } catch (error) {
      // Fallback: Load from static JSON files
      try {
        const categories = ['buttons', 'heroes', 'cards', 'sections', 'headers', 'footers'];
        const allLayouts: ComponentLayout[] = [];
        
        for (const category of categories) {
          try {
            const response = await fetch(`/data/layouts/components/${category}.json`);
            if (response.ok) {
              const data = await response.json();
              allLayouts.push(...data.layouts);
            }
          } catch {
            // Skip if file doesn't exist
          }
        }
        
        set({ layouts: allLayouts, isLoading: false });
      } catch (fallbackError) {
        set({ 
          error: 'Failed to load layouts', 
          isLoading: false,
          layouts: [] 
        });
      }
    }
  },
  
  // Create a new layout (admin only)
  createLayout: async (layoutData) => {
    const newLayout: ComponentLayout = {
      ...layoutData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const response = await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLayout),
      });
      
      if (!response.ok) throw new Error('Failed to create layout');
      
      set((state) => ({
        layouts: [...state.layouts, newLayout],
        isCreateModalOpen: false,
      }));
    } catch (error) {
      // Optimistic update for development
      set((state) => ({
        layouts: [...state.layouts, newLayout],
        isCreateModalOpen: false,
      }));
    }
  },
  
  // Update an existing layout
  updateLayout: async (id, updates) => {
    const updatedLayout = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const response = await fetch(`/api/layouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLayout),
      });
      
      if (!response.ok) throw new Error('Failed to update layout');
    } catch {
      // Continue with optimistic update
    }
    
    set((state) => ({
      layouts: state.layouts.map((layout) =>
        layout.id === id ? { ...layout, ...updatedLayout } : layout
      ),
      isEditModalOpen: false,
      editingLayout: null,
    }));
  },
  
  // Delete a layout
  deleteLayout: async (id) => {
    try {
      await fetch(`/api/layouts/${id}`, { method: 'DELETE' });
    } catch {
      // Continue with optimistic delete
    }
    
    set((state) => ({
      layouts: state.layouts.filter((layout) => layout.id !== id),
    }));
  },
  
  // Duplicate a layout
  duplicateLayout: async (id) => {
    const originalLayout = get().layouts.find((l) => l.id === id);
    if (!originalLayout) return;
    
    const duplicatedLayout: ComponentLayout = {
      ...originalLayout,
      id: generateId(),
      name: `${originalLayout.name} (Copy)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      layouts: [...state.layouts, duplicatedLayout],
    }));
  },
  
  // Toggle published status
  togglePublished: async (id) => {
    const layout = get().layouts.find((l) => l.id === id);
    if (!layout) return;
    
    await get().updateLayout(id, { isPublished: !layout.isPublished });
  },
  
  // Filter setters
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Custom layout operations (for regular users)
  createCustomLayout: (layoutData, userId) => {
    const newLayout: ComponentLayout = {
      ...layoutData,
      id: generateId(),
      isCustom: true,
      createdByUserId: userId,
      createdBy: userId,
      isPublished: true, // Custom layouts are always visible to the user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      customLayouts: [...state.customLayouts, newLayout],
      isCreateModalOpen: false,
    }));
  },
  
  updateCustomLayout: (id, updates) => {
    set((state) => ({
      customLayouts: state.customLayouts.map((layout) =>
        layout.id === id 
          ? { ...layout, ...updates, updatedAt: new Date().toISOString() } 
          : layout
      ),
      isEditModalOpen: false,
      isDesignerModalOpen: false,
      editingLayout: null,
    }));
  },
  
  deleteCustomLayout: (id) => {
    set((state) => ({
      customLayouts: state.customLayouts.filter((layout) => layout.id !== id),
    }));
  },
  
  // UI actions
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (layout) => set({ isEditModalOpen: true, editingLayout: layout }),
  closeEditModal: () => set({ isEditModalOpen: false, editingLayout: null }),
  openDesignerModal: (layout) => set({ isDesignerModalOpen: true, editingLayout: layout }),
  closeDesignerModal: () => set({ isDesignerModalOpen: false, editingLayout: null }),
  
  // Filter setters
  setShowCustomOnly: (show) => set({ showCustomOnly: show }),
  
  // Getters
  getLayoutById: (id) => {
    const { layouts, customLayouts } = get();
    return layouts.find((l) => l.id === id) || customLayouts.find((l) => l.id === id);
  },
  
  getFilteredLayouts: () => {
    const { layouts, selectedCategory, searchQuery } = get();
    
    return layouts.filter((layout) => {
      // Filter by published status (for non-admin users, only show published)
      // Note: Admin check should be done at component level
      
      // Filter by category
      if (selectedCategory !== 'all' && layout.category !== selectedCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = layout.name.toLowerCase().includes(query);
        const matchesDescription = layout.description?.toLowerCase().includes(query);
        const matchesTags = layout.tags?.some((tag) => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  getLayoutsByCategory: (category) => {
    return get().layouts.filter((l) => l.category === category && l.isPublished);
  },
  
  getCustomLayouts: (userId) => {
    return get().customLayouts.filter((l) => l.createdByUserId === userId);
  },
  
  getAllLayoutsForUser: (userId, isAdmin) => {
    const { layouts, customLayouts, selectedCategory, searchQuery, showCustomOnly } = get();
    
    // Combine admin layouts (published only for non-admins) and user's custom layouts
    let allLayouts: ComponentLayout[] = [];
    
    if (!showCustomOnly) {
      const adminLayouts = isAdmin ? layouts : layouts.filter((l) => l.isPublished);
      allLayouts = [...adminLayouts];
    }
    
    // Add user's custom layouts
    const userLayouts = customLayouts.filter((l) => l.createdByUserId === userId);
    allLayouts = [...allLayouts, ...userLayouts];
    
    // Apply filters
    return allLayouts.filter((layout) => {
      if (selectedCategory !== 'all' && layout.category !== selectedCategory) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = layout.name.toLowerCase().includes(query);
        const matchesDescription = layout.description?.toLowerCase().includes(query);
        const matchesTags = layout.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }
      
      return true;
    });
  },
    }),
    {
      name: 'layouts-storage',
      partialize: (state) => ({ customLayouts: state.customLayouts }),
    }
  )
);

// Selector hooks for better performance
export const useFilteredLayouts = () => useLayoutsStore((state) => state.getFilteredLayouts());
export const useLayoutCategories = () => LAYOUT_CATEGORIES;
export const useSelectedCategory = () => useLayoutsStore((state) => state.selectedCategory);

