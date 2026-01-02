import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ElementNode, DeviceType, SidebarPanel } from '@/types';

interface EditorState {
  // Current project/page
  projectId: string | null;
  pageId: string | null;
  
  // Elements
  elements: ElementNode[];
  isLoadingElements: boolean;
  loadingProgress: number;
  
  // Selection
  selectedElementId: string | null;
  hoveredElementId: string | null;
  
  // View
  device: DeviceType;
  zoom: number;
  showGrid: boolean;
  
  // Panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activePanel: SidebarPanel;
  
  // History
  history: ElementNode[][];
  historyIndex: number;
  
  // Clipboard
  clipboard: ElementNode | null;
}

interface EditorActions {
  // Project/Page
  setProject: (projectId: string) => void;
  setPage: (pageId: string) => void;
  
  // Elements - Streaming
  startLoadingElements: () => void;
  addElementChunk: (chunk: ElementNode[]) => void;
  finishLoadingElements: () => void;
  setElements: (elements: ElementNode[]) => void;
  
  // Elements - CRUD
  addElement: (element: ElementNode, parentId?: string | null) => void;
  updateElement: (id: string, updates: Partial<ElementNode>) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, newParentId: string | null, newOrder: number) => void;
  duplicateElement: (id: string) => void;
  replaceElement: (id: string, newElement: ElementNode) => void;
  
  // Selection
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;
  
  // View
  setDevice: (device: DeviceType) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  
  // Panels
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActivePanel: (panel: SidebarPanel) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  // Clipboard
  copyElement: (id: string) => void;
  pasteElement: (parentId?: string | null) => void;
}

const initialState: EditorState = {
  projectId: null,
  pageId: null,
  elements: [],
  isLoadingElements: false,
  loadingProgress: 0,
  selectedElementId: null,
  hoveredElementId: null,
  device: 'desktop',
  zoom: 100,
  showGrid: true,
  leftPanelOpen: true,
  rightPanelOpen: true,
  activePanel: 'elements',
  history: [],
  historyIndex: -1,
  clipboard: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // Project/Page
    setProject: (projectId) => set({ projectId }),
    setPage: (pageId) => set({ pageId, elements: [], selectedElementId: null }),

    // Elements - Streaming
    startLoadingElements: () => set({ 
      isLoadingElements: true, 
      loadingProgress: 0,
      elements: [] 
    }),
    
    addElementChunk: (chunk) => set((state) => {
      state.elements.push(...chunk);
      state.loadingProgress = state.elements.length;
    }),
    
    finishLoadingElements: () => set({ isLoadingElements: false }),
    
    setElements: (elements) => set({ elements, isLoadingElements: false }),

    // Elements - CRUD
    addElement: (element, parentId = null) => set((state) => {
      if (parentId) {
        const parent = findElement(state.elements, parentId);
        if (parent) {
          element.parentId = parentId;
          element.order = parent.children.length;
          parent.children.push(element);
        }
      } else {
        element.parentId = null;
        element.order = state.elements.length;
        state.elements.push(element);
      }
      state.selectedElementId = element.id;
    }),

    updateElement: (id, updates) => set((state) => {
      const element = findElement(state.elements, id);
      if (element) {
        Object.assign(element, updates);
      }
    }),

    deleteElement: (id) => set((state) => {
      removeElement(state.elements, id);
      if (state.selectedElementId === id) {
        state.selectedElementId = null;
      }
    }),

    moveElement: (id, newParentId, newOrder) => set((state) => {
      const element = findElement(state.elements, id);
      if (!element) return;
      
      // Remove from old position
      removeElement(state.elements, id);
      
      // Add to new position
      element.parentId = newParentId;
      element.order = newOrder;
      
      if (newParentId) {
        const parent = findElement(state.elements, newParentId);
        if (parent) {
          parent.children.splice(newOrder, 0, element);
          // Reorder siblings
          parent.children.forEach((child, i) => child.order = i);
        }
      } else {
        state.elements.splice(newOrder, 0, element);
        state.elements.forEach((el, i) => el.order = i);
      }
    }),

    duplicateElement: (id) => set((state) => {
      const element = findElement(state.elements, id);
      if (!element) return;
      
      const duplicate = deepCloneElement(element);
      
      if (element.parentId) {
        const parent = findElement(state.elements, element.parentId);
        if (parent) {
          duplicate.order = element.order + 1;
          parent.children.splice(duplicate.order, 0, duplicate);
          parent.children.forEach((child, i) => child.order = i);
        }
      } else {
        duplicate.order = element.order + 1;
        state.elements.splice(duplicate.order, 0, duplicate);
        state.elements.forEach((el, i) => el.order = i);
      }
      
      state.selectedElementId = duplicate.id;
    }),

    replaceElement: (id, newElement) => set((state) => {
      const oldElement = findElement(state.elements, id);
      if (!oldElement) return;

      // Keep the same position (order and parentId)
      newElement.parentId = oldElement.parentId;
      newElement.order = oldElement.order;

      if (oldElement.parentId) {
        const parent = findElement(state.elements, oldElement.parentId);
        if (parent) {
          const index = parent.children.findIndex((child) => child.id === id);
          if (index !== -1) {
            parent.children[index] = newElement;
          }
        }
      } else {
        const index = state.elements.findIndex((el) => el.id === id);
        if (index !== -1) {
          state.elements[index] = newElement;
        }
      }

      state.selectedElementId = newElement.id;
    }),

    // Selection
    selectElement: (id) => set({ selectedElementId: id }),
    hoverElement: (id) => set({ hoveredElementId: id }),

    // View
    setDevice: (device) => set({ device }),
    setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(25, zoom)) }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    // Panels
    toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
    toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
    setActivePanel: (panel) => set({ activePanel: panel }),

    // History
    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    saveHistory: () => set((state) => {
      const snapshot = JSON.parse(JSON.stringify(state.elements));
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(snapshot);
      state.historyIndex = state.history.length - 1;
      // Keep max 50 history items
      if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
      }
    }),

    // Clipboard
    copyElement: (id) => set((state) => {
      const element = findElement(state.elements, id);
      if (element) {
        state.clipboard = deepCloneElement(element);
      }
    }),

    pasteElement: (parentId = null) => set((state) => {
      if (!state.clipboard) return;
      
      const pasted = deepCloneElement(state.clipboard);
      pasted.parentId = parentId;
      
      if (parentId) {
        const parent = findElement(state.elements, parentId);
        if (parent) {
          pasted.order = parent.children.length;
          parent.children.push(pasted);
        }
      } else {
        pasted.order = state.elements.length;
        state.elements.push(pasted);
      }
      
      state.selectedElementId = pasted.id;
    }),
  }))
);

// Helper functions
function findElement(elements: ElementNode[], id: string): ElementNode | null {
  for (const element of elements) {
    if (element.id === id) return element;
    const found = findElement(element.children, id);
    if (found) return found;
  }
  return null;
}

function removeElement(elements: ElementNode[], id: string): boolean {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      elements.splice(i, 1);
      return true;
    }
    if (removeElement(elements[i].children, id)) return true;
  }
  return false;
}

function deepCloneElement(element: ElementNode): ElementNode {
  const clone = JSON.parse(JSON.stringify(element));
  const regenerateIds = (el: ElementNode) => {
    el.id = `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    el.children.forEach(regenerateIds);
  };
  regenerateIds(clone);
  return clone;
}

