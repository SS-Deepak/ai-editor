'use client';

import { useState } from 'react';
import {
  Type,
  Heading,
  Image,
  Square,
  Layout,
  Grid3x3,
  FormInput,
  MousePointer2,
  Link,
  Minus,
  MoveVertical,
  Navigation,
  Sparkles,
  PanelBottom,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Star,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore, useIsAdmin, useCanManageElements } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { Button, Tooltip } from '../ui';

interface ElementCategory {
  id: string;
  name: string;
  elements: ElementItem[];
  isAdminOnly?: boolean;
}

interface ElementItem {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  isCustom?: boolean;
}

const elementCategories: ElementCategory[] = [
  {
    id: 'basic',
    name: 'Basic',
    elements: [
      { id: 'elem_text', type: 'text', name: 'Text', icon: <Type size={18} /> },
      { id: 'elem_heading', type: 'heading', name: 'Heading', icon: <Heading size={18} /> },
      { id: 'elem_image', type: 'image', name: 'Image', icon: <Image size={18} /> },
      { id: 'elem_button', type: 'button', name: 'Button', icon: <MousePointer2 size={18} /> },
      { id: 'elem_link', type: 'link', name: 'Link', icon: <Link size={18} /> },
      { id: 'elem_divider', type: 'divider', name: 'Divider', icon: <Minus size={18} /> },
      { id: 'elem_spacer', type: 'spacer', name: 'Spacer', icon: <MoveVertical size={18} /> },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    elements: [
      { id: 'elem_container', type: 'container', name: 'Container', icon: <Square size={18} /> },
      { id: 'elem_section', type: 'section', name: 'Section', icon: <Layout size={18} /> },
      { id: 'elem_grid', type: 'grid', name: 'Grid', icon: <Grid3x3 size={18} /> },
      { id: 'elem_columns', type: 'columns', name: 'Columns', icon: <Layout size={18} /> },
    ],
  },
  {
    id: 'forms',
    name: 'Forms',
    elements: [
      { id: 'elem_form', type: 'form', name: 'Form', icon: <FormInput size={18} /> },
      { id: 'elem_input', type: 'input', name: 'Input', icon: <FormInput size={18} /> },
      { id: 'elem_textarea', type: 'textarea', name: 'Textarea', icon: <FormInput size={18} /> },
      { id: 'elem_select', type: 'select', name: 'Select', icon: <FormInput size={18} /> },
    ],
  },
  {
    id: 'blocks',
    name: 'Blocks',
    elements: [
      { id: 'elem_navbar', type: 'navbar', name: 'Navbar', icon: <Navigation size={18} /> },
      { id: 'elem_hero', type: 'hero', name: 'Hero', icon: <Sparkles size={18} /> },
      { id: 'elem_footer', type: 'footer', name: 'Footer', icon: <PanelBottom size={18} /> },
      { id: 'elem_card', type: 'card', name: 'Card', icon: <CreditCard size={18} /> },
    ],
  },
];

// Mock custom elements - would come from user's saved elements
const customElements: ElementItem[] = [
  { id: 'custom_1', type: 'custom', name: 'My Button', icon: <Star size={18} />, isCustom: true },
];

interface ElementsPanelProps {
  searchQuery?: string;
}

export function ElementsPanel({ searchQuery = '' }: ElementsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic', 'layout']);
  const { startDragging, stopDragging } = useUIStore();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const canManageElements = useCanManageElements();

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDragStart = (e: React.DragEvent, element: ElementItem) => {
    // Store type in UI store first (backup in case dataTransfer fails)
    startDragging(element.type);
    
    // Set the data in multiple formats for browser compatibility
    e.dataTransfer.setData('text/plain', element.type);
    e.dataTransfer.setData('element-type', element.type);
    e.dataTransfer.setData('application/x-element', element.type);
    e.dataTransfer.effectAllowed = 'copyMove';
    
    console.log('Drag started:', element.type);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    // Small delay to ensure drop handler completes first
    requestAnimationFrame(() => {
      stopDragging();
    });
  };

  // Filter elements by search
  const filteredCategories = elementCategories
    .map((category) => ({
      ...category,
      elements: category.elements.filter((el) =>
        el.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.elements.length > 0);

  // Filter custom elements
  const filteredCustomElements = customElements.filter((el) =>
    el.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3">
      {/* Admin Controls */}
      {canManageElements && (
        <div className="mb-4 p-3 rounded-material bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-amber-600 dark:text-amber-400" />
            <span className="text-label-md font-medium text-amber-700 dark:text-amber-400">
              Admin Mode
            </span>
          </div>
          <p className="text-body-sm text-amber-600/80 dark:text-amber-500/80 mb-3">
            You can create and manage global elements
          </p>
          <Button size="sm" variant="secondary" className="w-full justify-center">
            <Plus size={14} />
            Create New Element
          </Button>
        </div>
      )}

      {/* Element Categories */}
      {filteredCategories.map((category) => (
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
            <span className="flex-1 text-left">{category.name}</span>
            <span className="text-label-sm text-gray-400">
              {category.elements.length}
            </span>
          </button>

          {/* Elements Grid */}
          {expandedCategories.includes(category.id) && (
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {category.elements.map((element) => (
                <ElementCard
                  key={element.id}
                  element={element}
                  isAdmin={isAdmin}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Custom Elements Section */}
      {(filteredCustomElements.length > 0 || !searchQuery) && (
        <div className="mb-3">
          <button
            onClick={() => toggleCategory('custom')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-label-md text-gray-500 hover:text-on-surface-light dark:hover:text-on-surface-dark transition-colors rounded-material-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {expandedCategories.includes('custom') ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <Star size={14} className="text-amber-500" />
            <span className="flex-1 text-left">My Elements</span>
            <span className="text-label-sm text-gray-400">
              {customElements.length}
            </span>
          </button>

          {expandedCategories.includes('custom') && (
            <>
              {filteredCustomElements.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {filteredCustomElements.map((element) => (
                    <ElementCard
                      key={element.id}
                      element={element}
                      isAdmin={isAdmin}
                      isCustom
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 mt-1.5 rounded-material border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-body-sm text-gray-400">No custom elements yet</p>
                  <Button size="sm" variant="ghost" className="mt-2">
                    <Plus size={14} />
                    Save Selection
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredCategories.length === 0 && filteredCustomElements.length === 0 && (
        <div className="text-center py-8">
          <p className="text-body-md text-gray-500">
            No elements found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}

interface ElementCardProps {
  element: ElementItem;
  isAdmin: boolean;
  isCustom?: boolean;
  onDragStart: (e: React.DragEvent, element: ElementItem) => void;
  onDragEnd: () => void;
}

function ElementCard({ element, isAdmin, isCustom, onDragStart, onDragEnd }: ElementCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, element)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative flex flex-col items-center gap-2 p-3',
        'bg-surface-light dark:bg-surface-dark',
        'border border-outline-light dark:border-outline-dark',
        'rounded-material-sm cursor-grab',
        'hover:border-primary hover:shadow-material-1',
        'active:cursor-grabbing active:scale-95',
        'transition-all duration-150',
        isCustom && 'border-amber-200 dark:border-amber-800'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'text-gray-600 dark:text-gray-400',
        isCustom && 'text-amber-600 dark:text-amber-400'
      )}>
        {element.icon}
      </div>
      
      {/* Name */}
      <span className="text-label-sm text-on-surface-light dark:text-on-surface-dark text-center">
        {element.name}
      </span>

      {/* Admin Edit Actions */}
      {isAdmin && showActions && (
        <div className="absolute top-1 right-1 flex gap-0.5">
          <Tooltip content="Edit element" position="top">
            <button className="p-1 rounded bg-white/90 dark:bg-black/90 text-gray-500 hover:text-primary shadow-sm">
              <Edit2 size={12} />
            </button>
          </Tooltip>
          {isCustom && (
            <Tooltip content="Delete element" position="top">
              <button className="p-1 rounded bg-white/90 dark:bg-black/90 text-gray-500 hover:text-red-500 shadow-sm">
                <Trash2 size={12} />
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {/* Custom badge */}
      {isCustom && (
        <div className="absolute top-1 left-1">
          <Star size={10} className="text-amber-500 fill-amber-500" />
        </div>
      )}
    </div>
  );
}
