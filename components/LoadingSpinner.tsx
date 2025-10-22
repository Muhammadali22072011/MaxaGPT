import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-slate-400 border-t-cyan-400 ${sizeClasses[size]}`} role="status">
        <span className="sr-only">Loading...</span>
    </div>
  );
};
