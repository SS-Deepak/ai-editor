'use client';

import { useMemo } from 'react';
import { useSiteSettingsStore, ColorPalette, TypographySettings } from '@/store/site-settings-store';

// Generate CSS variables from palette
export function generatePaletteStyles(palette: ColorPalette | null): React.CSSProperties {
  if (!palette) return {};
  
  const baseStyles: Record<string, string> = {
    '--site-primary': palette.colors.primary,
    '--site-primary-light': palette.colors.primaryLight,
    '--site-primary-dark': palette.colors.primaryDark,
    '--site-primary-gradient': palette.colors.primaryGradient,
    '--site-primary-hover': palette.colors.primaryHover,
    '--site-secondary': palette.colors.secondary,
    '--site-secondary-hover': palette.colors.secondaryHover,
    '--site-secondary-light': palette.colors.secondaryLight,
    '--site-accent': palette.colors.accent,
    '--site-accent-hover': palette.colors.accentHover,
    '--site-background': palette.colors.background,
    '--site-surface': palette.colors.surface,
    '--site-surface-hover': palette.colors.surfaceHover,
    '--site-text': palette.colors.text,
    '--site-text-muted': palette.colors.textMuted,
    '--site-text-inverse': palette.colors.textInverse,
    '--site-border': palette.colors.border,
    '--site-divider': palette.colors.divider,
    '--site-success': palette.colors.success,
    '--site-warning': palette.colors.warning,
    '--site-error': palette.colors.error,
    '--site-info': palette.colors.info,
  };
  
  // Add custom colors if present
  if (palette.customColors && palette.customColors.length > 0) {
    palette.customColors.forEach(customColor => {
      baseStyles[`--site-custom-${customColor.name}`] = customColor.value;
    });
  }
  
  return baseStyles as React.CSSProperties;
}

// Generate typography styles
export function generateTypographyStyles(typography: TypographySettings): React.CSSProperties {
  return {
    '--site-font-primary': typography.fontFamily.primary,
    '--site-font-heading': typography.fontFamily.heading,
    '--site-font-mono': typography.fontFamily.mono,
    '--site-font-size-base': typography.baseFontSize,
    '--site-line-height': typography.lineHeight.toString(),
    '--site-font-size-h1': typography.headingSizes.h1,
    '--site-font-size-h2': typography.headingSizes.h2,
    '--site-font-size-h3': typography.headingSizes.h3,
    '--site-font-size-h4': typography.headingSizes.h4,
    '--site-font-size-h5': typography.headingSizes.h5,
    '--site-font-size-h6': typography.headingSizes.h6,
  } as React.CSSProperties;
}

// Hook to get all site styles
export function useSiteStyles() {
  const { getSelectedPalette, typography } = useSiteSettingsStore();
  const palette = getSelectedPalette();
  
  const styles = useMemo(() => {
    const paletteStyles = generatePaletteStyles(palette);
    const typographyStyles = generateTypographyStyles(typography);
    
    return {
      ...paletteStyles,
      ...typographyStyles,
    };
  }, [palette, typography]);
  
  return {
    styles,
    palette,
    typography,
  };
}

// Hook for element-specific styles based on site settings
export function useElementStyles() {
  const { getSelectedPalette, typography } = useSiteSettingsStore();
  const palette = getSelectedPalette();
  
  return useMemo(() => ({
    // Button styles
    button: {
      background: palette?.colors.primaryGradient || palette?.colors.primary || '#492cdd',
      color: palette?.colors.textInverse || '#ffffff',
      fontFamily: typography.fontFamily.primary,
    },
    // Text/Paragraph styles
    text: {
      color: palette?.colors.text || '#1a1a2e',
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.baseFontSize,
      lineHeight: typography.lineHeight,
    },
    // Heading styles
    heading: {
      color: palette?.colors.text || '#1a1a2e',
      fontFamily: typography.fontFamily.heading,
    },
    h1: {
      fontSize: typography.headingSizes.h1,
    },
    h2: {
      fontSize: typography.headingSizes.h2,
    },
    h3: {
      fontSize: typography.headingSizes.h3,
    },
    h4: {
      fontSize: typography.headingSizes.h4,
    },
    // Link styles
    link: {
      color: palette?.colors.primary || '#492cdd',
    },
    // Background colors
    background: {
      backgroundColor: palette?.colors.background || '#ffffff',
    },
    surface: {
      backgroundColor: palette?.colors.surface || '#f8f9fa',
    },
    // Border
    border: {
      borderColor: palette?.colors.border || '#e2e8f0',
    },
    // Navbar
    navbar: {
      backgroundColor: palette?.colors.background || '#ffffff',
      borderColor: palette?.colors.border || '#e2e8f0',
      color: palette?.colors.text || '#1a1a2e',
    },
    // Footer
    footer: {
      backgroundColor: palette?.colors.surface || '#f8f9fa',
      color: palette?.colors.text || '#1a1a2e',
    },
    // Hero
    hero: {
      background: `linear-gradient(to bottom, ${palette?.colors.surface || '#f8f9fa'}, ${palette?.colors.background || '#ffffff'})`,
      color: palette?.colors.text || '#1a1a2e',
    },
    // Get primary gradient
    primaryGradient: palette?.colors.primaryGradient || 'linear-gradient(to right, #492cdd, #ad38e2)',
    primary: palette?.colors.primary || '#492cdd',
    secondary: palette?.colors.secondary || '#6366f1',
    accent: palette?.colors.accent || '#f472b6',
  }), [palette, typography]);
}

