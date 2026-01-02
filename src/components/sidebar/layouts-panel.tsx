'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Shield,
  MousePointer2,
  Sparkles,
  CreditCard,
  Layout,
  PanelTop,
  PanelBottom,
  Navigation,
  FormInput,
  Zap,
  Quote,
  DollarSign,
  Megaphone,
  LayoutGrid,
  Lightbulb,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Filter,
  User,
  FolderHeart,
} from 'lucide-react';
import { useLayoutsStore, LAYOUT_CATEGORIES } from '@/store/layouts-store';
import { useEditorStore } from '@/store/editor-store';
import { useAuthStore, useIsAdmin, useCanManageLayouts } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { Button, Tooltip } from '../ui';
import { LayoutEditModal } from '../modals/layout-edit-modal';
import { LayoutDesignerModal } from '../modals/layout-designer-modal';
import type { ComponentLayout, ComponentLayoutCategory, DeviceType, ElementNode } from '@/types';

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  buttons: <MousePointer2 size={16} />,
  heroes: <Sparkles size={16} />,
  cards: <CreditCard size={16} />,
  sections: <Layout size={16} />,
  headers: <PanelTop size={16} />,
  footers: <PanelBottom size={16} />,
  navigation: <Navigation size={16} />,
  forms: <FormInput size={16} />,
  features: <Zap size={16} />,
  testimonials: <Quote size={16} />,
  pricing: <DollarSign size={16} />,
  cta: <Megaphone size={16} />,
};

// Map element types to related layout categories
const elementToLayoutCategory: Record<string, ComponentLayoutCategory[]> = {
  button: ['buttons'],
  hero: ['heroes'],
  card: ['cards'],
  section: ['sections', 'heroes', 'cta'],
  container: ['sections', 'cards'],
  navbar: ['headers', 'navigation'],
  footer: ['footers'],
  form: ['forms'],
  heading: ['heroes', 'sections'],
  text: ['sections', 'cards'],
  image: ['heroes', 'cards'],
  testimonial: ['testimonials'],
  pricing: ['pricing'],
  cta: ['cta'],
  feature: ['features', 'cards'],
};

interface LayoutsPanelProps {
  searchQuery?: string;
}

export function LayoutsPanel({ searchQuery = '' }: LayoutsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['buttons', 'heroes']);
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [designerModalOpen, setDesignerModalOpen] = useState(false);
  const [designerLayout, setDesignerLayout] = useState<ComponentLayout | null>(null);
  
  const {
    layouts,
    customLayouts,
    isLoading,
    loadLayouts,
    selectedCategory,
    setSelectedCategory,
    showCustomOnly,
    setShowCustomOnly,
    openCreateModal,
    deleteLayout,
    duplicateLayout,
    togglePublished,
    createCustomLayout,
    updateCustomLayout,
    deleteCustomLayout,
    isCreateModalOpen,
    isEditModalOpen,
    editingLayout,
    closeCreateModal,
    closeEditModal,
  } = useLayoutsStore();
  
  const { selectedElementId, elements } = useEditorStore();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const canManageLayouts = useCanManageLayouts();
  const { startDragging, stopDragging } = useUIStore();

  // Load layouts on mount
  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  // Get selected element type
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    
    const findElement = (els: typeof elements): typeof elements[0] | null => {
      for (const el of els) {
        if (el.id === selectedElementId) return el;
        if (el.children.length > 0) {
          const found = findElement(el.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findElement(elements);
  }, [selectedElementId, elements]);

  // Get related layout categories for selected element
  const relatedCategories = useMemo(() => {
    if (!selectedElement) return [];
    return elementToLayoutCategory[selectedElement.type] || [];
  }, [selectedElement]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Get user's custom layouts
  const userCustomLayouts = useMemo(() => {
    if (!user) return [];
    return customLayouts.filter((l) => l.createdByUserId === user.id);
  }, [customLayouts, user]);

  // Filter layouts
  const filteredLayouts = useMemo(() => {
    return layouts.filter((layout) => {
      // Non-admin users can only see published layouts
      if (!isAdmin && !layout.isPublished) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = layout.name.toLowerCase().includes(query);
        const matchesDescription = layout.description?.toLowerCase().includes(query);
        const matchesTags = layout.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      return true;
    });
  }, [layouts, isAdmin, searchQuery]);

  // Filter custom layouts
  const filteredCustomLayouts = useMemo(() => {
    if (!searchQuery) return userCustomLayouts;
    
    const query = searchQuery.toLowerCase();
    return userCustomLayouts.filter((layout) => {
      const matchesName = layout.name.toLowerCase().includes(query);
      const matchesDescription = layout.description?.toLowerCase().includes(query);
      const matchesTags = layout.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesName || matchesDescription || matchesTags;
    });
  }, [userCustomLayouts, searchQuery]);

  // Create custom layout handler
  const handleCreateCustomLayout = () => {
    if (!user) return;
    
    // Get selected element to create layout from
    const selectedEl = selectedElement;
    const elements: ElementNode[] = selectedEl ? [JSON.parse(JSON.stringify(selectedEl))] : [];
    
    createCustomLayout({
      name: `My Custom Layout ${userCustomLayouts.length + 1}`,
      description: 'Custom layout created from canvas',
      category: selectedEl ? (elementToLayoutCategory[selectedEl.type]?.[0] || 'sections') : 'sections',
      createdBy: user.id,
      isPublished: true,
      elements,
      exposedProps: [],
      tags: ['custom'],
    }, user.id);
  };

  // Group layouts by category
  const layoutsByCategory = LAYOUT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = filteredLayouts.filter((l) => l.category === category.id);
    return acc;
  }, {} as Record<string, ComponentLayout[]>);

  // Get related layouts for selected element
  const relatedLayouts = useMemo(() => {
    if (relatedCategories.length === 0) return [];
    return filteredLayouts.filter((l) => relatedCategories.includes(l.category));
  }, [filteredLayouts, relatedCategories]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, layout: ComponentLayout) => {
    startDragging(`layout:${layout.id}`);
    e.dataTransfer.setData('text/plain', `layout:${layout.id}`);
    e.dataTransfer.setData('layout-id', layout.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    requestAnimationFrame(() => {
      stopDragging();
    });
  };

  const openDesigner = (layout: ComponentLayout) => {
    setDesignerLayout(layout);
    setDesignerModalOpen(true);
  };

  // Category count
  const getCategoryCount = (categoryId: string) => {
    return layoutsByCategory[categoryId]?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
    <div className="p-3">
      {/* Admin Controls */}
      {canManageLayouts && (
        <div className="mb-4 p-3 rounded-material bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-amber-600 dark:text-amber-400" />
            <span className="text-label-md font-medium text-amber-700 dark:text-amber-400">
              Layout Manager
            </span>
          </div>
          <p className="text-body-sm text-amber-600/80 dark:text-amber-500/80 mb-3">
            Create and manage component layouts for all users
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="w-full justify-center"
            onClick={openCreateModal}
          >
            <Plus size={14} />
            Create New Layout
          </Button>
        </div>
      )}

      {/* Custom Layouts Section - Only for normal users (not admin) */}
      {!isAdmin && (
        <div className="mb-4 p-3 rounded-material bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FolderHeart size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-label-md font-medium text-indigo-700 dark:text-indigo-400">
                My Custom Layouts
              </span>
              <span className="text-label-sm text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 rounded">
                {userCustomLayouts.length}
              </span>
            </div>
          </div>
          
          {filteredCustomLayouts.length > 0 ? (
            <div className="space-y-2 mb-3">
              {filteredCustomLayouts.map((layout) => (
                <LayoutCard
                  key={layout.id}
                  layout={layout}
                  isAdmin={false}
                  canManage={true}
                  isCustom={true}
                  previewDevice={previewDevice}
                  compact
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDelete={() => deleteCustomLayout(layout.id)}
                  onDuplicate={() => {
                    if (!user) return;
                    createCustomLayout({
                      ...layout,
                      name: `${layout.name} (Copy)`,
                      id: undefined as any,
                      createdAt: undefined as any,
                      updatedAt: undefined as any,
                    }, user.id);
                  }}
                  onTogglePublished={() => {}}
                  onOpenDesigner={() => openDesigner(layout)}
                  onUpdateCustomLayout={updateCustomLayout}
                />
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-indigo-600/70 dark:text-indigo-400/70 mb-3">
              {searchQuery ? 'No matching custom layouts' : 'Create your own reusable layouts'}
            </p>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-center bg-white/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-900/50"
            onClick={handleCreateCustomLayout}
          >
            <Plus size={14} />
            {selectedElement ? `Save "${selectedElement.type}" as Layout` : 'Create Custom Layout'}
          </Button>
        </div>
      )}

      {/* Device Preview Toggle */}
      <div className="flex items-center gap-2 mb-3 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <span className="text-label-sm text-gray-500 px-2">Preview:</span>
        <div className="flex gap-1 flex-1">
          {[
            { device: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' },
            { device: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
            { device: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
          ].map(({ device, icon: Icon, label }) => (
            <Tooltip key={device} content={label} position="top">
              <button
                onClick={() => setPreviewDevice(device)}
                className={cn(
                  'flex-1 p-1.5 rounded-md flex items-center justify-center transition-all',
                  previewDevice === device
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <Icon size={16} />
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Category Dropdown Filter */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2.5',
            'bg-white dark:bg-surface-dark',
            'border border-outline-light dark:border-outline-dark rounded-material',
            'text-on-surface-light dark:text-on-surface-dark',
            'hover:border-primary transition-colors'
          )}
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-label-md">
              {selectedCategory === 'all' 
                ? 'All Categories' 
                : LAYOUT_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-gray-400">
              {selectedCategory === 'all' 
                ? filteredLayouts.length 
                : getCategoryCount(selectedCategory)
              } layouts
            </span>
            <ChevronDown size={16} className={cn(
              'text-gray-400 transition-transform',
              showCategoryDropdown && 'rotate-180'
            )} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {showCategoryDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowCategoryDropdown(false)} 
            />
            <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-surface-dark border border-outline-light dark:border-outline-dark rounded-material shadow-lg max-h-[300px] overflow-y-auto">
              {/* All option */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowCategoryDropdown(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  selectedCategory === 'all' && 'bg-primary/5 text-primary'
                )}
              >
                <LayoutGrid size={18} className="text-gray-400" />
                <span className="flex-1">All Categories</span>
                <span className="text-label-sm text-gray-400">{filteredLayouts.length}</span>
              </button>
              
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              
              {/* Category options */}
              {LAYOUT_CATEGORIES.map((category) => {
                const count = getCategoryCount(category.id);
                if (count === 0 && !isAdmin) return null;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                      selectedCategory === category.id && 'bg-primary/5 text-primary'
                    )}
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {categoryIcons[category.id]}
                    </span>
                    <span className="flex-1">{category.name}</span>
                    <span className="text-label-sm text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Related Layouts Section - Show when element is selected */}
      {selectedElement && relatedLayouts.length > 0 && (
        <div className="mb-4 p-3 rounded-material bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-label-md font-medium text-blue-700 dark:text-blue-400">
              Suggested for {selectedElement.type}
            </span>
          </div>
          <div className="space-y-2">
            {relatedLayouts.slice(0, 3).map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                isAdmin={isAdmin}
                canManage={canManageLayouts}
                previewDevice={previewDevice}
                compact
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDelete={() => deleteLayout(layout.id)}
                onDuplicate={() => duplicateLayout(layout.id)}
                onTogglePublished={() => togglePublished(layout.id)}
                onOpenDesigner={() => openDesigner(layout)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Layout Categories */}
      {LAYOUT_CATEGORIES.map((category) => {
        const categoryLayouts = layoutsByCategory[category.id] || [];
        
        // Skip empty categories (unless admin)
        if (categoryLayouts.length === 0 && !isAdmin) return null;
        
        // Filter by selected category
        if (selectedCategory !== 'all' && selectedCategory !== category.id) return null;

        return (
          <div key={category.id} className="mb-3">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-label-md text-gray-500 hover:text-on-surface-light dark:hover:text-on-surface-dark transition-colors rounded-material-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {categoryIcons[category.id] || <LayoutGrid size={16} />}
              </span>
              <span className="flex-1 text-left">{category.name}</span>
              <span className="text-label-sm text-gray-400">
                {categoryLayouts.length}
              </span>
            </button>

            {/* Layout Cards */}
            {expandedCategories.includes(category.id) && (
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                {categoryLayouts.length > 0 ? (
                  categoryLayouts.map((layout) => (
                    <LayoutCard
                      key={layout.id}
                      layout={layout}
                      isAdmin={isAdmin}
                      canManage={canManageLayouts}
                      previewDevice={previewDevice}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDelete={() => deleteLayout(layout.id)}
                      onDuplicate={() => duplicateLayout(layout.id)}
                      onTogglePublished={() => togglePublished(layout.id)}
                      onOpenDesigner={() => openDesigner(layout)}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 rounded-material border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-body-sm text-gray-400">
                      No layouts in this category
                    </p>
                    {canManageLayouts && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={openCreateModal}
                      >
                        <Plus size={14} />
                        Add Layout
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* No Results */}
      {searchQuery && filteredLayouts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-body-md text-gray-500">
            No layouts found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>

    {/* Modals */}
    <LayoutEditModal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      layout={null}
    />
    <LayoutEditModal
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
      layout={editingLayout}
    />
    {/* Designer Modal - available to admin for all layouts, and users for their custom layouts */}
    <LayoutDesignerModal
      isOpen={designerModalOpen}
      onClose={() => {
        setDesignerModalOpen(false);
        setDesignerLayout(null);
      }}
      layout={designerLayout}
      isCustomLayout={designerLayout?.isCustom}
      onSaveCustomLayout={designerLayout?.isCustom ? updateCustomLayout : undefined}
    />
    </>
  );
}

// Layout Card Component
interface LayoutCardProps {
  layout: ComponentLayout;
  isAdmin: boolean;
  canManage: boolean;
  isCustom?: boolean;
  previewDevice: DeviceType;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, layout: ComponentLayout) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePublished: () => void;
  onOpenDesigner: () => void;
  onUpdateCustomLayout?: (id: string, updates: Partial<ComponentLayout>) => void;
}

function LayoutCard({
  layout,
  isAdmin,
  canManage,
  isCustom = false,
  previewDevice,
  compact = false,
  onDragStart,
  onDragEnd,
  onDelete,
  onDuplicate,
  onTogglePublished,
  onOpenDesigner,
  onUpdateCustomLayout,
}: LayoutCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layout.name);
  const { openEditModal } = useLayoutsStore();

  // Handle inline name edit for custom layouts
  const handleSaveName = () => {
    if (isCustom && onUpdateCustomLayout && editName.trim()) {
      onUpdateCustomLayout(layout.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  // Get responsive indicator
  const getResponsiveInfo = () => {
    if (!layout.elements || layout.elements.length === 0) return null;
    
    const hasResponsive = layout.elements.some((el) => 
      el.styles?.tablet || el.styles?.desktop || el.styles?.wide ||
      el.props?.className?.includes('md:') || el.props?.className?.includes('lg:')
    );
    
    return hasResponsive;
  };

  const isResponsive = getResponsiveInfo();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, layout)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative flex items-start gap-3',
        compact ? 'p-2' : 'p-3',
        'bg-surface-light dark:bg-surface-dark',
        'border border-outline-light dark:border-outline-dark',
        'rounded-material cursor-grab',
        'hover:border-primary hover:shadow-material-1',
        'active:cursor-grabbing active:scale-[0.99]',
        'transition-all duration-150',
        !layout.isPublished && 'opacity-60 border-dashed'
      )}
    >
      {/* Layout Preview/Icon */}
      <div
        className={cn(
          'rounded-material flex-shrink-0',
          'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700',
          'flex items-center justify-center relative overflow-hidden',
          compact ? 'w-10 h-10' : 'w-12 h-12',
          'text-gray-400 dark:text-gray-500'
        )}
      >
        {categoryIcons[layout.category] || <LayoutGrid size={compact ? 16 : 20} />}
        
        {/* Responsive indicator */}
        {isResponsive && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-tl flex items-center justify-center">
            <Monitor size={6} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isEditing && isCustom ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setEditName(layout.name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 px-1.5 py-0.5 text-label-sm rounded border border-primary bg-white dark:bg-gray-800 focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className={cn(
                'font-medium text-on-surface-light dark:text-on-surface-dark truncate',
                compact ? 'text-label-sm' : 'text-label-md',
                isCustom && 'cursor-text hover:underline'
              )}
              onDoubleClick={(e) => {
                if (isCustom) {
                  e.stopPropagation();
                  setIsEditing(true);
                }
              }}
            >
              {layout.name}
            </span>
          )}
          {!layout.isPublished && !isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Draft
            </span>
          )}
          {isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              Custom
            </span>
          )}
        </div>
        {!compact && layout.description && (
          <p className="text-body-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {layout.description}
          </p>
        )}
        {!compact && layout.tags && layout.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {layout.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions - Admin or Custom layout owner */}
      {(canManage || isCustom) && showActions && (
        <div className="absolute top-2 right-2 flex gap-0.5 bg-white/95 dark:bg-gray-900/95 rounded-md shadow-sm p-0.5">
          {!isCustom && (
            <Tooltip content={layout.isPublished ? 'Unpublish' : 'Publish'} position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublished();
                }}
                className="p-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {layout.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </Tooltip>
          )}
          <Tooltip content="Edit Design" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDesigner();
              }}
              className="p-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Palette size={14} />
            </button>
          </Tooltip>
          {!isCustom && (
            <Tooltip content="Edit Info" position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(layout);
                }}
                className="p-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 size={14} />
              </button>
            </Tooltip>
          )}
          <Tooltip content="Duplicate" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Copy size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this layout?')) {
                  onDelete();
                }
              }}
              className="p-1.5 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
