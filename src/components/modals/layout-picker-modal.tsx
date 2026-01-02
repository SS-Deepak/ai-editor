'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Search,
  LayoutGrid,
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
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useLayoutsStore, LAYOUT_CATEGORIES } from '@/store/layouts-store';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { useSiteStyles } from '@/hooks/use-site-styles';
import { cn } from '@/lib/utils';
import { Button, Input, Tooltip } from '../ui';
import { cloneElementTree } from '@/lib/element-factory';
import type { ComponentLayout, ElementNode, DeviceType, ComponentLayoutCategory } from '@/types';

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

// Map element types to suggested layout categories
const elementToLayoutCategory: Record<string, ComponentLayoutCategory[]> = {
  button: ['buttons'],
  hero: ['heroes'],
  card: ['cards'],
  section: ['sections', 'heroes', 'cta'],
  container: ['sections', 'cards', 'heroes'],
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
  flexbox: ['sections', 'cards', 'heroes'],
  grid: ['sections', 'features'],
  stack: ['sections', 'cards'],
};

interface LayoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElement: ElementNode;
}

export function LayoutPickerModal({ isOpen, onClose, targetElement }: LayoutPickerModalProps) {
  const { layouts, loadLayouts } = useLayoutsStore();
  const { replaceElement, saveHistory } = useEditorStore();
  const { showToast } = useUIStore();
  const { palette } = useSiteStyles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentLayoutCategory | 'all' | 'suggested'>('suggested');
  const [selectedLayout, setSelectedLayout] = useState<ComponentLayout | null>(null);
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Load layouts on mount
  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  // Get suggested categories based on target element type
  const suggestedCategories = useMemo(() => {
    return elementToLayoutCategory[targetElement.type] || ['sections'];
  }, [targetElement.type]);

  // Filter layouts
  const filteredLayouts = useMemo(() => {
    return layouts.filter((layout) => {
      // Only show published layouts
      if (!layout.isPublished) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = layout.name.toLowerCase().includes(query);
        const matchesDescription = layout.description?.toLowerCase().includes(query);
        const matchesTags = layout.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      // Category filter
      if (selectedCategory === 'suggested') {
        return suggestedCategories.includes(layout.category);
      } else if (selectedCategory !== 'all') {
        return layout.category === selectedCategory;
      }

      return true;
    });
  }, [layouts, searchQuery, selectedCategory, suggestedCategories]);

  // Build tree structure from flat elements array
  const buildTreeFromFlat = (elements: ElementNode[]): ElementNode[] => {
    if (!elements || elements.length === 0) return [];
    
    // Check if already in tree format (has children with nested elements)
    const hasNestedChildren = elements.some(el => 
      el.children && el.children.length > 0 && el.children[0]?.id
    );
    
    if (hasNestedChildren) {
      // Already in tree format, return deep cloned
      return JSON.parse(JSON.stringify(elements)).sort((a: ElementNode, b: ElementNode) => a.order - b.order);
    }
    
    // Create a map for quick lookup
    const elementMap = new Map<string, ElementNode>();
    elements.forEach((el) => {
      // Deep clone each element to avoid mutating the original
      elementMap.set(el.id, { ...el, children: [] });
    });

    const rootElements: ElementNode[] = [];

    // Build the tree
    elements.forEach((el) => {
      const element = elementMap.get(el.id)!;
      if (el.parentId && elementMap.has(el.parentId)) {
        const parent = elementMap.get(el.parentId)!;
        parent.children.push(element);
        element.parentId = parent.id;
      } else {
        element.parentId = null;
        rootElements.push(element);
      }
    });

    // Sort children by order
    const sortChildren = (el: ElementNode) => {
      el.children.sort((a, b) => a.order - b.order);
      el.children.forEach(sortChildren);
    };
    rootElements.forEach(sortChildren);
    rootElements.sort((a, b) => a.order - b.order);

    return rootElements;
  };

  // Handle apply layout
  const handleApply = () => {
    if (!selectedLayout || !selectedLayout.elements.length) return;

    try {
      // Build tree structure from the flat layout elements
      const treeElements = buildTreeFromFlat(selectedLayout.elements);
      
      if (treeElements.length === 0) {
        showToast({ type: 'error', message: 'Layout has no elements' });
        return;
      }

      // Clone the first root element (which includes all its children)
      const cloned = cloneElementTree(treeElements[0]);
      cloned.parentId = targetElement.parentId;
      cloned.order = targetElement.order;
      replaceElement(targetElement.id, cloned);
      saveHistory();

      showToast({ type: 'success', message: `Applied layout: ${selectedLayout.name}` });
      onClose();
    } catch (error) {
      console.error('Failed to apply layout:', error);
      showToast({ type: 'error', message: 'Failed to apply layout' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] m-4 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-light dark:border-outline-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <LayoutGrid size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-title-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                Replace with Layout
              </h2>
              <p className="text-body-sm text-gray-500">
                Replacing: <span className="font-medium">{targetElement.type}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search layouts..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                'hover:border-primary'
              )}
            >
              <span className="text-sm">
                {selectedCategory === 'all' 
                  ? 'All Categories' 
                  : selectedCategory === 'suggested'
                  ? `Suggested (${suggestedCategories.length})`
                  : LAYOUT_CATEGORIES.find(c => c.id === selectedCategory)?.name
                }
              </span>
              <ChevronDown size={16} className={cn(
                'text-gray-400 transition-transform',
                showCategoryDropdown && 'rotate-180'
              )} />
            </button>

            {showCategoryDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 z-20 w-56 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedCategory('suggested');
                      setShowCategoryDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm',
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      selectedCategory === 'suggested' && 'bg-primary/5 text-primary'
                    )}
                  >
                    <Sparkles size={16} />
                    Suggested for {targetElement.type}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowCategoryDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm',
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      selectedCategory === 'all' && 'bg-primary/5 text-primary'
                    )}
                  >
                    <LayoutGrid size={16} />
                    All Categories
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  {LAYOUT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowCategoryDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-4 py-2 text-left text-sm',
                        'hover:bg-gray-50 dark:hover:bg-gray-800',
                        selectedCategory === category.id && 'bg-primary/5 text-primary'
                      )}
                    >
                      {categoryIcons[category.id]}
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {[
              { device: 'mobile' as DeviceType, icon: Smartphone },
              { device: 'tablet' as DeviceType, icon: Tablet },
              { device: 'desktop' as DeviceType, icon: Monitor },
            ].map(({ device, icon: Icon }) => (
              <Tooltip key={device} content={device} position="top">
                <button
                  onClick={() => setPreviewDevice(device)}
                  className={cn(
                    'p-1.5 rounded transition-all',
                    previewDevice === device
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <Icon size={16} />
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Layout Grid */}
          <div className="w-[280px] flex-shrink-0 border-r border-outline-light dark:border-outline-dark overflow-y-auto p-4">
            {filteredLayouts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      selectedLayout?.id === layout.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'p-1.5 rounded',
                        selectedLayout?.id === layout.id
                          ? 'bg-primary/20 text-primary'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      )}>
                        {categoryIcons[layout.category] || <LayoutGrid size={14} />}
                      </div>
                      <span className="text-label-md font-medium truncate flex-1">
                        {layout.name}
                      </span>
                    </div>
                    {layout.description && (
                      <p className="text-body-sm text-gray-500 line-clamp-2">
                        {layout.description}
                      </p>
                    )}
                    {layout.tags && layout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {layout.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <LayoutGrid size={48} className="mb-4 opacity-30" />
                <p className="text-body-md">No layouts found</p>
                <p className="text-body-sm">Try a different category or search term</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900/50 p-2 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="text-label-sm text-gray-500">Preview</div>
              <div className="text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                {previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '1024px'}
              </div>
            </div>
            {selectedLayout ? (
              <div className="flex-1 overflow-auto">
                {/* Browser-like frame */}
                <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                  {/* Browser header */}
                  <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 px-2 py-1 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-white dark:bg-gray-700 rounded px-2 py-0.5 text-[8px] text-gray-400 text-center max-w-[120px] mx-auto">
                        preview
                      </div>
                    </div>
                  </div>
                  {/* Content area - fills remaining space */}
                  <div className="flex-1 overflow-y-auto bg-white">
                    <LayoutPreview
                      layout={selectedLayout}
                      palette={palette}
                      device={previewDevice}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/30">
                <LayoutGrid size={32} className="mb-2 opacity-50" />
                <p className="text-body-sm">Select a layout to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
          <p className="text-body-sm text-gray-500">
            {selectedLayout 
              ? `Selected: ${selectedLayout.name}`
              : 'Select a layout to apply'
            }
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedLayout}
            >
              <Check size={16} />
              Apply Layout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Layout Preview Component
interface LayoutPreviewProps {
  layout: ComponentLayout;
  palette: any;
  device: DeviceType;
}

function LayoutPreview({ layout, palette, device }: LayoutPreviewProps) {
  // Default palette colors
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

  // Build tree structure from flat elements array for preview
  const buildTreeFromFlat = (elements: ElementNode[]): ElementNode[] => {
    if (!elements || elements.length === 0) return [];
    
    // Check if already in tree format (has children with nested elements)
    const hasNestedChildren = elements.some(el => 
      el.children && el.children.length > 0 && el.children[0]?.id
    );
    
    if (hasNestedChildren) {
      // Already in tree format, just return sorted
      return [...elements].sort((a, b) => a.order - b.order);
    }
    
    // Build tree from flat format
    const elementMap = new Map<string, ElementNode>();
    elements.forEach((el) => {
      elementMap.set(el.id, { ...el, children: [] });
    });

    const rootElements: ElementNode[] = [];

    elements.forEach((el) => {
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

  const treeElements = buildTreeFromFlat(layout.elements);

  const renderElement = (element: ElementNode): React.ReactNode => {
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

    // Get Tailwind classes
    const className = (element as any).className || '';

    switch (element.type) {
      case 'text':
      case 'paragraph':
        return (
          <p key={element.id} style={resolvedStyles} className={cn('text-sm', className)}>
            {element.props?.content || 'Text content'}
          </p>
        );
      case 'heading':
        const Tag = (element.props?.tag || 'h2') as keyof JSX.IntrinsicElements;
        const headingSizes: Record<string, string> = {
          h1: 'text-2xl font-bold',
          h2: 'text-xl font-semibold',
          h3: 'text-lg font-semibold',
          h4: 'text-base font-medium',
        };
        return (
          <Tag 
            key={element.id} 
            style={resolvedStyles} 
            className={cn(headingSizes[element.props?.tag || 'h2'], className)}
          >
            {element.props?.content || 'Heading'}
          </Tag>
        );
      case 'button':
        return (
          <button 
            key={element.id} 
            style={{
              backgroundColor: resolvedStyles.backgroundColor || defaultPalette.primary,
              color: resolvedStyles.color || defaultPalette.textInverse,
              ...resolvedStyles,
            }} 
            className={cn('px-4 py-2 rounded-lg text-sm font-medium', className)}
          >
            {element.props?.text || 'Button'}
          </button>
        );
      case 'image':
        return (
          <img
            key={element.id}
            src={element.props?.src || 'https://via.placeholder.com/300x150?text=Image'}
            alt={element.props?.alt || 'Image'}
            style={resolvedStyles}
            className={cn('max-w-full h-auto rounded', className)}
          />
        );
      case 'link':
        return (
          <a 
            key={element.id} 
            href="#" 
            style={resolvedStyles} 
            className={cn('text-indigo-600 hover:underline text-sm', className)}
          >
            {element.props?.text || 'Link'}
          </a>
        );
      case 'divider':
        return <hr key={element.id} style={resolvedStyles} className={cn('border-gray-200 my-3', className)} />;
      case 'spacer':
        return <div key={element.id} style={{ height: '16px', ...resolvedStyles }} className={className} />;
      case 'navbar':
        return (
          <nav 
            key={element.id} 
            style={resolvedStyles} 
            className={cn('flex items-center justify-between py-3 px-4 bg-white border-b', className)}
          >
            <span className="font-bold text-sm">{element.props?.logoText || 'Brand'}</span>
            <div className="flex items-center gap-3">
              {element.props?.links?.slice(0, 3).map((link: any, i: number) => (
                <span key={i} className="text-xs text-gray-600">{link.label}</span>
              ))}
              <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs">
                {element.props?.ctaText || 'CTA'}
              </button>
            </div>
          </nav>
        );
      case 'hero':
        return (
          <section 
            key={element.id} 
            style={resolvedStyles} 
            className={cn('py-8 px-4 text-center bg-gradient-to-br from-indigo-50 to-purple-50', className)}
          >
            <h1 className="text-xl font-bold mb-2">{element.props?.title || 'Hero Title'}</h1>
            <p className="text-sm text-gray-600 mb-4">{element.props?.subtitle || 'Hero subtitle text'}</p>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded text-xs">
                {element.props?.primaryCta || 'Primary'}
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded text-xs">
                {element.props?.secondaryCta || 'Secondary'}
              </button>
            </div>
            {element.children?.map(renderElement)}
          </section>
        );
      case 'footer':
        return (
          <footer 
            key={element.id} 
            style={resolvedStyles} 
            className={cn('py-4 px-4 text-center bg-gray-50 border-t', className)}
          >
            <p className="font-medium text-sm">{element.props?.companyName || 'Company'}</p>
            <p className="text-xs text-gray-500">{element.props?.copyright || '© 2024'}</p>
          </footer>
        );
      case 'card':
        return (
          <div 
            key={element.id} 
            style={resolvedStyles} 
            className={cn('p-4 bg-white rounded-lg shadow-sm border', className)}
          >
            {element.children?.length ? element.children.map(renderElement) : (
              <>
                <h3 className="text-base font-semibold mb-1">{element.props?.title || 'Card'}</h3>
                <p className="text-xs text-gray-600">{element.props?.description || 'Description'}</p>
              </>
            )}
          </div>
        );
      case 'container':
      case 'flexbox':
      case 'grid':
      case 'stack':
      case 'wrapper':
        return (
          <div key={element.id} style={resolvedStyles} className={className}>
            {element.children?.map(renderElement)}
            {(!element.children || element.children.length === 0) && (
              <div className="min-h-[30px] border border-dashed border-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] text-gray-400">{element.type}</span>
              </div>
            )}
          </div>
        );
      case 'section':
        // Section with styling - render as a styled container
        return (
          <section 
            key={element.id} 
            style={resolvedStyles} 
            className={cn('py-6 px-4', className)}
          >
            {element.children?.length ? (
              element.children.map(renderElement)
            ) : (
              <div className="min-h-[40px] bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">Section</span>
              </div>
            )}
          </section>
        );
      default:
        // Better default rendering - try to render children if they exist
        return (
          <div key={element.id} style={resolvedStyles} className={cn('', className)}>
            {element.children?.length ? (
              element.children.map(renderElement)
            ) : element.props?.content ? (
              <span>{element.props.content}</span>
            ) : element.props?.text ? (
              <span>{element.props.text}</span>
            ) : (
              <div className="p-2 bg-gray-50/50 rounded text-xs text-gray-400 border border-dashed">
                {element.type}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="overflow-hidden text-gray-800 bg-white">
      {treeElements.length > 0 ? (
        treeElements.map(renderElement)
      ) : (
        <div className="p-4 text-center text-gray-400 text-sm">
          No preview available
        </div>
      )}
    </div>
  );
}

