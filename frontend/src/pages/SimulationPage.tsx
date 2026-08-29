import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sliders,
  Play,
  TrendingUp,
  DollarSign,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { SimulationResult } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const SimulationPage: React.FC = () => {
  const toast = useToast();
  const [transactionCount, setTransactionCount] = useState<100 | 500 | 1000 | 5000>(500);
  const [avgTicketSize, setAvgTicketSize] = useState<number>(4250);
  const [strategyProfile, setStrategyProfile] = useState<'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE'>('BALANCED');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const runMutation = useMutation({
    mutationFn: (params: { transactionCount: 100 | 500 | 1000 | 5000; avgTicketSize: number; strategyProfile: string }) =>
      api.simulation.run(params as any),
    onSuccess: (data) => {
      setSimulation(data);
      toast.success(
        'Portfolio Simulation Complete',
        `RecoverAI projected to unlock +${formatINR(data.afterAI.additionalRevenueRecovered)} in recovered revenue!`
      );
    },
    onError: (err: any) => {
      toast.error('Simulation Failed', err.message);
    },
  });

  // Run initial simulation on load
  useEffect(() => {
    runMutation.mutate({ transactionCount, avgTicketSize, strategyProfile });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExecute = () => {
    runMutation.mutate({ transactionCount, avgTicketSize, strategyProfile });
  };

  const chartData = simulation
    ? [
        {
          name: 'Before AI (Naive Retry)',
          Recovered: simulation.beforeAI.recoveredRevenue,
          Lost: simulation.beforeAI.lostRevenue,
          Cost: simulation.beforeAI.estimatedCost,
        },
        {
          name: 'After AI (RecoverAI)',
          Recovered: simulation.afterAI.recoveredRevenue,
          Lost: simulation.afterAI.lostRevenue,
          Cost: simulation.afterAI.estimatedCost,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Revenue Recovery ROI Simulator
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Monte Carlo Modeling
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Simulate portfolio-scale payment recovery outcomes comparing static naive retries against RecoverAI’s
          deterministic machine-driven routing.
        </p>
      </div>

      {/* Simulator Control Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Simulation Parameters</span>
          </h3>
          <span className="text-xs text-slate-400">Indian Fintech Benchmark Distribution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Failed Transaction Volume */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Failed Transactions Volume
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([100, 500, 1000, 5000] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTransactionCount(cnt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    transactionCount === cnt
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cnt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Average Ticket Size */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Avg Order Value (AOV)</span>
              <span className="text-indigo-600 font-bold">{formatINR(avgTicketSize)}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="25000"
              step="250"
              value={avgTicketSize}
              onChange={(e) => setAvgTicketSize(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹1,000 (Micro)</span>
              <span>₹25,000 (Enterprise)</span>
            </div>
          </div>

          {/* Strategy Profile */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recovery Strategy Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStrategyProfile(p)}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                    strategyProfile === p
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Simulated Total Failed Pool:{' '}
            <span className="font-bold text-slate-900">{formatINR(transactionCount * avgTicketSize)}</span>
          </div>

          <button
            onClick={handleExecute}
            disabled={runMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-105"
          >
            {runMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Execute Simulation</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Output */}
      {simulation && (
        <div className="space-y-6">
          {/* Top Comparison Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before AI Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Before AI (Static Naive Retries)</h3>
                  <p className="text-xs text-slate-400">Generic re-attempts without timing or root cause intelligence</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {simulation.beforeAI.recoveryRate}% Recovery Rate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Recovered Revenue</span>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {formatINR(simulation.beforeAI.recoveredRevenue)}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50/50 p-3.5 border border-rose-100">
                  <span className="text-rose-600 uppercase text-[10px] font-semibold">Lost / Leaked Revenue</span>
                  <p className="text-xl font-bold text-rose-700 mt-1">
                    {formatINR(simulation.beforeAI.lostRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* After AI Card */}
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-indigo-50/40 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">After AI (RecoverAI Engine)</h3>
                    <p className="text-xs text-indigo-700">Multi-channel routing, smart retry timing, & risk filtering</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  {simulation.afterAI.recoveryRate}% Recovery Rate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200">
                  <span className="text-emerald-800 uppercase text-[10px] font-bold">Recovered Revenue</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {formatINR(simulation.afterAI.recoveredRevenue)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    +{formatINR(simulation.afterAI.additionalRevenueRecovered)} extra unlocked
                  </span>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-200">
                  <span className="text-indigo-800 uppercase text-[10px] font-bold">Strategy ROI</span>
                  <p className="text-2xl font-black text-indigo-700 mt-1">
                    {simulation.afterAI.roi}x Return
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    Est. Cost: {formatINR(simulation.afterAI.estimatedCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Comparison Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
            <h3 className="text-base font-bold text-slate-900 mb-4">Financial Comparison</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Recovered" name="Recovered Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lost" name="Lost Revenue" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cost" name="Operational Cost" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Failure Category Simulation Breakdown Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Breakdown & Efficiency Gains</h3>
                <p className="text-xs text-slate-500">RecoverAI performance by failure root-cause</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-4">Failure Category</th>
                    <th className="py-3.5 px-4">Transactions</th>
                    <th className="py-3.5 px-4">Volume Pool</th>
                    <th className="py-3.5 px-4">Baseline Rate</th>
                    <th className="py-3.5 px-4">AI Recovery Rate</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-700">Extra Recovered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulation.categoryBreakdown?.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cat.label}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{cat.transactionCount}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{formatINR(cat.volume)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-500">{cat.baselineRate}%</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600">{cat.aiRecoveryRate}%</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                        +{formatINR(cat.additionalRecovered)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
