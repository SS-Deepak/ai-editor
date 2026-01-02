'use client';

import {
  FileText,
  Plus,
  LayoutGrid,
  Layers,
  Image,
  Settings,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useAuthStore, useIsAdmin } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { Tooltip } from '../ui';
import type { SidebarPanel } from '@/types';

interface IconRailProps {
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

const mainPanels: { id: SidebarPanel; icon: typeof FileText; label: string }[] = [
  { id: 'pages', icon: FileText, label: 'Pages' },
  { id: 'elements', icon: Plus, label: 'Elements' },
  { id: 'layouts', icon: LayoutGrid, label: 'Layouts' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'assets', icon: Image, label: 'Assets' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function IconRail({ onToggleCollapse, isCollapsed }: IconRailProps) {
  const { activePanel, setActivePanel } = useEditorStore();
  const { user, logout } = useAuthStore();
  const isAdmin = useIsAdmin();

  return (
    <div className="h-full w-14 flex flex-col bg-surface-variant-light dark:bg-surface-variant-dark border-r border-outline-light dark:border-outline-dark">
      {/* User Avatar / Role Indicator */}
      <div className="p-2 border-b border-outline-light dark:border-outline-dark">
        <Tooltip content={user ? `${user.name} (${user.role})` : 'Not logged in'} position="right">
          <button
            onClick={() => setActivePanel('settings')}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'transition-all duration-200',
              isAdmin
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                : 'bg-gradient-to-br from-primary to-primary-light text-white',
              'hover:scale-105 hover:shadow-material-2'
            )}
          >
            {isAdmin ? <Shield size={18} /> : <User size={18} />}
          </button>
        </Tooltip>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-2 flex flex-col items-center gap-1">
        {mainPanels.map(({ id, icon: Icon, label }) => (
          <Tooltip key={id} content={label} position="right">
            <button
              onClick={() => setActivePanel(id)}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                'transition-all duration-200',
                activePanel === id
                  ? 'bg-primary text-white shadow-material-1'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-on-surface-light dark:hover:text-on-surface-dark'
              )}
            >
              <Icon size={20} />
            </button>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-outline-light dark:border-outline-dark flex flex-col items-center gap-1">
        {/* Collapse Toggle */}
        <Tooltip content={isCollapsed ? 'Expand panel' : 'Collapse panel'} position="right">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-all duration-200'
            )}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </Tooltip>

        {/* Logout */}
        {user && (
          <Tooltip content="Switch user" position="right">
            <button
              onClick={logout}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                'text-gray-500 dark:text-gray-400',
                'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500',
                'transition-all duration-200'
              )}
            >
              <LogOut size={18} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

