import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <input
        ref={ref}
        className={twMerge(
          'cyber-input w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
