import prisma from '../db/prisma';
import { RecoveryEngine } from '../ai/recoveryEngine';
import { AIScoringInput } from '../ai/types';

export class TransactionService {
  /**
   * Retrieves paginated transactions with flexible filtering and sorting
   */
  static async getTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    failureCategory?: string;
    paymentMethod?: string;
    priority?: string;
    sortBy?: 'createdAt' | 'amount' | 'recoveryScore' | 'expectedRecovery';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.failureCategory && params.failureCategory !== 'ALL') {
      where.failureCategory = params.failureCategory;
    }

    if (params.paymentMethod && params.paymentMethod !== 'ALL') {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.search) {
      const search = params.search.trim();
      where.OR = [
        { transactionId: { contains: search } },
        { failureReason: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
      ];
    }

    if (params.priority && params.priority !== 'ALL') {
      where.recoveryAnalysis = {
        priority: params.priority,
      };
    }

    // Determine sorting
    let orderBy: any = { createdAt: params.sortOrder || 'desc' };
    if (params.sortBy === 'amount') {
      orderBy = { amount: params.sortOrder || 'desc' };
    } else if (params.sortBy === 'recoveryScore') {
      orderBy = { recoveryAnalysis: { recoveryScore: params.sortOrder || 'desc' } };
    } else if (params.sortBy === 'expectedRecovery') {
      orderBy = { recoveryAnalysis: { expectedRecovery: params.sortOrder || 'desc' } };
    }

    const total = await prisma.transaction.count({ where });
    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            lifetimeValue: true,
            activityLevel: true,
            subscriptionStatus: true,
          },
        },
        recoveryAnalysis: true,
        recoveryAttempts: {
          orderBy: { attemptedAt: 'desc' },
          take: 3,
        },
      },
    });

    const formatted = transactions.map((t: any) => {
      let parsedExplanation = null;
      if (t.recoveryAnalysis?.explanation) {
        try {
          parsedExplanation = JSON.parse(t.recoveryAnalysis.explanation);
        } catch {
          parsedExplanation = { summary: t.recoveryAnalysis.explanation };
        }
      }

      return {
        ...t,
        recoveryAnalysis: t.recoveryAnalysis
          ? {
              ...t.recoveryAnalysis,
              parsedExplanation,
            }
          : null,
      };
    });

    return {
      transactions: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single transaction by ID with full analysis and historical attempts
   */
  static async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [{ id }, { transactionId: id }],
      },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: {
          orderBy: { attemptedAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      return null;
    }

    let parsedExplanation = null;
    if (transaction.recoveryAnalysis?.explanation) {
      try {
        parsedExplanation = JSON.parse(transaction.recoveryAnalysis.explanation);
      } catch {
        parsedExplanation = { summary: transaction.recoveryAnalysis.explanation };
      }
    }

    return {
      ...transaction,
      recoveryAnalysis: transaction.recoveryAnalysis
        ? {
            ...transaction.recoveryAnalysis,
            parsedExplanation,
          }
        : null,
    };
  }

  /**
   * Creates a new simulated transaction and triggers AI analysis if failed
   */
  static async createTransaction(data: {
    customerId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    failureReason: string;
    failureCode?: string;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const transactionId = `txn_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const failureCode = data.failureCode || 'ERR_PAYMENT_FAILED';

    // AI Scoring
    const scoringInput: AIScoringInput = {
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      failureReason: data.failureReason,
      failureCode,
      lifetimeValue: customer.lifetimeValue,
      totalTransactions: customer.totalTransactions,
      successfulTransactions: customer.successfulTransactions,
      failedTransactions: customer.failedTransactions + 1,
      activityLevel: customer.activityLevel,
      subscriptionStatus: customer.subscriptionStatus,
      daysSinceLastSuccess: 3,
      retryAttemptsCount: 0,
    };

    const aiResult = RecoveryEngine.analyze(scoringInput);

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,
        customerId: customer.id,
        amount: data.amount,
        currency: data.currency || 'INR',
        paymentMethod: data.paymentMethod,
        status: 'FAILED',
        failureReason: data.failureReason,
        failureCode,
        failureCategory: aiResult.failureCategory,
        recoveryAnalysis: {
          create: {
            recoveryScore: aiResult.recoveryScore,
            expectedRecovery: aiResult.expectedRecovery,
            priority: aiResult.priority,
            recommendedAction: aiResult.recommendedAction,
            recommendedChannel: aiResult.recommendedChannel,
            retryAfterHours: aiResult.retryAfterHours,
            customerValue: aiResult.customerValue,
            riskLevel: aiResult.riskLevel,
            explanation: JSON.stringify(aiResult.explanation),
          },
        },
      },
      include: {
        customer: true,
        recoveryAnalysis: true,
      },
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalTransactions: { increment: 1 },
        failedTransactions: { increment: 1 },
      },
    });

    return transaction;
  }
}
