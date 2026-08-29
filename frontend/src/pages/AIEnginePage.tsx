import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Cpu,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../lib/utils';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AIScoringResult, AIScoringInput } from '../types';

const PRESETS: Array<{ name: string; desc: string; input: Partial<AIScoringInput> }> = [
  {
    name: 'VIP High-Ticket Gateway Timeout',
    desc: 'High LTV enterprise client during transient PSP banking downtime',
    input: {
      amount: 45000,
      paymentMethod: 'UPI',
      failureReason: 'GATEWAY_TIMEOUT',
      lifetimeValue: 240000,
      totalTransactions: 35,
      successfulTransactions: 33,
      failedTransactions: 2,
      activityLevel: 'HIGH',
      subscriptionStatus: 'ACTIVE',
      daysSinceLastSuccess: 2,
      retryAttemptsCount: 0,
    },
  },
  {
    name: 'Monthly Payday Balance Drop',
    desc: 'Regular subscriber whose debit balance momentarily depleted',
    input: {
      amount: 4999,
      paymentMethod: 'DEBIT_CARD',
      failureReason: 'INSUFFICIENT_FUNDS',
      lifetimeValue: 35000,
      totalTransactions: 12,
      successfulTransactions: 10,
      failedTransactions: 2,
      activityLevel: 'MEDIUM',
      subscriptionStatus: 'ACTIVE',
      daysSinceLastSuccess: 14,
      retryAttemptsCount: 0,
    },
  },
  {
    name: 'Expired Credit Card Instrument',
    desc: 'High value customer requiring alternate payment card switch',
    input: {
      amount: 18500,
      paymentMethod: 'CREDIT_CARD',
      failureReason: 'CARD_EXPIRED',
      lifetimeValue: 85000,
      totalTransactions: 18,
      successfulTransactions: 16,
      failedTransactions: 2,
      activityLevel: 'HIGH',
      subscriptionStatus: 'ACTIVE',
      daysSinceLastSuccess: 7,
      retryAttemptsCount: 0,
    },
  },
  {
    name: 'High Risk Security Alert',
    desc: 'Suspicious new device checkout triggering fraud velocity rule',
    input: {
      amount: 92000,
      paymentMethod: 'CREDIT_CARD',
      failureReason: 'FRAUD_SUSPECTED',
      lifetimeValue: 5000,
      totalTransactions: 1,
      successfulTransactions: 0,
      failedTransactions: 1,
      activityLevel: 'LOW',
      subscriptionStatus: 'CHURNED',
      daysSinceLastSuccess: 60,
      retryAttemptsCount: 1,
    },
  },
];

export const AIEnginePage: React.FC = () => {
  const [formData, setFormData] = useState<Partial<AIScoringInput>>(PRESETS[0].input);
  const [result, setResult] = useState<AIScoringResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (input: Partial<AIScoringInput>) => api.ai.analyze(input),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  // Run initial analysis on mount
  useEffect(() => {
    analyzeMutation.mutate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: keyof AIScoringInput, val: any) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    analyzeMutation.mutate(updated);
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormData(preset.input);
    analyzeMutation.mutate(preset.input);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              AI Decision & Scoring Engine
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Deterministic Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Interactive playground to test RecoverAI's multi-factor scoring model. Adjust variables in real-time to
            inspect mathematical recovery probabilities, factor weights, and automated action triggers.
          </p>
        </div>
      </div>

      {/* Decision Pipeline Visualizer */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Autonomous AI Revenue Recovery Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: '1. Ingestion', label: 'Payment Metadata', desc: 'Rail & failure code' },
            { step: '2. Taxonomy', label: 'Failure Classification', desc: 'Transient vs Action' },
            { step: '3. Intelligence', label: 'Customer Profiling', desc: 'LTV & historical success' },
            { step: '4. Prediction', label: 'Recovery Score', desc: '0-100 weighted probability' },
            { step: '5. Action', label: 'Orchestration', desc: 'Retry window & channel' },
            { step: '6. Output', label: 'Expected Revenue', desc: 'Amount × Probability' },
          ].map((s, idx) => (
            <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 relative group">
              <span className="text-[10px] font-bold text-indigo-600 uppercase block">{s.step}</span>
              <p className="font-bold text-slate-800 mt-1">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Presets Bar */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Test Scenarios</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="text-left rounded-xl border border-slate-200 bg-white p-3.5 shadow-subtle hover:border-indigo-500 hover:shadow-card transition-all group"
            >
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{p.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sandbox: Inputs (Left) & Real-time AI Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Input Parameters</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">Live Evaluation</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Amount */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Transaction Amount: <span className="text-indigo-600 font-bold">{formatINR(formData.amount || 0)}</span>
              </label>
              <input
                type="range"
                min="500"
                max="150000"
                step="500"
                value={formData.amount || 5000}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Payment Rail */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod || 'UPI'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="UPI">UPI (Unified Payments Interface)</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="WALLET">Digital Wallet</option>
              </select>
            </div>

            {/* Failure Reason */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Failure Code / Reason</label>
              <select
                value={formData.failureReason || 'INSUFFICIENT_FUNDS'}
                onChange={(e) => handleChange('failureReason', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="BANK_SERVER_DOWN">BANK_SERVER_DOWN (Temporary Glitch)</option>
                <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (Temporary Glitch)</option>
                <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Customer Action)</option>
                <option value="AUTH_FAILED">AUTH_FAILED (3DS/OTP Drop)</option>
                <option value="CARD_EXPIRED">CARD_EXPIRED (Instrument Error)</option>
                <option value="INVALID_CVV">INVALID_CVV (Credential Error)</option>
                <option value="LIMIT_EXCEEDED">LIMIT_EXCEEDED (Daily Threshold)</option>
                <option value="FRAUD_SUSPECTED">FRAUD_SUSPECTED (High Risk Alert)</option>
              </select>
            </div>

            {/* Customer LTV */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Customer Lifetime Value (LTV): <span className="text-indigo-600 font-bold">{formatINR(formData.lifetimeValue || 0)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="350000"
                step="5000"
                value={formData.lifetimeValue || 50000}
                onChange={(e) => handleChange('lifetimeValue', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Successful Transactions Track Record */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Successful Payments</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.successfulTransactions ?? 10}
                  onChange={(e) => handleChange('successfulTransactions', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Failed Payments</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.failedTransactions ?? 1}
                  onChange={(e) => handleChange('failedTransactions', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold"
                />
              </div>
            </div>

            {/* Activity Level & Subscription */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Activity Level</label>
                <select
                  value={formData.activityLevel || 'HIGH'}
                  onChange={(e) => handleChange('activityLevel', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-800"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                  <option value="DORMANT">DORMANT</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subscription Tier</label>
                <select
                  value={formData.subscriptionStatus || 'ACTIVE'}
                  onChange={(e) => handleChange('subscriptionStatus', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="TRIAL">TRIAL</option>
                  <option value="CHURNED">CHURNED</option>
                </select>
              </div>
            </div>

            {/* Recency & Previous Retry Attempts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Days Since Last Success</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.daysSinceLastSuccess ?? 3}
                  onChange={(e) => handleChange('daysSinceLastSuccess', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prior Retry Attempts</label>
                <select
                  value={formData.retryAttemptsCount ?? 0}
                  onChange={(e) => handleChange('retryAttemptsCount', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-800"
                >
                  <option value="0">0 (Fresh Failure)</option>
                  <option value="1">1 Attempt Made</option>
                  <option value="2">2 Attempts Made</option>
                  <option value="3">3+ (High Fatigue)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time AI Output & Explainability Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-white to-white p-6 shadow-subtle space-y-6">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Computed Recovery Intelligence</h3>
                    <p className="text-xs text-slate-500">Live deterministic result from Express backend</p>
                  </div>
                </div>
                <PriorityBadge priority={result.priority} />
              </div>

              {/* Core Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle flex items-center gap-3">
                  <ScoreGauge score={result.recoveryScore} size="lg" showLabel={false} />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Recovery Score</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {result.recoveryScore >= 75 ? 'High Conversion' : result.recoveryScore >= 50 ? 'Moderate' : 'Low'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Recoverable</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{formatINR(result.expectedRecovery)}</p>
                  <span className="text-[10px] text-slate-400">
                    {result.recoveryScore}% of {formatINR(formData.amount || 0)}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-subtle">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Action</span>
                  <p className="text-xs font-bold text-indigo-700 mt-1">
                    {result.recommendedAction.replace(/_/g, ' ')}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Via {result.recommendedChannel} • T+{result.retryAfterHours}h
                  </span>
                </div>
              </div>

              {/* Explainable Factor Weights Visualizer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Factor Score Breakdown</span>
                  <span className="text-[11px] font-semibold text-indigo-600">
                    Total: {result.recoveryScore} / 100 pts
                  </span>
                </h4>

                <div className="space-y-2">
                  {result.explanation?.factorBreakdown?.map((f) => (
                    <div key={f.name} className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{f.name}</span>
                        <span className="font-mono font-bold text-slate-900">{f.label}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            f.impact === 'positive'
                              ? 'bg-emerald-500'
                              : f.impact === 'negative'
                              ? 'bg-rose-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${(f.score / f.weightMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Natural Language Summary */}
              <div className="rounded-xl bg-indigo-50/80 p-4 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-700" />
                  Decision Explanation for Product Managers:
                </span>
                <p className="leading-relaxed">{result.explanation?.summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
