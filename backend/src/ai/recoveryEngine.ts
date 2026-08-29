import {
  AIScoringInput,
  AIScoringResult,
  CustomerValueTier,
  FailureCategory,
  FactorScore,
  Priority,
  RecommendedAction,
  RecommendedChannel,
  RiskLevel,
} from './types';

/**
 * Classifies failure reason into standardized categories
 */
export function classifyFailure(reason: string, code?: string): {
  category: FailureCategory;
  explanation: string;
} {
  const normReason = (reason || '').toUpperCase();
  const normCode = (code || '').toUpperCase();

  // High Risk
  if (
    normReason.includes('FRAUD') ||
    normReason.includes('SUSPICIOUS') ||
    normReason.includes('VELOCITY') ||
    normReason.includes('BLACKLIST') ||
    normCode.includes('FRAUD')
  ) {
    return {
      category: 'HIGH_RISK',
      explanation: 'Potential fraud trigger or security block detected by risk engine.',
    };
  }

  // Temporary Glitches
  if (
    normReason.includes('TIMEOUT') ||
    normReason.includes('GATEWAY') ||
    normReason.includes('BANK_SERVER') ||
    normReason.includes('NETWORK') ||
    normReason.includes('PSP_DOWN') ||
    normReason.includes('DOWNTIME') ||
    normCode.includes('TIMEOUT') ||
    normCode.includes('PSP_DOWN')
  ) {
    return {
      category: 'TEMPORARY',
      explanation: 'Transient infrastructure or banking network glitch. Highly likely to succeed upon scheduled retry.',
    };
  }

  // Payment Method Problem
  if (
    normReason.includes('EXPIRED') ||
    normReason.includes('INVALID_CARD') ||
    normReason.includes('INVALID_CVV') ||
    normReason.includes('UNSUPPORTED') ||
    normReason.includes('BLOCKED_CARD') ||
    normReason.includes('INCORRECT_DETAILS') ||
    normCode.includes('CARD_EXPIRED')
  ) {
    return {
      category: 'PAYMENT_METHOD',
      explanation: 'Payment instrument issue (expired card, invalid credentials, or unsupported method).',
    };
  }

  // Customer Action Required (Default / Common)
  if (
    normReason.includes('INSUFFICIENT') ||
    normReason.includes('LIMIT_EXCEEDED') ||
    normReason.includes('AUTH_FAILED') ||
    normReason.includes('3DS') ||
    normReason.includes('OTP') ||
    normReason.includes('DECLINED_BY_USER') ||
    normReason.includes('USER_CANCELLED')
  ) {
    return {
      category: 'CUSTOMER_ACTION',
      explanation: 'Customer action needed (e.g. fund account, authorize 3DS/OTP, or accept collect request).',
    };
  }

  // Fallback
  return {
    category: 'CUSTOMER_ACTION',
    explanation: 'Transaction declined. Direct customer engagement recommended.',
  };
}

/**
 * Determines Customer Value Tier based on LTV & historical spend
 */
export function getCustomerValueTier(ltv: number = 0): CustomerValueTier {
  if (ltv >= 100000) return 'VIP';
  if (ltv >= 50000) return 'HIGH';
  if (ltv >= 15000) return 'MEDIUM';
  return 'LOW';
}

/**
 * Deterministic AI Scoring Engine for Payment Revenue Recovery
 */
export class RecoveryEngine {
  /**
   * Evaluates a failed transaction and generates comprehensive recovery intelligence
   */
  public static analyze(input: AIScoringInput): AIScoringResult {
    const {
      amount = 0,
      paymentMethod = 'UPI',
      failureReason = 'INSUFFICIENT_FUNDS',
      failureCode = '',
      lifetimeValue = 0,
      totalTransactions = 1,
      successfulTransactions = 0,
      failedTransactions = 1,
      activityLevel = 'MEDIUM',
      subscriptionStatus = 'ACTIVE',
      daysSinceLastSuccess = 5,
      retryAttemptsCount = 0,
    } = input;

    const { category, explanation: failureExplanation } = classifyFailure(failureReason, failureCode);
    const customerValue = getCustomerValueTier(lifetimeValue);

    const factorScores: FactorScore[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    // 1. Payment History Weight (30%)
    let historyScore = 0;
    const totalPrior = successfulTransactions + failedTransactions;
    const successRatio = totalPrior > 0 ? successfulTransactions / totalPrior : 0.5;

    if (successRatio >= 0.85 && successfulTransactions >= 3) {
      historyScore = 30;
      positiveFactors.push(`Strong historical payment success rate (${Math.round(successRatio * 100)}%) across ${successfulTransactions} orders`);
    } else if (successRatio >= 0.65) {
      historyScore = 22;
      positiveFactors.push(`Reliable past customer history with ${successfulTransactions} successful payments`);
    } else if (successRatio >= 0.35) {
      historyScore = 14;
      positiveFactors.push('Moderate transaction track record with previous completions');
    } else {
      historyScore = 6;
      negativeFactors.push('Low historical payment success rate or newly registered payer profile');
    }

    factorScores.push({
      name: 'Payment History',
      weightMax: 30,
      score: historyScore,
      label: `${historyScore}/30 pts`,
      impact: historyScore >= 20 ? 'positive' : historyScore >= 12 ? 'neutral' : 'negative',
    });

    // 2. Failure Category Weight (20%)
    let failureScore = 0;
    if (category === 'TEMPORARY') {
      failureScore = 20;
      positiveFactors.push('Temporary infrastructure/banking network failure (auto-recoverable)');
    } else if (category === 'CUSTOMER_ACTION') {
      if (failureReason.toUpperCase().includes('INSUFFICIENT')) {
        failureScore = 14;
        positiveFactors.push('Insufficient balance is commonly recovered via payday / reminder prompt');
      } else {
        failureScore = 16;
        positiveFactors.push('Customer authentication / OTP dropped — prompt retry yields quick conversion');
      }
    } else if (category === 'PAYMENT_METHOD') {
      failureScore = 9;
      negativeFactors.push('Payment instrument error requiring customer to switch card or rail');
    } else {
      // HIGH_RISK
      failureScore = 2;
      negativeFactors.push('High-risk/security check triggered — requires manual fraud screening');
    }

    factorScores.push({
      name: 'Failure Classification',
      weightMax: 20,
      score: failureScore,
      label: `${failureScore}/20 pts`,
      impact: failureScore >= 14 ? 'positive' : failureScore >= 8 ? 'neutral' : 'negative',
    });

    // 3. Customer Activity & Subscription (15%)
    let activityScore = 0;
    const act = (activityLevel || 'MEDIUM').toUpperCase();
    if (act === 'HIGH') {
      activityScore = 11;
      positiveFactors.push('High customer engagement and recent platform activity');
    } else if (act === 'MEDIUM') {
      activityScore = 8;
    } else if (act === 'LOW') {
      activityScore = 4;
      negativeFactors.push('Low platform engagement observed in last 30 days');
    } else {
      activityScore = 2;
      negativeFactors.push('Dormant user account profile');
    }

    // Subscription status bonus
    const sub = (subscriptionStatus || 'ACTIVE').toUpperCase();
    if (sub === 'ACTIVE') {
      activityScore += 4;
      positiveFactors.push('Active subscription tier with recurring billing intent');
    } else if (sub === 'TRIAL') {
      activityScore += 3;
    } else if (sub === 'PAST_DUE') {
      activityScore += 1;
    } else {
      activityScore = Math.max(1, activityScore - 2);
      negativeFactors.push('Subscription currently churned or canceled');
    }
    activityScore = Math.min(15, activityScore);

    factorScores.push({
      name: 'Customer Activity & Tier',
      weightMax: 15,
      score: activityScore,
      label: `${activityScore}/15 pts`,
      impact: activityScore >= 11 ? 'positive' : activityScore >= 7 ? 'neutral' : 'negative',
    });

    // 4. Customer Value / LTV (15%)
    let ltvScore = 0;
    if (customerValue === 'VIP') {
      ltvScore = 15;
      positiveFactors.push(`High lifetime value (VIP tier: ₹${lifetimeValue.toLocaleString('en-IN')})`);
    } else if (customerValue === 'HIGH') {
      ltvScore = 12;
      positiveFactors.push(`Established high-value account (₹${lifetimeValue.toLocaleString('en-IN')} LTV)`);
    } else if (customerValue === 'MEDIUM') {
      ltvScore = 8;
    } else {
      ltvScore = 4;
      negativeFactors.push('Entry-level customer lifetime value');
    }

    factorScores.push({
      name: 'Customer Value',
      weightMax: 15,
      score: ltvScore,
      label: `${ltvScore}/15 pts`,
      impact: ltvScore >= 10 ? 'positive' : ltvScore >= 6 ? 'neutral' : 'negative',
    });

    // 5. Recency (10%)
    let recencyScore = 0;
    if (daysSinceLastSuccess <= 3) {
      recencyScore = 10;
      positiveFactors.push(`Recent successful checkout within last ${daysSinceLastSuccess} day(s)`);
    } else if (daysSinceLastSuccess <= 14) {
      recencyScore = 8;
      positiveFactors.push('Recent transaction in last 2 weeks');
    } else if (daysSinceLastSuccess <= 45) {
      recencyScore = 5;
    } else {
      recencyScore = 2;
      negativeFactors.push(`No successful payment in over ${daysSinceLastSuccess} days`);
    }

    factorScores.push({
      name: 'Recency Factor',
      weightMax: 10,
      score: recencyScore,
      label: `${recencyScore}/10 pts`,
      impact: recencyScore >= 7 ? 'positive' : recencyScore >= 4 ? 'neutral' : 'negative',
    });

    // 6. Retry History (10%)
    let retryScore = 0;
    if (retryAttemptsCount === 0) {
      retryScore = 10;
      positiveFactors.push('Fresh failure with zero prior retry fatigue');
    } else if (retryAttemptsCount === 1) {
      retryScore = 7;
      negativeFactors.push('1 previous attempt failed');
    } else if (retryAttemptsCount === 2) {
      retryScore = 3;
      negativeFactors.push('2 previous recovery attempts exhausted');
    } else {
      retryScore = 1;
      negativeFactors.push(`High retry fatigue (${retryAttemptsCount} prior attempts unsuccessful)`);
    }

    factorScores.push({
      name: 'Retry Fatigue & History',
      weightMax: 10,
      score: retryScore,
      label: `${retryScore}/10 pts`,
      impact: retryScore >= 7 ? 'positive' : retryScore >= 4 ? 'neutral' : 'negative',
    });

    // Payment method bonus/adjustment (+/- 3%)
    const normMethod = (paymentMethod || '').toUpperCase();
    let methodAdjustment = 0;
    if (normMethod === 'UPI') {
      methodAdjustment = 2; // UPI instant collect has superior conversion in India
      positiveFactors.push('UPI rail provides high mobile notification conversion');
    } else if (normMethod === 'CREDIT_CARD') {
      methodAdjustment = 1;
    } else if (normMethod === 'NET_BANKING') {
      methodAdjustment = -2;
      negativeFactors.push('Net Banking has higher manual friction for recovery re-attempts');
    }

    // Calculate total score normalized between 5 and 99
    let rawScore = historyScore + failureScore + activityScore + ltvScore + recencyScore + retryScore + methodAdjustment;
    if (category === 'HIGH_RISK') {
      rawScore = Math.min(25, rawScore); // Cap high risk
    }
    const recoveryScore = Math.max(5, Math.min(98, Math.round(rawScore)));

    // Expected recovery amount calculation
    const recoveryProbability = recoveryScore / 100;
    const expectedRecovery = Math.round(amount * recoveryProbability);

    // Priority Determination
    let priority: Priority = 'MEDIUM';
    if (category === 'HIGH_RISK') {
      priority = 'LOW';
    } else if (recoveryScore >= 75 && (amount >= 10000 || customerValue === 'VIP')) {
      priority = 'CRITICAL';
    } else if (recoveryScore >= 65 || (recoveryScore >= 50 && amount >= 25000)) {
      priority = 'HIGH';
    } else if (recoveryScore < 40) {
      priority = 'LOW';
    } else {
      priority = 'MEDIUM';
    }

    // Recommended Action & Channel
    let recommendedAction: RecommendedAction = 'NOTIFY_CUSTOMER';
    let recommendedChannel: RecommendedChannel = 'WHATSAPP';
    let retryAfterHours = 4;

    if (category === 'TEMPORARY') {
      recommendedAction = 'RETRY_LATER';
      recommendedChannel = 'DIRECT_RETRY';
      retryAfterHours = 4;
    } else if (category === 'CUSTOMER_ACTION') {
      if (failureReason.toUpperCase().includes('INSUFFICIENT')) {
        recommendedAction = 'NOTIFY_CUSTOMER';
        recommendedChannel = customerValue === 'VIP' ? 'WHATSAPP' : 'SMS';
        retryAfterHours = 24; // Allow balance replenishment
      } else {
        recommendedAction = 'NOTIFY_CUSTOMER';
        recommendedChannel = 'WHATSAPP';
        retryAfterHours = 1;
      }
    } else if (category === 'PAYMENT_METHOD') {
      recommendedAction = 'ALT_PAYMENT_METHOD';
      recommendedChannel = 'WHATSAPP';
      retryAfterHours = 0;
    } else if (category === 'HIGH_RISK') {
      recommendedAction = 'MANUAL_REVIEW';
      recommendedChannel = 'EMAIL';
      retryAfterHours = 0;
    }

    // Confidence
    let confidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
    if (totalPrior >= 10 && retryAttemptsCount <= 1) {
      confidence = 'VERY_HIGH';
    } else if (totalPrior <= 2 || category === 'HIGH_RISK') {
      confidence = 'MODERATE';
    }

    // Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (category === 'HIGH_RISK') {
      riskLevel = 'CRITICAL';
    } else if (recoveryScore < 35 || retryAttemptsCount >= 2) {
      riskLevel = 'HIGH';
    } else if (recoveryScore < 60) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const summary = `RecoverAI predicts an ${recoveryScore}% recovery probability (${priority} priority) with expected recoverable revenue of ₹${expectedRecovery.toLocaleString('en-IN')}. Optimal action is ${recommendedAction.replace(/_/g, ' ')} via ${recommendedChannel}.`;

    return {
      recoveryScore,
      expectedRecovery,
      priority,
      recommendedAction,
      recommendedChannel,
      retryAfterHours,
      customerValue,
      riskLevel,
      failureCategory: category,
      failureExplanation,
      explanation: {
        positiveFactors,
        negativeFactors,
        factorBreakdown: factorScores,
        confidence,
        summary,
      },
    };
  }
}
