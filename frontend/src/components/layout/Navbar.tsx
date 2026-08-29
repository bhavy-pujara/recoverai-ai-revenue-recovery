import React from 'react';
import { Menu, Bell, Shield, Search, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenMobileNav: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileNav }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-600">Simulated Indian Gateway Production Mode</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/recovery-center"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Priority Recovery Queue</span>
        </Link>

        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-sm">
            RP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Revenue Ops Admin</p>
            <p className="text-[10px] text-slate-500">Razorpay Track Demo</p>
          </div>
        </div>
      </div>
    </header>
  );
};
