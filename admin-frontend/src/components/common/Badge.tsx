import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default:  'bg-panel-hi text-fg-2',
  success:  'bg-ok-bg text-ok',
  warning:  'bg-warn-bg text-warn',
  error:    'bg-err-bg text-err',
  info:     'bg-note-bg text-note',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => (
  <span className={`inline-flex items-center font-semibold rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
    {children}
  </span>
);

export default Badge;
