import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send,
  Calendar,
  ExternalLink,
  Plus,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { SkeletonTable } from '../components/ui/SkeletonTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ActionModal, ActionModalType } from '../components/ui/ActionModal';
import { useToast } from '../context/ToastContext';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'recoveryScore' | 'expectedRecovery'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modal State
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['transactions', page, search, statusFilter, methodFilter, categoryFilter, sortBy, sortOrder],
    queryFn: () =>
      api.transactions.getAll({
        page,
        limit: 12,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        paymentMethod: methodFilter !== 'ALL' ? methodFilter : undefined,
        failureCategory: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        sortBy,
        sortOrder,
      }),
  });

  const transactions = response?.data || [];
  const pagination = response?.pagination;

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

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    } catch (err: any) {
      toast.error('Action Failed', err.message);
    }
  };

  const toggleSort = (field: 'createdAt' | 'amount' | 'recoveryScore' | 'expectedRecovery') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Payment Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulated Indian payment stream with granular AI telemetry, failure codes, and recovery state machine.
          </p>
        </div>

        <Link
          to="/ai-engine"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulate Custom Failure</span>
        </Link>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Txn ID, customer name, email, or failure reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="FAILED">Failed</option>
            <option value="RECOVERED">Recovered</option>
            <option value="RETRYING">Retrying</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Rail: All Rails</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">Wallet</option>
          </select>

          {/* Failure Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Category: All</option>
            <option value="TEMPORARY">Temporary Glitch</option>
            <option value="CUSTOMER_ACTION">Customer Action</option>
            <option value="PAYMENT_METHOD">Payment Method</option>
            <option value="HIGH_RISK">High Risk</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={10} columns={8} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try broadening your search keywords or adjusting your filter selections."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('ALL');
              setMethodFilter('ALL');
              setCategoryFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Rail</th>
                  <th className="py-3.5 px-4">Failure Reason</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('recoveryScore')}
                  >
                    <div className="flex items-center gap-1">
                      <span>AI Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const score = txn.recoveryAnalysis?.recoveryScore || 50;

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        <Link
                          to={`/transactions/${txn.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{txn.transactionId}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                          {formatDate(txn.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{txn.customer?.name}</p>
                        <p className="text-[11px] text-slate-400">{txn.customer?.email}</p>
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
                        <span className="font-medium text-slate-800 block">
                          {txn.failureReason.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">{txn.failureCode}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <ScoreGauge score={score} size="sm" showLabel={false} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={txn.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {txn.status === 'FAILED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTxn(txn);
                                setModalType('retry');
                              }}
                              title="Smart Retry"
                              className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-200 p-1.5 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTxn(txn);
                                setModalType('remind');
                              }}
                              title="Send WhatsApp/SMS Reminder"
                              className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 p-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/transactions/${txn.id}`}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
