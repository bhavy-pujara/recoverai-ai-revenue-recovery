import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatINR } from '../../lib/utils';
import { X, RefreshCw, Send, Calendar, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';

export type ActionModalType = 'retry' | 'remind' | 'schedule' | 'mark-recovered' | 'mark-lost' | null;

interface ActionModalProps {
  type: ActionModalType;
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: ActionModalType, payload: any) => Promise<void>;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  transaction,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [channel, setChannel] = useState<string>('WHATSAPP');
  const [scheduledHours, setScheduledHours] = useState<number>(4);
  const [customAmount, setCustomAmount] = useState<number>(transaction?.amount || 0);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !transaction || !type) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      let payload: any = {};
      if (type === 'retry') {
        payload = { channel: 'DIRECT_RETRY' };
      } else if (type === 'remind') {
        payload = { channel };
      } else if (type === 'schedule') {
        payload = { scheduledHours };
      } else if (type === 'mark-recovered') {
        payload = { amount: customAmount || transaction.amount };
      }
      await onConfirm(type, payload);
      onClose();
    } catch (err) {
      console.error('Modal action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModalConfig = () => {
    switch (type) {
      case 'retry':
        return {
          title: 'Execute Smart Retry',
          subtitle: `Trigger instant automated retry for transaction ${transaction.transactionId}`,
          icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
          confirmText: 'Run Instant Retry',
          confirmBtnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        };
      case 'remind':
        return {
          title: 'Send Recovery Reminder',
          subtitle: `Dispatch interactive checkout link to ${transaction.customer.name}`,
          icon: <Send className="w-6 h-6 text-emerald-600" />,
          confirmText: 'Send Notification',
          confirmBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'schedule':
        return {
          title: 'Schedule Automated Retry',
          subtitle: `AI-calculated window to bypass temporary banking network downtime`,
          icon: <Calendar className="w-6 h-6 text-blue-600" />,
          confirmText: 'Schedule Retry',
          confirmBtnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'mark-recovered':
        return {
          title: 'Mark Payment Recovered',
          subtitle: `Manually reconcile captured payment into ledger`,
          icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
          confirmText: 'Confirm Recovery',
          confirmBtnClass: 'bg-teal-600 hover:bg-teal-700 text-white',
        };
      case 'mark-lost':
        return {
          title: 'Mark as Lost / Unrecoverable',
          subtitle: `Conclude recovery workflow for ${transaction.transactionId}`,
          icon: <AlertOctagon className="w-6 h-6 text-rose-600" />,
          confirmText: 'Mark Lost',
          confirmBtnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-elevated border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
              {config.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
              <p className="text-xs text-slate-500">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase">Customer</span>
              <p className="text-sm font-semibold text-slate-900">{transaction.customer.name}</p>
              <p className="text-xs text-slate-500">{transaction.customer.email}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 uppercase">Amount</span>
              <p className="text-lg font-bold text-slate-900">{formatINR(transaction.amount)}</p>
              <span className="text-xs text-indigo-600 font-semibold">{transaction.paymentMethod}</span>
            </div>
          </div>

          {type === 'remind' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Dispatch Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['WHATSAPP', 'SMS', 'EMAIL'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
                      channel === ch
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'schedule' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Retry Delay (Hours)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 4, 12, 24].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setScheduledHours(hrs)}
                    className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
                      scheduledHours === hrs
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    +{hrs} Hours
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'mark-recovered' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Confirmed Captured Amount (₹)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {transaction.recoveryAnalysis && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-900">
              <span className="font-bold">AI Recommendation:</span>{' '}
              {transaction.recoveryAnalysis.parsedExplanation?.summary ||
                `Score: ${transaction.recoveryAnalysis.recoveryScore}% (${transaction.recoveryAnalysis.priority} priority)`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition-all ${
              config.confirmBtnClass
            } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
