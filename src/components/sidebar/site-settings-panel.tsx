'use client';

import { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  Plus,
  Check,
  ChevronDown,
  Trash2,
  Edit3,
  Copy,
  Sparkles,
} from 'lucide-react';
import { useSiteSettingsStore, ColorPalette, AVAILABLE_FONTS } from '@/store/site-settings-store';
import { cn } from '@/lib/utils';

// Load system palettes
const loadSystemPalettes = async (): Promise<ColorPalette[]> => {
  try {
    const response = await fetch('/api/palettes');
    if (!response.ok) {
      // Fallback to hardcoded palettes if API not available
      return getDefaultPalettes();
    }
    const data = await response.json();
    return data.palettes || [];
  } catch {
    return getDefaultPalettes();
  }
};

// Default palettes fallback
function getDefaultPalettes(): ColorPalette[] {
  return [
    {
      id: 'palette_brand_purple',
      name: 'Brand Purple',
      description: 'Primary brand palette with purple gradient',
      createdBy: 'admin',
      isPublished: true,
      isDefault: true,
      colors: {
        primary: '#492cdd',
        primaryLight: '#ad38e2',
        primaryDark: '#3720a8',
        primaryGradient: 'linear-gradient(to right, #492cdd, #ad38e2)',
        primaryHover: '#5c3ee8',
        secondary: '#6366f1',
        secondaryHover: '#4f46e5',
        secondaryLight: '#e0e7ff',
        secondaryDark: '#4338ca',
        accent: '#f472b6',
        accentHover: '#ec4899',
        background: '#ffffff',
        backgroundDark: '#0f0f0f',
        surface: '#f8f9fa',
        surfaceDark: '#1e1e1e',
        surfaceVariant: '#f1f5f9',
        surfaceVariantDark: '#2d2d2d',
        surfaceHover: '#e2e8f0',
        surfaceHoverDark: '#3d3d3d',
        text: '#1a1a2e',
        textDark: '#f5f5f5',
        textMuted: '#64748b',
        textMutedDark: '#a1a1aa',
        textInverse: '#ffffff',
        border: '#e2e8f0',
        borderDark: '#3f3f46',
        divider: '#e5e7eb',
        dividerDark: '#3f3f46',
        success: '#10b981',
        successLight: '#d1fae5',
        warning: '#f59e0b',
        warningLight: '#fef3c7',
        error: '#ef4444',
        errorLight: '#fee2e2',
        info: '#3b82f6',
        infoLight: '#dbeafe',
      },
    },
    {
      id: 'palette_ocean_blue',
      name: 'Ocean Blue',
      description: 'Professional blue palette',
      createdBy: 'admin',
      isPublished: true,
      colors: {
        primary: '#3B82F6',
        primaryLight: '#60a5fa',
        primaryDark: '#1e40af',
        primaryGradient: 'linear-gradient(to right, #3b82f6, #60a5fa)',
        primaryHover: '#2563EB',
        secondary: '#10B981',
        secondaryHover: '#059669',
        secondaryLight: '#D1FAE5',
        secondaryDark: '#047857',
        accent: '#F59E0B',
        accentHover: '#D97706',
        background: '#ffffff',
        backgroundDark: '#0f172a',
        surface: '#F9FAFB',
        surfaceDark: '#1e293b',
        surfaceVariant: '#f1f5f9',
        surfaceVariantDark: '#334155',
        surfaceHover: '#F3F4F6',
        surfaceHoverDark: '#475569',
        text: '#1F2937',
        textDark: '#f8fafc',
        textMuted: '#6B7280',
        textMutedDark: '#94a3b8',
        textInverse: '#FFFFFF',
        border: '#E5E7EB',
        borderDark: '#475569',
        divider: '#E5E7EB',
        dividerDark: '#334155',
        success: '#10B981',
        successLight: '#d1fae5',
        warning: '#F59E0B',
        warningLight: '#fef3c7',
        error: '#EF4444',
        errorLight: '#fee2e2',
        info: '#3B82F6',
        infoLight: '#dbeafe',
      },
    },
    {
      id: 'palette_forest_green',
      name: 'Forest Green',
      description: 'Natural green palette',
      createdBy: 'admin',
      isPublished: true,
      colors: {
        primary: '#059669',
        primaryLight: '#34d399',
        primaryDark: '#065F46',
        primaryGradient: 'linear-gradient(to right, #059669, #34d399)',
        primaryHover: '#047857',
        secondary: '#0891B2',
        secondaryHover: '#0E7490',
        secondaryLight: '#CFFAFE',
        secondaryDark: '#155E75',
        accent: '#F97316',
        accentHover: '#EA580C',
        background: '#FFFFFF',
        backgroundDark: '#0f1f17',
        surface: '#F0FDF4',
        surfaceDark: '#14352a',
        surfaceVariant: '#dcfce7',
        surfaceVariantDark: '#1e4d3d',
        surfaceHover: '#DCFCE7',
        surfaceHoverDark: '#2d5a48',
        text: '#14532D',
        textDark: '#ecfdf5',
        textMuted: '#4D7C0F',
        textMutedDark: '#86efac',
        textInverse: '#FFFFFF',
        border: '#BBF7D0',
        borderDark: '#2d5a48',
        divider: '#BBF7D0',
        dividerDark: '#1e4d3d',
        success: '#22C55E',
        successLight: '#dcfce7',
        warning: '#EAB308',
        warningLight: '#fef9c3',
        error: '#DC2626',
        errorLight: '#fee2e2',
        info: '#0EA5E9',
        infoLight: '#e0f2fe',
      },
    },
    {
      id: 'palette_sunset_orange',
      name: 'Sunset Orange',
      description: 'Warm orange palette',
      createdBy: 'admin',
      isPublished: true,
      colors: {
        primary: '#F97316',
        primaryLight: '#fb923c',
        primaryDark: '#C2410C',
        primaryGradient: 'linear-gradient(to right, #f97316, #fb923c)',
        primaryHover: '#EA580C',
        secondary: '#EC4899',
        secondaryHover: '#DB2777',
        secondaryLight: '#FCE7F3',
        secondaryDark: '#BE185D',
        accent: '#8B5CF6',
        accentHover: '#7C3AED',
        background: '#FFFBEB',
        backgroundDark: '#1c1410',
        surface: '#FEF3C7',
        surfaceDark: '#2d1f18',
        surfaceVariant: '#fde68a',
        surfaceVariantDark: '#3d2a1e',
        surfaceHover: '#FDE68A',
        surfaceHoverDark: '#4d3525',
        text: '#78350F',
        textDark: '#fef3c7',
        textMuted: '#A16207',
        textMutedDark: '#fbbf24',
        textInverse: '#FFFFFF',
        border: '#FCD34D',
        borderDark: '#4d3525',
        divider: '#FCD34D',
        dividerDark: '#3d2a1e',
        success: '#22C55E',
        successLight: '#dcfce7',
        warning: '#EAB308',
        warningLight: '#fef9c3',
        error: '#DC2626',
        errorLight: '#fee2e2',
        info: '#3B82F6',
        infoLight: '#dbeafe',
      },
    },
  ];
}

export function SiteSettingsPanel() {
  const {
    selectedPaletteId,
    systemPalettes,
    customPalettes,
    typography,
    loadSystemPalettes: setSystemPalettes,
    setSelectedPalette,
    addCustomPalette,
    deleteCustomPalette,
    setFontFamily,
    setTypography,
  } = useSiteSettingsStore();

  const [showPaletteEditor, setShowPaletteEditor] = useState(false);
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);

  // Load palettes on mount
  useEffect(() => {
    if (systemPalettes.length === 0) {
      loadSystemPalettes().then(setSystemPalettes);
    }
  }, [systemPalettes.length, setSystemPalettes]);

  const allPalettes = [...systemPalettes, ...customPalettes];
  const selectedPalette = allPalettes.find((p) => p.id === selectedPaletteId);

  const handleCreatePalette = () => {
    setEditingPalette(null);
    setShowPaletteEditor(true);
  };

  const handleEditPalette = (palette: ColorPalette) => {
    setEditingPalette(palette);
    setShowPaletteEditor(true);
  };

  const handleDuplicatePalette = (palette: ColorPalette) => {
    const newPalette: ColorPalette = {
      ...palette,
      id: `palette_custom_${Date.now()}`,
      name: `${palette.name} (Copy)`,
      createdBy: 'user',
      isCustom: true,
      isDefault: false,
    };
    addCustomPalette(newPalette);
  };

  return (
    <div className="p-3 space-y-4">
      {/* Header with Live Preview indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-sm font-semibold text-on-surface-light dark:text-on-surface-dark">
          Site Defaults
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Preview
        </span>
      </div>

      {/* Live Preview Card */}
      {selectedPalette && (
        <div 
          className="rounded-lg overflow-hidden border shadow-sm"
          style={{ 
            backgroundColor: selectedPalette.colors.background,
            borderColor: selectedPalette.colors.border,
          }}
        >
          <div 
            className="p-3 border-b"
            style={{ 
              backgroundColor: selectedPalette.colors.background,
              borderColor: selectedPalette.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span 
                style={{ 
                  color: selectedPalette.colors.text,
                  fontFamily: typography.fontFamily.primary,
                }}
                className="font-bold text-sm"
              >
                Preview
              </span>
              <button
                style={{ 
                  background: selectedPalette.colors.primaryGradient || selectedPalette.colors.primary,
                  color: selectedPalette.colors.textInverse,
                }}
                className="px-3 py-1 rounded-md text-xs font-medium"
              >
                Button
              </button>
            </div>
          </div>
          <div className="p-3" style={{ backgroundColor: selectedPalette.colors.surface }}>
            <p 
              style={{ 
                color: selectedPalette.colors.text,
                fontFamily: typography.fontFamily.heading,
                fontSize: '14px',
              }}
              className="font-semibold mb-1"
            >
              Heading Text
            </p>
            <p 
              style={{ 
                color: selectedPalette.colors.textMuted,
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.baseFontSize,
                lineHeight: typography.lineHeight,
              }}
              className="text-xs"
            >
              Body text with your selected font and colors.
            </p>
          </div>
        </div>
      )}

      {/* Color Palette Section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-label-lg font-medium text-gray-500 flex items-center gap-2">
            <Palette size={16} />
            Color Palette
          </h4>
          <button
            onClick={handleCreatePalette}
            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <Plus size={14} />
            New
          </button>
        </div>

        {/* Selected Palette Preview */}
        {selectedPalette && (
          <div className="mb-3 p-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-outline-light dark:border-outline-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{selectedPalette.name}</span>
              {selectedPalette.isDefault && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <div
                className="w-8 h-8 rounded-md shadow-sm"
                style={{ background: selectedPalette.colors.primaryGradient || selectedPalette.colors.primary }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-md shadow-sm"
                style={{ background: selectedPalette.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded-md shadow-sm"
                style={{ background: selectedPalette.colors.accent }}
                title="Accent"
              />
              <div
                className="w-8 h-8 rounded-md shadow-sm border border-gray-200"
                style={{ background: selectedPalette.colors.background }}
                title="Background"
              />
              <div
                className="w-8 h-8 rounded-md shadow-sm"
                style={{ background: selectedPalette.colors.text }}
                title="Text"
              />
            </div>
          </div>
        )}

        {/* Palette List */}
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {allPalettes.map((palette) => (
            <PaletteItem
              key={palette.id}
              palette={palette}
              isSelected={palette.id === selectedPaletteId}
              onSelect={() => setSelectedPalette(palette.id)}
              onEdit={() => handleEditPalette(palette)}
              onDuplicate={() => handleDuplicatePalette(palette)}
              onDelete={palette.isCustom ? () => deleteCustomPalette(palette.id) : undefined}
            />
          ))}
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <h4 className="text-label-lg font-medium text-gray-500 flex items-center gap-2 mb-2">
          <Type size={16} />
          Typography
        </h4>

        <div className="space-y-3">
          {/* Primary Font */}
          <FontSelector
            label="Body Font"
            value={typography.fontFamily.primary}
            onChange={(font) => setFontFamily('primary', font)}
          />

          {/* Heading Font */}
          <FontSelector
            label="Heading Font"
            value={typography.fontFamily.heading}
            onChange={(font) => setFontFamily('heading', font)}
          />

          {/* Base Font Size */}
          <div>
            <label className="text-label-sm text-gray-500 mb-1 block">Base Font Size</label>
            <select
              value={typography.baseFontSize}
              onChange={(e) => setTypography({ baseFontSize: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="14px">14px - Small</option>
              <option value="16px">16px - Default</option>
              <option value="18px">18px - Large</option>
              <option value="20px">20px - Extra Large</option>
            </select>
          </div>

          {/* Line Height */}
          <div>
            <label className="text-label-sm text-gray-500 mb-1 block">Line Height</label>
            <select
              value={typography.lineHeight.toString()}
              onChange={(e) => setTypography({ lineHeight: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="1.4">1.4 - Compact</option>
              <option value="1.5">1.5 - Normal</option>
              <option value="1.6">1.6 - Relaxed</option>
              <option value="1.75">1.75 - Loose</option>
              <option value="2">2.0 - Double</option>
            </select>
          </div>
        </div>
      </section>

      {/* Palette Editor Modal */}
      {showPaletteEditor && (
        <PaletteEditorModal
          palette={editingPalette}
          onClose={() => setShowPaletteEditor(false)}
          onSave={(palette) => {
            if (editingPalette && editingPalette.isCustom) {
              useSiteSettingsStore.getState().updateCustomPalette(palette.id, palette);
            } else {
              addCustomPalette(palette);
            }
            setShowPaletteEditor(false);
          }}
        />
      )}
    </div>
  );
}

// Palette Item Component
interface PaletteItemProps {
  palette: ColorPalette;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete?: () => void;
}

function PaletteItem({ palette, isSelected, onSelect, onEdit, onDuplicate, onDelete }: PaletteItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group',
        isSelected
          ? 'bg-primary/10 border border-primary'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
      )}
      onClick={onSelect}
    >
      {/* Color preview dots */}
      <div className="flex gap-0.5 shrink-0">
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: palette.colors.primary }}
        />
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: palette.colors.secondary }}
        />
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: palette.colors.accent }}
        />
      </div>

      {/* Name */}
      <span className="flex-1 text-sm truncate">{palette.name}</span>

      {/* Selected indicator */}
      {isSelected && <Check size={14} className="text-primary shrink-0" />}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="Duplicate"
        >
          <Copy size={12} />
        </button>
        {palette.isCustom && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Edit3 size={12} />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Font Selector Component
interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
}

function FontSelector({ label, value, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fontsByCategory = {
    'Sans Serif': AVAILABLE_FONTS.filter((f) => f.category === 'sans-serif'),
    'Serif': AVAILABLE_FONTS.filter((f) => f.category === 'serif'),
    'Monospace': AVAILABLE_FONTS.filter((f) => f.category === 'monospace'),
  };

  return (
    <div className="relative">
      <label className="text-label-sm text-gray-500 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md',
          'border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900',
          'hover:border-gray-300 dark:hover:border-gray-600'
        )}
        style={{ fontFamily: value }}
      >
        <span>{value}</span>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[200px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 dark:bg-gray-800 sticky top-0">
                  {category}
                </div>
                {fonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => {
                      onChange(font.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800',
                      value === font.name && 'bg-primary/10 text-primary'
                    )}
                    style={{ fontFamily: font.name }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Palette Editor Modal
interface PaletteEditorModalProps {
  palette: ColorPalette | null;
  onClose: () => void;
  onSave: (palette: ColorPalette) => void;
}

interface CustomVar {
  id: string;
  name: string;
  value: string;
}

function PaletteEditorModal({ palette, onClose, onSave }: PaletteEditorModalProps) {
  const [name, setName] = useState(palette?.name || 'My Custom Palette');
  const [colors, setColors] = useState({
    primary: palette?.colors.primary || '#3B82F6',
    primaryLight: palette?.colors.primaryLight || '#60A5FA',
    primaryDark: palette?.colors.primaryDark || '#1E40AF',
    secondary: palette?.colors.secondary || '#10B981',
    accent: palette?.colors.accent || '#F59E0B',
    background: palette?.colors.background || '#FFFFFF',
    text: palette?.colors.text || '#1F2937',
  });
  const [customVars, setCustomVars] = useState<CustomVar[]>(
    palette?.customColors?.map(c => ({ id: c.id, name: c.name, value: c.value })) || []
  );
  const [showCustomVars, setShowCustomVars] = useState(false);

  const addCustomVar = () => {
    setCustomVars([
      ...customVars,
      { id: `var_${Date.now()}`, name: 'customColor', value: '#6366f1' }
    ]);
  };

  const updateCustomVar = (id: string, field: 'name' | 'value', val: string) => {
    setCustomVars(customVars.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  const removeCustomVar = (id: string) => {
    setCustomVars(customVars.filter(v => v.id !== id));
  };

  const handleSave = () => {
    const newPalette: ColorPalette = {
      id: palette?.id || `palette_custom_${Date.now()}`,
      name,
      description: 'Custom palette',
      createdBy: 'user',
      isPublished: false,
      isCustom: true,
      colors: {
        ...colors,
        primaryGradient: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})`,
        primaryHover: colors.primary,
        secondaryHover: colors.secondary,
        secondaryLight: colors.secondary + '20',
        secondaryDark: colors.secondary,
        accentHover: colors.accent,
        backgroundDark: '#0f0f0f',
        surface: colors.background,
        surfaceDark: '#1e1e1e',
        surfaceVariant: colors.background,
        surfaceVariantDark: '#2d2d2d',
        surfaceHover: colors.background,
        surfaceHoverDark: '#3d3d3d',
        textDark: '#f5f5f5',
        textMuted: '#64748b',
        textMutedDark: '#a1a1aa',
        textInverse: '#ffffff',
        border: '#e5e7eb',
        borderDark: '#3f3f46',
        divider: '#e5e7eb',
        dividerDark: '#3f3f46',
        success: '#10b981',
        successLight: '#d1fae5',
        warning: '#f59e0b',
        warningLight: '#fef3c7',
        error: '#ef4444',
        errorLight: '#fee2e2',
        info: '#3b82f6',
        infoLight: '#dbeafe',
      },
      customColors: customVars.map(v => ({ id: v.id, name: v.name, value: v.value })),
    };
    onSave(newPalette);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            {palette ? 'Edit Palette' : 'Create Palette'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Palette Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="My Palette"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <ColorInput label="Primary" value={colors.primary} onChange={(v) => setColors({ ...colors, primary: v })} />
            <ColorInput label="Primary Light" value={colors.primaryLight} onChange={(v) => setColors({ ...colors, primaryLight: v })} />
            <ColorInput label="Primary Dark" value={colors.primaryDark} onChange={(v) => setColors({ ...colors, primaryDark: v })} />
            <ColorInput label="Secondary" value={colors.secondary} onChange={(v) => setColors({ ...colors, secondary: v })} />
            <ColorInput label="Accent" value={colors.accent} onChange={(v) => setColors({ ...colors, accent: v })} />
            <ColorInput label="Background" value={colors.background} onChange={(v) => setColors({ ...colors, background: v })} />
            <ColorInput label="Text" value={colors.text} onChange={(v) => setColors({ ...colors, text: v })} />
          </div>

          {/* Custom Variables Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowCustomVars(!showCustomVars)}
              className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Plus size={14} />
                Custom Color Variables ({customVars.length})
              </span>
              <ChevronDown size={14} className={cn('transition-transform', showCustomVars && 'rotate-180')} />
            </button>
            
            {showCustomVars && (
              <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {customVars.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No custom variables. Add your own colors for more flexibility.
                  </p>
                ) : (
                  customVars.map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={v.value}
                        onChange={(e) => updateCustomVar(v.id, 'value', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => updateCustomVar(v.id, 'name', e.target.value.replace(/\s+/g, ''))}
                        placeholder="variableName"
                        className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
                      />
                      <input
                        type="text"
                        value={v.value}
                        onChange={(e) => updateCustomVar(v.id, 'value', e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomVar(v.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={addCustomVar}
                  className="w-full py-2 text-xs text-primary hover:bg-primary/10 rounded-md flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  Add Custom Variable
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700" style={{ background: colors.background }}>
            <div className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Preview
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                className="px-4 py-2 text-white text-sm rounded-lg"
                style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 text-white text-sm rounded-lg"
                style={{ background: colors.secondary }}
              >
                Secondary
              </button>
              {customVars.map((v) => (
                <span
                  key={v.id}
                  className="px-3 py-2 text-white text-xs rounded-lg"
                  style={{ background: v.value }}
                  title={v.name}
                >
                  {v.name}
                </span>
              ))}
            </div>
            <p className="text-sm" style={{ color: colors.text }}>
              This is how your text will look with this palette.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white rounded-lg bg-primary hover:bg-primary-dark"
          >
            {palette ? 'Save Changes' : 'Create Palette'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Color Input Component
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
        />
      </div>
    </div>
  );
}

