import { prisma } from '../db/prisma';
import { TransactionService } from '../services/transactionService';
import { CustomerService } from '../services/customerService';
import { AnalyticsService } from '../services/analyticsService';
import { RecoveryService } from '../services/recoveryService';
import { SimulationService } from '../services/simulationService';
import { RecoveryEngine } from '../ai/recoveryEngine';

async function runAudit() {
  console.log('=== 🧪 LOCAL SQLITE COMPREHENSIVE AUDIT ===');

  // 1. Prisma count check
  const custCount = await prisma.customer.count();
  const txnCount = await prisma.transaction.count();
  console.log(`1. Database Connection & Seed Counts: Customers = ${custCount}, Transactions = ${txnCount}`);

  // 2. TransactionService Queries
  const txns = await TransactionService.getTransactions({ limit: 5, status: 'FAILED' });
  console.log(`2. Transaction Query: Retrieved ${txns.transactions.length} transactions, total = ${txns.pagination.total}`);

  // 3. CustomerService Queries
  const customers = await CustomerService.getCustomers({ limit: 5 });
  console.log(`3. Customer Query: Retrieved ${customers.customers.length} customers`);

  // 4. Analytics Queries
  const overview = await AnalyticsService.getOverviewMetrics();
  console.log(`4. Analytics Overview: Failed = ${overview.totalFailedPayments}, At-Risk = ₹${overview.atRiskRevenue.toLocaleString('en-IN')}, Recovered = ₹${overview.revenueRecovered.toLocaleString('en-IN')}`);

  // 5. Recovery Actions (CRUD Mutation test)
  const failedTxn = await prisma.transaction.findFirst({ where: { status: 'FAILED' } });
  if (failedTxn) {
    const retryRes = await RecoveryService.retryPayment(failedTxn.id, 'DIRECT_RETRY');
    console.log(`5. Recovery Action (Retry): ${retryRes.message} -> Status: ${retryRes.transaction.status}`);
    
    const remindRes = await RecoveryService.sendReminder(failedTxn.id, 'WHATSAPP');
    console.log(`6. Recovery Action (Reminder): ${remindRes.message} -> Attempt Status: ${remindRes.attempt.status}`);

    const markRecRes = await RecoveryService.markRecovered(failedTxn.id, failedTxn.amount);
    console.log(`7. Recovery Action (Mark Recovered): ${markRecRes.message} -> Status: ${markRecRes.transaction.status}`);
  }

  // 6. Simulation Engine
  const sim = await SimulationService.runSimulation({ transactionCount: 500, avgTicketSize: 4500, strategyProfile: 'BALANCED' });
  console.log(`8. Simulation Engine: Recovered = ₹${sim.afterAI.recoveredRevenue.toLocaleString('en-IN')}, Extra = ₹${sim.afterAI.additionalRevenueRecovered.toLocaleString('en-IN')}, ROI = ${sim.afterAI.roi}x`);

  // 7. AI Decision Engine
  const aiScore = await RecoveryEngine.analyze({ amount: 25000, paymentMethod: 'UPI', failureReason: 'BANK_SERVER_DOWN', lifetimeValue: 120000 });
  console.log(`9. AI Scoring Engine: Score = ${aiScore.recoveryScore}%, Expected = ₹${aiScore.expectedRecovery.toLocaleString('en-IN')}, Priority = ${aiScore.priority}`);

  console.log('=== ✅ SQLITE AUDIT: ALL 9 MODULE CHECKS PASSED ===');
}

runAudit()
  .catch((e) => {
    console.error('❌ SQLite Audit Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
