'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Custom color variable
export interface CustomColorVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
}

// Color palette interface
export interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  createdBy: 'admin' | string;
  isPublished: boolean;
  isDefault?: boolean;
  isCustom?: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryGradient: string;
    primaryHover: string;
    
    secondary: string;
    secondaryHover: string;
    secondaryLight: string;
    secondaryDark: string;
    
    accent: string;
    accentHover: string;
    
    background: string;
    backgroundDark: string;
    surface: string;
    surfaceDark: string;
    surfaceVariant: string;
    surfaceVariantDark: string;
    surfaceHover: string;
    surfaceHoverDark: string;
    
    text: string;
    textDark: string;
    textMuted: string;
    textMutedDark: string;
    textInverse: string;
    
    border: string;
    borderDark: string;
    divider: string;
    dividerDark: string;
    
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
  };
  // Custom color variables (admin can add extra colors)
  customColors?: CustomColorVariable[];
}

// Typography settings
export interface TypographySettings {
  fontFamily: {
    primary: string;
    heading: string;
    mono: string;
  };
  baseFontSize: string;
  lineHeight: number;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
  };
}

// Site settings state
interface SiteSettingsState {
  // Selected palette
  selectedPaletteId: string;
  
  // System palettes (from JSON)
  systemPalettes: ColorPalette[];
  
  // Custom palettes (user created)
  customPalettes: ColorPalette[];
  
  // Typography
  typography: TypographySettings;
  
  // Loading state
  isLoading: boolean;
}

interface SiteSettingsActions {
  // Palette actions
  setSelectedPalette: (paletteId: string) => void;
  loadSystemPalettes: (palettes: ColorPalette[]) => void;
  addCustomPalette: (palette: ColorPalette) => void;
  updateCustomPalette: (paletteId: string, updates: Partial<ColorPalette>) => void;
  deleteCustomPalette: (paletteId: string) => void;
  
  // Typography actions
  setTypography: (typography: Partial<TypographySettings>) => void;
  setFontFamily: (type: keyof TypographySettings['fontFamily'], font: string) => void;
  
  // Helpers
  getSelectedPalette: () => ColorPalette | null;
  getAllPalettes: () => ColorPalette[];
}

// Default typography
const defaultTypography: TypographySettings = {
  fontFamily: {
    primary: 'Inter',
    heading: 'Inter',
    mono: 'JetBrains Mono',
  },
  baseFontSize: '16px',
  lineHeight: 1.6,
  headingSizes: {
    h1: '48px',
    h2: '36px',
    h3: '30px',
    h4: '24px',
    h5: '20px',
    h6: '16px',
  },
};

// Available fonts
export const AVAILABLE_FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Source Sans Pro', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Crimson Text', category: 'serif' },
  { name: 'JetBrains Mono', category: 'monospace' },
  { name: 'Fira Code', category: 'monospace' },
  { name: 'Source Code Pro', category: 'monospace' },
];

export const useSiteSettingsStore = create<SiteSettingsState & SiteSettingsActions>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedPaletteId: 'palette_brand_purple',
      systemPalettes: [],
      customPalettes: [],
      typography: defaultTypography,
      isLoading: false,

      // Palette actions
      setSelectedPalette: (paletteId) => {
        set({ selectedPaletteId: paletteId });
      },

      loadSystemPalettes: (palettes) => {
        set({ systemPalettes: palettes, isLoading: false });
      },

      addCustomPalette: (palette) => {
        set((state) => ({
          customPalettes: [...state.customPalettes, { ...palette, isCustom: true }],
        }));
      },

      updateCustomPalette: (paletteId, updates) => {
        set((state) => ({
          customPalettes: state.customPalettes.map((p) =>
            p.id === paletteId ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteCustomPalette: (paletteId) => {
        const state = get();
        // If deleting the selected palette, switch to default
        if (state.selectedPaletteId === paletteId) {
          set({
            selectedPaletteId: 'palette_brand_purple',
            customPalettes: state.customPalettes.filter((p) => p.id !== paletteId),
          });
        } else {
          set((state) => ({
            customPalettes: state.customPalettes.filter((p) => p.id !== paletteId),
          }));
        }
      },

      // Typography actions
      setTypography: (typography) => {
        set((state) => ({
          typography: { ...state.typography, ...typography },
        }));
      },

      setFontFamily: (type, font) => {
        set((state) => ({
          typography: {
            ...state.typography,
            fontFamily: {
              ...state.typography.fontFamily,
              [type]: font,
            },
          },
        }));
      },

      // Helpers
      getSelectedPalette: () => {
        const state = get();
        const all = [...state.systemPalettes, ...state.customPalettes];
        return all.find((p) => p.id === state.selectedPaletteId) || null;
      },

      getAllPalettes: () => {
        const state = get();
        return [...state.systemPalettes, ...state.customPalettes];
      },
    }),
    {
      name: 'site-settings-storage',
      partialize: (state) => ({
        selectedPaletteId: state.selectedPaletteId,
        customPalettes: state.customPalettes,
        typography: state.typography,
      }),
    }
  )
);

// Helper function to generate palette CSS variables
export function generatePaletteCSSVariables(palette: ColorPalette): Record<string, string> {
  return {
    '--color-primary': palette.colors.primary,
    '--color-primary-light': palette.colors.primaryLight,
    '--color-primary-dark': palette.colors.primaryDark,
    '--color-primary-hover': palette.colors.primaryHover,
    '--color-secondary': palette.colors.secondary,
    '--color-secondary-hover': palette.colors.secondaryHover,
    '--color-accent': palette.colors.accent,
    '--color-background': palette.colors.background,
    '--color-surface': palette.colors.surface,
    '--color-text': palette.colors.text,
    '--color-text-muted': palette.colors.textMuted,
    '--color-border': palette.colors.border,
    '--color-success': palette.colors.success,
    '--color-warning': palette.colors.warning,
    '--color-error': palette.colors.error,
    '--color-info': palette.colors.info,
  };
}

