import { RecoveryEngine, classifyFailure, getCustomerValueTier } from '../ai/recoveryEngine';
import { AIScoringInput } from '../ai/types';

describe('RecoverAI Recovery Engine & Classifier Tests', () => {
  describe('classifyFailure', () => {
    it('should classify bank server drop and timeout as TEMPORARY', () => {
      const result = classifyFailure('BANK_SERVER_DOWN', 'ERR_UPI_PSP_DOWN');
      expect(result.category).toBe('TEMPORARY');
      expect(result.explanation.toLowerCase()).toContain('transient');
    });

    it('should classify insufficient funds as CUSTOMER_ACTION', () => {
      const result = classifyFailure('INSUFFICIENT_FUNDS', 'ERR_INSUFFICIENT_BAL');
      expect(result.category).toBe('CUSTOMER_ACTION');
    });

    it('should classify expired card as PAYMENT_METHOD', () => {
      const result = classifyFailure('CARD_EXPIRED', 'ERR_CARD_EXPIRED');
      expect(result.category).toBe('PAYMENT_METHOD');
    });

    it('should classify fraud suspicion as HIGH_RISK', () => {
      const result = classifyFailure('FRAUD_SUSPECTED', 'ERR_RISK_VELOCITY');
      expect(result.category).toBe('HIGH_RISK');
    });
  });

  describe('getCustomerValueTier', () => {
    it('should assign VIP tier for LTV >= 1,00,000 INR', () => {
      expect(getCustomerValueTier(150000)).toBe('VIP');
    });

    it('should assign HIGH tier for LTV between 50k and 100k INR', () => {
      expect(getCustomerValueTier(75000)).toBe('HIGH');
    });

    it('should assign MEDIUM tier for LTV between 15k and 50k INR', () => {
      expect(getCustomerValueTier(25000)).toBe('MEDIUM');
    });

    it('should assign LOW tier for LTV < 15k INR', () => {
      expect(getCustomerValueTier(5000)).toBe('LOW');
    });
  });

  describe('RecoveryEngine.analyze', () => {
    it('should compute high recovery score for reliable customer with temporary network failure', () => {
      const input: AIScoringInput = {
        amount: 24500,
        paymentMethod: 'UPI',
        failureReason: 'BANK_SERVER_DOWN',
        failureCode: 'ERR_UPI_PSP_DOWN',
        lifetimeValue: 145000,
        totalTransactions: 25,
        successfulTransactions: 23,
        failedTransactions: 2,
        activityLevel: 'HIGH',
        subscriptionStatus: 'ACTIVE',
        daysSinceLastSuccess: 2,
        retryAttemptsCount: 0,
      };

      const result = RecoveryEngine.analyze(input);

      expect(result.recoveryScore).toBeGreaterThanOrEqual(80);
      expect(result.failureCategory).toBe('TEMPORARY');
      expect(result.recommendedAction).toBe('RETRY_LATER');
      expect(result.recommendedChannel).toBe('DIRECT_RETRY');
      expect(result.priority).toBe('CRITICAL');
      expect(result.expectedRecovery).toBe(Math.round(24500 * (result.recoveryScore / 100)));
      expect(result.explanation.positiveFactors.length).toBeGreaterThan(0);
    });

    it('should recommend WhatsApp notification and 24h delay for insufficient funds', () => {
      const input: AIScoringInput = {
        amount: 8500,
        paymentMethod: 'DEBIT_CARD',
        failureReason: 'INSUFFICIENT_FUNDS',
        lifetimeValue: 45000,
        totalTransactions: 10,
        successfulTransactions: 8,
        failedTransactions: 2,
        activityLevel: 'MEDIUM',
        subscriptionStatus: 'ACTIVE',
        daysSinceLastSuccess: 5,
        retryAttemptsCount: 0,
      };

      const result = RecoveryEngine.analyze(input);

      expect(result.recoveryScore).toBeGreaterThan(50);
      expect(result.failureCategory).toBe('CUSTOMER_ACTION');
      expect(result.recommendedAction).toBe('NOTIFY_CUSTOMER');
      expect(result.retryAfterHours).toBe(24);
    });

    it('should cap recovery score and flag low priority for high-risk fraud cases', () => {
      const input: AIScoringInput = {
        amount: 95000,
        paymentMethod: 'CREDIT_CARD',
        failureReason: 'FRAUD_SUSPECTED',
        lifetimeValue: 10000,
        totalTransactions: 1,
        successfulTransactions: 0,
        failedTransactions: 1,
        activityLevel: 'LOW',
        subscriptionStatus: 'CHURNED',
        daysSinceLastSuccess: 60,
        retryAttemptsCount: 1,
      };

      const result = RecoveryEngine.analyze(input);

      expect(result.recoveryScore).toBeLessThanOrEqual(25);
      expect(result.priority).toBe('LOW');
      expect(result.riskLevel).toBe('CRITICAL');
      expect(result.recommendedAction).toBe('MANUAL_REVIEW');
    });

    it('should penalize repeated retry attempts to prevent customer fatigue', () => {
      const baseInput: AIScoringInput = {
        amount: 5000,
        paymentMethod: 'UPI',
        failureReason: 'GATEWAY_TIMEOUT',
        lifetimeValue: 30000,
        totalTransactions: 5,
        successfulTransactions: 4,
        failedTransactions: 1,
        activityLevel: 'MEDIUM',
        subscriptionStatus: 'ACTIVE',
        daysSinceLastSuccess: 4,
        retryAttemptsCount: 0,
      };

      const freshAttempt = RecoveryEngine.analyze(baseInput);
      const fatiguedAttempt = RecoveryEngine.analyze({ ...baseInput, retryAttemptsCount: 3 });

      expect(freshAttempt.recoveryScore).toBeGreaterThan(fatiguedAttempt.recoveryScore);
      expect(fatiguedAttempt.explanation.negativeFactors.some((f) => f.includes('fatigue'))).toBe(true);
    });
  });
});
