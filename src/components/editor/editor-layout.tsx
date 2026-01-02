'use client';

import { Suspense } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { HeaderBar } from './header-bar';
import { LeftSidebar } from '../sidebar/left-sidebar';
import { Canvas } from './canvas';
import { RightPanel } from '../panels/right-panel';
import { CanvasSkeleton } from '../ui/skeleton';
import { KeyboardShortcuts } from './keyboard-shortcuts';
import { SiteFontsLoader } from './site-fonts-loader';
import { cn } from '@/lib/utils';

export function EditorLayout() {
  const { leftPanelOpen, rightPanelOpen, selectedElementId } = useEditorStore();

  return (
    <div className="h-screen flex flex-col bg-surface-light dark:bg-[#0f0f0f] overflow-hidden">
      {/* Load site fonts */}
      <SiteFontsLoader />
      
      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts />
      
      {/* Header */}
      <HeaderBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Split Design (Icon Rail + Detail Panel) */}
        <aside
          className={cn(
            'flex-shrink-0',
            'transition-all duration-300 ease-material-standard',
            !leftPanelOpen && '-ml-[290px]'
          )}
        >
          <LeftSidebar />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
          <Suspense fallback={<CanvasSkeleton />}>
            <Canvas />
          </Suspense>
        </main>

        {/* Right Panel */}
        <aside
          className={cn(
            'w-[320px] flex-shrink-0 panel border-l',
            'transition-all duration-300 ease-material-standard',
            !rightPanelOpen && 'mr-[-320px]',
            !selectedElementId && 'opacity-50'
          )}
        >
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}

