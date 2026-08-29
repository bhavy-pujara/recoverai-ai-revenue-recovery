import React from 'react';
import { cn } from '../../lib/utils';
import { Priority } from '../../types';
import { Flame, AlertCircle, Info, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const norm = (priority || '').toUpperCase();

  const config: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
      icon: <Flame className="w-3 h-3 mr-1 text-rose-600 animate-bounce" />,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
      icon: <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Info className="w-3 h-3 mr-1 text-indigo-600" />,
    },
    LOW: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: <ArrowDown className="w-3 h-3 mr-1 text-slate-500" />,
    },
  };

  const current = config[norm] || config.MEDIUM;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md border tracking-tight',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        current.bg,
        current.text,
        current.border
      )}
    >
      {current.icon}
      {current.label}
    </span>
  );
};
