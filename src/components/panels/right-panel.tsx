'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Paintbrush, Settings, Sparkles, Trash2, Copy, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { StylePanel } from './style-panel';
import { ElementSettingsPanel } from './element-settings-panel';
import { AnimationPanel } from './animation-panel';
import { cn } from '@/lib/utils';
import { Button } from '../ui';
import { getElementDisplayName } from '@/lib/element-factory';
import type { ElementNode } from '@/types';

type TabId = 'style' | 'settings' | 'animation';

export function RightPanel() {
  const { selectedElementId, elements, updateElement, deleteElement, duplicateElement, saveHistory } = useEditorStore();
  const [activeTab, setActiveTab] = useState<TabId>('settings');

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

  if (!selectedElementId || !element) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Paintbrush size={24} className="text-gray-400" />
        </div>
        <h3 className="text-title-md text-on-surface-light dark:text-on-surface-dark">
          No element selected
        </h3>
        <p className="text-body-md text-gray-500 mt-2">
          Click on an element in the canvas to edit its properties and styles
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteElement(element.id);
    saveHistory();
  };

  const handleDuplicate = () => {
    duplicateElement(element.id);
    saveHistory();
  };

  const handleToggleLock = () => {
    updateElement(element.id, { isLocked: !element.isLocked });
    saveHistory();
  };

  const handleToggleVisibility = () => {
    updateElement(element.id, { isHidden: !element.isHidden });
    saveHistory();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with element info */}
      <div className="flex-shrink-0 p-3 border-b border-outline-light dark:border-outline-dark">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 text-label-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary rounded-full">
            {getElementDisplayName(element.type)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleVisibility}
              title={element.isHidden ? 'Show' : 'Hide'}
              className={cn(
                'p-1.5 rounded transition-colors',
                element.isHidden 
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
              )}
            >
              {element.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={handleToggleLock}
              title={element.isLocked ? 'Unlock' : 'Lock'}
              className={cn(
                'p-1.5 rounded transition-colors',
                element.isLocked 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
              )}
            >
              {element.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={handleDuplicate}
              title="Duplicate"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-3 pt-2 border-b border-outline-light dark:border-outline-dark">
        <div className="flex gap-1">
          <TabButton
            id="settings"
            icon={<Settings size={14} />}
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <TabButton
            id="style"
            icon={<Paintbrush size={14} />}
            label="Style"
            isActive={activeTab === 'style'}
            onClick={() => setActiveTab('style')}
          />
          <TabButton
            id="animation"
            icon={<Sparkles size={14} />}
            label="Animate"
            isActive={activeTab === 'animation'}
            onClick={() => setActiveTab('animation')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'settings' && <ElementSettingsPanel />}
        {activeTab === 'style' && <StylePanel />}
        {activeTab === 'animation' && <AnimationPanel />}
      </div>
    </div>
  );
}

interface TabButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ id, icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-label-md font-medium rounded-t-lg transition-colors',
        isActive
          ? 'bg-white dark:bg-surface-dark text-primary border-t border-x border-outline-light dark:border-outline-dark -mb-px'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
