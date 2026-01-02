'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const UNITS = ['px', '%', 'em', 'rem', 'vh', 'vw', 'auto'] as const;
type Unit = typeof UNITS[number];

interface UnitInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  allowAuto?: boolean;
}

// Parse value like "24px" into { number: 24, unit: 'px' }
function parseValue(value: string): { number: number; unit: Unit } {
  if (!value || value === 'auto') {
    return { number: 0, unit: 'auto' };
  }
  
  const match = value.match(/^(-?\d*\.?\d+)\s*(px|%|em|rem|vh|vw)?$/);
  if (match) {
    return {
      number: parseFloat(match[1]) || 0,
      unit: (match[2] as Unit) || 'px', // Default to px
    };
  }
  
  // Try to extract just numbers - default to px
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return { number: num, unit: 'px' };
  }
  
  return { number: 0, unit: 'px' };
}

export function UnitInput({
  value,
  onChange,
  label,
  placeholder = '0',
  min,
  max,
  step = 1,
  className,
  allowAuto = true,
}: UnitInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const parsed = parseValue(value);
  const [localNumber, setLocalNumber] = useState(parsed.number.toString());
  // Default to px if no unit is parsed
  const [unit, setUnit] = useState<Unit>(parsed.unit === 'auto' && !value ? 'px' : parsed.unit);
  
  // Update local state when value prop changes
  useEffect(() => {
    const newParsed = parseValue(value);
    setLocalNumber(newParsed.number.toString());
    // Keep px as default unless explicitly auto
    setUnit(value === 'auto' ? 'auto' : (newParsed.unit || 'px'));
  }, [value]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleNumberChange = (newNumber: string) => {
    setLocalNumber(newNumber);
    
    if (newNumber === '' || newNumber === '-') {
      return;
    }
    
    const num = parseFloat(newNumber);
    if (!isNaN(num)) {
      const currentUnit = unit === 'auto' ? 'px' : unit;
      if (unit === 'auto') {
        setUnit('px');
      }
      onChange(`${num}${currentUnit}`);
    }
  };
  
  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
    setIsDropdownOpen(false);
    
    if (newUnit === 'auto') {
      onChange('auto');
    } else {
      const num = parseFloat(localNumber) || 0;
      onChange(`${num}${newUnit}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (unit === 'auto') return;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const num = (parseFloat(localNumber) || 0) + step;
      const clamped = max !== undefined ? Math.min(num, max) : num;
      setLocalNumber(clamped.toString());
      onChange(`${clamped}${unit}`);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const num = (parseFloat(localNumber) || 0) - step;
      const clamped = min !== undefined ? Math.max(num, min) : num;
      setLocalNumber(clamped.toString());
      onChange(`${clamped}${unit}`);
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Normalize empty input - default to px
    if (localNumber === '' || localNumber === '-') {
      setLocalNumber('0');
      if (unit !== 'auto') {
        onChange(`0${unit}`);
      }
    }
  };

  const availableUnits = allowAuto ? UNITS : UNITS.filter(u => u !== 'auto');

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-label-sm text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          'flex items-stretch h-8 rounded-md border transition-all',
          isFocused 
            ? 'border-primary ring-1 ring-primary/20' 
            : 'border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900'
        )}
      >
        {/* Number Input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={unit === 'auto' ? '' : localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={unit === 'auto' ? 'auto' : placeholder}
          disabled={unit === 'auto'}
          className={cn(
            'flex-1 min-w-0 w-12 px-2 py-1 text-sm bg-transparent outline-none rounded-l-md',
            'text-on-surface-light dark:text-on-surface-dark',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            unit === 'auto' && 'text-gray-400 italic'
          )}
        />
        
        {/* Unit Dropdown - directly next to input, no buttons between */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'h-full px-2 flex items-center gap-1 border-l border-gray-200 dark:border-gray-700',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              'text-xs font-medium text-gray-500 dark:text-gray-400',
              'rounded-r-md'
            )}
          >
            <span>{unit}</span>
            <ChevronDown size={10} className={cn(
              'transition-transform opacity-60',
              isDropdownOpen && 'rotate-180'
            )} />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[70px] py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
              {availableUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  className={cn(
                    'w-full px-3 py-1 text-xs text-left',
                    'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                    unit === u 
                      ? 'text-primary font-medium bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

