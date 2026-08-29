import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Crown,
  AlertTriangle,
  UserX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../lib/utils';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { SkeletonTable } from '../components/ui/SkeletonTable';
import { EmptyState } from '../components/ui/EmptyState';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['customers', page, search, segment],
    queryFn: () =>
      api.customers.getAll({
        page,
        limit: 12,
        search: search || undefined,
        segment: segment !== 'ALL' ? segment : undefined,
      }),
  });

  const customers = response?.data || [];
  const pagination = response?.pagination;

  const getSegmentBadge = (seg: string) => {
    switch (seg) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
            <Crown className="w-3 h-3 text-amber-600" />
            VIP Enterprise
          </span>
        );
      case 'HIGH_RECOVERY':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            High Recovery
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase bg-rose-50 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            At Risk
          </span>
        );
      case 'CHURN_RISK':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full">
            <UserX className="w-3 h-3 text-slate-500" />
            Churn Risk
          </span>
        );
      default:
        return (
          <span className="font-semibold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Customer Intelligence & Segmentation
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Behavioral Scoring
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track customer lifetime value, historical payment success ratios, and individual recovery probabilities to
          tailor recovery channels.
        </p>
      </div>

      {/* Search and Segment Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Segments' },
            { id: 'VIP', label: 'VIP (LTV ₹1L+)' },
            { id: 'HIGH_RECOVERY', label: 'High Recovery' },
            { id: 'AT_RISK', label: 'At Risk' },
            { id: 'CHURN_RISK', label: 'Churn Risk' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSegment(s.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                segment === s.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={10} columns={7} />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers match criteria"
            description="Try changing your search parameters or selecting another segment filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setSegment('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Lifetime Value (LTV)</th>
                  <th className="py-3.5 px-4">Success Rate</th>
                  <th className="py-3.5 px-4">Failures</th>
                  <th className="py-3.5 px-4">Recovery Score</th>
                  <th className="py-3.5 px-4">Segment</th>
                  <th className="py-3.5 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/customers/${c.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 hover:underline block"
                          >
                            {c.name}
                          </Link>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {formatINR(c.lifetimeValue)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              c.successRate && c.successRate >= 80
                                ? 'bg-emerald-500'
                                : c.successRate && c.successRate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${c.successRate || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{c.successRate}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.successfulTransactions} successful</span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-rose-600">
                      {c.failedTransactions} failed
                    </td>

                    <td className="py-4 px-4">
                      <ScoreGauge score={c.avgRecoveryScore || 70} size="sm" showLabel={false} />
                    </td>

                    <td className="py-4 px-4">{getSegmentBadge(c.segment || 'STANDARD')}</td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/customers/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <span>History</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
