'use client';

import { useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { useLayoutsStore } from '@/store/layouts-store';
import { useSiteStyles, useElementStyles } from '@/hooks/use-site-styles';
import { useElementAnimation } from '@/hooks/use-element-animation';
import { cn } from '@/lib/utils';
import { DeviceFrame } from './device-frame';
import { CanvasSkeleton } from '../ui/skeleton';
import { createElement, canHaveChildren, getElementDisplayName, generateElementId, cloneElementTree } from '@/lib/element-factory';
import type { ElementType, ElementNode } from '@/types';
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  LayoutGrid,
} from 'lucide-react';
import { LayoutPickerModal } from '../modals/layout-picker-modal';

const deviceWidths = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// Elements that are "sealed" - can't drop inside, only before/after
const sealedElements = ['hero', 'navbar', 'footer'];

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    elements, 
    isLoadingElements, 
    loadingProgress,
    device, 
    zoom, 
    showGrid,
    selectedElementId,
    selectElement,
    addElement,
    moveElement,
    saveHistory,
  } = useEditorStore();
  const { isDragging, draggedElementType, stopDragging, showToast } = useUIStore();
  const { layouts, getLayoutById } = useLayoutsStore();
  const { styles: siteStyles, palette, typography } = useSiteStyles();
  const [dragOverPosition, setDragOverPosition] = useState<{
    parentId: string | null;
    index: number;
    elementId?: string;
    position?: 'before' | 'after';
  } | null>(null);

  const frameWidth = deviceWidths[device];
  const scale = zoom / 100;

  // Click outside to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  // Handle drop at a specific position
  const handleDropAtPosition = useCallback((parentId: string | null, index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('[handleDropAtPosition] Drop at position:', { parentId, index });

    // Check if we're moving an existing element
    const movingElementId = e.dataTransfer.getData('element-id');
    
    if (movingElementId) {
      // Moving existing element
      console.log('[handleDropAtPosition] Moving element:', movingElementId);
      moveElement(movingElementId, parentId, index);
      saveHistory();
    } else {
      // Adding new element from sidebar
      // Try multiple data formats for browser compatibility
      let elementType = e.dataTransfer.getData('element-type');
      if (!elementType) elementType = e.dataTransfer.getData('text/plain');
      if (!elementType) elementType = e.dataTransfer.getData('application/x-element');
      
      // Check for layout ID
      const layoutId = e.dataTransfer.getData('layout-id');
      
      // Use the UI store backup if dataTransfer failed
      if (!elementType && draggedElementType) {
        console.log('[handleDropAtPosition] Using draggedElementType from store:', draggedElementType);
        elementType = draggedElementType;
      }
      
      console.log('[handleDropAtPosition] Element type to add:', elementType, 'Layout ID:', layoutId);
      
      // Handle layout drop
      if (layoutId || (elementType && elementType.startsWith('layout:'))) {
        const actualLayoutId = layoutId || elementType.replace('layout:', '');
        console.log('[handleDropAtPosition] Dropping layout:', actualLayoutId);
        
        const layout = getLayoutById(actualLayoutId);
        if (layout && layout.elements.length > 0) {
          try {
            // Clone all elements from the layout with new IDs
            layout.elements.forEach((element, i) => {
              const clonedElement = cloneElementTree(element);
              clonedElement.order = index + i;
              clonedElement.parentId = parentId;
              addElement(clonedElement, parentId);
            });
            saveHistory();
            showToast({ type: 'success', message: `Added "${layout.name}" layout` });
          } catch (err) {
            console.error('[handleDropAtPosition] Error adding layout:', err);
            showToast({ type: 'error', message: 'Failed to add layout' });
          }
        } else {
          console.warn('[handleDropAtPosition] Layout not found or empty:', actualLayoutId);
          showToast({ type: 'warning', message: 'Layout is empty or not found' });
        }
      } else if (elementType && elementType !== 'undefined') {
        // Handle regular element drop
        try {
          const newElement = createElement(elementType as ElementType);
          newElement.order = index;
          newElement.parentId = parentId;
          console.log('[handleDropAtPosition] Creating new element:', newElement);
          addElement(newElement, parentId);
          saveHistory();
          showToast({ type: 'success', message: `Added ${elementType} element` });
        } catch (err) {
          console.error('[handleDropAtPosition] Error creating element:', err);
          showToast({ type: 'error', message: 'Failed to add element' });
        }
      } else {
        console.warn('[handleDropAtPosition] No element type found');
      }
    }

    setDragOverPosition(null);
    // Delay stopping drag to ensure UI updates
    setTimeout(() => stopDragging(), 50);
  }, [addElement, moveElement, saveHistory, stopDragging, draggedElementType, showToast, getLayoutById]);

  // Handle canvas-level drag over (for dropping at very top or bottom)
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // Only set position if canvas is empty
    // Element-level handlers will set their own positions
    if (elements.length === 0) {
      setDragOverPosition({ parentId: null, index: 0 });
    }
  }, [elements.length]);

  // Handle canvas-level drop - this catches drops that fall through
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // IMPORTANT: If dragOverPosition exists and has an elementId, 
    // it means the user was hovering over a specific element
    // Use that position, not the default
    if (dragOverPosition) {
      console.log('[Canvas Drop] Using tracked position:', dragOverPosition);
      handleDropAtPosition(dragOverPosition.parentId, dragOverPosition.index, e);
    } else {
      // No position tracked - this shouldn't happen often
      // but default to end as fallback
      console.log('[Canvas Drop] No position tracked, defaulting to end');
      handleDropAtPosition(null, elements.length, e);
    }
  }, [dragOverPosition, handleDropAtPosition, elements.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-auto p-8',
        'flex items-start justify-center',
        isDragging && 'cursor-copy'
      )}
      onClick={handleCanvasClick}
    >
      {/* Grid Background */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Device Frame */}
      <DeviceFrame device={device} scale={scale}>
        <div
          ref={canvasRef}
          className="min-h-[600px] relative"
          style={{ 
            width: frameWidth,
            backgroundColor: palette?.colors.background || '#ffffff',
            color: palette?.colors.text || '#1a1a2e',
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            ...siteStyles,
          }}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {/* Loading State */}
          {isLoadingElements ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <CanvasSkeleton />
              <div className="flex items-center gap-2 text-body-sm text-gray-500">
                <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#492cdd] to-[#ad38e2] transition-all duration-300"
                    style={{ width: `${Math.min(100, loadingProgress * 10)}%` }}
                  />
                </div>
                <span>Loading...</span>
              </div>
            </div>
          ) : elements.length === 0 ? (
            // Empty State
            <EmptyCanvasDropZone 
              isDragging={isDragging} 
              onDrop={(e) => handleDropAtPosition(null, 0, e)}
              isOver={dragOverPosition !== null}
              onDragOver={() => setDragOverPosition({ parentId: null, index: 0 })}
              onDragLeave={() => setDragOverPosition(null)}
            />
          ) : (
            // Render Elements - add padding top for first element's toolbar
            <div className="min-h-full pt-8">
              {/* Top drop zone */}
              <TopDropZone
                isDragging={isDragging}
                isActive={dragOverPosition?.parentId === null && dragOverPosition?.index === 0}
                onDragOver={() => setDragOverPosition({ parentId: null, index: 0, position: 'before' })}
                onDragLeave={() => setDragOverPosition(null)}
                onDrop={(e) => handleDropAtPosition(null, 0, e)}
              />
              
              {elements.map((element, index) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  index={index}
                  isSelected={selectedElementId === element.id}
                  isDragging={isDragging}
                  dragOverPosition={dragOverPosition}
                  onDragOverPosition={setDragOverPosition}
                  onDrop={handleDropAtPosition}
                  depth={0}
                  totalSiblings={elements.length}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </DeviceFrame>
    </div>
  );
}

// Top drop zone for dropping at the very beginning
interface TopDropZoneProps {
  isDragging: boolean;
  isActive: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

function TopDropZone({ isDragging, isActive, onDragOver, onDragLeave, onDrop }: TopDropZoneProps) {
  if (!isDragging) return null;
  
  return (
    <div
      className={cn(
        'h-8 -mt-8 transition-all duration-150',
        isActive && 'bg-primary/10'
      )}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); onDragLeave(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
    >
      {isActive && (
        <div className="h-1 bg-primary mx-2 mt-7 rounded-full" />
      )}
    </div>
  );
}

// Canvas element with selection, drag handle, and container support
interface CanvasElementProps {
  element: ElementNode;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  dragOverPosition: { parentId: string | null; index: number; elementId?: string; position?: 'before' | 'after' } | null;
  onDragOverPosition: (pos: { parentId: string | null; index: number; elementId?: string; position?: 'before' | 'after' } | null) => void;
  onDrop: (parentId: string | null, index: number, e: React.DragEvent) => void;
  depth: number;
  totalSiblings: number;
  isFirst?: boolean;
}

function CanvasElement({ 
  element, 
  index,
  isSelected, 
  isDragging,
  dragOverPosition,
  onDragOverPosition,
  onDrop,
  depth,
  totalSiblings,
  isFirst,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { 
    selectElement, 
    hoverElement, 
    hoveredElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    saveHistory,
  } = useEditorStore();
  const { startDragging, stopDragging, showToast } = useUIStore();
  const isHovered = hoveredElementId === element.id;
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const isContainer = canHaveChildren(element.type);
  const isSealed = sealedElements.includes(element.type);
  
  // Animation hook
  const { 
    ref: animationRef, 
    style: animationStyle,
    handlers: animationHandlers, 
    isAnimating 
  } = useElementAnimation({
    animations: element.animations || [],
    parallax: element.props?.parallax,
    isEnabled: true,
  });
  
  // Check if drop indicator should show
  const showDropBefore = dragOverPosition?.elementId === element.id && dragOverPosition?.position === 'before';
  const showDropAfter = dragOverPosition?.elementId === element.id && dragOverPosition?.position === 'after';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!element.isLocked) {
      selectElement(element.id);
    }
    // Trigger click animations
    if (animationHandlers.onClick) {
      animationHandlers.onClick(e);
    }
  };

  const handleMouseEnter = () => {
    if (!element.isLocked && !isDragging) {
      hoverElement(element.id);
    }
    // Trigger hover animations
    if (animationHandlers.onMouseEnter) {
      animationHandlers.onMouseEnter({} as React.MouseEvent);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      hoverElement(null);
    }
    // Trigger hover leave
    if (animationHandlers.onMouseLeave) {
      animationHandlers.onMouseLeave({} as React.MouseEvent);
    }
  };

  // Handle dragging this element to reorder
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('element-id', element.id);
    e.dataTransfer.effectAllowed = 'move';
    startDragging(element.type);
  };

  const handleDragEnd = () => {
    stopDragging();
  };

  // Handle drag over to determine drop position
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Determine if we're in the top or bottom half
    const position = y < height / 2 ? 'before' : 'after';
    
    // For sealed elements, show warning and only allow before/after
    if (isSealed && y > height * 0.2 && y < height * 0.8) {
      // Hovering over middle of sealed element
      onDragOverPosition({
        parentId: element.parentId,
        index: position === 'before' ? index : index + 1,
        elementId: element.id,
        position,
      });
      return;
    }
    
    // For containers, allow dropping inside
    if (isContainer && !isSealed && y > height * 0.25 && y < height * 0.75) {
      onDragOverPosition({
        parentId: element.id,
        index: element.children.length,
        elementId: element.id,
        position: undefined, // inside
      });
      return;
    }
    
    onDragOverPosition({
      parentId: element.parentId,
      index: position === 'before' ? index : index + 1,
      elementId: element.id,
      position,
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragOverPosition) return;
    
    // Show warning for sealed elements
    if (isSealed && dragOverPosition.position === undefined) {
      showToast({
        type: 'warning',
        message: `${getElementDisplayName(element.type)} is a pre-built block. Elements can only be added above or below it.`,
      });
      onDragOverPosition(null);
      return;
    }
    
    onDrop(dragOverPosition.parentId, dragOverPosition.index, e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
    saveHistory();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateElement(element.id);
    saveHistory();
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { isLocked: !element.isLocked });
  };

  if (element.isHidden) {
    return null;
  }

  const isDropInside = dragOverPosition?.parentId === element.id && dragOverPosition?.position === undefined;

  return (
    <div ref={elementRef} className="relative overflow-visible">
      {/* Drop indicator line BEFORE element */}
      {showDropBefore && (
        <div className="absolute -top-0.5 left-2 right-2 z-50 pointer-events-none">
          <div className="h-1 bg-primary rounded-full" />
        </div>
      )}

      <div
        ref={animationRef}
        style={animationStyle}
        className={cn(
          'relative transition-all duration-150',
          // Selection highlight - very prominent
          isSelected && 'ring-2 ring-primary ring-offset-2 rounded-sm bg-primary/5',
          // Hover highlight
          isHovered && !isSelected && 'ring-1 ring-primary/40 rounded-sm',
          // Locked state
          element.isLocked && 'opacity-60',
          // Drop inside container highlight
          isDropInside && isContainer && !isSealed && 'ring-2 ring-primary bg-primary/10',
          // Sealed element warning on drop inside attempt
          isDropInside && isSealed && 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20',
          // Animation indicator
          isAnimating && 'ring-2 ring-purple-500/50',
          // Parallax indicator
          element.props?.parallax?.enabled && 'ring-1 ring-cyan-500/30'
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Element Label & Controls - Always visible area above element */}
        {(isSelected || isHovered) && !element.isLocked && (
          <div 
            className={cn(
              'absolute left-0 right-0 flex items-center justify-between z-30 pointer-events-none',
              isFirst ? '-top-6' : '-top-7'
            )}
          >
            <div className="flex items-center gap-1 pointer-events-auto">
              {/* Drag handle */}
              <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-grab active:cursor-grabbing shadow-md',
                  isSelected ? 'bg-primary text-white' : 'bg-gray-700 text-white'
                )}
              >
                <GripVertical size={12} />
                {getElementDisplayName(element.type)}
                {/* Animation indicator */}
                {element.animations && element.animations.length > 0 && (
                  <span className="ml-1 px-1 py-0.5 text-[9px] bg-purple-500/30 rounded" title={`${element.animations.length} animation(s)`}>
                    ✨{element.animations.length}
                  </span>
                )}
                {/* Parallax indicator */}
                {element.props?.parallax?.enabled && (
                  <span className="ml-1 px-1 py-0.5 text-[9px] bg-cyan-500/30 rounded" title="Parallax enabled">
                    ↕
                  </span>
                )}
                {isSealed && (
                  <AlertCircle size={10} className="ml-1 opacity-70" />
                )}
                {isContainer && !isSealed && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="ml-1 hover:bg-white/20 rounded p-0.5"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick actions */}
            {isSelected && (
              <div className="flex items-center gap-0.5 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLayoutPicker(true);
                  }}
                  className="p-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                  title="Replace with Layout"
                >
                  <LayoutGrid size={12} />
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-1.5 rounded bg-primary text-white hover:bg-primary-dark shadow-md"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={handleToggleLock}
                  className="p-1.5 rounded bg-primary text-white hover:bg-primary-dark shadow-md"
                  title={element.isLocked ? 'Unlock' : 'Lock'}
                >
                  {element.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded bg-red-500 text-white hover:bg-red-600 shadow-md"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Warning badge for sealed elements when trying to drop inside */}
        {isDropInside && isSealed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
            <div className="px-3 py-2 bg-amber-500 text-white text-sm rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Drop above or below this block</span>
            </div>
          </div>
        )}

        {/* Element Content */}
        <div className={cn(isContainer && !isExpanded && 'max-h-16 overflow-hidden')}>
          {/* For container elements like grid, render children INSIDE the styled container */}
          {isContainer && !isSealed ? (
            <ContainerWithChildren
              element={element}
              isSelected={isSelected}
              isExpanded={isExpanded}
              isDragging={isDragging}
              dragOverPosition={dragOverPosition}
              onDragOverPosition={onDragOverPosition}
              onDrop={onDrop}
              depth={depth}
            />
          ) : (
            <ElementContent element={element} isSelected={isSelected} />
          )}
        </div>

        {/* Lock indicator */}
        {element.isLocked && (
          <div className="absolute top-2 right-2 p-1.5 bg-gray-800/80 rounded z-10">
            <Lock size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Drop indicator line AFTER element */}
      {showDropAfter && (
        <div className="absolute -bottom-0.5 left-2 right-2 z-50 pointer-events-none">
          <div className="h-1 bg-primary rounded-full" />
        </div>
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPickerModal
          isOpen={showLayoutPicker}
          onClose={() => setShowLayoutPicker(false)}
          targetElement={element}
        />
      )}
    </div>
  );
}

// Container component that renders children INSIDE the styled container
interface ContainerWithChildrenProps {
  element: ElementNode;
  isSelected: boolean;
  isExpanded: boolean;
  isDragging: boolean;
  dragOverPosition: DropPosition | null;
  onDragOverPosition: (position: DropPosition | null) => void;
  onDrop: (parentId: string | null, index: number, e: React.DragEvent) => void;
  depth: number;
}

function ContainerWithChildren({ 
  element, 
  isSelected, 
  isExpanded, 
  isDragging, 
  dragOverPosition, 
  onDragOverPosition, 
  onDrop,
  depth 
}: ContainerWithChildrenProps) {
  const { selectedElementId } = useEditorStore();
  const props = element.props || {};
  const styles = getComputedStyles(element);
  
  // Render children helper
  const renderChildren = () => {
    if (!isExpanded) return null;
    
    if (element.children.length === 0) {
      return (
        <div className="h-12 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded m-1">
          Drop elements inside
        </div>
      );
    }
    
    return element.children.map((child, childIndex) => (
      <CanvasElement
        key={child.id}
        element={child}
        index={childIndex}
        isSelected={selectedElementId === child.id}
        isDragging={isDragging}
        dragOverPosition={dragOverPosition}
        onDragOverPosition={onDragOverPosition}
        onDrop={onDrop}
        depth={depth + 1}
        totalSiblings={element.children.length}
        isFirst={childIndex === 0}
      />
    ));
  };
  
  switch (element.type) {
    case 'grid':
      const cols = props.columns || 3;
      return (
        <div 
          style={{ 
            ...styles,
            display: 'grid', 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: props.gap || '16px',
          }} 
          className={cn(
            'min-h-[60px] p-2 rounded relative overflow-visible',
            // Add top padding when there are children for toolbar space
            element.children.length > 0 && 'pt-8',
            // Only show border/bg when empty or selected
            element.children.length === 0 && 'border border-dashed border-gray-300 dark:border-gray-600'
          )}
        >
          {/* Show placeholder columns when empty */}
          {element.children.length === 0 && isExpanded ? (
            Array.from({ length: cols }).map((_, i) => (
              <div 
                key={i} 
                className="min-h-[40px] border border-dashed border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center"
              >
                <span className="text-[10px] text-gray-400">Col {i + 1}</span>
              </div>
            ))
          ) : (
            renderChildren()
          )}
        </div>
      );
      
    case 'columns':
      const colCount = props.columns || 2;
      return (
        <div 
          style={{ 
            ...styles,
            display: 'flex', 
            gap: props.gap || '16px',
          }} 
          className={cn(
            'min-h-[60px] p-2 rounded relative overflow-visible',
            // Add top padding when there are children for toolbar space
            element.children.length > 0 && 'pt-8',
            // Only show border/bg when empty
            element.children.length === 0 && 'border border-dashed border-gray-300 dark:border-gray-600'
          )}
        >
          {/* Show placeholder columns when empty */}
          {element.children.length === 0 && isExpanded ? (
            Array.from({ length: colCount }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 min-h-[40px] border border-dashed border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center"
              >
                <span className="text-[10px] text-gray-400">Col {i + 1}</span>
              </div>
            ))
          ) : (
            renderChildren()
          )}
        </div>
      );
      
    case 'container':
    case 'section':
    case 'wrapper':
      return (
        <div 
          style={styles} 
          className={cn(
            'min-h-[40px] p-2 rounded overflow-visible',
            // Add top padding when there are children for toolbar space
            element.children.length > 0 && 'pt-8',
            element.children.length === 0 && 'border border-dashed border-gray-300 dark:border-gray-600'
          )}
        >
          {element.children.length === 0 && isExpanded ? (
            <div className="h-10 flex items-center justify-center text-gray-400 text-xs">
              Drop elements inside
            </div>
          ) : (
            renderChildren()
          )}
        </div>
      );
      
    case 'flexbox':
    case 'stack':
      return (
        <div 
          style={{ 
            ...styles,
            display: 'flex',
            flexDirection: props.direction || 'column',
            gap: props.gap || '8px',
          }} 
          className={cn(
            'min-h-[40px] p-2 rounded overflow-visible',
            // Add top padding when there are children for toolbar space
            element.children.length > 0 && 'pt-8',
            element.children.length === 0 && 'border border-dashed border-gray-300 dark:border-gray-600'
          )}
        >
          {element.children.length === 0 && isExpanded ? (
            <div className="h-10 flex items-center justify-center text-gray-400 text-xs">
              Drop elements inside
            </div>
          ) : (
            renderChildren()
          )}
        </div>
      );
      
    default:
      // Fallback for unknown container types
      return (
        <div style={styles} className={cn(
          'min-h-[40px] p-2 overflow-visible',
          element.children.length > 0 && 'pt-8'
        )}>
          {renderChildren()}
        </div>
      );
  }
}

// Element content renderer - Uses site palette colors via CSS variables
function ElementContent({ element, isSelected }: { element: ElementNode; isSelected: boolean }) {
  const props = element.props || {};
  const styles = getComputedStyles(element);

  switch (element.type) {
    case 'text':
    case 'paragraph':
      return (
        <p 
          style={{
            ...styles,
            color: styles.color || 'var(--site-text)',
            fontFamily: styles.fontFamily || 'var(--site-font-primary)',
          }} 
          className="min-h-[24px] p-2"
        >
          {props.content || 'Add your text here'}
        </p>
      );

    case 'heading':
      const HeadingTag = (props.tag || 'h2') as keyof JSX.IntrinsicElements;
      const headingSize = {
        h1: 'var(--site-font-size-h1)',
        h2: 'var(--site-font-size-h2)',
        h3: 'var(--site-font-size-h3)',
        h4: 'var(--site-font-size-h4)',
        h5: 'var(--site-font-size-h5)',
        h6: 'var(--site-font-size-h6)',
      }[props.tag || 'h2'] || 'var(--site-font-size-h2)';
      
      return (
        <HeadingTag 
          style={{
            ...styles,
            color: styles.color || 'var(--site-text)',
            fontFamily: styles.fontFamily || 'var(--site-font-heading)',
            fontSize: styles.fontSize || headingSize,
          }} 
          className="min-h-[32px] p-2 font-bold"
        >
          {props.content || 'Heading'}
        </HeadingTag>
      );

    case 'button':
      return (
        <div className="p-2">
          <button
            style={{
              ...styles,
              background: styles.backgroundColor || 'var(--site-primary-gradient, linear-gradient(to right, var(--site-primary), var(--site-primary-light)))',
              color: styles.color || 'var(--site-text-inverse)',
              width: 'auto',
              display: 'inline-flex',
            }}
            className="font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow px-6 py-3"
          >
            {props.text || 'Button'}
          </button>
        </div>
      );

    case 'image':
      return props.src ? (
        <img src={props.src} alt={props.alt || 'Image'} style={styles} className="max-w-full h-auto" />
      ) : (
        <div 
          style={{ 
            ...styles, 
            backgroundColor: styles.backgroundColor || 'var(--site-surface)' 
          }} 
          className="w-full h-48 rounded-lg flex items-center justify-center m-2"
        >
          <span style={{ color: 'var(--site-text-muted)' }} className="text-sm">Click to add image</span>
        </div>
      );

    case 'link':
      return (
        <a 
          href="#" 
          style={{
            ...styles,
            color: styles.color || 'var(--site-primary)',
          }} 
          onClick={(e) => e.preventDefault()} 
          className="underline p-2 inline-block"
        >
          {props.text || 'Click here'}
        </a>
      );

    case 'divider':
      return (
        <hr 
          style={{ 
            ...styles, 
            borderColor: styles.borderColor || 'var(--site-divider)' 
          }} 
          className="my-4 mx-2" 
        />
      );

    case 'spacer':
      return (
        <div 
          style={{ 
            ...styles, 
            height: props.height || '40px',
            backgroundColor: 'var(--site-surface)',
            borderColor: 'var(--site-border)',
          }}
          className="border border-dashed mx-2 opacity-50"
        />
      );

    case 'navbar':
      return (
        <nav 
          style={{
            ...styles,
            backgroundColor: styles.backgroundColor || 'var(--site-background)',
            borderColor: 'var(--site-border)',
            color: 'var(--site-text)',
          }} 
          className="flex items-center justify-between p-4 border-b"
        >
          <span className="font-bold text-lg">{props.logoText || 'Logo'}</span>
          <div className="flex gap-6">
            {(props.links || []).map((link: any, i: number) => (
              <a 
                key={i} 
                href="#" 
                style={{ color: 'var(--site-text-muted)' }}
                className="hover:opacity-80 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button 
            style={{ background: 'var(--site-primary-gradient, var(--site-primary))' }}
            className="text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            {props.ctaText || 'Get Started'}
          </button>
        </nav>
      );

    case 'hero':
      return (
        <section 
          style={{
            ...styles,
            background: styles.background || `linear-gradient(to bottom, var(--site-surface), var(--site-background))`,
            color: 'var(--site-text)',
          }} 
          className="py-20 px-8 text-center"
        >
          <h1 
            style={{ 
              fontFamily: 'var(--site-font-heading)',
              fontSize: 'var(--site-font-size-h1)',
            }}
            className="font-bold mb-4"
          >
            {props.title || 'Hero Title'}
          </h1>
          <p 
            style={{ color: 'var(--site-text-muted)' }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            {props.subtitle || 'Hero subtitle goes here'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              style={{ 
                background: 'var(--site-primary-gradient, var(--site-primary))',
                color: 'var(--site-text-inverse)',
              }}
              className="px-6 py-3 rounded-xl font-medium shadow-lg"
            >
              {props.ctaText || 'Get Started'}
            </button>
            {props.secondaryCtaText && (
              <button 
                style={{ 
                  backgroundColor: 'var(--site-background)',
                  borderColor: 'var(--site-border)',
                  color: 'var(--site-text)',
                }}
                className="px-6 py-3 rounded-xl font-medium border"
              >
                {props.secondaryCtaText}
              </button>
            )}
          </div>
        </section>
      );

    case 'footer':
      return (
        <footer 
          style={{
            ...styles,
            backgroundColor: styles.backgroundColor || 'var(--site-surface)',
            color: 'var(--site-text)',
          }} 
          className="py-12 px-8 text-center"
        >
          <p className="font-bold text-lg mb-2">{props.companyName || 'Company'}</p>
          <p style={{ color: 'var(--site-text-muted)' }} className="text-sm">
            {props.copyright || '© 2024 All rights reserved.'}
          </p>
        </footer>
      );

    // Containers are now handled by ContainerWithChildren
    // These cases should not normally be reached, but provide fallback
    case 'container':
    case 'section':
    case 'wrapper':
    case 'flexbox':
    case 'stack':
    case 'grid':
    case 'columns':
      return (
        <div 
          style={styles} 
          className="min-h-[40px] p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md"
        />
      );

    case 'card':
      return (
        <div style={styles} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 m-2">
          <h3 className="text-xl font-semibold mb-2">{props.title || 'Card Title'}</h3>
          <p className="text-gray-600 dark:text-gray-400">{props.description || 'Card description'}</p>
        </div>
      );

    case 'input':
      return (
        <div className="p-2">
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder}
            style={styles}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            readOnly
          />
        </div>
      );

    case 'form':
      return <form style={styles} className="space-y-4 p-2" onSubmit={(e) => e.preventDefault()} />;

    default:
      return (
        <div style={styles} className="p-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 m-2">
          <span className="text-gray-500 text-sm">{element.type}</span>
        </div>
      );
  }
}

// Empty canvas drop zone
interface EmptyCanvasDropZoneProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  isOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
}

function EmptyCanvasDropZone({ isDragging, onDrop, isOver, onDragOver, onDragLeave }: EmptyCanvasDropZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[EmptyCanvasDropZone] Drop event received');
    onDrop(e);
  };

  return (
    <div 
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 transition-all duration-200',
        isDragging && isOver && 'bg-primary/10'
      )}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); onDragLeave(); }}
      onDrop={handleDrop}
    >
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
        isDragging && isOver ? 'bg-primary/20 scale-110' : 'bg-gray-100 dark:bg-gray-800'
      )}>
        <svg
          className={cn('w-8 h-8 transition-colors', isDragging && isOver ? 'text-primary' : 'text-gray-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className={cn(
          'text-title-md transition-colors',
          isDragging && isOver ? 'text-primary' : 'text-on-surface-light dark:text-on-surface-dark'
        )}>
          {isDragging ? 'Drop element here' : 'Start building your page'}
        </h3>
        <p className="text-body-md text-gray-500 mt-1">
          {isDragging ? 'Release to add element' : 'Drag elements from the left panel'}
        </p>
      </div>
    </div>
  );
}

// Helper to compute styles from element definition
function getComputedStyles(element: ElementNode): React.CSSProperties {
  const baseStyles = element.styles?.base || {};
  const styles: Record<string, string | number> = {};

  const paletteDefaults: Record<string, string> = {
    primary: '#492cdd',
    primaryLight: '#ad38e2',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    background: '#ffffff',
    surface: '#f8f9fa',
    border: '#e2e8f0',
  };

  Object.entries(baseStyles).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && '$palette' in value) {
      const paletteValue = value as { $palette: string };
      styles[key] = paletteDefaults[paletteValue.$palette] || paletteValue.$palette;
    } else if (typeof value === 'object' && value !== null && '$settings' in value) {
      styles[key] = '16px';
    } else if (typeof value === 'object' && value !== null && ('top' in value || 'right' in value)) {
      const spacing = value as { top?: string; right?: string; bottom?: string; left?: string };
      styles[key] = `${spacing.top || 0} ${spacing.right || 0} ${spacing.bottom || 0} ${spacing.left || 0}`;
    } else if (value !== null && value !== undefined) {
      styles[key] = value as string | number;
    }
  });

  return styles as React.CSSProperties;
}
