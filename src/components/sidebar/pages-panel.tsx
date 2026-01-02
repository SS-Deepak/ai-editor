'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Home, 
  MoreVertical, 
  Copy, 
  Trash2,
  Settings,
  GripVertical,
  Eye,
  EyeOff,
  ChevronRight,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button, IconButton, Input } from '../ui';
import { cn } from '@/lib/utils';
import { usePagesStore, type PageListItem } from '@/store/pages-store';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { PageSettingsModal } from '../modals/page-settings-modal';

export function PagesPanel() {
  const { 
    pages, 
    selectedPageId, 
    isLoading, 
    loadPages, 
    selectPage, 
    createPage, 
    deletePage,
    duplicatePage,
    togglePublishStatus,
  } = usePagesStore();
  const { projectId, setPage } = useEditorStore();
  const { showToast } = useUIStore();
  
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPage, setSettingsPage] = useState<PageListItem | null>(null);
  const [contextMenuPage, setContextMenuPage] = useState<string | null>(null);
  
  // New page form
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Load pages on mount
  useEffect(() => {
    if (projectId) {
      loadPages(projectId);
    }
  }, [projectId, loadPages]);

  // Auto-generate slug from name
  useEffect(() => {
    if (newPageName && !newPageSlug) {
      setNewPageSlug(newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [newPageName, newPageSlug]);

  const handleSelectPage = (pageId: string) => {
    selectPage(pageId);
    setPage(pageId);
    setContextMenuPage(null);
  };

  const handleOpenSettings = (page: PageListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSettingsPage(page);
    setShowSettingsModal(true);
    setContextMenuPage(null);
  };

  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      showToast({ type: 'error', message: 'Please enter a page name' });
      return;
    }
    
    const page = await createPage(projectId || 'project_demo', newPageName, newPageSlug);
    if (page) {
      showToast({ type: 'success', message: `Created "${page.name}"` });
      setShowCreateModal(false);
      setNewPageName('');
      setNewPageSlug('');
      // Select the new page
      handleSelectPage(page.id);
    }
  };

  const handleDuplicatePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPage = await duplicatePage(pageId);
    if (newPage) {
      showToast({ type: 'success', message: `Created "${newPage.name}"` });
    }
    setContextMenuPage(null);
  };

  const handleDeletePage = (page: PageListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (page.isHome) {
      showToast({ type: 'error', message: 'Cannot delete the home page' });
      return;
    }
    deletePage(page.id);
    showToast({ type: 'success', message: 'Page deleted' });
    setContextMenuPage(null);
  };

  const handleTogglePublish = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePublishStatus(pageId);
    setContextMenuPage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-2 h-full flex flex-col">
      {/* Add Page Button */}
      <Button 
        size="sm" 
        variant="secondary" 
        className="w-full justify-center mb-2 flex-shrink-0 text-[11px] py-1.5"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus size={14} />
        New Page
      </Button>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length > 0 ? (
          pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                'group relative flex items-center gap-1.5 px-1.5 py-1.5 rounded-md cursor-pointer',
                'transition-colors duration-150',
                selectedPageId === page.id
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => handleSelectPage(page.id)}
              onMouseEnter={() => setHoveredPage(page.id)}
              onMouseLeave={() => {
                setHoveredPage(null);
                if (contextMenuPage === page.id) setContextMenuPage(null);
              }}
            >
              {/* Drag Handle */}
              <GripVertical
                size={12}
                className={cn(
                  'text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0',
                  selectedPageId === page.id && 'opacity-100'
                )}
              />

              {/* Icon */}
              {page.isHome ? (
                <Home size={12} className="flex-shrink-0 text-amber-500" />
              ) : (
                <FileText size={12} className="flex-shrink-0 text-gray-400" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span className={cn(
                  'text-[12px] truncate',
                  selectedPageId === page.id 
                    ? 'text-primary dark:text-primary-light font-medium' 
                    : 'text-on-surface-light dark:text-on-surface-dark'
                )}>
                  {page.name}
                </span>
                {page.status === 'draft' && (
                  <span className="flex-shrink-0 text-[9px] px-1 py-px bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                    Draft
                  </span>
                )}
              </div>

              {/* Actions */}
              <div
                className={cn(
                  'flex items-center flex-shrink-0',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  selectedPageId === page.id && 'opacity-100'
                )}
              >
                <button
                  onClick={(e) => handleOpenSettings(page, e)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Page Settings"
                >
                  <Settings size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuPage(contextMenuPage === page.id ? null : page.id);
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <MoreVertical size={12} />
                </button>
              </div>

              {/* Context Menu */}
              {contextMenuPage === page.id && (
                <div 
                  className="absolute right-0 top-full mt-1 z-50 w-40 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleOpenSettings(page, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Settings size={12} />
                    Settings
                  </button>
                  <button
                    onClick={(e) => handleTogglePublish(page.id, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {page.status === 'published' ? (
                      <>
                        <EyeOff size={12} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={12} />
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ExternalLink size={12} />
                    Preview
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={(e) => handleDuplicatePage(page.id, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                  {!page.isHome && (
                    <>
                      <div className="border-t border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={(e) => handleDeletePage(page, e)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <FileText size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-[11px] text-gray-500">No pages yet</p>
            <Button size="sm" className="mt-2 text-[11px]" onClick={() => setShowCreateModal(true)}>
              <Plus size={12} />
              Create page
            </Button>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md m-4 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-light dark:border-outline-dark">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-title-lg font-semibold">Create New Page</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-label-md font-medium mb-2">
                  Page Name
                </label>
                <Input
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="e.g., About Us, Contact, Services"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-label-md font-medium mb-2">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg text-gray-500 text-body-sm border border-r-0 border-gray-200 dark:border-gray-700">
                    /
                  </span>
                  <Input
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    placeholder="page-url"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-body-sm text-gray-500 mt-1.5">
                  URL: yourdomain.com/{newPageSlug || 'page-url'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePage}>
                <Check size={16} />
                Create Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Settings Modal */}
      {settingsPage && (
        <PageSettingsModal
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setSettingsPage(null);
          }}
          page={settingsPage}
        />
      )}
    </div>
  );
}
