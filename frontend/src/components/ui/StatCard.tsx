import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-indigo-600',
  bgColor = 'bg-indigo-50',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
            bgColor
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : changeType === 'negative'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            )}
          >
            {changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {changeType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
