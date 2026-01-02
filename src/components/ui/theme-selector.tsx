'use client';

import { useUIStore, EDITOR_THEMES, EditorTheme } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const themeIcons: Record<EditorTheme, string> = {
  light: '☀️',
  dark: '🌙',
  midnight: '🌃',
  dracula: '🧛',
  nord: '❄️',
  forest: '🌲',
  sunset: '🌅',
  ocean: '🌊',
};

export function ThemeSelector() {
  const { theme, setTheme } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = EDITOR_THEMES[theme];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
          'bg-secondary/50 hover:bg-secondary transition-colors',
          'border border-border/50'
        )}
      >
        <span>{themeIcons[theme]}</span>
        <span className="hidden sm:inline">{currentTheme.label}</span>
        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-56 p-2 rounded-xl shadow-xl',
            'bg-card border border-border',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5 mb-1">
              Editor Theme
            </div>
            
            <div className="space-y-0.5">
              {(Object.keys(EDITOR_THEMES) as EditorTheme[]).map((themeKey) => {
                const themeConfig = EDITOR_THEMES[themeKey];
                const isActive = theme === themeKey;
                
                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      setTheme(themeKey);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                      'transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-secondary'
                    )}
                  >
                    <span className="text-lg">{themeIcons[themeKey]}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{themeConfig.label}</div>
                      <div className={cn(
                        'text-xs',
                        isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {themeConfig.mode === 'light' ? 'Light mode' : 'Dark mode'}
                      </div>
                    </div>
                    
                    {/* Color preview */}
                    <div className="flex gap-0.5">
                      <div 
                        className="w-3 h-3 rounded-full border border-border/50"
                        style={{ backgroundColor: `hsl(${themeConfig.colors.primary})` }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-border/50"
                        style={{ backgroundColor: `hsl(${themeConfig.colors.accent})` }}
                      />
                    </div>
                    
                    {isActive && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

