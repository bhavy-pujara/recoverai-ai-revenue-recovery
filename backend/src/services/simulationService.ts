import prisma from '../db/prisma';

export interface SimulationParams {
  transactionCount: 100 | 500 | 1000 | 5000;
  avgTicketSize?: number;
  strategyProfile?: 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE';
}

export class SimulationService {
  /**
   * Runs a portfolio-scale revenue recovery simulation comparing Before AI vs After AI
   */
  static async runSimulation(params: SimulationParams) {
    const { transactionCount = 500, avgTicketSize = 4250, strategyProfile = 'BALANCED' } = params;

    const totalFailedRevenue = transactionCount * avgTicketSize;

    // Failure category composition percentages in Indian fintech
    const failureDistribution = [
      { category: 'TEMPORARY', label: 'Temporary Gateway/Bank Glitch', share: 0.34, baselineRecovery: 0.35, aiRecovery: 0.88, costPerAttempt: 2.5 },
      { category: 'CUSTOMER_ACTION', label: 'Insufficient Funds / Auth Drop', share: 0.42, baselineRecovery: 0.28, aiRecovery: 0.74, costPerAttempt: 4.0 },
      { category: 'PAYMENT_METHOD', label: 'Card Expired / Invalid Details', share: 0.18, baselineRecovery: 0.12, aiRecovery: 0.62, costPerAttempt: 3.5 },
      { category: 'HIGH_RISK', label: 'Suspicious / Fraud Trigger', share: 0.06, baselineRecovery: 0.02, aiRecovery: 0.04, costPerAttempt: 1.0 },
    ];

    // Multipliers based on strategy profile
    const profileMultiplier = strategyProfile === 'AGGRESSIVE' ? 1.05 : strategyProfile === 'CONSERVATIVE' ? 0.94 : 1.0;

    let baselineRecoveredRevenue = 0;
    let aiRecoveredRevenue = 0;
    let totalAICost = 0;
    let baselineCost = 0;

    const categoryBreakdown = failureDistribution.map((item) => {
      const count = Math.round(transactionCount * item.share);
      const categoryVolume = count * avgTicketSize;

      const baseRate = item.baselineRecovery;
      const baseRecovered = categoryVolume * baseRate;
      baselineRecoveredRevenue += baseRecovered;
      baselineCost += count * 5; // Naive bulk retry cost

      const aiRate = Math.min(0.96, item.aiRecovery * profileMultiplier);
      const aiRecovered = categoryVolume * aiRate;
      aiRecoveredRevenue += aiRecovered;
      totalAICost += count * item.costPerAttempt;

      return {
        category: item.category,
        label: item.label,
        transactionCount: count,
        volume: Math.round(categoryVolume),
        baselineRate: Math.round(baseRate * 100),
        baselineRecovered: Math.round(baseRecovered),
        aiRecoveryRate: Math.round(aiRate * 100),
        aiRecovered: Math.round(aiRecovered),
        additionalRecovered: Math.round(aiRecovered - baseRecovered),
      };
    });

    const baselineRecoveryRate = (baselineRecoveredRevenue / totalFailedRevenue) * 100;
    const aiRecoveryRate = (aiRecoveredRevenue / totalFailedRevenue) * 100;
    const additionalRevenue = aiRecoveredRevenue - baselineRecoveredRevenue;
    const recoveryImprovement = ((aiRecoveryRate - baselineRecoveryRate) / baselineRecoveryRate) * 100;
    const roi = totalAICost > 0 ? additionalRevenue / totalAICost : 24.5;

    // Save simulation record to database
    const simulationRecord = await prisma.strategySimulation.create({
      data: {
        strategy: `SIM_${strategyProfile}_${transactionCount}`,
        transactionCount,
        expectedRecovery: Math.round(aiRecoveredRevenue),
        recoveryRate: Number(aiRecoveryRate.toFixed(1)),
        estimatedCost: Math.round(totalAICost),
        roi: Number(roi.toFixed(1)),
      },
    });

    return {
      simulationId: simulationRecord.id,
      parameters: {
        transactionCount,
        avgTicketSize,
        strategyProfile,
        totalFailedRevenue: Math.round(totalFailedRevenue),
      },
      beforeAI: {
        recoveryRate: Number(baselineRecoveryRate.toFixed(1)),
        recoveredRevenue: Math.round(baselineRecoveredRevenue),
        lostRevenue: Math.round(totalFailedRevenue - baselineRecoveredRevenue),
        estimatedCost: Math.round(baselineCost),
      },
      afterAI: {
        recoveryRate: Number(aiRecoveryRate.toFixed(1)),
        recoveredRevenue: Math.round(aiRecoveredRevenue),
        lostRevenue: Math.round(totalFailedRevenue - aiRecoveredRevenue),
        additionalRevenueRecovered: Math.round(additionalRevenue),
        recoveryImprovementPercentage: Number(recoveryImprovement.toFixed(1)),
        estimatedCost: Math.round(totalAICost),
        roi: Number(roi.toFixed(1)),
      },
      categoryBreakdown,
      projectedAnnualSavings: Math.round(additionalRevenue * 12),
    };
  }

  /**
   * Retrieves simulation by ID
   */
  static async getSimulationById(id: string) {
    return prisma.strategySimulation.findUnique({ where: { id } });
  }
}
