import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

const variantClasses = {
  primary:   'bg-accent text-[oklch(15%_0.008_55)] hover:bg-accent-hi focus:ring-accent/30',
  secondary: 'bg-panel text-fg-2 hover:bg-panel-hi hover:text-fg-1 border border-edge focus:ring-edge/30',
  danger:    'bg-err-bg text-err hover:brightness-110 focus:ring-err/30',
  success:   'bg-ok-bg text-ok hover:brightness-110 focus:ring-ok/30',
  ghost:     'text-fg-3 hover:bg-panel-hi hover:text-fg-1 focus:ring-edge/30',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-6 py-2.5 text-[13px]',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  className = '',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg
      transition-all duration-150 focus:outline-none focus:ring-2
      disabled:opacity-40 disabled:cursor-not-allowed
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}
    `}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
    ) : Icon ? (
      <Icon className="w-3.5 h-3.5" />
    ) : null}
    {children}
  </button>
);

export default Button;
