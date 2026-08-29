import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScoreGauge } from '../components/ui/ScoreGauge';

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer-profile', id],
    queryFn: () => api.customers.getById(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded skeleton-shimmer" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 skeleton-shimmer" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900">Customer Profile Not Found</h2>
        <p className="text-sm text-rose-600 mt-1">The requested customer record does not exist.</p>
        <Link
          to="/customers"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Button and Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customers"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
            {customer.lifetimeValue >= 100000 && (
              <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3 text-amber-600" />
                VIP Account
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer ID: {customer.id} • Registered {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Profile Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle">
          <span className="text-xs font-medium text-slate-500 uppercase">Lifetime Value (LTV)</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(customer.lifetimeValue)}</p>
          <span className="text-[11px] text-slate-400">Total cumulative capture</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle">
          <span className="text-xs font-medium text-slate-500 uppercase">Historical Success Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{customer.successRate}%</p>
          <span className="text-[11px] text-slate-400">
            {customer.successfulTransactions} successful / {customer.failedTransactions} failed
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle">
          <span className="text-xs font-medium text-slate-500 uppercase">Activity & Subscription</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{customer.subscriptionStatus}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">{customer.activityLevel} Activity</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle">
          <span className="text-xs font-medium text-slate-500 uppercase">Contact Information</span>
          <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {customer.email}
          </p>
          <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {customer.phone}
          </p>
        </div>
      </div>

      {/* AI Behavioral Insights for Customer */}
      {customer.aiInsights && customer.aiInsights.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 p-5 shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              RecoverAI Customer Behavioral Intelligence
            </h3>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {customer.aiInsights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Transaction Ledger */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Payment & Recovery Ledger</h2>
            <p className="text-xs text-slate-500">Historical transactions for this customer</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Rail</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">AI Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.transactions?.map((txn: any) => (
                <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    <Link to={`/transactions/${txn.id}`} className="hover:underline">
                      {txn.transactionId}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-sans block">
                      {formatDate(txn.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {formatINR(txn.amount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {txn.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">
                      {txn.failureReason.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <ScoreGauge score={txn.recoveryAnalysis?.recoveryScore || 50} size="sm" showLabel={false} />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={txn.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/transactions/${txn.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
