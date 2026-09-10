import React from 'react';
import { Lock } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'vault' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    primary: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
    vault: 'bg-gradient-to-r from-indigo-950 to-violet-950 text-indigo-200 border border-indigo-500/40 shadow-sm shadow-indigo-900/30',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${variantClasses}`}>
      {icon}
      {children}
    </span>
  );
};

export const PrivateLockBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm shadow-amber-950/20">
    <Lock className="w-3.5 h-3.5 text-amber-400" />
    <span>PRIVATE — ONLY YOU CAN SEE THIS</span>
  </span>
);
