import prisma from '../db/prisma';

export interface StrategyDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  targetAudience: string;
  recommendedWindow: string;
  recoveryRate: number; // e.g. 78.5%
  confidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  costPerTransaction: number; // in INR
  roi: number; // e.g. 18.2x
  bestForCategories: string[];
}

export class StrategyService {
  /**
   * Returns standard revenue recovery strategies with active benchmark statistics
   */
  static async getStrategies(): Promise<StrategyDefinition[]> {
    return [
      {
        id: 'strat_smart_retry',
        name: 'Smart Scheduled Retry',
        code: 'SMART_RETRY',
        description: 'Dynamically schedules payment retry after optimal 2-6 hour window for transient bank and gateway network drops without disturbing the customer.',
        targetAudience: 'Temporary gateway drops, bank server timeouts, PSP downtime',
        recommendedWindow: 'T+2 to T+6 Hours (Off-peak bank traffic)',
        recoveryRate: 86.4,
        confidence: 'VERY_HIGH',
        costPerTransaction: 1.5,
        roi: 28.5,
        bestForCategories: ['TEMPORARY'],
      },
      {
        id: 'strat_customer_reminder',
        name: 'Personalized Customer Reminder',
        code: 'CUSTOMER_REMINDER',
        description: 'Dispatches instant interactive WhatsApp & SMS notifications with 1-click retry authorization for insufficient funds or 3DS authentication drops.',
        targetAudience: 'Insufficient funds, 3DS authentication timeout, user drop-offs',
        recommendedWindow: 'Immediate (T+15m for Auth, T+24h for Payday balance)',
        recoveryRate: 74.2,
        confidence: 'HIGH',
        costPerTransaction: 3.8,
        roi: 16.4,
        bestForCategories: ['CUSTOMER_ACTION'],
      },
      {
        id: 'strat_alt_payment',
        name: 'Alternative Payment Method Fallback',
        code: 'ALT_PAYMENT',
        description: 'Intelligently detects failed payment instruments (expired card, limit hit) and presents a pre-configured UPI / alternate card seamless checkout link.',
        targetAudience: 'Expired cards, invalid credentials, unsupported bank instruments',
        recommendedWindow: 'Immediate in-app prompt or WhatsApp magic link',
        recoveryRate: 68.0,
        confidence: 'HIGH',
        costPerTransaction: 2.2,
        roi: 21.0,
        bestForCategories: ['PAYMENT_METHOD'],
      },
      {
        id: 'strat_dynamic_ai',
        name: 'AI Dynamic Orchestration',
        code: 'AI_DYNAMIC_ORCHESTRATION',
        description: 'End-to-end autonomous model that evaluates LTV, risk score, and failure taxonomy to select optimal hybrid strategy per individual transaction.',
        targetAudience: 'All transaction failures with autonomous multi-channel routing',
        recommendedWindow: 'Adaptive algorithmic timing',
        recoveryRate: 81.8,
        confidence: 'VERY_HIGH',
        costPerTransaction: 2.8,
        roi: 24.2,
        bestForCategories: ['TEMPORARY', 'CUSTOMER_ACTION', 'PAYMENT_METHOD'],
      },
    ];
  }

  /**
   * Simulates recovery execution for a chosen strategy across specified volume
   */
  static async simulateStrategy(strategyCode: string, transactionCount: number = 500) {
    const strategies = await this.getStrategies();
    const strategy = strategies.find((s: StrategyDefinition) => s.code === strategyCode) || strategies[0];

    const avgTicket = 4500;
    const totalVolume = transactionCount * avgTicket;
    const expectedRecovery = Math.round(totalVolume * (strategy.recoveryRate / 100));
    const estimatedCost = Math.round(transactionCount * strategy.costPerTransaction);
    const netRecovered = expectedRecovery - estimatedCost;
    const computedROI = estimatedCost > 0 ? Number((netRecovered / estimatedCost).toFixed(1)) : strategy.roi;

    const record = await prisma.strategySimulation.create({
      data: {
        strategy: strategy.code,
        transactionCount,
        expectedRecovery,
        recoveryRate: strategy.recoveryRate,
        estimatedCost,
        roi: computedROI,
      },
    });

    return {
      simulationId: record.id,
      strategy: strategy.name,
      strategyCode: strategy.code,
      transactionCount,
      totalVolume,
      expectedRecovery,
      recoveryRate: strategy.recoveryRate,
      estimatedCost,
      netRecovered,
      roi: computedROI,
      createdAt: record.createdAt,
    };
  }
}
