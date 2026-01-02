'use client';

import { useState } from 'react';
import {
  Image,
  Video,
  FileText,
  Upload,
  FolderOpen,
  MoreVertical,
  Download,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '../ui';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  thumbnail?: string;
}

// Mock assets data
const mockAssets: Asset[] = [
  {
    id: 'asset_1',
    name: 'hero-banner.jpg',
    type: 'image',
    url: '/images/hero-banner.jpg',
    size: 256000,
    thumbnail: 'https://via.placeholder.com/100x100/492cdd/ffffff?text=Hero',
  },
  {
    id: 'asset_2',
    name: 'logo.svg',
    type: 'image',
    url: '/images/logo.svg',
    size: 4500,
    thumbnail: 'https://via.placeholder.com/100x100/ad38e2/ffffff?text=Logo',
  },
  {
    id: 'asset_3',
    name: 'product-demo.mp4',
    type: 'video',
    url: '/videos/demo.mp4',
    size: 15000000,
  },
];

const assetIcons = {
  image: Image,
  video: Video,
  document: FileText,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AssetsPanelProps {
  searchQuery?: string;
}

export function AssetsPanel({ searchQuery = '' }: AssetsPanelProps) {
  const [assets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log('Upload clicked');
  };

  return (
    <div className="p-3">
      {/* Upload Button */}
      <Button
        variant="secondary"
        className="w-full mb-4 justify-center"
        onClick={handleUpload}
      >
        <Upload size={16} />
        Upload Assets
      </Button>

      {/* Assets Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          {filteredAssets.map((asset) => {
            const Icon = assetIcons[asset.type];
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset.id)}
                className={cn(
                  'group relative rounded-material overflow-hidden cursor-pointer',
                  'border border-outline-light dark:border-outline-dark',
                  'hover:border-primary hover:shadow-material-1',
                  'transition-all duration-150',
                  selectedAsset === asset.id && 'ring-2 ring-primary border-primary'
                )}
              >
                {/* Thumbnail or Icon */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon size={32} className="text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2 bg-white dark:bg-surface-dark">
                  <p className="text-label-sm truncate text-on-surface-light dark:text-on-surface-dark">
                    {asset.name}
                  </p>
                  <p className="text-label-sm text-gray-400">{formatFileSize(asset.size)}</p>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton size="sm" variant="ghost" className="bg-white/90 dark:bg-black/90">
                    <MoreVertical size={14} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-8">
          <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-body-md text-gray-500">
            {searchQuery ? `No assets found for "${searchQuery}"` : 'No assets uploaded yet'}
          </p>
          {!searchQuery && (
            <Button size="sm" className="mt-3" onClick={handleUpload}>
              <Upload size={16} />
              Upload first asset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

