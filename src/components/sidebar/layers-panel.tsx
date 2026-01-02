'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Type,
  Image,
  Square,
  Layout,
  MousePointer2,
  Navigation,
  PanelBottom,
  Sparkles,
  CreditCard,
  FormInput,
  Link,
  Minus,
  MoveVertical,
  Grid3x3,
  Columns,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import type { ElementNode } from '@/types';

const elementIcons: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  heading: <Type size={14} />,
  paragraph: <Type size={14} />,
  image: <Image size={14} />,
  container: <Square size={14} />,
  section: <Layout size={14} />,
  button: <MousePointer2 size={14} />,
  navbar: <Navigation size={14} />,
  footer: <PanelBottom size={14} />,
  hero: <Sparkles size={14} />,
  card: <CreditCard size={14} />,
  form: <FormInput size={14} />,
  input: <FormInput size={14} />,
  link: <Link size={14} />,
  divider: <Minus size={14} />,
  spacer: <MoveVertical size={14} />,
  grid: <Grid3x3 size={14} />,
  columns: <Columns size={14} />,
};

interface LayerItemProps {
  element: ElementNode;
  depth?: number;
  onDragStart: (element: ElementNode) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, position: 'before' | 'after' | 'inside') => void;
  draggingId: string | null;
}

function LayerItem({ element, depth = 0, onDragStart, onDragEnd, onDrop, draggingId }: LayerItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const { selectedElementId, hoveredElementId, selectElement, hoverElement, updateElement } = useEditorStore();
  const hasChildren = element.children.length > 0;
  const isSelected = selectedElementId === element.id;
  const isHovered = hoveredElementId === element.id;
  const isDragging = draggingId === element.id;
  const isContainer = ['container', 'section', 'grid', 'columns', 'form', 'card', 'hero', 'navbar', 'footer', 'flexbox', 'wrapper', 'stack'].includes(element.type);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { isHidden: !element.isHidden });
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { isLocked: !element.isLocked });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('layer-element-id', element.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(element);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingId === element.id) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Determine drop position based on cursor position
    if (y < height * 0.25) {
      setDropPosition('before');
    } else if (y > height * 0.75) {
      setDropPosition('after');
    } else if (isContainer) {
      setDropPosition('inside');
    } else {
      setDropPosition('after');
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropPosition && draggingId !== element.id) {
      onDrop(element.id, dropPosition);
    }
    setDropPosition(null);
  };

  return (
    <div className={cn(isDragging && 'opacity-40')}>
      {/* Drop indicator line before */}
      {dropPosition === 'before' && (
        <div 
          className="h-0.5 bg-primary rounded-full mx-1 my-0.5"
          style={{ marginLeft: `${depth * 16 + 4}px` }}
        />
      )}
      
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 cursor-pointer',
          'transition-colors duration-100',
          isSelected && 'bg-primary-50 dark:bg-primary-900/20',
          isHovered && !isSelected && 'bg-gray-100 dark:bg-gray-800',
          element.isHidden && 'opacity-50',
          dropPosition === 'inside' && 'ring-2 ring-primary ring-inset'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => selectElement(element.id)}
        onMouseEnter={() => hoverElement(element.id)}
        onMouseLeave={() => hoverElement(null)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Drag Handle */}
        <GripVertical
          size={12}
          className="text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        />

        {/* Icon */}
        <span className={cn(
          'text-gray-500 dark:text-gray-400',
          isSelected && 'text-primary'
        )}>
          {elementIcons[element.type] || <Square size={14} />}
        </span>

        {/* Name */}
        <span className={cn(
          'flex-1 text-body-sm truncate',
          isSelected 
            ? 'text-primary font-medium'
            : 'text-on-surface-light dark:text-on-surface-dark'
        )}>
          {element.props.content?.slice(0, 20) || element.props.text?.slice(0, 20) || element.props.title?.slice(0, 20) || element.type}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={toggleVisibility}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={element.isHidden ? 'Show' : 'Hide'}
          >
            {element.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            onClick={toggleLock}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={element.isLocked ? 'Unlock' : 'Lock'}
          >
            {element.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {element.children.map((child) => (
            <LayerItem 
              key={child.id} 
              element={child} 
              depth={depth + 1}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              draggingId={draggingId}
            />
          ))}
        </div>
      )}

      {/* Drop indicator line after */}
      {dropPosition === 'after' && (
        <div 
          className="h-0.5 bg-primary rounded-full mx-1 my-0.5"
          style={{ marginLeft: `${depth * 16 + 4}px` }}
        />
      )}
    </div>
  );
}

interface LayersPanelProps {
  searchQuery?: string;
}

export function LayersPanel({ searchQuery = '' }: LayersPanelProps) {
  const { elements, moveElement, saveHistory } = useEditorStore();
  const [draggingElement, setDraggingElement] = useState<ElementNode | null>(null);
  
  // Find element and its parent by ID
  const findElementWithParent = useCallback((elements: ElementNode[], id: string, parent: ElementNode | null = null): { element: ElementNode; parent: ElementNode | null; index: number } | null => {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].id === id) {
        return { element: elements[i], parent, index: i };
      }
      const found = findElementWithParent(elements[i].children, id, elements[i]);
      if (found) return found;
    }
    return null;
  }, []);

  const handleDragStart = (element: ElementNode) => {
    setDraggingElement(element);
  };

  const handleDragEnd = () => {
    setDraggingElement(null);
  };

  const handleDrop = useCallback((targetId: string, position: 'before' | 'after' | 'inside') => {
    if (!draggingElement) return;
    
    const targetInfo = findElementWithParent(elements, targetId);
    if (!targetInfo) return;

    const { element: targetElement, parent: targetParent, index: targetIndex } = targetInfo;

    let newParentId: string | null;
    let newIndex: number;

    if (position === 'inside') {
      // Drop inside container
      newParentId = targetId;
      newIndex = targetElement.children.length;
    } else if (position === 'before') {
      newParentId = targetParent?.id || null;
      newIndex = targetIndex;
    } else {
      // after
      newParentId = targetParent?.id || null;
      newIndex = targetIndex + 1;
    }

    // Prevent dropping element into itself
    if (newParentId === draggingElement.id) return;

    moveElement(draggingElement.id, newParentId, newIndex);
    saveHistory();
    setDraggingElement(null);
  }, [draggingElement, elements, findElementWithParent, moveElement, saveHistory]);
  
  // Filter elements by search query
  const filterElements = (elements: ElementNode[], query: string): ElementNode[] => {
    if (!query) return elements;
    return elements.filter((el) => {
      const nameMatch = el.type.toLowerCase().includes(query.toLowerCase()) ||
        (el.props.content && String(el.props.content).toLowerCase().includes(query.toLowerCase()));
      const childrenMatch = filterElements(el.children, query).length > 0;
      return nameMatch || childrenMatch;
    });
  };

  const filteredElements = filterElements(elements, searchQuery);

  return (
    <div className="py-2">
      {/* Header */}
      <div className="px-3 pb-2 mb-2 border-b border-outline-light dark:border-outline-dark">
        <p className="text-label-sm text-gray-500">
          {elements.length} element{elements.length !== 1 ? 's' : ''} • Drag to reorder
        </p>
      </div>

      {/* Layers Tree */}
      <div>
        {filteredElements.map((element) => (
          <LayerItem 
            key={element.id} 
            element={element}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggingId={draggingElement?.id || null}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredElements.length === 0 && (
        <div className="text-center py-8 px-4">
          <Layout size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-body-md text-gray-500">
            {searchQuery ? `No layers found for "${searchQuery}"` : 'No elements yet'}
          </p>
          {!searchQuery && (
            <p className="text-body-sm text-gray-400 mt-1">
              Add elements from the Elements tab
            </p>
          )}
        </div>
      )}
    </div>
  );
}
