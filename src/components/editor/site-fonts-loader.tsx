'use client';

import { useEffect } from 'react';
import { useSiteSettingsStore } from '@/store/site-settings-store';

// Generate Google Fonts URL for the selected fonts
function getGoogleFontsUrl(fonts: string[]): string {
  const uniqueFonts = [...new Set(fonts)].filter(font => font && font !== 'system-ui');
  
  if (uniqueFonts.length === 0) return '';
  
  const fontParams = uniqueFonts
    .map(font => {
      const formattedFont = font.replace(/\s+/g, '+');
      // Include multiple weights for flexibility
      return `family=${formattedFont}:wght@300;400;500;600;700`;
    })
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

export function SiteFontsLoader() {
  const typography = useSiteSettingsStore((state) => state.typography);
  
  useEffect(() => {
    const fonts = [
      typography.fontFamily.primary,
      typography.fontFamily.heading,
      typography.fontFamily.mono,
    ];
    
    const fontsUrl = getGoogleFontsUrl(fonts);
    
    if (!fontsUrl) return;
    
    // Check if this font link already exists
    const existingLink = document.querySelector(`link[href="${fontsUrl}"]`);
    if (existingLink) return;
    
    // Remove old font links (optional - prevents accumulation)
    const oldLinks = document.querySelectorAll('link[data-site-fonts="true"]');
    oldLinks.forEach(link => link.remove());
    
    // Create and append new link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontsUrl;
    link.setAttribute('data-site-fonts', 'true');
    document.head.appendChild(link);
    
    return () => {
      // Cleanup on unmount
      link.remove();
    };
  }, [typography.fontFamily]);
  
  return null;
}

// Also export a hook version for more flexibility
export function useSiteFonts() {
  const typography = useSiteSettingsStore((state) => state.typography);
  
  useEffect(() => {
    const fonts = [
      typography.fontFamily.primary,
      typography.fontFamily.heading,
      typography.fontFamily.mono,
    ];
    
    const fontsUrl = getGoogleFontsUrl(fonts);
    
    if (!fontsUrl) return;
    
    const existingLink = document.querySelector(`link[href="${fontsUrl}"]`);
    if (existingLink) return;
    
    const oldLinks = document.querySelectorAll('link[data-site-fonts="true"]');
    oldLinks.forEach(link => link.remove());
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontsUrl;
    link.setAttribute('data-site-fonts', 'true');
    document.head.appendChild(link);
  }, [typography.fontFamily]);
}

