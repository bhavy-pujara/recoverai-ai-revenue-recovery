export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET';
export type TransactionStatus = 'FAILED' | 'RECOVERED' | 'RETRYING' | 'SCHEDULED' | 'LOST' | 'SUCCESS';
export type FailureCategory = 'TEMPORARY' | 'CUSTOMER_ACTION' | 'PAYMENT_METHOD' | 'HIGH_RISK';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendedAction = 'RETRY_LATER' | 'NOTIFY_CUSTOMER' | 'ALT_PAYMENT_METHOD' | 'MANUAL_REVIEW';
export type RecommendedChannel = 'DIRECT_RETRY' | 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP' | 'WEBHOOK';
export type CustomerValueTier = 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIScoringInput {
  amount: number;
  paymentMethod: PaymentMethod | string;
  failureReason: string;
  failureCode?: string;
  lifetimeValue?: number;
  totalTransactions?: number;
  successfulTransactions?: number;
  failedTransactions?: number;
  activityLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'DORMANT' | string;
  subscriptionStatus?: 'ACTIVE' | 'PAST_DUE' | 'CHURNED' | 'TRIAL' | string;
  daysSinceLastSuccess?: number;
  retryAttemptsCount?: number;
  lastAttemptResult?: string;
}

export interface FactorScore {
  name: string;
  weightMax: number;
  score: number;
  label: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface AIExplanation {
  positiveFactors: string[];
  negativeFactors: string[];
  factorBreakdown: FactorScore[];
  confidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  summary: string;
}

export interface AIScoringResult {
  recoveryScore: number;
  expectedRecovery: number;
  priority: Priority;
  recommendedAction: RecommendedAction;
  recommendedChannel: RecommendedChannel;
  retryAfterHours: number;
  customerValue: CustomerValueTier;
  riskLevel: RiskLevel;
  failureCategory: FailureCategory;
  failureExplanation: string;
  explanation: AIExplanation;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifetimeValue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  activityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'DORMANT' | string;
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CHURNED' | 'TRIAL' | string;
  successRate?: number;
  segment?: string;
  avgRecoveryScore?: number;
  recentTransactions?: Transaction[];
  transactions?: Transaction[];
  createdAt: string;
  updatedAt?: string;
}

export interface RecoveryAnalysis {
  id: string;
  transactionId: string;
  recoveryScore: number;
  expectedRecovery: number;
  priority: Priority;
  recommendedAction: RecommendedAction;
  recommendedChannel: RecommendedChannel;
  retryAfterHours: number;
  customerValue: CustomerValueTier;
  riskLevel: RiskLevel;
  explanation: string;
  parsedExplanation?: AIExplanation;
  createdAt: string;
}

export interface RecoveryAttempt {
  id: string;
  transactionId: string;
  action: string;
  channel: string;
  status: string;
  attemptedAt: string;
  result: string;
  recoveredAmount: number;
}

export interface Transaction {
  id: string;
  transactionId: string;
  customerId: string;
  customer: Customer;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failureReason: string;
  failureCode: string;
  failureCategory: FailureCategory;
  createdAt: string;
  updatedAt: string;
  recoveryAnalysis?: RecoveryAnalysis | null;
  recoveryAttempts?: RecoveryAttempt[];
}

export interface OverviewMetrics {
  totalFailedPayments: number;
  atRiskRevenue: number;
  aiRecoveryOpportunityCount: number;
  expectedRecoverableRevenue: number;
  revenueRecovered: number;
  lostRevenue: number;
  recoveryRate: number;
  avgRecoveryHours: number;
  totalTransactionsCount: number;
  totalAttemptsCount: number;
  highPriorityCount: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  revenue: number;
  percentage: number;
  description: string;
}

export interface TrendDataPoint {
  date: string;
  formattedDate: string;
  failed: number;
  recovered: number;
  lost: number;
}

export interface PaymentMethodStat {
  paymentMethod: string;
  displayName: string;
  totalTransactions: number;
  failedCount: number;
  recoveredCount: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface FailureReasonStat {
  reason: string;
  rawReason: string;
  category: FailureCategory;
  count: number;
  recoveredCount: number;
  totalAmount: number;
  recoverabilityRate: number;
}

export interface AIInsight {
  id: string;
  type: 'OPPORTUNITY' | 'ALERT' | 'TREND' | 'OPTIMIZATION';
  title: string;
  description: string;
  metric: string;
  impact: 'HIGH' | 'MEDIUM' | 'POSITIVE';
}

export interface StrategyItem {
  id: string;
  name: string;
  code: string;
  description: string;
  targetAudience: string;
  recommendedWindow: string;
  recoveryRate: number;
  confidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  costPerTransaction: number;
  roi: number;
  bestForCategories: string[];
}

export interface SimulationResult {
  simulationId: string;
  parameters: {
    transactionCount: number;
    avgTicketSize: number;
    strategyProfile: string;
    totalFailedRevenue: number;
  };
  beforeAI: {
    recoveryRate: number;
    recoveredRevenue: number;
    lostRevenue: number;
    estimatedCost: number;
  };
  afterAI: {
    recoveryRate: number;
    recoveredRevenue: number;
    lostRevenue: number;
    additionalRevenueRecovered: number;
    recoveryImprovementPercentage: number;
    estimatedCost: number;
    roi: number;
  };
  categoryBreakdown: Array<{
    category: string;
    label: string;
    transactionCount: number;
    volume: number;
    baselineRate: number;
    baselineRecovered: number;
    aiRecoveryRate: number;
    aiRecovered: number;
    additionalRecovered: number;
  }>;
  projectedAnnualSavings: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
