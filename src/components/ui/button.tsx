'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: `
        bg-gradient-to-r from-[#492cdd] to-[#ad38e2]
        text-white font-medium
        shadow-material-1 hover:shadow-material-2
        hover:scale-[1.02] active:scale-[0.98]
      `,
      secondary: `
        bg-surface-light dark:bg-surface-dark
        text-on-surface-light dark:text-on-surface-dark
        border border-outline-light dark:border-outline-dark
        shadow-material-1 hover:shadow-material-2
        hover:bg-gray-50 dark:hover:bg-gray-800
        active:scale-[0.98]
      `,
      ghost: `
        text-primary dark:text-primary-300
        hover:bg-primary-50 dark:hover:bg-primary-900/20
        active:scale-[0.98]
      `,
      danger: `
        bg-red-500 text-white font-medium
        shadow-material-1 hover:shadow-material-2
        hover:bg-red-600 active:scale-[0.98]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-body-sm gap-1.5',
      md: 'px-5 py-2.5 text-body-md gap-2',
      lg: 'px-6 py-3 text-body-lg gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-material transition-all duration-200 ease-material-standard',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'focus:outline-none focus:ring-2 focus:ring-primary/30',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

