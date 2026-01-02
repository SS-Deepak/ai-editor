'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconRail } from './icon-rail';
import { DetailPanel } from './detail-panel';

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);

  const toggleDetailPanel = () => {
    setIsDetailCollapsed(!isDetailCollapsed);
  };

  return (
    <div className={cn('h-full flex', className)}>
      {/* Icon Rail - Always visible */}
      <IconRail 
        onToggleCollapse={toggleDetailPanel}
        isCollapsed={isDetailCollapsed}
      />

      {/* Detail Panel - Collapsible */}
      <div
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300 ease-material-standard',
          isDetailCollapsed ? 'w-0 opacity-0' : 'w-[232px] opacity-100'
        )}
      >
        <DetailPanel />
      </div>
    </div>
  );
}
