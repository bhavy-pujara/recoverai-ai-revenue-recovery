import prisma from '../db/prisma';
import { RecoveryEngine } from '../ai/recoveryEngine';
import { AIScoringInput } from '../ai/types';

export class RecoveryService {
  /**
   * Executes an intelligent automated payment retry on a failed transaction
   */
  static async retryPayment(transactionId: string, channel: string = 'DIRECT_RETRY') {
    const transaction = await prisma.transaction.findFirst({
      where: { OR: [{ id: transactionId }, { transactionId }] },
      include: { customer: true, recoveryAnalysis: true, recoveryAttempts: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'RECOVERED') {
      throw new Error('Transaction is already successfully recovered');
    }

    const recoveryScore = transaction.recoveryAnalysis?.recoveryScore || 60;
    // Deterministic simulation based on score threshold and pseudo-random seed
    const isSuccess = recoveryScore >= 45 ? Math.random() * 100 <= Math.min(95, recoveryScore + 10) : Math.random() > 0.6;

    const attemptedAt = new Date();
    const resultMessage = isSuccess
      ? 'PAYMENT_CAPTURED_VIA_RECOVERY'
      : 'RETRY_DECLINED_BANK_OR_AUTH';

    // 1. Create recovery attempt
    const attempt = await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: 'SMART_RETRY',
        channel,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        result: resultMessage,
        recoveredAmount: isSuccess ? transaction.amount : 0,
        attemptedAt,
      },
    });

    // 2. Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: isSuccess ? 'RECOVERED' : 'FAILED',
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: { orderBy: { attemptedAt: 'desc' } },
      },
    });

    // 3. Update customer stats
    if (isSuccess) {
      await prisma.customer.update({
        where: { id: transaction.customerId },
        data: {
          successfulTransactions: { increment: 1 },
          lifetimeValue: { increment: transaction.amount },
        },
      });
    }

    return {
      success: isSuccess,
      message: isSuccess
        ? `Successfully recovered ₹${transaction.amount.toLocaleString('en-IN')} via ${channel}`
        : `Retry attempt failed. Next scheduled retry or manual outreach advised.`,
      transaction: updatedTransaction,
      attempt,
    };
  }

  /**
   * Dispatches a payment reminder notification via selected channel
   */
  static async sendReminder(transactionId: string, channel: string = 'WHATSAPP') {
    const transaction = await prisma.transaction.findFirst({
      where: { OR: [{ id: transactionId }, { transactionId }] },
      include: { customer: true, recoveryAnalysis: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const attempt = await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: 'REMINDER_NOTIFICATION',
        channel,
        status: 'SUCCESS',
        result: `REMINDER_DISPATCHED_TO_${channel}`,
        recoveredAmount: 0,
      },
    });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'RETRYING' },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: { orderBy: { attemptedAt: 'desc' } },
      },
    });

    return {
      success: true,
      message: `Recovery reminder dispatched to ${transaction.customer.name} via ${channel}`,
      transaction: updatedTransaction,
      attempt,
    };
  }

  /**
   * Schedules an automated retry after a specific number of hours
   */
  static async scheduleRetry(transactionId: string, scheduledHours: number = 4) {
    const transaction = await prisma.transaction.findFirst({
      where: { OR: [{ id: transactionId }, { transactionId }] },
      include: { customer: true, recoveryAnalysis: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const attempt = await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: 'SCHEDULED_RETRY',
        channel: 'DIRECT_RETRY',
        status: 'SCHEDULED',
        result: `SCHEDULED_FOR_T_PLUS_${scheduledHours}H`,
        recoveredAmount: 0,
      },
    });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'SCHEDULED' },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: { orderBy: { attemptedAt: 'desc' } },
      },
    });

    return {
      success: true,
      message: `Automated retry scheduled for T+${scheduledHours} hours for transaction ${transaction.transactionId}`,
      transaction: updatedTransaction,
      attempt,
    };
  }

  /**
   * Manually marks a transaction as recovered
   */
  static async markRecovered(transactionId: string, amount?: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { OR: [{ id: transactionId }, { transactionId }] },
      include: { customer: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const recoveryAmount = amount || transaction.amount;

    await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: 'MANUAL_INTERVENTION',
        channel: 'IN_APP',
        status: 'SUCCESS',
        result: 'MANUALLY_MARKED_RECOVERED',
        recoveredAmount: recoveryAmount,
      },
    });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'RECOVERED' },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: { orderBy: { attemptedAt: 'desc' } },
      },
    });

    await prisma.customer.update({
      where: { id: transaction.customerId },
      data: {
        successfulTransactions: { increment: 1 },
        lifetimeValue: { increment: recoveryAmount },
      },
    });

    return {
      success: true,
      message: `Transaction ${transaction.transactionId} marked as recovered (₹${recoveryAmount.toLocaleString('en-IN')})`,
      transaction: updatedTransaction,
    };
  }

  /**
   * Marks a transaction as permanently lost/unrecoverable
   */
  static async markLost(transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { OR: [{ id: transactionId }, { transactionId }] },
      include: { customer: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: 'MANUAL_INTERVENTION',
        channel: 'IN_APP',
        status: 'FAILED',
        result: 'MARKED_UNRECOVERABLE',
        recoveredAmount: 0,
      },
    });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'LOST' },
      include: {
        customer: true,
        recoveryAnalysis: true,
        recoveryAttempts: { orderBy: { attemptedAt: 'desc' } },
      },
    });

    return {
      success: true,
      message: `Transaction ${transaction.transactionId} marked as lost`,
      transaction: updatedTransaction,
    };
  }
}
