'use client';

import { useState, useCallback } from 'react';
import {
  Type,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Button, Input } from '../ui';
import { getElementDisplayName } from '@/lib/element-factory';
import type { ElementNode } from '@/types';

export function ElementSettingsPanel() {
  const { selectedElementId, elements, updateElement, saveHistory } = useEditorStore();
  
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

  // Update prop
  const updateProp = useCallback((key: string, value: any) => {
    if (!element) return;
    
    updateElement(element.id, {
      props: {
        ...element.props,
        [key]: value,
      },
    });
  }, [element, updateElement]);

  const commitChanges = useCallback(() => {
    saveHistory();
  }, [saveHistory]);

  if (!element) {
    return (
      <div className="text-center py-8 px-4">
        <Type size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-body-md text-gray-500">Select an element to edit its settings</p>
      </div>
    );
  }

  // Render settings based on element type
  const renderSettings = () => {
    switch (element.type) {
      case 'text':
      case 'paragraph':
        return <TextSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'heading':
        return <HeadingSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'button':
        return <ButtonSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'image':
        return <ImageSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'link':
        return <LinkSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'spacer':
        return <SpacerSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'input':
        return <InputSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'textarea':
        return <TextareaSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'select':
        return <SelectSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'navbar':
        return <NavbarSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'hero':
        return <HeroSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'footer':
        return <FooterSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'card':
        return <CardSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'grid':
        return <GridSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      case 'columns':
        return <ColumnsSettings element={element} updateProp={updateProp} onBlur={commitChanges} />;
      
      default:
        return (
          <div className="text-center py-8 px-4">
            <p className="text-body-md text-gray-500">
              No settings available for {getElementDisplayName(element.type)}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
      {/* Element Info */}
      <div className="p-4 border-b border-outline-light dark:border-outline-dark">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 text-label-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary rounded-full">
            {getElementDisplayName(element.type)}
          </span>
        </div>
        <div className="text-body-sm text-gray-500">
          ID: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">{element.id}</code>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4">
        {renderSettings()}
      </div>

      {/* Custom ID & Classes */}
      <div className="p-4 border-t border-outline-light dark:border-outline-dark">
        <SettingsSection title="Advanced" defaultOpen={false}>
          <div className="space-y-3">
            <div>
              <label className="text-label-sm text-gray-500 mb-1 block">Custom ID</label>
              <input
                type="text"
                value={element.customId || ''}
                placeholder="my-element-id"
                onChange={(e) => updateElement(element.id, { customId: e.target.value })}
                onBlur={commitChanges}
                className="input py-2 text-body-sm"
              />
            </div>
            <div>
              <label className="text-label-sm text-gray-500 mb-1 block">Custom Classes</label>
              <input
                type="text"
                value={element.customClasses?.join(' ') || ''}
                placeholder="class1 class2"
                onChange={(e) => updateElement(element.id, { customClasses: e.target.value.split(' ').filter(Boolean) })}
                onBlur={commitChanges}
                className="input py-2 text-body-sm"
              />
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

// Section wrapper
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SettingsSection({ title, children, defaultOpen = true }: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 text-label-md font-medium text-gray-700 dark:text-gray-300"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && children}
    </div>
  );
}

// Props for element settings components
interface ElementSettingsProps {
  element: ElementNode;
  updateProp: (key: string, value: any) => void;
  onBlur: () => void;
}

// Text Settings
function TextSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Content</label>
        <textarea
          value={element.props.content || ''}
          onChange={(e) => updateProp('content', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm min-h-[100px] resize-y"
          placeholder="Enter your text..."
        />
      </div>
    </div>
  );
}

// Heading Settings
function HeadingSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Heading Text</label>
        <input
          type="text"
          value={element.props.content || ''}
          onChange={(e) => updateProp('content', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Heading text"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-2 block">Level</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => {
                updateProp('tag', `h${level}`);
                updateProp('level', level);
                onBlur();
              }}
              className={cn(
                'flex-1 py-2 rounded-material-sm font-medium',
                'border border-outline-light dark:border-outline-dark',
                'transition-colors',
                element.props.level === level || element.props.tag === `h${level}`
                  ? 'bg-primary text-white border-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              H{level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Button Settings
function ButtonSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Button Text</label>
        <input
          type="text"
          value={element.props.text || ''}
          onChange={(e) => updateProp('text', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Button text"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Link URL</label>
        <input
          type="text"
          value={element.props.href || ''}
          onChange={(e) => updateProp('href', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Open In</label>
        <select
          value={element.props.target || '_self'}
          onChange={(e) => {
            updateProp('target', e.target.value);
            onBlur();
          }}
          className="input py-2 text-body-sm"
        >
          <option value="_self">Same window</option>
          <option value="_blank">New tab</option>
        </select>
      </div>
    </div>
  );
}

// Image Settings
function ImageSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Image URL</label>
        <input
          type="text"
          value={element.props.src || ''}
          onChange={(e) => updateProp('src', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Alt Text</label>
        <input
          type="text"
          value={element.props.alt || ''}
          onChange={(e) => updateProp('alt', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Image description"
        />
      </div>
      <Button variant="secondary" size="sm" className="w-full justify-center">
        <Image size={16} />
        Upload Image
      </Button>
    </div>
  );
}

// Link Settings
function LinkSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Link Text</label>
        <input
          type="text"
          value={element.props.text || ''}
          onChange={(e) => updateProp('text', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Click here"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">URL</label>
        <input
          type="text"
          value={element.props.href || ''}
          onChange={(e) => updateProp('href', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Open In</label>
        <select
          value={element.props.target || '_self'}
          onChange={(e) => {
            updateProp('target', e.target.value);
            onBlur();
          }}
          className="input py-2 text-body-sm"
        >
          <option value="_self">Same window</option>
          <option value="_blank">New tab</option>
        </select>
      </div>
    </div>
  );
}

// Spacer Settings
function SpacerSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Height</label>
        <input
          type="text"
          value={element.props.height || '40px'}
          onChange={(e) => updateProp('height', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="40px"
        />
      </div>
    </div>
  );
}

// Input Settings
function InputSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Type</label>
        <select
          value={element.props.type || 'text'}
          onChange={(e) => {
            updateProp('type', e.target.value);
            onBlur();
          }}
          className="input py-2 text-body-sm"
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="password">Password</option>
          <option value="number">Number</option>
          <option value="tel">Phone</option>
          <option value="url">URL</option>
        </select>
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Placeholder</label>
        <input
          type="text"
          value={element.props.placeholder || ''}
          onChange={(e) => updateProp('placeholder', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Enter placeholder text"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Name</label>
        <input
          type="text"
          value={element.props.name || ''}
          onChange={(e) => updateProp('name', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="field_name"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={element.props.required || false}
          onChange={(e) => {
            updateProp('required', e.target.checked);
            onBlur();
          }}
          className="w-4 h-4 rounded"
        />
        <span className="text-body-sm">Required</span>
      </label>
    </div>
  );
}

// Textarea Settings
function TextareaSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Placeholder</label>
        <input
          type="text"
          value={element.props.placeholder || ''}
          onChange={(e) => updateProp('placeholder', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Enter placeholder text"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Rows</label>
        <input
          type="number"
          value={element.props.rows || 4}
          onChange={(e) => updateProp('rows', parseInt(e.target.value))}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          min={2}
          max={20}
        />
      </div>
    </div>
  );
}

// Select Settings
function SelectSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  const options = element.props.options || [];

  const addOption = () => {
    updateProp('options', [...options, { label: `Option ${options.length + 1}`, value: `option${options.length + 1}` }]);
    onBlur();
  };

  const removeOption = (index: number) => {
    updateProp('options', options.filter((_: any, i: number) => i !== index));
    onBlur();
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateProp('options', newOptions);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Placeholder</label>
        <input
          type="text"
          value={element.props.placeholder || ''}
          onChange={(e) => updateProp('placeholder', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Select an option"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-2 block">Options</label>
        <div className="space-y-2">
          {options.map((opt: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => updateOption(i, 'label', e.target.value)}
                onBlur={onBlur}
                className="input py-1.5 text-body-sm flex-1"
                placeholder="Label"
              />
              <button
                onClick={() => removeOption(i)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2" onClick={addOption}>
          <Plus size={14} />
          Add Option
        </Button>
      </div>
    </div>
  );
}

// Navbar Settings
function NavbarSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  const links = element.props.links || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Logo Text</label>
        <input
          type="text"
          value={element.props.logoText || ''}
          onChange={(e) => updateProp('logoText', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Logo"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">CTA Button Text</label>
        <input
          type="text"
          value={element.props.ctaText || ''}
          onChange={(e) => updateProp('ctaText', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Get Started"
        />
      </div>
      <SettingsSection title="Navigation Links">
        <div className="space-y-2">
          {links.map((link: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => {
                  const newLinks = [...links];
                  newLinks[i] = { ...link, label: e.target.value };
                  updateProp('links', newLinks);
                }}
                onBlur={onBlur}
                className="input py-1.5 text-body-sm flex-1"
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

// Hero Settings
function HeroSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Title</label>
        <input
          type="text"
          value={element.props.title || ''}
          onChange={(e) => updateProp('title', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Hero Title"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Subtitle</label>
        <textarea
          value={element.props.subtitle || ''}
          onChange={(e) => updateProp('subtitle', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm min-h-[80px]"
          placeholder="Hero subtitle..."
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Primary Button Text</label>
        <input
          type="text"
          value={element.props.ctaText || ''}
          onChange={(e) => updateProp('ctaText', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Get Started"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Secondary Button Text</label>
        <input
          type="text"
          value={element.props.secondaryCtaText || ''}
          onChange={(e) => updateProp('secondaryCtaText', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Learn More (optional)"
        />
      </div>
    </div>
  );
}

// Footer Settings
function FooterSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Company Name</label>
        <input
          type="text"
          value={element.props.companyName || ''}
          onChange={(e) => updateProp('companyName', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Company Name"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Copyright Text</label>
        <input
          type="text"
          value={element.props.copyright || ''}
          onChange={(e) => updateProp('copyright', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="© 2024 All rights reserved."
        />
      </div>
    </div>
  );
}

// Card Settings
function CardSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Title</label>
        <input
          type="text"
          value={element.props.title || ''}
          onChange={(e) => updateProp('title', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="Card Title"
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Description</label>
        <textarea
          value={element.props.description || ''}
          onChange={(e) => updateProp('description', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm min-h-[80px]"
          placeholder="Card description..."
        />
      </div>
    </div>
  );
}

// Grid Settings
function GridSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Columns</label>
        <input
          type="number"
          value={element.props.columns || 3}
          onChange={(e) => updateProp('columns', parseInt(e.target.value))}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          min={1}
          max={12}
        />
      </div>
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Gap</label>
        <input
          type="text"
          value={element.props.gap || '24px'}
          onChange={(e) => updateProp('gap', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="24px"
        />
      </div>
    </div>
  );
}

// Columns Settings
function ColumnsSettings({ element, updateProp, onBlur }: ElementSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label-sm text-gray-500 mb-1 block">Gap</label>
        <input
          type="text"
          value={element.props.gap || '24px'}
          onChange={(e) => updateProp('gap', e.target.value)}
          onBlur={onBlur}
          className="input py-2 text-body-sm"
          placeholder="24px"
        />
      </div>
    </div>
  );
}

