'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Palette,
  Type,
  Box,
  Move,
  Layers,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Import,
  MousePointer,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useLayoutsStore } from '@/store/layouts-store';
import { useEditorStore } from '@/store/editor-store';
import { useSiteStyles } from '@/hooks/use-site-styles';
import { cn } from '@/lib/utils';
import { Button, Input, Tooltip } from '../ui';
import { createElement, cloneElementTree } from '@/lib/element-factory';
import type { ComponentLayout, ElementNode, DeviceType, ElementType } from '@/types';

interface LayoutDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: ComponentLayout | null;
  isCustomLayout?: boolean;
  onSaveCustomLayout?: (id: string, updates: Partial<ComponentLayout>) => void;
}

type StyleTab = 'layout' | 'spacing' | 'typography' | 'colors' | 'effects';

const deviceWidths: Record<DeviceType, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export function LayoutDesignerModal({ 
  isOpen, 
  onClose, 
  layout, 
  isCustomLayout = false,
  onSaveCustomLayout 
}: LayoutDesignerModalProps) {
  const { updateLayout } = useLayoutsStore();
  const { elements: canvasElements } = useEditorStore();
  const { palette } = useSiteStyles();
  
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementNode[]>([]);
  const [expandedElements, setExpandedElements] = useState<string[]>([]);
  const [activeStyleTab, setActiveStyleTab] = useState<StyleTab>('layout');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([]);

  // Build tree from flat layout elements
  const buildTreeFromFlat = (flatElements: ElementNode[]): ElementNode[] => {
    if (!flatElements || flatElements.length === 0) return [];
    
    const elementMap = new Map<string, ElementNode>();
    flatElements.forEach((el) => {
      elementMap.set(el.id, { ...el, children: [] });
    });

    const rootElements: ElementNode[] = [];

    flatElements.forEach((el) => {
      const element = elementMap.get(el.id)!;
      if (el.parentId && elementMap.has(el.parentId)) {
        const parent = elementMap.get(el.parentId)!;
        parent.children.push(element);
      } else {
        rootElements.push(element);
      }
    });

    const sortChildren = (el: ElementNode) => {
      el.children.sort((a, b) => a.order - b.order);
      el.children.forEach(sortChildren);
    };
    rootElements.forEach(sortChildren);
    rootElements.sort((a, b) => a.order - b.order);

    return rootElements;
  };

  // Initialize elements from layout (build tree if flat)
  useEffect(() => {
    if (layout?.elements) {
      // Check if elements are already in tree format (have children populated)
      const hasNestedChildren = layout.elements.some(el => el.children && el.children.length > 0);
      
      if (hasNestedChildren) {
        setElements(JSON.parse(JSON.stringify(layout.elements)));
      } else {
        // Build tree from flat structure
        const treeElements = buildTreeFromFlat(layout.elements);
        setElements(treeElements);
      }
      setHasChanges(false);
    } else {
      setElements([]);
    }
    setSelectedElementId(null);
  }, [layout, isOpen]);

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    
    const findElement = (els: ElementNode[]): ElementNode | null => {
      for (const el of els) {
        if (el.id === selectedElementId) return el;
        if (el.children?.length) {
          const found = findElement(el.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findElement(elements);
  }, [selectedElementId, elements]);

  // Update element helper
  const updateElement = (elementId: string, updates: Partial<ElementNode>) => {
    setElements((prev) => {
      const updateInTree = (els: ElementNode[]): ElementNode[] => {
        return els.map((el) => {
          if (el.id === elementId) {
            return { ...el, ...updates };
          }
          if (el.children?.length) {
            return { ...el, children: updateInTree(el.children) };
          }
          return el;
        });
      };
      return updateInTree(prev);
    });
    setHasChanges(true);
  };

  // Update element style
  const updateElementStyle = (
    elementId: string, 
    device: 'base' | 'tablet' | 'desktop' | 'wide', 
    property: string, 
    value: string
  ) => {
    setElements((prev) => {
      const updateInTree = (els: ElementNode[]): ElementNode[] => {
        return els.map((el) => {
          if (el.id === elementId) {
            const newStyles = { ...el.styles };
            if (device === 'base') {
              newStyles.base = { ...newStyles.base, [property]: value };
            } else {
              newStyles[device] = { ...newStyles[device], [property]: value };
            }
            return { ...el, styles: newStyles };
          }
          if (el.children?.length) {
            return { ...el, children: updateInTree(el.children) };
          }
          return el;
        });
      };
      return updateInTree(prev);
    });
    setHasChanges(true);
  };

  // Add new element
  const addElement = (type: ElementType, parentId: string | null = null) => {
    const newElement = createElement(type);
    newElement.parentId = parentId;
    
    if (parentId) {
      setElements((prev) => {
        const addToTree = (els: ElementNode[]): ElementNode[] => {
          return els.map((el) => {
            if (el.id === parentId) {
              return { ...el, children: [...(el.children || []), newElement] };
            }
            if (el.children?.length) {
              return { ...el, children: addToTree(el.children) };
            }
            return el;
          });
        };
        return addToTree(prev);
      });
    } else {
      setElements((prev) => [...prev, newElement]);
    }
    setHasChanges(true);
    setSelectedElementId(newElement.id);
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements((prev) => {
      const removeFromTree = (els: ElementNode[]): ElementNode[] => {
        return els
          .filter((el) => el.id !== elementId)
          .map((el) => ({
            ...el,
            children: el.children?.length ? removeFromTree(el.children) : [],
          }));
      };
      return removeFromTree(prev);
    });
    setHasChanges(true);
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    const findAndDuplicate = (els: ElementNode[]): ElementNode[] => {
      const result: ElementNode[] = [];
      for (const el of els) {
        result.push(el);
        if (el.id === elementId) {
          const cloned = cloneElementTree(el);
          cloned.parentId = el.parentId;
          result.push(cloned);
        }
        if (el.children?.length) {
          el.children = findAndDuplicate(el.children);
        }
      }
      return result;
    };
    setElements((prev) => findAndDuplicate(prev));
    setHasChanges(true);
  };

  // Flatten tree back to array for storage
  const flattenTree = (els: ElementNode[], parentId: string | null = null): ElementNode[] => {
    const result: ElementNode[] = [];
    els.forEach((el, index) => {
      const flatEl: ElementNode = {
        ...el,
        parentId,
        order: index,
        children: [], // Will be stored separately
      };
      result.push(flatEl);
      if (el.children && el.children.length > 0) {
        result.push(...flattenTree(el.children, el.id));
      }
    });
    return result;
  };

  // Save changes
  const handleSave = async () => {
    if (!layout) return;
    
    setIsSaving(true);
    try {
      // Flatten tree for storage
      const flatElements = flattenTree(elements);
      
      if (isCustomLayout && onSaveCustomLayout) {
        onSaveCustomLayout(layout.id, { elements: flatElements });
      } else {
        await updateLayout(layout.id, { elements: flatElements });
      }
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    if (layout?.elements) {
      setElements(JSON.parse(JSON.stringify(layout.elements)));
      setHasChanges(false);
    }
  };

  // Import from canvas
  const handleImportFromCanvas = () => {
    if (selectedImportIds.length === 0) return;

    // Find and clone selected elements from canvas
    const findElement = (els: ElementNode[], id: string): ElementNode | null => {
      for (const el of els) {
        if (el.id === id) return el;
        if (el.children?.length) {
          const found = findElement(el.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const importedElements: ElementNode[] = [];
    for (const id of selectedImportIds) {
      const element = findElement(canvasElements, id);
      if (element) {
        const cloned = cloneElementTree(element);
        cloned.parentId = selectedElementId; // Import into selected parent or root
        importedElements.push(cloned);
      }
    }

    if (selectedElementId) {
      // Add to selected container
      setElements((prev) => {
        const addToTree = (els: ElementNode[]): ElementNode[] => {
          return els.map((el) => {
            if (el.id === selectedElementId) {
              return { ...el, children: [...(el.children || []), ...importedElements] };
            }
            if (el.children?.length) {
              return { ...el, children: addToTree(el.children) };
            }
            return el;
          });
        };
        return addToTree(prev);
      });
    } else {
      // Add to root
      setElements((prev) => [...prev, ...importedElements]);
    }

    setHasChanges(true);
    setShowImportModal(false);
    setSelectedImportIds([]);
  };

  if (!isOpen || !layout) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (hasChanges && !confirm('You have unsaved changes. Discard them?')) return;
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative flex flex-col w-full h-full max-w-[95vw] max-h-[95vh] m-auto bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              <h2 className="text-title-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                Layout Designer
              </h2>
            </div>
            <span className="text-body-sm text-gray-500">
              {layout.name}
            </span>
            {hasChanges && (
              <span className="px-2 py-0.5 text-label-sm bg-amber-100 text-amber-700 rounded">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {[
              { device: 'mobile' as DeviceType, icon: Smartphone },
              { device: 'tablet' as DeviceType, icon: Tablet },
              { device: 'desktop' as DeviceType, icon: Monitor },
            ].map(({ device, icon: Icon }) => (
              <Tooltip key={device} content={device.charAt(0).toUpperCase() + device.slice(1)} position="bottom">
                <button
                  onClick={() => setPreviewDevice(device)}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    previewDevice === device
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon size={18} />
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw size={16} />
                Reset
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save size={16} />
              )}
              Save Layout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Element Tree */}
          <div className="w-64 border-r border-outline-light dark:border-outline-dark flex flex-col bg-gray-50 dark:bg-gray-900/50">
            <div className="p-3 border-b border-outline-light dark:border-outline-dark">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-md font-medium">Elements</span>
                <div className="flex items-center gap-1">
                  <Tooltip content="Import from Canvas" position="left">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-gray-800"
                    >
                      <Import size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Add Element" position="left">
                    <button
                      onClick={() => addElement('container')}
                      className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800"
                    >
                      <Plus size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              {canvasElements.length > 0 && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-label-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  <Import size={14} />
                  Import from Canvas
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {elements.length > 0 ? (
                <ElementTree
                  elements={elements}
                  selectedId={selectedElementId}
                  expandedIds={expandedElements}
                  onSelect={setSelectedElementId}
                  onToggleExpand={(id) => setExpandedElements((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                  )}
                  onDelete={deleteElement}
                  onDuplicate={duplicateElement}
                  onAddChild={(parentId) => addElement('container', parentId)}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Layers size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-body-sm">No elements yet</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => addElement('container')}
                  >
                    <Plus size={14} />
                    Add Element
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Add Elements */}
            <div className="p-3 border-t border-outline-light dark:border-outline-dark">
              <span className="text-label-sm text-gray-500 mb-2 block">Quick Add:</span>
              <div className="flex flex-wrap gap-1">
                {(['container', 'text', 'heading', 'button', 'image'] as ElementType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addElement(type, selectedElementId)}
                    className="px-2 py-1 text-label-sm bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Preview */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-8 flex items-start justify-center">
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{
                width: deviceWidths[previewDevice],
                minHeight: 400,
              }}
            >
              <LayoutPreview
                elements={elements}
                selectedId={selectedElementId}
                onSelect={setSelectedElementId}
                palette={palette}
                device={previewDevice}
              />
            </div>
          </div>

          {/* Right Panel - Style Editor */}
          <div className="w-80 border-l border-outline-light dark:border-outline-dark flex flex-col bg-gray-50 dark:bg-gray-900/50">
            {selectedElement ? (
              <>
                <div className="p-3 border-b border-outline-light dark:border-outline-dark">
                  <div className="flex items-center justify-between">
                    <span className="text-label-md font-medium">{selectedElement.type}</span>
                    <span className="text-label-sm text-gray-400">#{selectedElement.id.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Style Tabs */}
                <div className="flex border-b border-outline-light dark:border-outline-dark">
                  {[
                    { id: 'layout' as StyleTab, icon: Box, label: 'Layout' },
                    { id: 'spacing' as StyleTab, icon: Move, label: 'Spacing' },
                    { id: 'typography' as StyleTab, icon: Type, label: 'Text' },
                    { id: 'colors' as StyleTab, icon: Palette, label: 'Colors' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setActiveStyleTab(id)}
                      className={cn(
                        'flex-1 py-2 flex flex-col items-center gap-1 text-label-sm transition-colors',
                        activeStyleTab === id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Style Controls */}
                <div className="flex-1 overflow-y-auto p-4">
                  <StyleEditor
                    element={selectedElement}
                    device={previewDevice}
                    activeTab={activeStyleTab}
                    onUpdateStyle={(prop, value) => 
                      updateElementStyle(selectedElement.id, 'base', prop, value)
                    }
                    onUpdateResponsiveStyle={(device, prop, value) =>
                      updateElementStyle(selectedElement.id, device, prop, value)
                    }
                    onUpdateProp={(prop, value) =>
                      updateElement(selectedElement.id, { props: { ...selectedElement.props, [prop]: value } })
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Box size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-body-sm">Select an element to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Import from Canvas Modal */}
        {showImportModal && (
          <ImportCanvasModal
            canvasElements={canvasElements}
            selectedIds={selectedImportIds}
            onToggleSelect={(id) => {
              setSelectedImportIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              );
            }}
            onSelectAll={() => {
              const getAllIds = (els: ElementNode[]): string[] => {
                const ids: string[] = [];
                for (const el of els) {
                  ids.push(el.id);
                  if (el.children?.length) {
                    ids.push(...getAllIds(el.children));
                  }
                }
                return ids;
              };
              setSelectedImportIds(getAllIds(canvasElements));
            }}
            onClearAll={() => setSelectedImportIds([])}
            onImport={handleImportFromCanvas}
            onClose={() => {
              setShowImportModal(false);
              setSelectedImportIds([]);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Import from Canvas Modal Component
interface ImportCanvasModalProps {
  canvasElements: ElementNode[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onImport: () => void;
  onClose: () => void;
}

function ImportCanvasModal({
  canvasElements,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearAll,
  onImport,
  onClose,
}: ImportCanvasModalProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const renderElement = (element: ElementNode, depth: number = 0): React.ReactNode => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedIds.includes(element.id);
    const isSelected = selectedIds.includes(element.id);

    return (
      <div key={element.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
            isSelected
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
          style={{ marginLeft: depth * 16 }}
          onClick={() => onToggleSelect(element.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedIds((prev) =>
                  prev.includes(element.id)
                    ? prev.filter((i) => i !== element.id)
                    : [...prev, element.id]
                );
              }}
              className="p-0.5 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <span className="w-5" />}
          
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'border-gray-300 dark:border-gray-600'
            )}
          >
            {isSelected && <Check size={12} />}
          </div>
          
          <span className="text-label-md font-medium">{element.type}</span>
          
          {element.props?.content && (
            <span className="text-label-sm text-gray-400 truncate max-w-[150px]">
              "{String(element.props.content).slice(0, 20)}..."
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {element.children!.map((child) => renderElement(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Import size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-title-md font-semibold">Import from Canvas</h3>
              <p className="text-body-sm text-gray-500">
                Select elements to import into this layout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Element List */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {canvasElements.length > 0 ? (
            <div className="space-y-1">
              {canvasElements.map((element) => renderElement(element))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Layers size={32} className="mb-2 opacity-50" />
              <p className="text-body-sm">No elements on canvas</p>
              <p className="text-label-sm">Add elements to the editor first</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="text-label-sm text-indigo-500 hover:text-indigo-600"
            >
              Select All
            </button>
            <button
              onClick={onClearAll}
              className="text-label-sm text-gray-500 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-label-sm text-gray-500">
              {selectedIds.length} selected
            </span>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onImport} disabled={selectedIds.length === 0}>
              <ArrowRight size={16} />
              Import ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Element Tree Component
interface ElementTreeProps {
  elements: ElementNode[];
  selectedId: string | null;
  expandedIds: string[];
  depth?: number;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

function ElementTree({
  elements,
  selectedId,
  expandedIds,
  depth = 0,
  onSelect,
  onToggleExpand,
  onDelete,
  onDuplicate,
  onAddChild,
}: ElementTreeProps) {
  return (
    <div className={cn(depth > 0 && 'ml-3 border-l border-gray-200 dark:border-gray-700')}>
      {elements.map((element) => {
        const hasChildren = element.children && element.children.length > 0;
        const isExpanded = expandedIds.includes(element.id);
        const isSelected = selectedId === element.id;

        return (
          <div key={element.id}>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group',
                isSelected
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => onSelect(element.id)}
            >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(element.id);
                  }}
                  className="p-0.5"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-5" />
              )}
              
              <span className="text-label-sm flex-1 truncate">
                {element.type}
                {element.props?.content && (
                  <span className="text-gray-400 ml-1">
                    "{String(element.props.content).slice(0, 15)}..."
                  </span>
                )}
              </span>

              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(element.id);
                  }}
                  className="p-1 rounded hover:bg-white dark:hover:bg-gray-700"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(element.id);
                  }}
                  className="p-1 rounded hover:bg-white dark:hover:bg-gray-700"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <ElementTree
                elements={element.children}
                selectedId={selectedId}
                expandedIds={expandedIds}
                depth={depth + 1}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onAddChild={onAddChild}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Layout Preview Component
interface LayoutPreviewProps {
  elements: ElementNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  palette: any;
  device: DeviceType;
}

function LayoutPreview({ elements, selectedId, onSelect, palette, device }: LayoutPreviewProps) {
  // Default palette colors for preview
  const defaultPalette: Record<string, string> = {
    primary: '#492cdd',
    primaryLight: '#ad38e2',
    primaryDark: '#3721a8',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    background: '#ffffff',
    surface: '#f8f9fa',
    border: '#e2e8f0',
    ...palette?.colors,
  };

  const renderElement = (element: ElementNode): React.ReactNode => {
    const isSelected = selectedId === element.id;
    const baseStyles = element.styles?.base || {};
    const deviceStyles = device !== 'mobile' ? element.styles?.[device] || {} : {};
    const combinedStyles = { ...baseStyles, ...deviceStyles };

    // Resolve palette references
    const resolvedStyles: React.CSSProperties = {};
    for (const [key, value] of Object.entries(combinedStyles)) {
      if (value && typeof value === 'object' && '$palette' in value) {
        resolvedStyles[key as any] = defaultPalette[value.$palette] || value.$palette;
      } else {
        resolvedStyles[key as any] = value;
      }
    }

    const commonProps = {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(element.id);
      },
      className: cn(
        'relative cursor-pointer transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2 rounded'
      ),
      style: resolvedStyles,
    };

    switch (element.type) {
      case 'text':
      case 'paragraph':
        return (
          <p key={element.id} {...commonProps}>
            {element.props?.content || 'Text content'}
          </p>
        );
      case 'heading':
        const Tag = (element.props?.tag || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <Tag key={element.id} {...commonProps}>
            {element.props?.content || 'Heading'}
          </Tag>
        );
      case 'button':
        return (
          <button 
            key={element.id} 
            {...commonProps}
            className={cn(commonProps.className, 'px-4 py-2 rounded-lg')}
            style={{
              ...resolvedStyles,
              backgroundColor: resolvedStyles.backgroundColor || defaultPalette.primary,
              color: resolvedStyles.color || defaultPalette.textInverse,
            }}
          >
            {element.props?.text || 'Button'}
          </button>
        );
      case 'image':
        return (
          <img
            key={element.id}
            src={element.props?.src || 'https://via.placeholder.com/400x200?text=Image'}
            alt={element.props?.alt || 'Image'}
            {...commonProps}
            className={cn(commonProps.className, 'max-w-full h-auto rounded')}
          />
        );
      case 'link':
        return (
          <a key={element.id} href="#" {...commonProps} className={cn(commonProps.className, 'text-primary hover:underline')}>
            {element.props?.text || 'Link'}
          </a>
        );
      case 'divider':
        return (
          <hr key={element.id} {...commonProps} className={cn(commonProps.className, 'border-gray-200 my-4')} />
        );
      case 'spacer':
        return (
          <div key={element.id} {...commonProps} style={{ ...resolvedStyles, height: resolvedStyles.height || '24px' }} />
        );
      case 'navbar':
        return (
          <nav key={element.id} {...commonProps} className={cn(commonProps.className, 'flex items-center justify-between py-4 px-6 bg-white border-b')}>
            <span className="font-bold text-lg">{element.props?.logoText || 'Brand'}</span>
            <div className="flex items-center gap-4">
              {element.props?.links?.slice(0, 3).map((link: any, i: number) => (
                <span key={i} className="text-sm text-gray-600 hover:text-primary">{link.label}</span>
              ))}
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
                {element.props?.ctaText || 'Get Started'}
              </button>
            </div>
          </nav>
        );
      case 'hero':
        return (
          <section key={element.id} {...commonProps} className={cn(commonProps.className, 'py-16 px-6 text-center bg-gradient-to-br from-indigo-50 to-purple-50')}>
            <h1 className="text-4xl font-bold mb-4">{element.props?.title || 'Hero Title'}</h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{element.props?.subtitle || 'Hero subtitle text goes here'}</p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-3 bg-primary text-white rounded-lg">{element.props?.primaryCta || 'Primary CTA'}</button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg">{element.props?.secondaryCta || 'Secondary'}</button>
            </div>
            {element.children?.map(renderElement)}
          </section>
        );
      case 'footer':
        return (
          <footer key={element.id} {...commonProps} className={cn(commonProps.className, 'py-8 px-6 text-center bg-gray-50 border-t')}>
            <p className="font-bold mb-1">{element.props?.companyName || 'Company'}</p>
            <p className="text-sm text-gray-500">{element.props?.copyright || '© 2024 All rights reserved.'}</p>
          </footer>
        );
      case 'card':
        return (
          <div key={element.id} {...commonProps} className={cn(commonProps.className, 'p-6 bg-white rounded-xl shadow-md border')}>
            {element.children?.length ? element.children.map(renderElement) : (
              <>
                <h3 className="text-xl font-semibold mb-2">{element.props?.title || 'Card Title'}</h3>
                <p className="text-gray-600">{element.props?.description || 'Card description'}</p>
              </>
            )}
          </div>
        );
      case 'container':
      case 'section':
      case 'flexbox':
      case 'grid':
      case 'stack':
      case 'wrapper':
        return (
          <div key={element.id} {...commonProps}>
            {element.children?.map(renderElement)}
            {(!element.children || element.children.length === 0) && (
              <div className="min-h-[60px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm bg-gray-50/50">
                <div className="text-center">
                  <Box size={20} className="mx-auto mb-1 opacity-50" />
                  <span>Empty {element.type}</span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div key={element.id} {...commonProps} className={cn(commonProps.className, 'p-2 bg-gray-100 rounded border border-dashed')}>
            <span className="text-xs text-gray-500">[{element.type}]</span>
            {element.children?.map(renderElement)}
          </div>
        );
    }
  };

  return (
    <div className="p-4 min-h-[300px]">
      {elements.length > 0 ? (
        elements.map(renderElement)
      ) : (
        <div className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
          <Layers size={32} className="mb-2 opacity-50" />
          <p className="text-body-sm">Add elements to preview</p>
          <p className="text-label-sm">Click "Import from Canvas" or add elements from the left panel</p>
        </div>
      )}
    </div>
  );
}

// Style Editor Component
interface StyleEditorProps {
  element: ElementNode;
  device: DeviceType;
  activeTab: StyleTab;
  onUpdateStyle: (property: string, value: string) => void;
  onUpdateResponsiveStyle: (device: 'tablet' | 'desktop' | 'wide', property: string, value: string) => void;
  onUpdateProp: (property: string, value: any) => void;
}

function StyleEditor({
  element,
  device,
  activeTab,
  onUpdateStyle,
  onUpdateResponsiveStyle,
  onUpdateProp,
}: StyleEditorProps) {
  const baseStyles = element.styles?.base || {};
  const deviceStyles = element.styles?.[device] || {};

  const renderInput = (
    label: string,
    property: string,
    placeholder?: string,
    type: 'text' | 'number' | 'color' | 'select' = 'text',
    options?: { label: string; value: string }[]
  ) => {
    const value = (deviceStyles[property] ?? baseStyles[property]) || '';
    const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    return (
      <div className="mb-3">
        <label className="block text-label-sm text-gray-500 mb-1">{label}</label>
        {type === 'select' && options ? (
          <select
            value={displayValue}
            onChange={(e) => onUpdateStyle(property, e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Default</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'color' ? (
          <div className="flex gap-2">
            <input
              type="color"
              value={displayValue.startsWith('#') ? displayValue : '#000000'}
              onChange={(e) => onUpdateStyle(property, e.target.value)}
              className="w-10 h-10 rounded border border-gray-200"
            />
            <Input
              value={displayValue}
              onChange={(e) => onUpdateStyle(property, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
          </div>
        ) : (
          <Input
            type={type}
            value={displayValue}
            onChange={(e) => onUpdateStyle(property, e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Device-specific indicator */}
      {device !== 'mobile' && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-label-sm text-blue-600 dark:text-blue-400">
          Editing styles for {device} and larger screens
        </div>
      )}

      {activeTab === 'layout' && (
        <>
          {renderInput('Display', 'display', 'flex', 'select', [
            { label: 'Block', value: 'block' },
            { label: 'Flex', value: 'flex' },
            { label: 'Grid', value: 'grid' },
            { label: 'Inline', value: 'inline' },
            { label: 'Inline Flex', value: 'inline-flex' },
            { label: 'None', value: 'none' },
          ])}
          {renderInput('Flex Direction', 'flexDirection', '', 'select', [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
            { label: 'Row Reverse', value: 'row-reverse' },
            { label: 'Column Reverse', value: 'column-reverse' },
          ])}
          {renderInput('Justify Content', 'justifyContent', '', 'select', [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Space Between', value: 'space-between' },
            { label: 'Space Around', value: 'space-around' },
          ])}
          {renderInput('Align Items', 'alignItems', '', 'select', [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Stretch', value: 'stretch' },
          ])}
          {renderInput('Gap', 'gap', '16px')}
          {renderInput('Width', 'width', '100%')}
          {renderInput('Height', 'height', 'auto')}
          {renderInput('Max Width', 'maxWidth', '1200px')}
        </>
      )}

      {activeTab === 'spacing' && (
        <>
          {renderInput('Padding', 'padding', '16px')}
          {renderInput('Padding Top', 'paddingTop', '')}
          {renderInput('Padding Bottom', 'paddingBottom', '')}
          {renderInput('Padding Left', 'paddingLeft', '')}
          {renderInput('Padding Right', 'paddingRight', '')}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
          {renderInput('Margin', 'margin', '0')}
          {renderInput('Margin Top', 'marginTop', '')}
          {renderInput('Margin Bottom', 'marginBottom', '')}
        </>
      )}

      {activeTab === 'typography' && (
        <>
          {/* Props for text content */}
          {(element.type === 'text' || element.type === 'heading' || element.type === 'button') && (
            <div className="mb-4">
              <label className="block text-label-sm text-gray-500 mb-1">Content</label>
              <textarea
                value={element.props?.content || element.props?.text || ''}
                onChange={(e) => onUpdateProp(element.type === 'button' ? 'text' : 'content', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none"
              />
            </div>
          )}
          {renderInput('Font Size', 'fontSize', '16px')}
          {renderInput('Font Weight', 'fontWeight', '', 'select', [
            { label: 'Normal (400)', value: '400' },
            { label: 'Medium (500)', value: '500' },
            { label: 'Semi Bold (600)', value: '600' },
            { label: 'Bold (700)', value: '700' },
            { label: 'Extra Bold (800)', value: '800' },
          ])}
          {renderInput('Line Height', 'lineHeight', '1.6')}
          {renderInput('Text Align', 'textAlign', '', 'select', [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ])}
        </>
      )}

      {activeTab === 'colors' && (
        <>
          {renderInput('Color', 'color', '#000000', 'color')}
          {renderInput('Background', 'backgroundColor', '#ffffff', 'color')}
          {renderInput('Border Color', 'borderColor', '#e5e7eb', 'color')}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
          {renderInput('Border Width', 'borderWidth', '0')}
          {renderInput('Border Radius', 'borderRadius', '8px')}
          {renderInput('Box Shadow', 'boxShadow', 'none')}
        </>
      )}
    </div>
  );
}

