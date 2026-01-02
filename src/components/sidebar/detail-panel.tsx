'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Input } from '../ui';
import { PagesPanel } from './pages-panel';
import { ElementsPanel } from './elements-panel';
import { LayoutsPanel } from './layouts-panel';
import { LayersPanel } from './layers-panel';
import { AssetsPanel } from './assets-panel';
import { SettingsPanel } from './settings-panel';
import type { SidebarPanel } from '@/types';

const panelTitles: Record<SidebarPanel, string> = {
  pages: 'Pages',
  elements: 'Elements',
  layouts: 'Layouts',
  layers: 'Layers',
  assets: 'Assets',
  settings: 'Settings',
};

const searchablePanels: SidebarPanel[] = ['elements', 'layouts', 'assets', 'layers'];

interface DetailPanelProps {
  className?: string;
}

export function DetailPanel({ className }: DetailPanelProps) {
  const { activePanel } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const showSearch = searchablePanels.includes(activePanel);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={cn('h-full flex flex-col bg-white dark:bg-surface-dark', className)}>
      {/* Panel Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-outline-light dark:border-outline-dark">
        <h2 className="text-title-md font-semibold text-on-surface-light dark:text-on-surface-dark">
          {panelTitles[activePanel]}
        </h2>
      </div>

      {/* Search Bar (conditional) */}
      {showSearch && (
        <div className="flex-shrink-0 p-3 border-b border-outline-light dark:border-outline-dark">
          <div className="relative">
            <Input
              placeholder={`Search ${panelTitles[activePanel].toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              icon={<Search size={16} className={cn(isSearchFocused && 'text-primary')} />}
              className="py-2 pr-8"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activePanel === 'pages' && <PagesPanel />}
        {activePanel === 'elements' && <ElementsPanel searchQuery={searchQuery} />}
        {activePanel === 'layouts' && <LayoutsPanel searchQuery={searchQuery} />}
        {activePanel === 'layers' && <LayersPanel searchQuery={searchQuery} />}
        {activePanel === 'assets' && <AssetsPanel searchQuery={searchQuery} />}
        {activePanel === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

