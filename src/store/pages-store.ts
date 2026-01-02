import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Page, PageSeo } from '@/types';

export interface PageListItem {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  status: 'draft' | 'published';
  updatedAt: string;
}

interface PagesState {
  pages: PageListItem[];
  currentPage: Page | null;
  isLoading: boolean;
  selectedPageId: string | null;
}

interface PagesActions {
  // Load pages
  loadPages: (projectId: string) => Promise<void>;
  loadPage: (projectId: string, pageId: string) => Promise<void>;
  
  // CRUD
  createPage: (projectId: string, name: string, slug: string) => Promise<PageListItem | null>;
  updatePage: (pageId: string, updates: Partial<PageListItem>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => Promise<PageListItem | null>;
  
  // Page settings
  setAsHomePage: (pageId: string) => void;
  togglePublishStatus: (pageId: string) => void;
  updatePageSeo: (pageId: string, seo: Partial<PageSeo>) => void;
  
  // Selection
  selectPage: (pageId: string | null) => void;
}

// Mock data - will be replaced with API calls
const mockPages: PageListItem[] = [
  { id: 'page_home', name: 'Home', slug: '', isHome: true, status: 'published', updatedAt: '2024-01-15T10:30:00Z' },
  { id: 'page_about', name: 'About', slug: 'about', isHome: false, status: 'draft', updatedAt: '2024-01-14T09:00:00Z' },
  { id: 'page_contact', name: 'Contact', slug: 'contact', isHome: false, status: 'draft', updatedAt: '2024-01-13T15:45:00Z' },
];

export const usePagesStore = create<PagesState & PagesActions>()(
  immer((set, get) => ({
    pages: [],
    currentPage: null,
    isLoading: false,
    selectedPageId: null,

    loadPages: async (projectId: string) => {
      set({ isLoading: true });
      try {
        // TODO: Replace with actual API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ pages: mockPages, isLoading: false });
      } catch (error) {
        console.error('Failed to load pages:', error);
        set({ isLoading: false });
      }
    },

    loadPage: async (projectId: string, pageId: string) => {
      set({ isLoading: true });
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/projects/${projectId}/pages/${pageId}`);
        if (response.ok) {
          const page = await response.json();
          set({ currentPage: page, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        set({ isLoading: false });
      }
    },

    createPage: async (projectId: string, name: string, slug: string) => {
      try {
        const newPage: PageListItem = {
          id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          isHome: false,
          status: 'draft',
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.pages.push(newPage);
        });
        
        return newPage;
      } catch (error) {
        console.error('Failed to create page:', error);
        return null;
      }
    },

    updatePage: (pageId: string, updates: Partial<PageListItem>) => {
      set((state) => {
        const page = state.pages.find(p => p.id === pageId);
        if (page) {
          Object.assign(page, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },

    deletePage: (pageId: string) => {
      set((state) => {
        const index = state.pages.findIndex(p => p.id === pageId);
        if (index !== -1) {
          // Don't allow deleting the home page
          if (state.pages[index].isHome) {
            return;
          }
          state.pages.splice(index, 1);
          if (state.selectedPageId === pageId) {
            state.selectedPageId = null;
          }
        }
      });
    },

    duplicatePage: async (pageId: string) => {
      const state = get();
      const page = state.pages.find(p => p.id === pageId);
      if (!page) return null;
      
      const newPage: PageListItem = {
        id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${page.name} (Copy)`,
        slug: `${page.slug}-copy`,
        isHome: false,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => {
        state.pages.push(newPage);
      });
      
      return newPage;
    },

    setAsHomePage: (pageId: string) => {
      set((state) => {
        // Remove home status from all pages
        state.pages.forEach(page => {
          page.isHome = page.id === pageId;
          // Home page has empty slug
          if (page.id === pageId) {
            page.slug = '';
          }
        });
      });
    },

    togglePublishStatus: (pageId: string) => {
      set((state) => {
        const page = state.pages.find(p => p.id === pageId);
        if (page) {
          page.status = page.status === 'published' ? 'draft' : 'published';
          page.updatedAt = new Date().toISOString();
        }
      });
    },

    updatePageSeo: (pageId: string, seo: Partial<PageSeo>) => {
      set((state) => {
        if (state.currentPage && state.currentPage.id === pageId) {
          state.currentPage.seo = { ...state.currentPage.seo, ...seo };
        }
      });
    },

    selectPage: (pageId: string | null) => {
      set({ selectedPageId: pageId });
    },
  }))
);

