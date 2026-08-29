import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Activity,
  DollarSign,
  PieChart,
  Lock,
} from 'lucide-react';
import { formatINR } from '../lib/utils';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">RecoverAI</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Fintech Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/ai-engine"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
              AI Sandbox
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Revenue Recovery Track Portfolio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Turn failed payments into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              recovered revenue.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            An intelligent payment intelligence platform that classifies failed transactions, predicts recovery
            probabilities using transparent factor scoring, and dynamically orchestrates retries, customer reminders,
            and alternative payment rails.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/40 hover:bg-indigo-500 transition-all hover:scale-105"
            >
              <span>Open Recovery Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ai-engine"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Explore AI Decision Engine</span>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <span className="text-xs text-slate-400">Recovery Rate</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">78.4%</p>
              <span className="text-[11px] text-slate-500">vs 28% naive retry</span>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <span className="text-xs text-slate-400">At-Risk Identified</span>
              <p className="text-2xl font-black text-white mt-1">₹38.5L+</p>
              <span className="text-[11px] text-slate-500">Simulated portfolio</span>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <span className="text-xs text-slate-400">Scoring Engine</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">100%</p>
              <span className="text-[11px] text-slate-500">Explainable factors</span>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <span className="text-xs text-slate-400">Average ROI</span>
              <p className="text-2xl font-black text-teal-400 mt-1">24.2x</p>
              <span className="text-[11px] text-slate-500">Revenue to retry cost</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-900/30 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">The Problem & Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Why Traditional Payment Retries Leak Revenue
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Problem Card */}
            <div className="rounded-3xl border border-rose-900/40 bg-rose-950/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-rose-300">The Problem: Naive Retries</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">✕</span>
                  <span><strong>Blind retries:</strong> Retrying expired cards or permanent bank errors wastes gateway fees and triggers risk flags.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">✕</span>
                  <span><strong>Customer friction:</strong> Spamming customers with generic error emails causes churn and brand fatigue.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">✕</span>
                  <span><strong>Invisible revenue loss:</strong> 35-45% of failed transactions in Indian UPI and cards are easily recoverable if timed correctly.</span>
                </li>
              </ul>
            </div>

            {/* The Solution Card */}
            <div className="rounded-3xl border border-emerald-900/40 bg-emerald-950/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-emerald-300">The Solution: RecoverAI</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Failure classification:</strong> Distinguishes temporary gateway glitches from insufficient funds or card errors.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Intelligent timing & channels:</strong> Re-attempts transient errors after 4 hours; triggers instant 1-click WhatsApp checkout for auth drops.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Prioritized expected recovery:</strong> Sorts at-risk revenue by probability and value to maximize recaptured cash flow.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="py-20 px-6 border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Autonomous Pipeline</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">How RecoverAI Works</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Classify & Inspect',
                desc: 'Maps error codes to taxonomy: Temporary, Customer Action, Instrument Issue, or High Risk.',
              },
              {
                step: '02',
                title: 'Predict Recovery',
                desc: 'Computes explainable 0-100 score across LTV, historical payment success, recency, and retry fatigue.',
              },
              {
                step: '03',
                title: 'Prioritize Value',
                desc: 'Calculates Expected Recoverable Revenue (Amount × Probability) to rank high-impact transactions.',
              },
              {
                step: '04',
                title: 'Orchestrate Action',
                desc: 'Triggers optimal automated smart retry, WhatsApp/SMS payment magic link, or alternative rail prompt.',
              },
            ].map((p) => (
              <div key={p.step} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 relative">
                <span className="text-2xl font-black text-indigo-500/40 mb-3 block">{p.step}</span>
                <h4 className="text-lg font-bold text-white mb-2">{p.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer & Disclaimer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400" />
              <span className="font-extrabold text-white">RecoverAI</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Intelligent Payment Revenue Recovery Platform
            </p>
          </div>

          <div className="max-w-md text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Disclaimer:</span> Demo project — simulated payment data.
            Not affiliated with or endorsed by Razorpay.
          </div>
        </div>
      </footer>
    </div>
  );
};
