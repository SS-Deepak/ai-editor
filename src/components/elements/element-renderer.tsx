'use client';

import { useState, useCallback } from 'react';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  LayoutGrid,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { createElement, canHaveChildren, getElementDisplayName } from '@/lib/element-factory';
import { LayoutPickerModal } from '../modals/layout-picker-modal';
import type { ElementNode, ElementType } from '@/types';

interface ElementRendererProps {
  element: ElementNode;
  isSelected?: boolean;
  depth?: number;
}

export function ElementRenderer({ element, isSelected, depth = 0 }: ElementRendererProps) {
  const { 
    selectElement, 
    hoverElement, 
    hoveredElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    addElement,
    saveHistory,
  } = useEditorStore();
  const { isDragging, draggedElementType, stopDragging } = useUIStore();
  const isHovered = hoveredElementId === element.id;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!element.isLocked) {
      selectElement(element.id);
    }
  };

  const handleMouseEnter = () => {
    if (!element.isLocked) {
      hoverElement(element.id);
    }
  };

  const handleMouseLeave = () => {
    hoverElement(null);
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

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { isHidden: !element.isHidden });
  };

  // Handle drop into container elements
  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canHaveChildren(element.type)) return;
    
    // Try to get element type from multiple formats
    let elementType = e.dataTransfer.getData('element-type');
    if (!elementType) {
      elementType = e.dataTransfer.getData('text/plain');
    }
    if (!elementType) {
      elementType = draggedElementType || '';
    }
    
    if (!elementType) {
      setIsDragOverContainer(false);
      return;
    }

    const newElement = createElement(elementType as ElementType);
    newElement.order = element.children.length;
    
    addElement(newElement, element.id);
    saveHistory();
    stopDragging();
    setIsDragOverContainer(false);
  }, [element, addElement, saveHistory, stopDragging, draggedElementType]);

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canHaveChildren(element.type)) {
      setIsDragOverContainer(true);
    }
  }, [element.type]);

  const handleContainerDragLeave = useCallback(() => {
    setIsDragOverContainer(false);
  }, []);

  // Convert style definition to CSS
  const getStyles = (): React.CSSProperties => {
    const baseStyles = element.styles?.base || {};
    const styles: React.CSSProperties = {};

    Object.entries(baseStyles).forEach(([key, value]) => {
      if (typeof value === 'object' && '$palette' in value) {
        const paletteDefaults: Record<string, string> = {
          primary: '#492cdd',
          primaryLight: '#ad38e2',
          text: '#1a1a2e',
          textInverse: '#ffffff',
          background: '#ffffff',
          surface: '#f8f9fa',
          border: '#e2e8f0',
        };
        styles[key as any] = paletteDefaults[value.$palette] || value.$palette;
      } else if (typeof value === 'object' && '$settings' in value) {
        styles[key as any] = '16px';
      } else if (typeof value === 'object' && ('top' in value || 'right' in value)) {
        const spacing = value as { top?: string; right?: string; bottom?: string; left?: string };
        styles[key as any] = `${spacing.top || 0} ${spacing.right || 0} ${spacing.bottom || 0} ${spacing.left || 0}`;
      } else {
        styles[key as any] = value;
      }
    });

    return styles;
  };

  // Get combined classes (element className + customClasses)
  const getElementClasses = () => {
    const classes: string[] = [];
    
    // Add Tailwind responsive classes from element.className
    if (element.className) {
      classes.push(element.className);
    }
    
    // Add responsive classes
    if (element.responsiveClasses) {
      if (element.responsiveClasses.base) classes.push(element.responsiveClasses.base);
      if (element.responsiveClasses.sm) classes.push(element.responsiveClasses.sm);
      if (element.responsiveClasses.md) classes.push(element.responsiveClasses.md);
      if (element.responsiveClasses.lg) classes.push(element.responsiveClasses.lg);
      if (element.responsiveClasses.xl) classes.push(element.responsiveClasses.xl);
    }
    
    // Add custom classes
    if (element.customClasses) {
      classes.push(...element.customClasses);
    }
    
    return classes.join(' ');
  };

  // Render based on element type
  const renderElement = () => {
    const props = element.props || {};
    const styles = getStyles();
    const elementClasses = getElementClasses();
    const isContainer = canHaveChildren(element.type);

    // Container wrapper for drop support
    const ContainerWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        style={styles}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
        className={cn(
          'relative transition-all duration-200',
          elementClasses,
          isDragOverContainer && 'ring-2 ring-primary ring-inset bg-primary/5'
        )}
      >
        {children}
        {element.children.length === 0 && (
          <div className={cn(
            'min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200',
            isDragOverContainer 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 dark:border-gray-600'
          )}>
            <span className={cn(
              'text-sm',
              isDragOverContainer ? 'text-primary font-medium' : 'text-gray-400'
            )}>
              {isDragOverContainer ? 'Drop here' : 'Drop elements here'}
            </span>
          </div>
        )}
      </div>
    );

    switch (element.type) {
      case 'text':
      case 'paragraph':
        return (
          <p style={styles} className={cn('cursor-text', elementClasses)}>
            {props.content || 'Add your text here'}
          </p>
        );

      case 'heading':
        const HeadingTag = (props.tag || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag style={styles} className={cn('cursor-text', elementClasses)}>
            {props.content || 'Heading'}
          </HeadingTag>
        );

      case 'button':
        // If elementClasses has specific styling, don't override with default gradient
        const hasCustomStyles = elementClasses && (
          elementClasses.includes('bg-') || 
          styles.backgroundColor || 
          styles.background
        );
        return (
          <button
            style={hasCustomStyles ? styles : {
              ...styles,
              background: 'linear-gradient(to right, #492cdd, #ad38e2)',
            }}
            className={cn(
              'font-medium shadow-md hover:shadow-lg transition-all',
              elementClasses || 'text-white rounded-xl'
            )}
          >
            {props.text || 'Button'}
          </button>
        );

      case 'image':
        return props.src ? (
          <img
            src={props.src}
            alt={props.alt || 'Image'}
            style={styles}
            className={cn('max-w-full h-auto', elementClasses)}
          />
        ) : (
          <div 
            style={styles}
            className={cn('w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center', elementClasses)}
          >
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Click to add image</span>
            </div>
          </div>
        );

      case 'link':
        return (
          <a href="#" style={styles} className={elementClasses} onClick={(e) => e.preventDefault()}>
            {props.text || 'Click here'}
          </a>
        );

      case 'divider':
        return <hr style={styles} className="border-gray-200 dark:border-gray-700 my-4" />;

      case 'spacer':
        return (
          <div 
            style={{ ...styles, height: props.height || '40px' }}
            className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700"
          />
        );

      case 'input':
        return (
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder}
            style={styles}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            readOnly
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={props.placeholder}
            style={styles}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[100px]"
            readOnly
          />
        );

      case 'select':
        return (
          <select
            style={styles}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            <option>{props.placeholder || 'Select option'}</option>
            {(props.options || []).map((opt: any, i: number) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'container':
      case 'section':
      case 'wrapper':
      case 'flexbox':
      case 'stack':
        return (
          <ContainerWrapper>
            {element.children.map((child) => (
              <ElementRenderer
                key={child.id}
                element={child}
                depth={depth + 1}
              />
            ))}
          </ContainerWrapper>
        );

      case 'grid':
        return (
          <ContainerWrapper>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
              gap: props.gap || '24px',
            }}>
              {element.children.map((child) => (
                <ElementRenderer
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          </ContainerWrapper>
        );

      case 'columns':
        return (
          <ContainerWrapper>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: props.gap || '24px',
            }}>
              {element.children.map((child) => (
                <div key={child.id} className="flex-1">
                  <ElementRenderer
                    element={child}
                    depth={depth + 1}
                  />
                </div>
              ))}
            </div>
          </ContainerWrapper>
        );

      case 'form':
        return (
          <ContainerWrapper>
            <form style={styles} onSubmit={(e) => e.preventDefault()}>
              {element.children.map((child) => (
                <ElementRenderer
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                />
              ))}
            </form>
          </ContainerWrapper>
        );

      case 'navbar':
        return (
          <nav style={styles} className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <span className="font-bold text-lg">{props.logoText || 'Logo'}</span>
            <div className="flex gap-6">
              {(props.links || []).map((link: any, i: number) => (
                <a key={i} href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
            <button className="bg-gradient-to-r from-[#492cdd] to-[#ad38e2] text-white py-2 px-4 rounded-lg text-sm font-medium">
              {props.ctaText || 'Get Started'}
            </button>
          </nav>
        );

      case 'hero':
        return (
          <section style={styles} className="py-20 px-8 text-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {props.title || 'Hero Title'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {props.subtitle || 'Hero subtitle goes here'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-[#492cdd] to-[#ad38e2] text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow">
                {props.ctaText || 'Get Started'}
              </button>
              {props.secondaryCtaText && (
                <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {props.secondaryCtaText}
                </button>
              )}
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer style={styles} className="py-12 px-8 bg-gray-100 dark:bg-gray-900 text-center">
            <p className="font-bold text-lg mb-2">{props.companyName || 'Company'}</p>
            <p className="text-gray-500 text-sm">{props.copyright || '© 2024 All rights reserved.'}</p>
          </footer>
        );

      case 'card':
        return (
          <ContainerWrapper>
            <div style={styles} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
              {element.children.length > 0 ? (
                element.children.map((child) => (
                  <ElementRenderer
                    key={child.id}
                    element={child}
                    depth={depth + 1}
                  />
                ))
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">{props.title || 'Card Title'}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{props.description || 'Card description'}</p>
                </>
              )}
            </div>
          </ContainerWrapper>
        );

      default:
        return (
          <div style={styles} className="p-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 text-sm">Element: {element.type}</span>
          </div>
        );
    }
  };

  if (element.isHidden) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative group',
        isSelected && 'ring-2 ring-primary ring-offset-2 rounded',
        isHovered && !isSelected && 'ring-2 ring-primary/40 rounded',
        element.isLocked && 'opacity-70'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
      }}
    >
      {renderElement()}

      {/* Selection Label */}
      {(isSelected || isHovered) && !element.isLocked && (
        <div
          className={cn(
            'absolute -top-7 left-0 px-2 py-1 text-xs font-medium rounded-t flex items-center gap-1.5 z-10',
            isSelected
              ? 'bg-primary text-white'
              : 'bg-primary/70 text-white'
          )}
        >
          <GripVertical size={12} className="cursor-grab" />
          {getElementDisplayName(element.type)}
        </div>
      )}

      {/* Quick Actions */}
      {isSelected && !element.isLocked && (
        <div className="absolute -top-7 right-0 flex items-center gap-0.5 z-10">
          <ActionButton
            icon={<LayoutGrid size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              setShowLayoutPicker(true);
            }}
            tooltip="Replace with Layout"
            variant="layout"
          />
          <ActionButton
            icon={<Copy size={12} />}
            onClick={handleDuplicate}
            tooltip="Duplicate"
          />
          <ActionButton
            icon={element.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            onClick={handleToggleVisibility}
            tooltip={element.isHidden ? 'Show' : 'Hide'}
          />
          <ActionButton
            icon={element.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            onClick={handleToggleLock}
            tooltip={element.isLocked ? 'Unlock' : 'Lock'}
          />
          <ActionButton
            icon={<Trash2 size={12} />}
            onClick={handleDelete}
            tooltip="Delete"
            variant="danger"
          />
        </div>
      )}

      {/* Locked indicator */}
      {element.isLocked && (
        <div className="absolute top-2 right-2 p-1.5 bg-gray-800/80 rounded">
          <Lock size={14} className="text-white" />
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

// Action button component
interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tooltip: string;
  variant?: 'default' | 'danger' | 'layout';
}

function ActionButton({ icon, onClick, tooltip, variant = 'default' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'p-1.5 rounded transition-colors',
        variant === 'danger'
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : variant === 'layout'
          ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
          : 'bg-primary hover:bg-primary-dark text-white'
      )}
    >
      {icon}
    </button>
  );
}
