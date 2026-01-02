'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useLayoutsStore, LAYOUT_CATEGORIES } from '@/store/layouts-store';
import { cn } from '@/lib/utils';
import { Button, Input, Tooltip } from '../ui';
import type { ComponentLayout, ComponentLayoutCategory, ExposedProp } from '@/types';

interface LayoutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout?: ComponentLayout | null;
}

export function LayoutEditModal({ isOpen, onClose, layout }: LayoutEditModalProps) {
  const { createLayout, updateLayout } = useLayoutsStore();
  const isEditing = !!layout;

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: ComponentLayoutCategory;
    tags: string[];
    isPublished: boolean;
  }>({
    name: '',
    description: '',
    category: 'buttons',
    tags: [],
    isPublished: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (layout) {
      setFormData({
        name: layout.name,
        description: layout.description || '',
        category: layout.category,
        tags: layout.tags || [],
        isPublished: layout.isPublished,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'buttons',
        tags: [],
        isPublished: false,
      });
    }
  }, [layout, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateLayout(layout.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          isPublished: formData.isPublished,
        });
      } else {
        await createLayout({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          isPublished: formData.isPublished,
          createdBy: 'admin',
          elements: [],
          exposedProps: [],
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-light dark:border-outline-dark">
          <h2 className="text-title-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
            {isEditing ? 'Edit Layout' : 'Create New Layout'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-label-md font-medium text-on-surface-light dark:text-on-surface-dark mb-1.5">
              Layout Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Primary Button, Hero Section"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-label-md font-medium text-on-surface-light dark:text-on-surface-dark mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this layout..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-material',
                'border border-outline-light dark:border-outline-dark',
                'bg-white dark:bg-surface-dark',
                'text-on-surface-light dark:text-on-surface-dark',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'resize-none'
              )}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-label-md font-medium text-on-surface-light dark:text-on-surface-dark mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as ComponentLayoutCategory }))}
              className={cn(
                'w-full px-3 py-2.5 rounded-material',
                'border border-outline-light dark:border-outline-dark',
                'bg-white dark:bg-surface-dark',
                'text-on-surface-light dark:text-on-surface-dark',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              )}
            >
              {LAYOUT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-label-md font-medium text-on-surface-light dark:text-on-surface-dark mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                <Plus size={16} />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-label-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="sr-only peer"
              />
              <div className={cn(
                'w-11 h-6 rounded-full',
                'bg-gray-200 dark:bg-gray-700',
                'peer-checked:bg-primary',
                'after:content-[""]',
                'after:absolute after:top-0.5 after:left-0.5',
                'after:bg-white after:rounded-full after:h-5 after:w-5',
                'after:transition-all',
                'peer-checked:after:translate-x-5'
              )} />
            </label>
            <span className="text-label-md text-on-surface-light dark:text-on-surface-dark">
              {formData.isPublished ? 'Published (visible to all users)' : 'Draft (admin only)'}
            </span>
          </div>

          {/* Info about elements */}
          {!isEditing && (
            <div className="p-3 rounded-material bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-body-sm text-blue-700 dark:text-blue-400">
                <strong>Tip:</strong> After creating the layout, select elements on the canvas and use "Save as Layout" to add them to this layout.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditing ? 'Save Changes' : 'Create Layout'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

