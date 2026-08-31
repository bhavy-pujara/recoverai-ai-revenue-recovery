import { PrismaClient } from '../backend/src/generated/prisma';

const prisma = new PrismaClient();

const CUSTOMERS_DATA = [
  { name: 'Rahul Mehta', email: 'rahul.mehta@enterprise-flow.in', phone: '+91 98201 44521', lifetimeValue: 145000, totalTransactions: 28, successfulTransactions: 25, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Priya Shah', email: 'priya.shah@finmatrix.io', phone: '+91 97112 88934', lifetimeValue: 182000, totalTransactions: 34, successfulTransactions: 32, failedTransactions: 2, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Arjun Patel', email: 'arjun.patel@zenithtech.co', phone: '+91 98450 12389', lifetimeValue: 88500, totalTransactions: 19, successfulTransactions: 16, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Neha Desai', email: 'neha.desai@omniretail.in', phone: '+91 99304 55671', lifetimeValue: 42000, totalTransactions: 12, successfulTransactions: 9, failedTransactions: 3, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Vikram Malhotra', email: 'vikram.m@malhotralogistics.com', phone: '+91 98100 99882', lifetimeValue: 260000, totalTransactions: 45, successfulTransactions: 42, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Ananya Iyer', email: 'ananya.iyer@creativespark.design', phone: '+91 94480 33211', lifetimeValue: 31500, totalTransactions: 8, successfulTransactions: 6, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Rohan Sharma', email: 'rohan.sharma@paystacker.in', phone: '+91 98711 22345', lifetimeValue: 115000, totalTransactions: 22, successfulTransactions: 19, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@hyderabadventures.com', phone: '+91 98490 66778', lifetimeValue: 95000, totalTransactions: 18, successfulTransactions: 15, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Karan Verma', email: 'karan.verma@quickscale.ai', phone: '+91 99201 77889', lifetimeValue: 19500, totalTransactions: 6, successfulTransactions: 4, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'PAST_DUE' },
  { name: 'Divya Nair', email: 'divya.nair@keralaspices.org', phone: '+91 94470 11223', lifetimeValue: 64000, totalTransactions: 14, successfulTransactions: 12, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Aditya Joshi', email: 'aditya.joshi@punesoft.tech', phone: '+91 98220 44556', lifetimeValue: 128000, totalTransactions: 26, successfulTransactions: 23, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Pooja Kapoor', email: 'pooja.kapoor@delhifashions.in', phone: '+91 98111 55667', lifetimeValue: 53000, totalTransactions: 11, successfulTransactions: 8, failedTransactions: 3, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Siddharth Rao', email: 'siddharth.rao@bengalurulabs.io', phone: '+91 98455 77889', lifetimeValue: 210000, totalTransactions: 39, successfulTransactions: 36, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Tanvi Kulkarni', email: 'tanvi.kulkarni@edusmart.co.in', phone: '+91 98230 11998', lifetimeValue: 36000, totalTransactions: 9, successfulTransactions: 7, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Manish Singhania', email: 'manish.singhania@kolkatatraders.biz', phone: '+91 98300 22334', lifetimeValue: 340000, totalTransactions: 52, successfulTransactions: 48, failedTransactions: 4, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Ritu Agarwal', email: 'ritu.agarwal@jaipurcrafts.com', phone: '+91 94140 88776', lifetimeValue: 28500, totalTransactions: 7, successfulTransactions: 5, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'TRIAL' },
  { name: 'Sandeep Bansal', email: 'sandeep.bansal@chandigarhfoods.in', phone: '+91 98150 33445', lifetimeValue: 74000, totalTransactions: 16, successfulTransactions: 13, failedTransactions: 3, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Meera Nambiar', email: 'meera.nambiar@cochinmarine.org', phone: '+91 94460 55667', lifetimeValue: 82000, totalTransactions: 17, successfulTransactions: 14, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Gaurav Bhatt', email: 'gaurav.bhatt@ahmedabadchem.in', phone: '+91 98250 66778', lifetimeValue: 165000, totalTransactions: 31, successfulTransactions: 28, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Kavita Sen', email: 'kavita.sen@bengalgalleria.co', phone: '+91 98310 99001', lifetimeValue: 14000, totalTransactions: 4, successfulTransactions: 2, failedTransactions: 2, activityLevel: 'LOW', subscriptionStatus: 'PAST_DUE' },
  { name: 'Rajesh Pillai', email: 'rajesh.pillai@trivandrumsoft.com', phone: '+91 94471 22334', lifetimeValue: 92000, totalTransactions: 20, successfulTransactions: 17, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Swati Mukherjee', email: 'swati.mukherjee@kolkatadesign.net', phone: '+91 98305 44556', lifetimeValue: 48000, totalTransactions: 10, successfulTransactions: 8, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Amit Gupta', email: 'amit.gupta@lucknowinfra.in', phone: '+91 94150 77889', lifetimeValue: 110000, totalTransactions: 24, successfulTransactions: 21, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Shreya Choudhury', email: 'shreya.choudhury@guwahatitea.com', phone: '+91 94350 11223', lifetimeValue: 22000, totalTransactions: 5, successfulTransactions: 3, failedTransactions: 2, activityLevel: 'LOW', subscriptionStatus: 'CHURNED' },
  { name: 'Nikhil Menon', email: 'nikhil.menon@calicutlog.io', phone: '+91 94462 88990', lifetimeValue: 67000, totalTransactions: 15, successfulTransactions: 13, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Sunita Das', email: 'sunita.das@bhubaneswaredutech.in', phone: '+91 94370 33445', lifetimeValue: 18500, totalTransactions: 5, successfulTransactions: 3, failedTransactions: 2, activityLevel: 'LOW', subscriptionStatus: 'PAST_DUE' },
  { name: 'Harish Goyal', email: 'harish.goyal@indorepharma.biz', phone: '+91 98260 55667', lifetimeValue: 138000, totalTransactions: 27, successfulTransactions: 24, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Deepa Hegde', email: 'deepa.hegde@mangalorecoastal.in', phone: '+91 98459 77889', lifetimeValue: 58000, totalTransactions: 13, successfulTransactions: 11, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Varun Saxena', email: 'varun.saxena@bhopalautomotive.com', phone: '+91 98270 11223', lifetimeValue: 84000, totalTransactions: 18, successfulTransactions: 15, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Preeti Chawla', email: 'preeti.chawla@amritsargold.in', phone: '+91 98140 44556', lifetimeValue: 175000, totalTransactions: 33, successfulTransactions: 30, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
  { name: 'Tarun Sethi', email: 'tarun.sethi@dehradunadventures.com', phone: '+91 94120 66778', lifetimeValue: 29000, totalTransactions: 7, successfulTransactions: 5, failedTransactions: 2, activityLevel: 'LOW', subscriptionStatus: 'ACTIVE' },
  { name: 'Ishita Trivedi', email: 'ishita.trivedi@vadodaratextiles.org', phone: '+91 98240 88990', lifetimeValue: 71000, totalTransactions: 15, successfulTransactions: 13, failedTransactions: 2, activityLevel: 'MEDIUM', subscriptionStatus: 'ACTIVE' },
  { name: 'Alok Jain', email: 'alok.jain@jabalpurminerals.biz', phone: '+91 98269 11223', lifetimeValue: 195000, totalTransactions: 36, successfulTransactions: 33, failedTransactions: 3, activityLevel: 'HIGH', subscriptionStatus: 'ACTIVE' },
];

const FAILURE_TEMPLATES = [
  { reason: 'INSUFFICIENT_FUNDS', code: 'ERR_INSUFFICIENT_BAL', methods: ['UPI', 'DEBIT_CARD'], weights: [4500, 12000, 24500, 8900, 35000, 15000] },
  { reason: 'BANK_SERVER_DOWN', code: 'ERR_UPI_PSP_DOWN', methods: ['UPI', 'NET_BANKING'], weights: [18500, 42000, 8500, 64000, 29000, 14000] },
  { reason: 'AUTH_FAILED', code: 'ERR_3DS_OTP_EXPIRED', methods: ['CREDIT_CARD', 'DEBIT_CARD'], weights: [9500, 16000, 28000, 52000, 7500, 31000] },
  { reason: 'CARD_EXPIRED', code: 'ERR_CARD_EXPIRED', methods: ['CREDIT_CARD', 'DEBIT_CARD'], weights: [12500, 22000, 48000, 6500, 19000] },
  { reason: 'GATEWAY_TIMEOUT', code: 'ERR_GATEWAY_TIMEOUT', methods: ['UPI', 'CREDIT_CARD', 'NET_BANKING'], weights: [32000, 17500, 75000, 11000, 45000] },
  { reason: 'INVALID_CVV', code: 'ERR_CARD_DECLINED_CVV', methods: ['CREDIT_CARD', 'DEBIT_CARD'], weights: [6500, 14000, 26000, 39000] },
  { reason: 'LIMIT_EXCEEDED', code: 'ERR_DAILY_LIMIT_EXCEEDED', methods: ['UPI', 'DEBIT_CARD'], weights: [48000, 65000, 95000, 120000] },
  { reason: 'FRAUD_SUSPECTED', code: 'ERR_RISK_VELOCITY_TRIGGER', methods: ['CREDIT_CARD', 'WALLET'], weights: [55000, 89000, 110000] },
];

function calculateDeterministicAnalysis(amount: number, reason: string, customer: any) {
  let category = 'CUSTOMER_ACTION';
  let recommendedAction = 'NOTIFY_CUSTOMER';
  let recommendedChannel = 'WHATSAPP';
  let retryAfterHours = 4;
  let baseScore = 65;

  if (reason.includes('BANK') || reason.includes('TIMEOUT')) {
    category = 'TEMPORARY';
    recommendedAction = 'RETRY_LATER';
    recommendedChannel = 'DIRECT_RETRY';
    retryAfterHours = 4;
    baseScore = 85;
  } else if (reason.includes('INSUFFICIENT')) {
    category = 'CUSTOMER_ACTION';
    recommendedAction = 'NOTIFY_CUSTOMER';
    recommendedChannel = 'WHATSAPP';
    retryAfterHours = 24;
    baseScore = 72;
  } else if (reason.includes('AUTH')) {
    category = 'CUSTOMER_ACTION';
    recommendedAction = 'NOTIFY_CUSTOMER';
    recommendedChannel = 'SMS';
    retryAfterHours = 1;
    baseScore = 76;
  } else if (reason.includes('CARD') || reason.includes('CVV')) {
    category = 'PAYMENT_METHOD';
    recommendedAction = 'ALT_PAYMENT_METHOD';
    recommendedChannel = 'WHATSAPP';
    retryAfterHours = 0;
    baseScore = 60;
  } else if (reason.includes('FRAUD')) {
    category = 'HIGH_RISK';
    recommendedAction = 'MANUAL_REVIEW';
    recommendedChannel = 'EMAIL';
    retryAfterHours = 0;
    baseScore = 18;
  }

  // Adjust for LTV
  if (customer.lifetimeValue >= 100000) baseScore += 8;
  if (customer.subscriptionStatus === 'PAST_DUE') baseScore -= 5;
  const recoveryScore = Math.max(10, Math.min(98, baseScore));
  const expectedRecovery = Math.round(amount * (recoveryScore / 100));

  const priority = category === 'HIGH_RISK' ? 'LOW' : recoveryScore >= 75 && amount >= 10000 ? 'CRITICAL' : recoveryScore >= 65 ? 'HIGH' : 'MEDIUM';
  const customerValue = customer.lifetimeValue >= 100000 ? 'VIP' : customer.lifetimeValue >= 50000 ? 'HIGH' : 'MEDIUM';
  const riskLevel = category === 'HIGH_RISK' ? 'CRITICAL' : recoveryScore < 60 ? 'MEDIUM' : 'LOW';

  const explanation = {
    positiveFactors: [
      `Customer historical LTV: ₹${customer.lifetimeValue.toLocaleString('en-IN')}`,
      `Category classification: ${category}`,
    ],
    negativeFactors: category === 'HIGH_RISK' ? ['Security velocity trigger active'] : [],
    factorBreakdown: [
      { name: 'Payment History', weightMax: 30, score: 24, label: '24/30 pts', impact: 'positive' },
      { name: 'Failure Classification', weightMax: 20, score: 18, label: '18/20 pts', impact: 'positive' },
      { name: 'Customer Activity', weightMax: 15, score: 12, label: '12/15 pts', impact: 'positive' },
      { name: 'Customer Value', weightMax: 15, score: 12, label: '12/15 pts', impact: 'positive' },
      { name: 'Recency Factor', weightMax: 10, score: 8, label: '8/10 pts', impact: 'positive' },
      { name: 'Retry History', weightMax: 10, score: 10, label: '10/10 pts', impact: 'positive' },
    ],
    confidence: 'HIGH',
    summary: `RecoverAI predicts an ${recoveryScore}% recovery probability (${priority} priority) with expected recoverable revenue of ₹${expectedRecovery.toLocaleString('en-IN')}.`,
  };

  return {
    category,
    recoveryScore,
    expectedRecovery,
    priority,
    recommendedAction,
    recommendedChannel,
    retryAfterHours,
    customerValue,
    riskLevel,
    explanation: JSON.stringify(explanation),
  };
}

async function main() {
  console.log('🌱 Starting RecoverAI database seeding...');

  await prisma.recoveryAttempt.deleteMany();
  await prisma.recoveryAnalysis.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.strategySimulation.deleteMany();

  console.log('🧹 Purged existing database tables');

  const createdCustomers: any[] = [];
  for (const c of CUSTOMERS_DATA) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }
  console.log(`✅ Seeded ${createdCustomers.length} authentic Indian fintech customers`);

  let txnCounter = 1000;
  const now = Date.now();
  let totalCreatedTransactions = 0;
  let totalRecovered = 0;
  let totalActiveFailed = 0;

  for (let i = 0; i < createdCustomers.length; i++) {
    const customer = createdCustomers[i];
    const txnCount = 3 + (i % 3);

    for (let j = 0; j < txnCount; j++) {
      txnCounter++;
      const template = FAILURE_TEMPLATES[(i + j * 3) % FAILURE_TEMPLATES.length];
      const amount = template.weights[(i + j) % template.weights.length];
      const paymentMethod = template.methods[(i + j) % template.methods.length];

      let status = 'FAILED';
      if (j === 0 && (i % 3 === 0 || i % 4 === 0)) {
        status = 'RECOVERED';
      } else if (j === 1 && i % 5 === 0) {
        status = 'LOST';
      } else if (j === 2 && i % 4 === 0) {
        status = 'RETRYING';
      }

      const daysAgo = (i * 2 + j * 5) % 29;
      const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (j * 180 + i * 45) * 60 * 1000);
      const transactionId = `txn_rcv_${txnCounter}_${Math.random().toString(36).substring(2, 6)}`;

      const analysis = calculateDeterministicAnalysis(amount, template.reason, customer);

      const transaction = await prisma.transaction.create({
        data: {
          transactionId,
          customerId: customer.id,
          amount,
          currency: 'INR',
          paymentMethod,
          status,
          failureReason: template.reason,
          failureCode: template.code,
          failureCategory: analysis.category,
          createdAt,
          updatedAt: createdAt,
          recoveryAnalysis: {
            create: {
              recoveryScore: analysis.recoveryScore,
              expectedRecovery: analysis.expectedRecovery,
              priority: analysis.priority,
              recommendedAction: analysis.recommendedAction,
              recommendedChannel: analysis.recommendedChannel,
              retryAfterHours: analysis.retryAfterHours,
              customerValue: analysis.customerValue,
              riskLevel: analysis.riskLevel,
              explanation: analysis.explanation,
              createdAt,
            },
          },
        },
      });

      if (status === 'RECOVERED') {
        totalRecovered++;
        await prisma.recoveryAttempt.create({
          data: {
            transactionId: transaction.id,
            action: analysis.recommendedAction === 'RETRY_LATER' ? 'SMART_RETRY' : 'REMINDER_NOTIFICATION',
            channel: analysis.recommendedChannel,
            status: 'SUCCESS',
            result: 'PAYMENT_CAPTURED_VIA_RECOVERY',
            recoveredAmount: amount,
            attemptedAt: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
          },
        });
      } else if (status === 'LOST') {
        await prisma.recoveryAttempt.create({
          data: {
            transactionId: transaction.id,
            action: 'SMART_RETRY',
            channel: 'DIRECT_RETRY',
            status: 'FAILED',
            result: 'BANK_RETRY_EXHAUSTED',
            recoveredAmount: 0,
            attemptedAt: new Date(createdAt.getTime() + 6 * 60 * 60 * 1000),
          },
        });
      } else if (status === 'RETRYING') {
        await prisma.recoveryAttempt.create({
          data: {
            transactionId: transaction.id,
            action: 'REMINDER_NOTIFICATION',
            channel: 'WHATSAPP',
            status: 'SUCCESS',
            result: 'REMINDER_DISPATCHED',
            recoveredAmount: 0,
            attemptedAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
          },
        });
      } else {
        totalActiveFailed++;
      }

      totalCreatedTransactions++;
    }
  }

  console.log(`✅ Seeded ${totalCreatedTransactions} realistic transactions (${totalActiveFailed} active failed, ${totalRecovered} recovered)`);

  const benchmarks = [
    { strategy: 'SMART_RETRY', transactionCount: 500, expectedRecovery: 1850000, recoveryRate: 86.4, estimatedCost: 750, roi: 28.5 },
    { strategy: 'CUSTOMER_REMINDER', transactionCount: 500, expectedRecovery: 1580000, recoveryRate: 74.2, estimatedCost: 1900, roi: 16.4 },
    { strategy: 'ALT_PAYMENT', transactionCount: 500, expectedRecovery: 1450000, recoveryRate: 68.0, estimatedCost: 1100, roi: 21.0 },
    { strategy: 'AI_DYNAMIC_ORCHESTRATION', transactionCount: 1000, expectedRecovery: 3480000, recoveryRate: 81.8, estimatedCost: 2800, roi: 24.2 },
  ];

  for (const b of benchmarks) {
    await prisma.strategySimulation.create({ data: b });
  }

  console.log(`✅ Seeded benchmark strategy simulations`);
  console.log('🎉 RecoverAI database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
