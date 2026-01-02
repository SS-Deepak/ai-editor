'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Layout,
  Square,
  Type,
  Palette,
  Box,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Globe,
  Link,
  Unlink,
  SquareDashedBottom,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useSiteSettingsStore } from '@/store/site-settings-store';
import { UnitInput } from '../ui';
import { cn } from '@/lib/utils';
import type { ElementNode } from '@/types';

interface StyleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function StyleSection({ title, icon, children, defaultOpen = true }: StyleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-outline-light dark:border-outline-dark">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-gray-500">{icon}</span>
        <span className="flex-1 text-left text-label-lg text-on-surface-light dark:text-on-surface-dark">
          {title}
        </span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function StylePanel() {
  const { selectedElementId, elements, updateElement, saveHistory } = useEditorStore();
  const { getSelectedPalette, typography } = useSiteSettingsStore();
  const palette = getSelectedPalette();
  
  // Find selected element
  const findElement = (els: typeof elements, id: string): ElementNode | null => {
    for (const el of els) {
      if (el.id === id) return el;
      const found = findElement(el.children, id);
      if (found) return found;
    }
    return null;
  };

  const element = selectedElementId ? findElement(elements, selectedElementId) : null;

  // Update style property
  const updateStyle = useCallback((property: string, value: string | number) => {
    if (!element) return;
    
    const newStyles = {
      ...element.styles,
      base: {
        ...element.styles.base,
        [property]: value || undefined, // Remove empty values
      },
    };
    
    updateElement(element.id, { styles: newStyles });
  }, [element, updateElement]);

  // Commit changes to history
  const commitChanges = useCallback(() => {
    saveHistory();
  }, [saveHistory]);

  if (!element) return null;

  const baseStyles = element.styles?.base || {};

  // Helper to get string value
  const getStyleValue = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'object' && val !== null) {
      if ('$palette' in val) return (val as { $palette: string }).$palette;
      if ('$settings' in val) return '';
    }
    return '';
  };

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
      {/* Layout Section */}
      <StyleSection title="Layout" icon={<Layout size={16} />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StyleSelect
              label="Display"
              value={getStyleValue(baseStyles.display) || 'block'}
              options={[
                { label: 'Block', value: 'block' },
                { label: 'Flex', value: 'flex' },
                { label: 'Grid', value: 'grid' },
                { label: 'Inline', value: 'inline' },
                { label: 'Inline Flex', value: 'inline-flex' },
                { label: 'Inline Block', value: 'inline-block' },
                { label: 'None', value: 'none' },
              ]}
              onChange={(v) => { updateStyle('display', v); commitChanges(); }}
            />
            <StyleSelect
              label="Position"
              value={getStyleValue(baseStyles.position) || 'relative'}
              options={[
                { label: 'Relative', value: 'relative' },
                { label: 'Absolute', value: 'absolute' },
                { label: 'Fixed', value: 'fixed' },
                { label: 'Sticky', value: 'sticky' },
                { label: 'Static', value: 'static' },
              ]}
              onChange={(v) => { updateStyle('position', v); commitChanges(); }}
            />
          </div>

          {/* Flex Options */}
          {getStyleValue(baseStyles.display) === 'flex' && (
            <div className="pt-2 border-t border-outline-light dark:border-outline-dark space-y-3">
              <div>
                <label className="text-label-sm text-gray-500 mb-2 block">Direction</label>
                <div className="flex gap-1">
                  {[
                    { value: 'row', label: '→' },
                    { value: 'column', label: '↓' },
                    { value: 'row-reverse', label: '←' },
                    { value: 'column-reverse', label: '↑' },
                  ].map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() => {
                        updateStyle('flexDirection', dir.value);
                        commitChanges();
                      }}
                      className={cn(
                        'flex-1 py-1.5 text-label-sm rounded-material-sm',
                        'border border-outline-light dark:border-outline-dark',
                        'transition-colors',
                        getStyleValue(baseStyles.flexDirection) === dir.value
                          ? 'bg-primary text-white border-primary'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StyleSelect
                  label="Justify"
                  value={getStyleValue(baseStyles.justifyContent) || 'flex-start'}
                  options={[
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                    { label: 'Between', value: 'space-between' },
                    { label: 'Around', value: 'space-around' },
                  ]}
                  onChange={(v) => { updateStyle('justifyContent', v); commitChanges(); }}
                />
                <StyleSelect
                  label="Align"
                  value={getStyleValue(baseStyles.alignItems) || 'stretch'}
                  options={[
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                    { label: 'Stretch', value: 'stretch' },
                  ]}
                  onChange={(v) => { updateStyle('alignItems', v); commitChanges(); }}
                />
              </div>

              <UnitInput
                label="Gap"
                value={getStyleValue(baseStyles.gap) || ''}
                placeholder="16"
                onChange={(v) => { updateStyle('gap', v); commitChanges(); }}
              />
            </div>
          )}
        </div>
      </StyleSection>

      {/* Spacing Section */}
      <StyleSection title="Spacing" icon={<Box size={16} />}>
        <div className="space-y-4">
          {/* Margin */}
          <LinkedSpacingInput
            label="Margin"
            values={{
              top: getStyleValue(baseStyles.marginTop) || '',
              right: getStyleValue(baseStyles.marginRight) || '',
              bottom: getStyleValue(baseStyles.marginBottom) || '',
              left: getStyleValue(baseStyles.marginLeft) || '',
            }}
            onChange={(side, value) => {
              updateStyle(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value);
              commitChanges();
            }}
            onChangeAll={(value) => {
              updateStyle('marginTop', value);
              updateStyle('marginRight', value);
              updateStyle('marginBottom', value);
              updateStyle('marginLeft', value);
              commitChanges();
            }}
          />

          {/* Padding */}
          <LinkedSpacingInput
            label="Padding"
            values={{
              top: getStyleValue(baseStyles.paddingTop) || '',
              right: getStyleValue(baseStyles.paddingRight) || '',
              bottom: getStyleValue(baseStyles.paddingBottom) || '',
              left: getStyleValue(baseStyles.paddingLeft) || '',
            }}
            onChange={(side, value) => {
              updateStyle(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value);
              commitChanges();
            }}
            onChangeAll={(value) => {
              updateStyle('paddingTop', value);
              updateStyle('paddingRight', value);
              updateStyle('paddingBottom', value);
              updateStyle('paddingLeft', value);
              commitChanges();
            }}
          />
        </div>
      </StyleSection>

      {/* Size Section */}
      <StyleSection title="Size" icon={<Square size={16} />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Width"
              value={getStyleValue(baseStyles.width) || ''}
              placeholder="auto"
              onChange={(v) => { updateStyle('width', v); commitChanges(); }}
              allowAuto
            />
            <UnitInput
              label="Height"
              value={getStyleValue(baseStyles.height) || ''}
              placeholder="auto"
              onChange={(v) => { updateStyle('height', v); commitChanges(); }}
              allowAuto
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Min Width"
              value={getStyleValue(baseStyles.minWidth) || ''}
              placeholder="0"
              onChange={(v) => { updateStyle('minWidth', v); commitChanges(); }}
            />
            <UnitInput
              label="Max Width"
              value={getStyleValue(baseStyles.maxWidth) || ''}
              placeholder="none"
              onChange={(v) => { updateStyle('maxWidth', v); commitChanges(); }}
              allowAuto
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Min Height"
              value={getStyleValue(baseStyles.minHeight) || ''}
              placeholder="0"
              onChange={(v) => { updateStyle('minHeight', v); commitChanges(); }}
            />
            <UnitInput
              label="Max Height"
              value={getStyleValue(baseStyles.maxHeight) || ''}
              placeholder="none"
              onChange={(v) => { updateStyle('maxHeight', v); commitChanges(); }}
              allowAuto
            />
          </div>
        </div>
      </StyleSection>

      {/* Typography Section */}
      <StyleSection title="Typography" icon={<Type size={16} />}>
        <div className="space-y-3">
          <StyleSelectWithSite
            label="Font Family"
            value={getStyleValue(baseStyles.fontFamily) || ''}
            siteOptions={[
              { label: `Site Body (${typography.fontFamily.primary})`, value: `var(--site-font-primary)`, preview: typography.fontFamily.primary },
              { label: `Site Heading (${typography.fontFamily.heading})`, value: `var(--site-font-heading)`, preview: typography.fontFamily.heading },
              { label: `Site Mono (${typography.fontFamily.mono})`, value: `var(--site-font-mono)`, preview: typography.fontFamily.mono },
            ]}
            customOptions={[
              { label: 'Inter', value: 'Inter, sans-serif' },
              { label: 'Roboto', value: 'Roboto, sans-serif' },
              { label: 'Open Sans', value: 'Open Sans, sans-serif' },
              { label: 'Poppins', value: 'Poppins, sans-serif' },
              { label: 'Playfair Display', value: 'Playfair Display, serif' },
              { label: 'System', value: 'system-ui, sans-serif' },
            ]}
            onChange={(v) => { updateStyle('fontFamily', v); commitChanges(); }}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Font Size"
              value={getStyleValue(baseStyles.fontSize) || ''}
              placeholder="16"
              onChange={(v) => { updateStyle('fontSize', v); commitChanges(); }}
            />
            <StyleSelect
              label="Weight"
              value={getStyleValue(baseStyles.fontWeight) || '400'}
              options={[
                { label: 'Light', value: '300' },
                { label: 'Regular', value: '400' },
                { label: 'Medium', value: '500' },
                { label: 'Semibold', value: '600' },
                { label: 'Bold', value: '700' },
              ]}
              onChange={(v) => { updateStyle('fontWeight', parseInt(v)); commitChanges(); }}
            />
          </div>

          <UnitInput
            label="Line Height"
            value={getStyleValue(baseStyles.lineHeight) || ''}
            placeholder="1.5"
            onChange={(v) => { updateStyle('lineHeight', v); commitChanges(); }}
          />

          <UnitInput
            label="Letter Spacing"
            value={getStyleValue(baseStyles.letterSpacing) || ''}
            placeholder="0"
            onChange={(v) => { updateStyle('letterSpacing', v); commitChanges(); }}
          />

          <div>
            <label className="text-label-sm text-gray-500 mb-2 block">Text Align</label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
                { value: 'justify', icon: AlignJustify },
              ].map((align) => {
                const Icon = align.icon;
                return (
                  <button
                    key={align.value}
                    onClick={() => {
                      updateStyle('textAlign', align.value);
                      commitChanges();
                    }}
                    className={cn(
                      'flex-1 py-2 rounded-material-sm',
                      'border border-outline-light dark:border-outline-dark',
                      'transition-colors flex items-center justify-center',
                      getStyleValue(baseStyles.textAlign) === align.value
                        ? 'bg-primary text-white border-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <SiteColorInput
            label="Color"
            value={getStyleValue(baseStyles.color) || ''}
            palette={palette}
            siteOptions={[
              { label: 'Site Text', value: 'var(--site-text)', color: palette?.colors.text },
              { label: 'Site Text Muted', value: 'var(--site-text-muted)', color: palette?.colors.textMuted },
              { label: 'Site Text Inverse', value: 'var(--site-text-inverse)', color: palette?.colors.textInverse },
              { label: 'Site Primary', value: 'var(--site-primary)', color: palette?.colors.primary },
              { label: 'Site Secondary', value: 'var(--site-secondary)', color: palette?.colors.secondary },
              { label: 'Site Accent', value: 'var(--site-accent)', color: palette?.colors.accent },
            ]}
            onChange={(v) => { updateStyle('color', v); commitChanges(); }}
          />
        </div>
      </StyleSection>

      {/* Background Section */}
      <StyleSection title="Background" icon={<Palette size={16} />} defaultOpen={false}>
        <div className="space-y-3">
          <SiteColorInput
            label="Background Color"
            value={getStyleValue(baseStyles.backgroundColor) || ''}
            palette={palette}
            siteOptions={[
              { label: 'Site Background', value: 'var(--site-background)', color: palette?.colors.background },
              { label: 'Site Surface', value: 'var(--site-surface)', color: palette?.colors.surface },
              { label: 'Site Primary', value: 'var(--site-primary)', color: palette?.colors.primary },
              { label: 'Site Primary Light', value: 'var(--site-primary-light)', color: palette?.colors.primaryLight },
              { label: 'Site Secondary', value: 'var(--site-secondary)', color: palette?.colors.secondary },
              { label: 'Site Accent', value: 'var(--site-accent)', color: palette?.colors.accent },
            ]}
            onChange={(v) => { updateStyle('backgroundColor', v); commitChanges(); }}
          />
        </div>
      </StyleSection>

      {/* Border Section */}
      <StyleSection title="Border" icon={<SquareDashedBottom size={16} />} defaultOpen={false}>
        <div className="space-y-3">
          <StyleSelect
            label="Border Style"
            value={getStyleValue(baseStyles.borderStyle) || 'none'}
            options={[
              { label: 'None', value: 'none' },
              { label: 'Solid', value: 'solid' },
              { label: 'Dashed', value: 'dashed' },
              { label: 'Dotted', value: 'dotted' },
              { label: 'Double', value: 'double' },
            ]}
            onChange={(v) => { updateStyle('borderStyle', v); commitChanges(); }}
          />

          {/* Border Width with link */}
          <LinkedSpacingInput
            label="Border Width"
            values={{
              top: getStyleValue(baseStyles.borderTopWidth) || '',
              right: getStyleValue(baseStyles.borderRightWidth) || '',
              bottom: getStyleValue(baseStyles.borderBottomWidth) || '',
              left: getStyleValue(baseStyles.borderLeftWidth) || '',
            }}
            onChange={(side, value) => {
              updateStyle(`border${side.charAt(0).toUpperCase() + side.slice(1)}Width`, value);
              commitChanges();
            }}
            onChangeAll={(value) => {
              updateStyle('borderWidth', value);
              updateStyle('borderTopWidth', value);
              updateStyle('borderRightWidth', value);
              updateStyle('borderBottomWidth', value);
              updateStyle('borderLeftWidth', value);
              commitChanges();
            }}
            defaultLinked={true}
          />

          <SiteColorInput
            label="Border Color"
            value={getStyleValue(baseStyles.borderColor) || ''}
            palette={palette}
            siteOptions={[
              { label: 'Site Border', value: 'var(--site-border)', color: palette?.colors.border },
              { label: 'Site Divider', value: 'var(--site-divider)', color: palette?.colors.divider },
              { label: 'Site Primary', value: 'var(--site-primary)', color: palette?.colors.primary },
              { label: 'Site Secondary', value: 'var(--site-secondary)', color: palette?.colors.secondary },
            ]}
            onChange={(v) => { updateStyle('borderColor', v); commitChanges(); }}
          />

          {/* Border Radius with link */}
          <LinkedSpacingInput
            label="Border Radius"
            values={{
              top: getStyleValue(baseStyles.borderTopLeftRadius) || '',
              right: getStyleValue(baseStyles.borderTopRightRadius) || '',
              bottom: getStyleValue(baseStyles.borderBottomRightRadius) || '',
              left: getStyleValue(baseStyles.borderBottomLeftRadius) || '',
            }}
            labels={{ top: 'TL', right: 'TR', bottom: 'BR', left: 'BL' }}
            onChange={(side, value) => {
              const radiusMap: Record<string, string> = {
                top: 'borderTopLeftRadius',
                right: 'borderTopRightRadius',
                bottom: 'borderBottomRightRadius',
                left: 'borderBottomLeftRadius',
              };
              updateStyle(radiusMap[side], value);
              commitChanges();
            }}
            onChangeAll={(value) => {
              updateStyle('borderRadius', value);
              updateStyle('borderTopLeftRadius', value);
              updateStyle('borderTopRightRadius', value);
              updateStyle('borderBottomRightRadius', value);
              updateStyle('borderBottomLeftRadius', value);
              commitChanges();
            }}
            defaultLinked={true}
          />
        </div>
      </StyleSection>

      {/* Effects Section */}
      <StyleSection title="Effects" icon={<Sparkles size={16} />} defaultOpen={false}>
        <div className="space-y-3">
          <StyleSelect
            label="Box Shadow"
            value={getStyleValue(baseStyles.boxShadow) || 'none'}
            options={[
              { label: 'None', value: 'none' },
              { label: 'Small', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
              { label: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
              { label: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
              { label: 'XL', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
            ]}
            onChange={(v) => { updateStyle('boxShadow', v); commitChanges(); }}
          />

          <div>
            <label className="text-label-sm text-gray-500 mb-1 block">Opacity</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={((baseStyles.opacity as number) ?? 1) * 100}
                onChange={(e) => updateStyle('opacity', parseInt(e.target.value) / 100)}
                onMouseUp={commitChanges}
                className="flex-1"
              />
              <span className="text-body-sm text-gray-500 w-12 text-right">
                {Math.round(((baseStyles.opacity as number) ?? 1) * 100)}%
              </span>
            </div>
          </div>

          <StyleSelect
            label="Overflow"
            value={getStyleValue(baseStyles.overflow) || 'visible'}
            options={[
              { label: 'Visible', value: 'visible' },
              { label: 'Hidden', value: 'hidden' },
              { label: 'Scroll', value: 'scroll' },
              { label: 'Auto', value: 'auto' },
            ]}
            onChange={(v) => { updateStyle('overflow', v); commitChanges(); }}
          />

          <StyleSelect
            label="Cursor"
            value={getStyleValue(baseStyles.cursor) || 'auto'}
            options={[
              { label: 'Auto', value: 'auto' },
              { label: 'Pointer', value: 'pointer' },
              { label: 'Default', value: 'default' },
              { label: 'Move', value: 'move' },
              { label: 'Not Allowed', value: 'not-allowed' },
              { label: 'Text', value: 'text' },
            ]}
            onChange={(v) => { updateStyle('cursor', v); commitChanges(); }}
          />
        </div>
      </StyleSection>
    </div>
  );
}

// Reusable style select component
interface StyleSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

function StyleSelect({ label, value, options, onChange }: StyleSelectProps) {
  return (
    <div>
      <label className="text-label-sm text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Color input with picker
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="text-label-sm text-gray-500 mb-1 block">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer bg-white"
        />
        <input
          type="text"
          value={value}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>
  );
}

// Style select with site-level options
interface StyleSelectWithSiteProps {
  label: string;
  value: string;
  siteOptions: { label: string; value: string; preview?: string }[];
  customOptions: { label: string; value: string }[];
  onChange: (value: string) => void;
}

function StyleSelectWithSite({ label, value, siteOptions, customOptions, onChange }: StyleSelectWithSiteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSiteValue = value.startsWith('var(--site');
  
  // Find current label
  const currentOption = [...siteOptions, ...customOptions].find(o => o.value === value);
  const displayLabel = currentOption?.label || value || 'Select...';
  
  return (
    <div className="relative">
      <label className="text-label-sm text-gray-500 mb-1 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-2 py-2 text-sm rounded-md',
          'border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900',
          'hover:border-gray-300 dark:hover:border-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-primary/20'
        )}
      >
        <span className="flex items-center gap-2">
          {isSiteValue && <Globe size={12} className="text-primary" />}
          <span style={{ fontFamily: (currentOption as any)?.preview || value }}>
            {displayLabel}
          </span>
        </span>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[250px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            {/* Site Options */}
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wide text-primary bg-primary/5 font-medium flex items-center gap-1 sticky top-0">
              <Globe size={10} />
              Site Defaults
            </div>
            {siteOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2',
                  value === opt.value && 'bg-primary/10 text-primary'
                )}
                style={{ fontFamily: opt.preview }}
              >
                <Globe size={12} className="text-primary shrink-0" />
                {opt.label}
              </button>
            ))}
            
            {/* Custom Options */}
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 dark:bg-gray-800 sticky top-0">
              Custom Fonts
            </div>
            {customOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800',
                  value === opt.value && 'bg-primary/10 text-primary'
                )}
                style={{ fontFamily: opt.value }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Linked spacing input component with lock functionality
interface LinkedSpacingInputProps {
  label: string;
  values: { top: string; right: string; bottom: string; left: string };
  labels?: { top: string; right: string; bottom: string; left: string };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  onChangeAll: (value: string) => void;
  defaultLinked?: boolean;
}

function LinkedSpacingInput({ 
  label, 
  values, 
  labels = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' },
  onChange, 
  onChangeAll,
  defaultLinked = false,
}: LinkedSpacingInputProps) {
  const [isLinked, setIsLinked] = useState(defaultLinked);
  const [linkedValue, setLinkedValue] = useState('');

  // Check if all values are the same
  const allSame = values.top === values.right && values.right === values.bottom && values.bottom === values.left;
  
  // Get display value when linked
  const getLinkedDisplayValue = () => {
    if (allSame && values.top) return values.top;
    return linkedValue;
  };

  const handleLinkedChange = (value: string) => {
    setLinkedValue(value);
    onChangeAll(value);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-label-sm text-gray-500">{label}</label>
        <button
          type="button"
          onClick={() => setIsLinked(!isLinked)}
          className={cn(
            'p-1 rounded transition-colors',
            isLinked 
              ? 'bg-primary/10 text-primary' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title={isLinked ? 'Unlink values' : 'Link all values'}
        >
          {isLinked ? <Link size={14} /> : <Unlink size={14} />}
        </button>
      </div>
      
      {isLinked ? (
        <UnitInput
          label="All sides"
          value={getLinkedDisplayValue()}
          placeholder="0"
          onChange={handleLinkedChange}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <UnitInput
            label={labels.top}
            value={values.top}
            placeholder="0"
            onChange={(v) => onChange('top', v)}
          />
          <UnitInput
            label={labels.right}
            value={values.right}
            placeholder="0"
            onChange={(v) => onChange('right', v)}
          />
          <UnitInput
            label={labels.bottom}
            value={values.bottom}
            placeholder="0"
            onChange={(v) => onChange('bottom', v)}
          />
          <UnitInput
            label={labels.left}
            value={values.left}
            placeholder="0"
            onChange={(v) => onChange('left', v)}
          />
        </div>
      )}
    </div>
  );
}

// Color input with site palette options
interface SiteColorInputProps {
  label: string;
  value: string;
  palette: any;
  siteOptions: { label: string; value: string; color?: string }[];
  onChange: (value: string) => void;
}

function SiteColorInput({ label, value, palette, siteOptions, onChange }: SiteColorInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'site' | 'custom'>(value.startsWith('var(--site') ? 'site' : 'custom');
  
  // Get the actual color value for display
  const getDisplayColor = () => {
    if (value.startsWith('var(--site')) {
      const opt = siteOptions.find(o => o.value === value);
      return opt?.color || '#000000';
    }
    return value || '#000000';
  };
  
  const displayColor = getDisplayColor();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-label-sm text-gray-500">{label}</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('site')}
            className={cn(
              'px-2 py-0.5 text-[10px] rounded',
              mode === 'site' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700'
            )}
          >
            <Globe size={10} className="inline mr-1" />
            Site
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={cn(
              'px-2 py-0.5 text-[10px] rounded',
              mode === 'custom' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700'
            )}
          >
            Custom
          </button>
        </div>
      </div>
      
      {mode === 'site' ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md',
              'border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div 
              className="w-6 h-6 rounded border border-gray-200 shrink-0"
              style={{ backgroundColor: displayColor }}
            />
            <span className="flex-1 text-left truncate">
              {siteOptions.find(o => o.value === value)?.label || 'Select site color...'}
            </span>
            <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
          </button>
          
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 z-50 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                <div className="grid grid-cols-3 gap-1">
                  {siteOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { onChange(opt.value); setIsOpen(false); }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800',
                        value === opt.value && 'ring-2 ring-primary'
                      )}
                      title={opt.label}
                    >
                      <div 
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="text-[9px] text-gray-500 truncate w-full text-center">
                        {opt.label.replace('Site ', '')}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Custom colors from palette */}
                {palette?.customColors && palette.customColors.length > 0 && (
                  <>
                    <div className="text-[10px] text-gray-400 uppercase mt-2 mb-1">Custom Colors</div>
                    <div className="grid grid-cols-4 gap-1">
                      {palette.customColors.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { onChange(`var(--site-custom-${c.name})`); setIsOpen(false); }}
                          className={cn(
                            'flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                          title={c.name}
                        >
                          <div 
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: c.value }}
                          />
                          <span className="text-[8px] text-gray-500 truncate w-full text-center">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="color"
            value={value.startsWith('var') ? displayColor : (value || '#000000')}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer bg-white"
          />
          <input
            type="text"
            value={value.startsWith('var') ? '' : value}
            placeholder="#000000"
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-2 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      )}
    </div>
  );
}
