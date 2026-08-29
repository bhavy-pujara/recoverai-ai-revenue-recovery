import React from 'react';
import { cn } from '../../lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));

  let colorClass = 'text-emerald-600 stroke-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (normalized < 40) {
    colorClass = 'text-rose-600 stroke-rose-500';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized < 65) {
    colorClass = 'text-amber-600 stroke-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized < 80) {
    colorClass = 'text-indigo-600 stroke-indigo-500';
    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  const radius = size === 'lg' ? 42 : size === 'md' ? 24 : 16;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 5 : 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-700 ease-out', colorClass)}
          />
        </svg>
        <span
          className={cn(
            'absolute font-bold tracking-tighter text-slate-900',
            size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xs' : 'text-[10px]'
          )}
        >
          {normalized}%
        </span>
      </div>

      {showLabel && size === 'lg' && (
        <div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', badgeBg)}>
            {normalized >= 80 ? 'High Recovery' : normalized >= 60 ? 'Moderate Recovery' : 'At-Risk / Low'}
          </span>
        </div>
      )}
    </div>
  );
};
