import React from 'react';
import { cn } from '../../lib/utils';
import { TransactionStatus } from '../../types';
import { CheckCircle, AlertTriangle, RefreshCw, Clock, XCircle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: TransactionStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  const config: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    RECOVERED: {
      label: 'Recovered',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    FAILED: {
      label: 'Failed',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />,
    },
    RETRYING: {
      label: 'Retrying',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <RefreshCw className="w-3.5 h-3.5 mr-1 text-amber-600 animate-spin" />,
    },
    SCHEDULED: {
      label: 'Scheduled',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />,
    },
    LOST: {
      label: 'Lost / Churned',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />,
    },
    SUCCESS: {
      label: 'Success',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />,
    },
  };

  const current = config[norm] || {
    label: norm,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: null,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border tracking-tight whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
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
