import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Cpu,
  User,
  ShieldCheck,
  Clock,
  CreditCard,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { ActionModal, ActionModalType } from '../components/ui/ActionModal';
import { useToast } from '../context/ToastContext';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalType, setModalType] = useState<ActionModalType>(null);

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction-detail', id],
    queryFn: () => api.transactions.getById(id || ''),
    enabled: !!id,
  });

  const handleModalConfirm = async (type: ActionModalType, payload: any) => {
    if (!transaction) return;
    try {
      if (type === 'retry') {
        const res = await api.recovery.retry(transaction.id, payload.channel);
        toast.success(res.message);
      } else if (type === 'remind') {
        const res = await api.recovery.remind(transaction.id, payload.channel);
        toast.success(res.message);
      } else if (type === 'schedule') {
        const res = await api.recovery.schedule(transaction.id, payload.scheduledHours);
        toast.success(res.message);
      } else if (type === 'mark-recovered') {
        const res = await api.recovery.markRecovered(transaction.id, payload.amount);
        toast.success(res.message);
      } else if (type === 'mark-lost') {
        const res = await api.recovery.markLost(transaction.id);
        toast.info(res.message);
      }

      queryClient.invalidateQueries({ queryKey: ['transaction-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    } catch (err: any) {
      toast.error('Action Failed', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded skeleton-shimmer" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 skeleton-shimmer" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <AlertOctagon className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900">Transaction Not Found</h2>
        <p className="text-sm text-rose-600 mt-1">
          The requested transaction identifier could not be located in the ledger.
        </p>
        <Link
          to="/transactions"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </Link>
      </div>
    );
  }

  const analysis = transaction.recoveryAnalysis;
  const explanation = analysis?.parsedExplanation;
  const score = analysis?.recoveryScore || 50;
  const expectedRecovery = analysis?.expectedRecovery || transaction.amount * 0.5;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/transactions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-subtle"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900">
                {transaction.transactionId}
              </h1>
              <StatusBadge status={transaction.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Created: {formatDate(transaction.createdAt)} • Rail: {transaction.paymentMethod}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {transaction.status !== 'RECOVERED' && (
            <>
              <button
                onClick={() => setModalType('retry')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-105"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>
              <button
                onClick={() => setModalType('remind')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all hover:scale-105"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
              <button
                onClick={() => setModalType('schedule')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule</span>
              </button>
            </>
          )}

          {transaction.status !== 'RECOVERED' && (
            <button
              onClick={() => setModalType('mark-recovered')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Recovered</span>
            </button>
          )}

          {transaction.status !== 'LOST' && transaction.status !== 'RECOVERED' && (
            <button
              onClick={() => setModalType('mark-lost')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Mark Lost</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Transaction Overview & AI Intelligence Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Transaction & Customer Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Payment Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction Amount</span>
                <span className="font-bold text-base text-slate-900">{formatINR(transaction.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold text-slate-800">{transaction.currency}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Instrument</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {transaction.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Failure Code</span>
                <span className="font-mono text-rose-600 font-semibold">{transaction.failureCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Failure Category</span>
                <span className="font-semibold text-slate-800">{transaction.failureCategory}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Failure Reason</span>
                <span className="font-bold text-rose-700 text-right">
                  {transaction.failureReason.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Customer Profile</h3>
              <Link
                to={`/customers/${transaction.customer?.id}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View Profile
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                {transaction.customer?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{transaction.customer?.name}</p>
                <p className="text-xs text-slate-400">{transaction.customer?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase">Customer LTV</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {formatINR(transaction.customer?.lifetimeValue || 0)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase">Subscription</span>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {transaction.customer?.subscriptionStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Explainable AI Decision Engine Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-white p-6 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">AI Recovery Intelligence Engine</h2>
                  <p className="text-xs text-slate-500">Deterministic scoring & factor explainability</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={analysis?.priority || 'MEDIUM'} />
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                  Tier: {analysis?.customerValue || 'HIGH'}
                </span>
              </div>
            </div>

            {/* Score & Expected Revenue KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle flex items-center gap-3">
                <ScoreGauge score={score} size="lg" showLabel={false} />
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Recovery Score</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {score >= 75 ? 'High Probability' : score >= 50 ? 'Moderate' : 'Low / At Risk'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle">
                <span className="text-xs text-slate-400 uppercase font-semibold">Expected Recoverable</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatINR(expectedRecovery)}</p>
                <span className="text-[10px] text-slate-400">{score}% of ₹{transaction.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle">
                <span className="text-xs text-slate-400 uppercase font-semibold">AI Recommendation</span>
                <p className="text-sm font-bold text-indigo-700 mt-1">
                  {analysis?.recommendedAction?.replace(/_/g, ' ')}
                </p>
                <span className="text-[11px] text-slate-500">Channel: {analysis?.recommendedChannel}</span>
              </div>
            </div>

            {/* Why This Score? Factor Weights Breakdown */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Why this score? (Explainable Factor Breakdown)
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">
                {explanation?.factorBreakdown?.map((f: any) => (
                  <div
                    key={f.name}
                    className="rounded-xl bg-slate-50/70 p-3 border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{f.name}</span>
                      <p className="text-[10px] text-slate-400">Max {f.weightMax} pts</p>
                    </div>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        f.impact === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.impact === 'negative'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.score} / {f.weightMax} pts
                    </span>
                  </div>
                ))}
              </div>

              {/* Positive and Negative Factor Notes */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {explanation?.positiveFactors && explanation.positiveFactors.length > 0 && (
                  <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Positive Factors
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {explanation.positiveFactors.map((pf: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">+</span>
                          <span>{pf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation?.negativeFactors && explanation.negativeFactors.length > 0 && (
                  <div className="rounded-xl bg-rose-50/60 p-4 border border-rose-200 text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Negative / Risk Factors
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {explanation.negativeFactors.map((nf: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">-</span>
                          <span>{nf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historical Attempts Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Recovery Attempts & Reconciliations
            </h3>

            {!transaction.recoveryAttempts || transaction.recoveryAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No automated attempts executed yet for this transaction.</p>
            ) : (
              <div className="space-y-3">
                {transaction.recoveryAttempts.map((att: any) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          att.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {att.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{att.action.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-slate-400">
                          Channel: {att.channel} • Result: {att.result}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-slate-400 text-[10px] block">
                        {formatDate(att.attemptedAt)}
                      </span>
                      {att.recoveredAmount > 0 && (
                        <span className="font-bold text-emerald-700 text-xs">
                          +{formatINR(att.recoveredAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        type={modalType}
        transaction={transaction}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};
