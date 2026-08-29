import prisma from '../db/prisma';

export class CustomerService {
  /**
   * Returns list of customers with computed segmentation, recovery stats, and filtering
   */
  static async getCustomers(params: {
    search?: string;
    segment?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const search = params.search.trim();
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (params.segment && params.segment !== 'ALL') {
      if (params.segment === 'VIP') {
        where.lifetimeValue = { gte: 100000 };
      } else if (params.segment === 'AT_RISK') {
        where.failedTransactions = { gte: 2 };
        where.activityLevel = { in: ['LOW', 'DORMANT'] };
      } else if (params.segment === 'CHURN_RISK') {
        where.subscriptionStatus = { in: ['PAST_DUE', 'CHURNED'] };
      } else if (params.segment === 'HIGH_RECOVERY') {
        where.successfulTransactions = { gte: 3 };
        where.failedTransactions = { gte: 1 };
      }
    }

    const total = await prisma.customer.count({ where });
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { lifetimeValue: 'desc' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            recoveryAnalysis: true,
          },
        },
      },
    });

    const formatted = customers.map((c: any) => {
      const totalTxns = c.totalTransactions || (c.successfulTransactions + c.failedTransactions);
      const successRate = totalTxns > 0 ? Math.round((c.successfulTransactions / totalTxns) * 100) : 0;

      // Determine customer segment
      let segment = 'STANDARD';
      if (c.lifetimeValue >= 100000) {
        segment = 'VIP';
      } else if (c.subscriptionStatus === 'PAST_DUE' || c.subscriptionStatus === 'CHURNED') {
        segment = 'CHURN_RISK';
      } else if (c.failedTransactions >= 2 && (c.activityLevel === 'LOW' || c.activityLevel === 'DORMANT')) {
        segment = 'AT_RISK';
      } else if (successRate >= 70 && c.failedTransactions > 0) {
        segment = 'HIGH_RECOVERY';
      }

      // Compute average recovery probability for this customer
      const recentFailedScores = c.transactions
        .filter((t: any) => t.status === 'FAILED' && t.recoveryAnalysis?.recoveryScore)
        .map((t: any) => t.recoveryAnalysis!.recoveryScore);

      const avgRecoveryScore = recentFailedScores.length > 0
        ? Math.round(recentFailedScores.reduce((a: number, b: number) => a + b, 0) / recentFailedScores.length)
        : successRate > 75 ? 82 : 65;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        lifetimeValue: c.lifetimeValue,
        totalTransactions: c.totalTransactions,
        successfulTransactions: c.successfulTransactions,
        failedTransactions: c.failedTransactions,
        activityLevel: c.activityLevel,
        subscriptionStatus: c.subscriptionStatus,
        successRate,
        segment,
        avgRecoveryScore,
        recentTransactions: c.transactions,
        createdAt: c.createdAt,
      };
    });

    return {
      customers: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single customer with full transaction history and recovery timeline
   */
  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            recoveryAnalysis: true,
            recoveryAttempts: {
              orderBy: { attemptedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!customer) {
      return null;
    }

    const totalTxns = customer.totalTransactions || (customer.successfulTransactions + customer.failedTransactions);
    const successRate = totalTxns > 0 ? Math.round((customer.successfulTransactions / totalTxns) * 100) : 0;

    let segment = 'STANDARD';
    if (customer.lifetimeValue >= 100000) {
      segment = 'VIP';
    } else if (customer.subscriptionStatus === 'PAST_DUE' || customer.subscriptionStatus === 'CHURNED') {
      segment = 'CHURN_RISK';
    } else if (customer.failedTransactions >= 2 && customer.activityLevel === 'LOW') {
      segment = 'AT_RISK';
    } else if (successRate >= 70 && customer.failedTransactions > 0) {
      segment = 'HIGH_RECOVERY';
    }

    const failedTotalAmount = customer.transactions
      .filter((t: any) => t.status === 'FAILED')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const recoveredTotalAmount = customer.transactions
      .filter((t: any) => t.status === 'RECOVERED')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Dynamic AI insights for this customer
    const insights: string[] = [];
    if (customer.lifetimeValue >= 50000) {
      insights.push(`High Lifetime Value Customer (₹${customer.lifetimeValue.toLocaleString('en-IN')}) — Prioritize white-glove recovery channel.`);
    }
    if (successRate >= 80) {
      insights.push('Strong historical payment reliability — failure is likely transient or bank-side.');
    }
    if (customer.subscriptionStatus === 'PAST_DUE') {
      insights.push('Subscription is past due — recommend automated retry and WhatsApp notification.');
    }

    return {
      ...customer,
      successRate,
      segment,
      failedTotalAmount,
      recoveredTotalAmount,
      aiInsights: insights,
    };
  }
}
