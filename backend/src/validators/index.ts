import { z } from 'zod';

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().optional(),
  status: z.string().optional(),
  failureCategory: z.string().optional(),
  paymentMethod: z.string().optional(),
  priority: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'recoveryScore', 'expectedRecovery']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CreateTransactionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('INR'),
  paymentMethod: z.enum(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET']),
  failureReason: z.string().min(1, 'Failure reason is required'),
  failureCode: z.string().optional().default('ERR_PAYMENT_FAILED'),
});

export const AIAnalyzeSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.string().default('UPI'),
  failureReason: z.string().min(1, 'Failure reason is required'),
  failureCode: z.string().optional().default(''),
  lifetimeValue: z.number().nonnegative().optional().default(0),
  totalTransactions: z.number().int().nonnegative().optional().default(1),
  successfulTransactions: z.number().int().nonnegative().optional().default(0),
  failedTransactions: z.number().int().nonnegative().optional().default(1),
  activityLevel: z.enum(['HIGH', 'MEDIUM', 'LOW', 'DORMANT']).optional().default('MEDIUM'),
  subscriptionStatus: z.enum(['ACTIVE', 'PAST_DUE', 'CHURNED', 'TRIAL']).optional().default('ACTIVE'),
  daysSinceLastSuccess: z.number().nonnegative().optional().default(5),
  retryAttemptsCount: z.number().int().nonnegative().optional().default(0),
});

export const RecoveryActionSchema = z.object({
  channel: z.enum(['DIRECT_RETRY', 'WHATSAPP', 'SMS', 'EMAIL', 'IN_APP', 'WEBHOOK']).optional(),
  notes: z.string().optional(),
  scheduledHours: z.number().int().min(1).max(168).optional(),
});

export const SimulationRunSchema = z.object({
  transactionCount: z.union([z.literal(100), z.literal(500), z.literal(1000), z.literal(5000)]),
  avgTicketSize: z.number().positive().optional().default(3850),
  strategyProfile: z.enum(['AGGRESSIVE', 'BALANCED', 'CONSERVATIVE']).optional().default('BALANCED'),
});

export const StrategySimulateSchema = z.object({
  strategy: z.enum(['SMART_RETRY', 'CUSTOMER_REMINDER', 'ALT_PAYMENT', 'AI_DYNAMIC_ORCHESTRATION']),
  transactionCount: z.number().int().min(10).max(10000).default(500),
});
