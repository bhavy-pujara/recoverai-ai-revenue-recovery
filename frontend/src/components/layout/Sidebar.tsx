import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  ArrowLeftRight,
  Cpu,
  Target,
  Users,
  BarChart3,
  Sliders,
  Home,
  ShieldCheck,
  ExternalLink,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Recovery Center', path: '/recovery-center', icon: Zap, highlight: true },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'AI Engine', path: '/ai-engine', icon: Cpu },
  { name: 'Strategies', path: '/strategies', icon: Target },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Simulation', path: '/simulation', icon: Sliders },
];

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full w-64 bg-slate-900 text-slate-300 border-r border-slate-800 selection:bg-indigo-500">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-500/20">
          <Zap className="h-5 w-5 fill-white text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">RecoverAI</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Revenue Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
                  item.highlight && !isActive && 'text-emerald-400 hover:text-emerald-300'
                )
              }
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform group-hover:scale-110',
                  item.highlight && !isActive ? 'text-emerald-400' : ''
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.highlight && !isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Priority
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Portals & Sandbox
        </div>

        <NavLink
          to="/"
          onClick={onCloseMobile}
          className={cn(
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-all'
          )}
        >
          <Home className="w-4 h-4" />
          <span>Product Overview</span>
        </NavLink>
      </div>

      {/* Footer System Status & Disclaimer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300">AI Scoring Engine Active</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Demo portfolio project with simulated payments. Not affiliated with or endorsed by Razorpay.
        </p>
      </div>
    </aside>
  );
};
