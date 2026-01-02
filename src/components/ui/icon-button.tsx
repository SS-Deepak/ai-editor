'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      active = false,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: `
        text-on-surface-light dark:text-on-surface-dark
        hover:bg-gray-100 dark:hover:bg-gray-800
        ${active ? 'bg-gray-100 dark:bg-gray-800' : ''}
      `,
      primary: `
        text-primary dark:text-primary-300
        hover:bg-primary-50 dark:hover:bg-primary-900/20
        ${active ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
      `,
      ghost: `
        text-gray-500 dark:text-gray-400
        hover:text-on-surface-light dark:hover:text-on-surface-dark
        hover:bg-gray-100 dark:hover:bg-gray-800
      `,
    };

    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-full transition-all duration-150',
          'active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        title={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

