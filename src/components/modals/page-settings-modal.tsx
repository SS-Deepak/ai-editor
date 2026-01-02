'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Home,
  FileText,
  Search,
  Image,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '../ui';
import { usePagesStore, type PageListItem } from '@/store/pages-store';
import { useUIStore } from '@/store/ui-store';

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageListItem;
}

type SettingsTab = 'general' | 'seo' | 'advanced';

export function PageSettingsModal({ isOpen, onClose, page }: PageSettingsModalProps) {
  const { updatePage, setAsHomePage, togglePublishStatus, deletePage, duplicatePage } = usePagesStore();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when page changes
  useEffect(() => {
    setName(page.name);
    setSlug(page.slug);
    setShowDeleteConfirm(false);
  }, [page]);

  const handleSave = () => {
    updatePage(page.id, {
      name,
      slug: page.isHome ? '' : slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
    showToast({ type: 'success', message: 'Page settings saved' });
    onClose();
  };

  const handleSetAsHome = () => {
    setAsHomePage(page.id);
    showToast({ type: 'success', message: `"${page.name}" is now the home page` });
  };

  const handleTogglePublish = () => {
    togglePublishStatus(page.id);
    showToast({ 
      type: 'success', 
      message: page.status === 'published' ? 'Page unpublished' : 'Page published' 
    });
  };

  const handleDuplicate = async () => {
    const newPage = await duplicatePage(page.id);
    if (newPage) {
      showToast({ type: 'success', message: `Created "${newPage.name}"` });
      onClose();
    }
  };

  const handleDelete = () => {
    if (page.isHome) {
      showToast({ type: 'error', message: 'Cannot delete the home page' });
      return;
    }
    deletePage(page.id);
    showToast({ type: 'success', message: 'Page deleted' });
    onClose();
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <FileText size={16} /> },
    { id: 'seo', label: 'SEO', icon: <Search size={16} /> },
    { id: 'advanced', label: 'Advanced', icon: <Globe size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex flex-col w-full max-w-lg max-h-[85vh] m-4 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-light dark:border-outline-dark">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              page.isHome 
                ? 'bg-amber-100 dark:bg-amber-900/30' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            )}>
              {page.isHome ? (
                <Home size={20} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-title-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                Page Settings
              </h2>
              <p className="text-body-sm text-gray-500">{page.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-outline-light dark:border-outline-dark">
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-gray-500">Status:</span>
            <button
              onClick={handleTogglePublish}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-medium transition-colors',
                page.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {page.status === 'published' ? (
                <>
                  <Eye size={14} />
                  Published
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  Draft
                </>
              )}
            </button>
          </div>
          {page.isHome && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-label-sm font-medium">
              <Home size={14} />
              Home Page
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-light dark:border-outline-dark">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-body-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Page Name */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  Page Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  URL Slug
                </label>
                {page.isHome ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                    <Home size={16} />
                    <span className="text-body-sm">Home page uses root URL (/)</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg text-gray-500 text-body-sm border border-r-0 border-gray-200 dark:border-gray-700">
                      /
                    </span>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="page-url"
                      className="rounded-l-none"
                    />
                  </div>
                )}
                <p className="text-body-sm text-gray-500 mt-1.5">
                  URL: yourdomain.com/{page.isHome ? '' : slug || 'page-url'}
                </p>
              </div>

              {/* Set as Home */}
              {!page.isHome && (
                <div className="pt-2">
                  <button
                    onClick={handleSetAsHome}
                    className="flex items-center gap-2 px-4 py-2.5 w-full rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Home size={18} className="text-amber-500" />
                    <span className="text-body-md">Set as Home Page</span>
                  </button>
                  <p className="text-body-sm text-gray-500 mt-1.5">
                    Make this the default page visitors see
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-5">
              {/* SEO Title */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  SEO Title
                </label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Page title for search engines"
                />
                <p className="text-body-sm text-gray-500 mt-1.5">
                  Recommended: 50-60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  Meta Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description for search results"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-body-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-body-sm text-gray-500 mt-1.5">
                  Recommended: 150-160 characters ({seoDescription.length}/160)
                </p>
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  Social Share Image (OG Image)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button variant="secondary" size="sm">
                    <Image size={16} />
                    Browse
                  </Button>
                </div>
                <p className="text-body-sm text-gray-500 mt-1.5">
                  Recommended size: 1200 x 630 pixels
                </p>
              </div>

              {/* No Index */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <label htmlFor="noIndex" className="text-body-md font-medium cursor-pointer">
                    Hide from search engines
                  </label>
                  <p className="text-body-sm text-gray-500 mt-0.5">
                    Adds noindex meta tag to prevent this page from appearing in search results
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-label-md font-medium mb-2">
                  Search Result Preview
                </label>
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
                    {seoTitle || name || 'Page Title'}
                  </div>
                  <div className="text-green-700 dark:text-green-500 text-sm mt-1">
                    yourdomain.com/{page.isHome ? '' : slug || 'page-url'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                    {seoDescription || 'Add a meta description to see how it appears in search results...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-5">
              {/* Page Actions */}
              <div>
                <label className="block text-label-md font-medium mb-3">
                  Page Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Copy size={18} className="text-blue-500" />
                    <div className="text-left">
                      <div className="text-body-md font-medium">Duplicate Page</div>
                      <div className="text-body-sm text-gray-500">Create a copy of this page</div>
                    </div>
                  </button>

                  <button
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink size={18} className="text-gray-500" />
                    <div className="text-left">
                      <div className="text-body-md font-medium">Preview Page</div>
                      <div className="text-body-sm text-gray-500">Open page in a new tab</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-label-md font-medium text-red-600 mb-3">
                  Danger Zone
                </label>
                
                {page.isHome ? (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <AlertCircle size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-body-md font-medium text-gray-500">Cannot delete home page</div>
                      <div className="text-body-sm text-gray-400">
                        Set another page as home before deleting this one
                      </div>
                    </div>
                  </div>
                ) : showDeleteConfirm ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
                      <AlertCircle size={18} />
                      <span className="font-medium">Are you sure?</span>
                    </div>
                    <p className="text-body-sm text-red-600/80 dark:text-red-400/80 mb-4">
                      This action cannot be undone. This will permanently delete the page and all its content.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 size={14} />
                        Delete Page
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={18} />
                    <div className="text-left">
                      <div className="text-body-md font-medium">Delete Page</div>
                      <div className="text-body-sm text-red-500/80">Permanently remove this page</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check size={16} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

