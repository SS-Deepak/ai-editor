'use client';

import { useState } from 'react';
import {
  Menu,
  Save,
  Eye,
  Upload,
  Undo2,
  Redo2,
  Smartphone,
  Tablet,
  Monitor,
  MonitorPlay,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Loader2,
  User,
  Shield,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore, useIsAdmin } from '@/store/auth-store';
import { Button, IconButton, Tooltip } from '../ui';
import { ThemeSelector } from '../ui/theme-selector';
import { cn } from '@/lib/utils';

const devices = [
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: 375 },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: 768 },
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: 1024 },
  { id: 'wide', icon: MonitorPlay, label: 'Wide', width: 1440 },
] as const;

export function HeaderBar() {
  const { device, setDevice, zoom, setZoom, toggleLeftPanel, toggleRightPanel, undo, redo, history, historyIndex } = useEditorStore();
  const { isSaving, hasUnsavedChanges } = useUIStore();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const [showPageMenu, setShowPageMenu] = useState(false);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = () => {
    // TODO: Implement save
    console.log('Save');
  };

  const handlePreview = () => {
    // TODO: Implement preview
    console.log('Preview');
  };

  const handlePublish = () => {
    // TODO: Implement publish
    console.log('Publish');
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-surface-dark border-b border-outline-light dark:border-outline-dark">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Menu Toggle */}
        <IconButton onClick={toggleLeftPanel} tooltip="Toggle sidebar">
          <Menu size={20} />
        </IconButton>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-material bg-gradient-to-r from-[#492cdd] to-[#ad38e2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-on-surface-light dark:text-on-surface-dark hidden sm:block">
            Editor
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-light dark:bg-outline-dark" />

        {/* Page Selector */}
        <button
          onClick={() => setShowPageMenu(!showPageMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-material-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-body-md text-on-surface-light dark:text-on-surface-dark">
            Home
          </span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Center Section - Toolbar */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <Tooltip content="Undo (Ctrl+Z)">
            <IconButton 
              size="sm" 
              onClick={undo}
              disabled={!canUndo}
              className={cn(!canUndo && 'opacity-40 cursor-not-allowed')}
            >
              <Undo2 size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Shift+Z)">
            <IconButton 
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className={cn(!canRedo && 'opacity-40 cursor-not-allowed')}
            >
              <Redo2 size={18} />
            </IconButton>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-light dark:bg-outline-dark" />

        {/* Device Toggle */}
        <div className="flex items-center gap-1 px-2">
          {devices.map(({ id, icon: Icon, label, width }) => (
            <Tooltip key={id} content={`${label} (${width}px)`}>
              <IconButton
                size="sm"
                variant={device === id ? 'primary' : 'default'}
                active={device === id}
                onClick={() => setDevice(id)}
              >
                <Icon size={18} />
              </IconButton>
            </Tooltip>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-light dark:bg-outline-dark" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip content="Zoom out">
            <IconButton size="sm" onClick={() => setZoom(zoom - 10)}>
              <ZoomOut size={18} />
            </IconButton>
          </Tooltip>
          <span className="w-12 text-center text-body-sm text-gray-600 dark:text-gray-400">
            {zoom}%
          </span>
          <Tooltip content="Zoom in">
            <IconButton size="sm" onClick={() => setZoom(zoom + 10)}>
              <ZoomIn size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* User Badge */}
        {user && (
          <Tooltip content={`Logged in as ${user.name}`}>
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              isAdmin 
                ? 'bg-amber-100 dark:bg-amber-900/30' 
                : 'bg-primary-50 dark:bg-primary-900/30'
            )}>
              {isAdmin ? (
                <Shield size={14} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <User size={14} className="text-primary dark:text-primary-300" />
              )}
              <span className={cn(
                'text-label-sm font-medium',
                isAdmin 
                  ? 'text-amber-700 dark:text-amber-400' 
                  : 'text-primary dark:text-primary-300'
              )}>
                {isAdmin ? 'Admin' : user.name.split(' ')[0]}
              </span>
            </div>
          </Tooltip>
        )}

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Divider */}
        <div className="w-px h-6 bg-outline-light dark:bg-outline-dark" />

        {/* Save Status */}
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="flex items-center gap-2 text-body-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-body-sm text-amber-500">Unsaved changes</span>
          ) : (
            <span className="text-body-sm text-green-500">Saved</span>
          )}
        </div>

        {/* Action Buttons */}
        <Tooltip content="Save (Ctrl+S)">
          <Button variant="secondary" size="sm" onClick={handleSave}>
            <Save size={16} />
            Save
          </Button>
        </Tooltip>

        <Tooltip content="Preview">
          <Button variant="ghost" size="sm" onClick={handlePreview}>
            <Eye size={16} />
            Preview
          </Button>
        </Tooltip>

        <Button size="sm" onClick={handlePublish}>
          <Upload size={16} />
          Publish
        </Button>

        {/* Right Panel Toggle */}
        <IconButton onClick={toggleRightPanel} tooltip="Toggle style panel">
          <Menu size={20} className="rotate-180" />
        </IconButton>
      </div>
    </header>
  );
}

