export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET';

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
  recoveryScore: number; // 0 - 100
  expectedRecovery: number; // calculated in INR
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
