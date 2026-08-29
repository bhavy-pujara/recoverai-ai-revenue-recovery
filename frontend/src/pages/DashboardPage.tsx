import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  Sliders,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatDate, formatRelativeTime } from '../lib/utils';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { SkeletonTable } from '../components/ui/SkeletonTable';
import { ActionModal, ActionModalType } from '../components/ui/ActionModal';
import { useToast } from '../context/ToastContext';
import { Transaction } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  // Modal State
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: api.analytics.getOverview,
    refetchInterval: 30000,
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['analytics-trend', timeRange],
    queryFn: () => api.analytics.getRevenueTrend(timeRange),
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics-funnel'],
    queryFn: api.analytics.getRecoveryFunnel,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: api.analytics.getAIInsights,
  });

  const { data: recentFailed, isLoading: txnsLoading } = useQuery({
    queryKey: ['dashboard-recent-failed'],
    queryFn: () =>
      api.transactions.getAll({
        limit: 6,
        status: 'FAILED',
        sortBy: 'expectedRecovery',
        sortOrder: 'desc',
      }),
  });

  // Action Mutation
  const handleModalConfirm = async (type: ActionModalType, payload: any) => {
    if (!selectedTxn) return;
    try {
      if (type === 'retry') {
        const res = await api.recovery.retry(selectedTxn.id, payload.channel);
        toast.success(res.message);
      } else if (type === 'remind') {
        const res = await api.recovery.remind(selectedTxn.id, payload.channel);
        toast.success(res.message);
      } else if (type === 'schedule') {
        const res = await api.recovery.schedule(selectedTxn.id, payload.scheduledHours);
        toast.success(res.message);
      } else if (type === 'mark-recovered') {
        const res = await api.recovery.markRecovered(selectedTxn.id, payload.amount);
        toast.success(res.message);
      } else if (type === 'mark-lost') {
        const res = await api.recovery.markLost(selectedTxn.id);
        toast.info(res.message);
      }

      // Invalidate queries to refresh dashboard metrics immediately
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-trend'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-funnel'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-failed'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err: any) {
      toast.error('Recovery Action Failed', err.message);
    }
  };

  const openAction = (type: ActionModalType, txn: Transaction) => {
    setSelectedTxn(txn);
    setModalType(type);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner with AI Insights ticker */}
      {insightsData && insightsData.length > 0 && (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Live AI Opportunity
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                {insightsData[0].title}: {insightsData[0].description}
              </p>
            </div>
          </div>
          <Link
            to="/recovery-center"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 shrink-0"
          >
            <span>Execute Recovery</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Revenue Recovery Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, expected recoverable revenue, and automated recovery actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Run ROI Simulator</span>
          </Link>
          <Link
            to="/recovery-center"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Priority Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="At-Risk Failed Revenue"
          value={formatINR(overview?.atRiskRevenue || 0)}
          subtitle={`${overview?.totalFailedPayments || 0} failed payments currently open`}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          bgColor="bg-rose-50"
          change="+3.2%"
          changeType="negative"
        />

        <StatCard
          title="Expected Recoverable"
          value={formatINR(overview?.expectedRecoverableRevenue || 0)}
          subtitle={`${overview?.aiRecoveryOpportunityCount || 0} high-probability opportunities`}
          icon={Zap}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50"
          change="AI Optimized"
          changeType="positive"
        />

        <StatCard
          title="Revenue Recovered"
          value={formatINR(overview?.revenueRecovered || 0)}
          subtitle={`Overall recovery conversion rate: ${overview?.recoveryRate || 72}%`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          change="+18.4%"
          changeType="positive"
        />

        <StatCard
          title="Avg Recovery Window"
          value={`${overview?.avgRecoveryHours || 4.2} hrs`}
          subtitle="Smart retry timing saves customer churn"
          icon={Clock}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          change="Fast Resolution"
          changeType="positive"
        />
      </div>

      {/* Middle Row: Revenue Trend & Recovery Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Recovery Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Recovery Trends</h2>
              <p className="text-xs text-slate-500">Failed vs Recovered vs Lost volume over time</p>
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['7D', '30D', '90D'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeRange === r
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {trendLoading ? (
              <div className="h-full w-full rounded-xl skeleton-shimmer" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="formattedDate" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
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
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    name="Recovered Revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRecovered)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Failed Revenue"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorFailed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Revenue Recovery Funnel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recovery Funnel</h2>
                <p className="text-xs text-slate-500">Pipeline conversion stages</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {overview?.recoveryRate || 72}% Recaptured
              </span>
            </div>

            <div className="space-y-4 mt-6">
              {funnelData?.stages?.map((stage: any, idx: number) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      {stage.stage}
                    </span>
                    <span className="font-bold text-slate-900">{formatINR(stage.revenue)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 4
                          ? 'bg-emerald-500'
                          : idx === 0
                          ? 'bg-rose-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{stage.description}</span>
                    <span>{stage.count} txns</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <Link
              to="/analytics"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Explore In-Depth Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top High-Value Failed Transactions Queue */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Priority Recovery Opportunities</h2>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                Ranked by Expected Recoverable Revenue
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any quick action to trigger automated recovery workflows on the live database.
            </p>
          </div>

          <Link
            to="/transactions"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {txnsLoading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Rail / Reason</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Expected Rec.</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFailed?.data?.map((txn) => {
                  const score = txn.recoveryAnalysis?.recoveryScore || 50;
                  const expRec = txn.recoveryAnalysis?.expectedRecovery || txn.amount * 0.5;

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">
                        <Link to={`/transactions/${txn.id}`} className="hover:underline">
                          {txn.transactionId}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{txn.customer?.name}</p>
                        <p className="text-[11px] text-slate-400">{txn.customer?.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatINR(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{txn.paymentMethod}</span>
                        <p className="text-[11px] text-rose-600 truncate max-w-[140px]">
                          {txn.failureReason.replace(/_/g, ' ')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <ScoreGauge score={score} size="sm" showLabel={false} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatINR(expRec)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openAction('retry', txn)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                        <button
                          onClick={() => openAction('remind', txn)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Remind</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <ActionModal
        type={modalType}
        transaction={selectedTxn}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};
