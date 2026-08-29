import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Target,
  Clock,
  Send,
  CreditCard,
  Zap,
  TrendingUp,
  ShieldCheck,
  Play,
  CheckCircle2,
  DollarSign,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { StrategyItem } from '../types';

export const StrategiesPage: React.FC = () => {
  const toast = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('SMART_RETRY');
  const [simVolume, setSimVolume] = useState<number>(500);
  const [simResult, setSimResult] = useState<any>(null);

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['strategies-list'],
    queryFn: api.strategies.getAll,
  });

  const simulateMutation = useMutation({
    mutationFn: (params: { strategy: string; transactionCount: number }) =>
      api.strategies.simulate(params.strategy, params.transactionCount),
    onSuccess: (data) => {
      setSimResult(data);
      toast.success(
        `Simulation Completed for ${data.strategy}`,
        `Expected to recover ${formatINR(data.expectedRecovery)} with an estimated ROI of ${data.roi}x.`
      );
    },
    onError: (err: any) => {
      toast.error('Simulation Failed', err.message);
    },
  });

  const handleRunSimulation = (stratCode: string) => {
    setSelectedStrategy(stratCode);
    simulateMutation.mutate({ strategy: stratCode, transactionCount: simVolume });
  };

  const getStrategyIcon = (code: string) => {
    switch (code) {
      case 'SMART_RETRY':
        return <Clock className="w-6 h-6 text-indigo-600" />;
      case 'CUSTOMER_REMINDER':
        return <Send className="w-6 h-6 text-emerald-600" />;
      case 'ALT_PAYMENT':
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'AI_DYNAMIC_ORCHESTRATION':
        return <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />;
      default:
        return <Target className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Recovery Strategies & Orchestration
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Automated Rules
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Pre-built and autonomous recovery protocols engineered for Indian payment rails. Simulate strategy benchmarks
          against real transaction portfolios.
        </p>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies?.map((strat) => (
          <div
            key={strat.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    {getStrategyIcon(strat.code)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{strat.name}</h3>
                    <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                      Confidence: {strat.confidence}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {strat.recoveryRate}% Recovery Rate
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{strat.description}</p>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Audience:</span>
                  <span className="font-semibold text-slate-800 text-right">{strat.targetAudience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended Window:</span>
                  <span className="font-semibold text-slate-800">{strat.recommendedWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Cost / Txn:</span>
                  <span className="font-semibold text-slate-800">₹{strat.costPerTransaction.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Benchmark ROI:</span>
                  <span className="font-bold text-emerald-700">{strat.roi}x</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Ready for deployment</span>
              <button
                onClick={() => handleRunSimulation(strat.code)}
                disabled={simulateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {simulateMutation.isPending && selectedStrategy === strat.code ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Run Simulation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Result Card if active */}
      {simResult && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 p-6 shadow-card animate-scale-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Simulation Outcome: {simResult.strategy}
                </h3>
                <p className="text-xs text-slate-500">
                  Tested across {simResult.transactionCount} transactions (Total volume: {formatINR(simResult.totalVolume)})
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-full">
              ID: {simResult.simulationId.substring(0, 10)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-subtle">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Recaptured</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{formatINR(simResult.expectedRecovery)}</p>
              <span className="text-[10px] text-slate-400">{simResult.recoveryRate}% conversion</span>
            </div>
            <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-subtle">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Cost</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{formatINR(simResult.estimatedCost)}</p>
              <span className="text-[10px] text-slate-400">Gateway + Messaging API</span>
            </div>
            <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-subtle">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Recovered Cash</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{formatINR(simResult.netRecovered)}</p>
              <span className="text-[10px] text-slate-400">After all operational expenses</span>
            </div>
            <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-subtle">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Strategy ROI</span>
              <p className="text-2xl font-black text-teal-600 mt-1">{simResult.roi}x</p>
              <span className="text-[10px] text-slate-400">Return on investment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
