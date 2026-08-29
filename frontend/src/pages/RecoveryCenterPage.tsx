import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  Send,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatDate } from '../lib/utils';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { SkeletonTable } from '../components/ui/SkeletonTable';
import { ActionModal, ActionModalType } from '../components/ui/ActionModal';
import { useToast } from '../context/ToastContext';
import { Transaction } from '../types';

export const RecoveryCenterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  // Modal State
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['recovery-center-queue', priorityFilter],
    queryFn: () =>
      api.transactions.getAll({
        status: 'FAILED',
        priority: priorityFilter,
        sortBy: 'expectedRecovery',
        sortOrder: 'desc',
        limit: 25,
      }),
  });

  const transactions = response?.data || [];

  const totalAtRisk = transactions.reduce((s, t) => s + t.amount, 0);
  const totalExpected = transactions.reduce(
    (s, t) => s + (t.recoveryAnalysis?.expectedRecovery || t.amount * 0.5),
    0
  );

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

      queryClient.invalidateQueries({ queryKey: ['recovery-center-queue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    } catch (err: any) {
      toast.error('Recovery Action Failed', err.message);
    }
  };

  const executeBatchTopRecovery = async () => {
    if (transactions.length === 0) return;
    setBatchLoading(true);
    const topTargets = transactions.slice(0, 4);
    let recoveredCount = 0;
    let recoveredRevenue = 0;

    for (const t of topTargets) {
      try {
        const res = await api.recovery.retry(t.id, 'DIRECT_RETRY');
        if (res.data?.success) {
          recoveredCount++;
          recoveredRevenue += t.amount;
        }
      } catch (err) {
        console.error('Batch item error:', err);
      }
    }

    setBatchLoading(false);
    toast.success(
      'Batch Orchestration Executed',
      `Processed ${topTargets.length} transactions. Successfully recaptured ₹${recoveredRevenue.toLocaleString('en-IN')}.`
    );
    queryClient.invalidateQueries({ queryKey: ['recovery-center-queue'] });
    queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Metrics Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              AI Recovery Command Center
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-700" />
              Live Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Prioritized by RecoverAI’s expected recoverable revenue algorithm. Execute high-impact retries, WhatsApp
            collect reminders, or multi-channel workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={executeBatchTopRecovery}
            disabled={batchLoading || transactions.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-600 transition-all hover:scale-105 disabled:opacity-50"
          >
            {batchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-200" />
            )}
            <span>Batch Recover Top 4 Targets</span>
          </button>
        </div>
      </div>

      {/* Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Queue At-Risk Value</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(totalAtRisk)}</p>
            <span className="text-[11px] text-slate-400">{transactions.length} target payments</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase">AI Expected Recoverable</span>
            <p className="text-2xl font-black text-indigo-900 mt-1">{formatINR(totalExpected)}</p>
            <span className="text-[11px] text-indigo-600">Calculated after failure classification</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5 fill-white" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Avg Opportunity Score</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {transactions.length > 0
                ? Math.round(
                    transactions.reduce(
                      (s, t) => s + (t.recoveryAnalysis?.recoveryScore || 60),
                      0
                    ) / transactions.length
                  )
                : 75}
              %
            </p>
            <span className="text-[11px] text-slate-400">High probability tier</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Priority:
        </span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              priorityFilter === p
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Opportunities List Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} columns={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3.5 px-4">Transaction & Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Failure Reason</th>
                  <th className="py-3.5 px-4">AI Score</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">AI Strategy</th>
                  <th className="py-3.5 px-4">Expected Rec.</th>
                  <th className="py-3.5 px-4 text-right">Execute Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const score = txn.recoveryAnalysis?.recoveryScore || 50;
                  const expRec = txn.recoveryAnalysis?.expectedRecovery || txn.amount * 0.5;
                  const action = txn.recoveryAnalysis?.recommendedAction || 'NOTIFY_CUSTOMER';
                  const channel = txn.recoveryAnalysis?.recommendedChannel || 'WHATSAPP';

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          to={`/transactions/${txn.id}`}
                          className="font-mono font-bold text-indigo-600 hover:underline block"
                        >
                          {txn.transactionId}
                        </Link>
                        <p className="font-semibold text-slate-900 mt-0.5">{txn.customer?.name}</p>
                        <span className="text-[10px] text-slate-400">
                          {txn.paymentMethod} • {formatDate(txn.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                        {formatINR(txn.amount)}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                          {txn.failureReason.replace(/_/g, ' ')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{txn.failureCode}</p>
                      </td>

                      <td className="py-4 px-4">
                        <ScoreGauge score={score} size="md" showLabel={false} />
                      </td>

                      <td className="py-4 px-4">
                        <PriorityBadge priority={txn.recoveryAnalysis?.priority || 'MEDIUM'} />
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 text-xs">
                          {action.replace(/_/g, ' ')}
                        </p>
                        <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                          Via {channel}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-700 text-sm">
                        {formatINR(expRec)}
                      </td>

                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {action === 'RETRY_LATER' ? (
                          <button
                            onClick={() => {
                              setSelectedTxn(txn);
                              setModalType('retry');
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all hover:scale-105"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Now</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTxn(txn);
                              setModalType('remind');
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-105"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Magic Link</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTxn(txn);
                            setModalType('schedule');
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
