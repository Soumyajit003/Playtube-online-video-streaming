import React from 'react';
import { twMerge } from 'tailwind-merge';

export const GlassCard = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        'glass-card p-6 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
