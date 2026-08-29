# RecoverAI — Intelligent Payment Revenue Recovery Platform

> **Turn failed payments into recovered revenue.**

[![Full-Stack Fintech](https://img.shields.io/badge/Fintech-Revenue%20Recovery-4F46E5.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js / Express](https://img.shields.io/badge/Express-REST%20API-green.svg)](https://expressjs.com/)
[![React 18 / Vite](https://img.shields.io/badge/React-18%20Vite-61DAFB.svg)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

---

## 📌 Disclaimer
> **Demo Project — Simulated Payment Data.**
> This is an independent portfolio demonstration project engineered for the **Razorpay Internship (AI Revenue Recovery Track)**. It uses realistic simulated Indian payment data and is **not** affiliated with, endorsed by, or integrated with Razorpay's proprietary internal systems.

---

## 📖 Executive Summary

In Indian digital commerce, payment failures across **UPI, Credit Cards, Debit Cards, Net Banking, and Wallets** cause massive invisible revenue leakage. Traditional payment gateways execute naive, blind retries that exacerbate customer churn, waste gateway fees on expired cards, and trigger security blocks.

**RecoverAI** is an intelligent revenue recovery intelligence platform that:
1. Classifies the root cause of payment failure (Temporary network drop vs Customer action vs Payment instrument issue vs High risk).
2. Evaluates customer lifetime value (LTV) and historical payment success.
3. Computes a **deterministic, explainable AI recovery probability score (0–100%)**.
4. Ranks recovery opportunities by **Expected Recoverable Revenue** ($Amount \times Probability$).
5. Dynamically orchestrates the optimal recovery action: automated off-peak smart retry ($T+4h$), 1-click WhatsApp/SMS interactive checkout links, or seamless alternate payment rail prompts.

---

## 🏗️ System Architecture

```text
                                  RecoverAI Platform
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
          React 18 + TypeScript                       Express REST API Server
         (Vite + Tailwind CSS +                          (Node.js + TypeScript)
        Recharts + TanStack Query)                               │
                   │                                             ▼
                   │                                  Deterministic AI Engine
                   │                             (Failure Taxonomy + Factor Scoring)
                   │                                             │
                   └───────────────► REST API ◄──────────────────┘
                               (Zod Validation, Error Handler, Helmet, CORS)
                                                 │
                                                 ▼
                                         Prisma Client ORM
                                                 │
                                                 ▼
                                     Relational Database
                                    (PostgreSQL / SQLite)
```

---

## 🧠 AI Decision Engine & Mathematical Scoring Model

RecoverAI rejects black-box "magic numbers" in favor of a **deterministic, weighted, and fully explainable scoring model**:

$$\text{Recovery Score} = \sum (\text{Factor Weight} \times \text{Component Score}) + \text{Rail Bonus} - \text{Fatigue Penalty}$$

| Factor | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Payment History** | **30%** | Historical success ratio ($Successful / Total$), completion volume track record. |
| **Failure Classification** | **20%** | Categorical taxonomy: `TEMPORARY` (+20 pts), `CUSTOMER_ACTION` (+14-16 pts), `PAYMENT_METHOD` (+9 pts), `HIGH_RISK` (+2 pts). |
| **Customer Activity & Tier** | **15%** | Platform engagement level (`HIGH`, `MEDIUM`, `LOW`, `DORMANT`) and subscription status (`ACTIVE`, `PAST_DUE`, `CHURNED`). |
| **Customer Lifetime Value** | **15%** | LTV tier: `VIP` (₹1,00,000+), `HIGH` (₹50,000–₹99,999), `MEDIUM`, `LOW`. |
| **Recency Factor** | **10%** | Days elapsed since last successful payment transaction. |
| **Retry Fatigue & History** | **10%** | Prior retry attempts penalty ($0 \text{ attempts} = 10\text{ pts}$, $3+ \text{ attempts} = 1\text{ pt}$). |

### Failure Classification Taxonomy

* **`TEMPORARY`** (Network timeout, Bank server downtime, PSP gateway glitch) $\rightarrow$ **Smart Retry ($T+2\text{h}$ to $T+6\text{h}$)**.
* **`CUSTOMER_ACTION`** (Insufficient funds, 3DS authentication/OTP drop) $\rightarrow$ **1-Click WhatsApp/SMS interactive checkout link**.
* **`PAYMENT_METHOD`** (Card expired, daily limit exceeded, invalid credentials) $\rightarrow$ **Alternative payment rail prompt (e.g. switch to UPI)**.
* **`HIGH_RISK`** (Velocity trigger, fraud risk threshold) $\rightarrow$ **Manual review & risk hold**.

### Expected Recoverable Revenue Calculation

$$\text{Expected Recovery} = \text{Transaction Amount} \times \left(\frac{\text{Recovery Score}}{100}\right)$$

Example: ₹$24,500 \times 0.87 = ₹21,315$ expected recoverable value.

---

## 🗄️ Database Schema & Relational Design

The application utilizes **Prisma ORM** with multi-column indexes for fast lookups across high-volume transactions:

```prisma
model Customer {
  id                     String        @id @default(cuid())
  name                   String
  email                  String        @unique
  phone                  String
  lifetimeValue          Float         @default(0.0)
  totalTransactions      Int           @default(0)
  successfulTransactions Int           @default(0)
  failedTransactions     Int           @default(0)
  activityLevel          String        @default("MEDIUM")
  subscriptionStatus     String        @default("ACTIVE")
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt
  transactions           Transaction[]
}

model Transaction {
  id               String            @id @default(cuid())
  transactionId    String            @unique
  customerId       String
  customer         Customer          @relation(fields: [customerId], references: [id], onDelete: Cascade)
  amount           Float
  currency         String            @default("INR")
  paymentMethod    String            // UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, WALLET
  status           String            // FAILED, RECOVERED, RETRYING, SCHEDULED, LOST, SUCCESS
  failureReason    String            // INSUFFICIENT_FUNDS, BANK_SERVER_DOWN, AUTH_FAILED, etc.
  failureCode      String            // ERR_UPI_PSP_DOWN, ERR_CARD_EXPIRED, etc.
  failureCategory  String            // TEMPORARY, CUSTOMER_ACTION, PAYMENT_METHOD, HIGH_RISK
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  recoveryAnalysis RecoveryAnalysis?
  recoveryAttempts RecoveryAttempt[]
}

model RecoveryAnalysis {
  id                 String      @id @default(cuid())
  transactionId      String      @unique
  transaction        Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  recoveryScore      Float       // 0 - 100
  expectedRecovery   Float
  priority           String      // CRITICAL, HIGH, MEDIUM, LOW
  recommendedAction  String      // RETRY_LATER, NOTIFY_CUSTOMER, ALT_PAYMENT_METHOD, MANUAL_REVIEW
  recommendedChannel String      // DIRECT_RETRY, WHATSAPP, SMS, EMAIL, IN_APP
  retryAfterHours    Int         @default(0)
  customerValue      String      // VIP, HIGH, MEDIUM, LOW
  riskLevel          String      // LOW, MEDIUM, HIGH, CRITICAL
  explanation        String      // Serialized JSON factor breakdown
  createdAt          DateTime    @default(now())
}

model RecoveryAttempt {
  id              String      @id @default(cuid())
  transactionId   String
  transaction     Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  action          String      // SMART_RETRY, REMINDER_NOTIFICATION, SCHEDULED_RETRY, MANUAL_INTERVENTION
  channel         String
  status          String      // IN_PROGRESS, SUCCESS, FAILED, SCHEDULED
  attemptedAt     DateTime    @default(now())
  result          String
  recoveredAmount Float       @default(0.0)
}

model StrategySimulation {
  id               String   @id @default(cuid())
  strategy         String
  transactionCount Int
  expectedRecovery Float
  recoveryRate     Float
  estimatedCost    Float
  roi              Float
  createdAt        DateTime @default(now())
}
```

---

## 📡 REST API Reference

Base URL: `/api`

### 1. AI Recovery Engine
* `POST /api/ai/analyze` — Evaluates a failed transaction payload and returns complete factor scoring, probability, and recommended action.
* `POST /api/ai/batch-analyze` — Batch scoring of transaction arrays.

#### Request Body Example:
```json
{
  "amount": 24500,
  "paymentMethod": "UPI",
  "failureReason": "BANK_SERVER_DOWN",
  "failureCode": "ERR_UPI_PSP_DOWN",
  "lifetimeValue": 145000,
  "totalTransactions": 28,
  "successfulTransactions": 25,
  "failedTransactions": 3,
  "activityLevel": "HIGH",
  "subscriptionStatus": "ACTIVE",
  "daysSinceLastSuccess": 2,
  "retryAttemptsCount": 0
}
```

#### Response Example:
```json
{
  "success": true,
  "data": {
    "recoveryScore": 88,
    "expectedRecovery": 21560,
    "priority": "CRITICAL",
    "recommendedAction": "RETRY_LATER",
    "recommendedChannel": "DIRECT_RETRY",
    "retryAfterHours": 4,
    "customerValue": "VIP",
    "riskLevel": "LOW",
    "failureCategory": "TEMPORARY",
    "explanation": {
      "positiveFactors": [
        "Strong historical payment success rate (89%) across 25 orders",
        "Temporary infrastructure/banking network failure (auto-recoverable)",
        "High lifetime value (VIP tier: ₹1,45,000)"
      ],
      "negativeFactors": [],
      "factorBreakdown": [
        { "name": "Payment History", "weightMax": 30, "score": 30, "label": "30/30 pts", "impact": "positive" },
        { "name": "Failure Classification", "weightMax": 20, "score": 20, "label": "20/20 pts", "impact": "positive" },
        { "name": "Customer Activity", "weightMax": 15, "score": 15, "label": "15/15 pts", "impact": "positive" },
        { "name": "Customer Value", "weightMax": 15, "score": 15, "label": "15/15 pts", "impact": "positive" },
        { "name": "Recency Factor", "weightMax": 10, "score": 10, "label": "10/10 pts", "impact": "positive" },
        { "name": "Retry History", "weightMax": 10, "score": 10, "label": "10/10 pts", "impact": "positive" }
      ],
      "confidence": "VERY_HIGH",
      "summary": "RecoverAI predicts an 88% recovery probability (CRITICAL priority) with expected recoverable revenue of ₹21,560. Optimal action is RETRY LATER via DIRECT RETRY."
    }
  }
}
```

### 2. Transaction Management
* `GET /api/transactions` — Query paginated transactions with multi-filtering (`status`, `paymentMethod`, `failureCategory`, `priority`, `search`, `sortBy`, `sortOrder`).
* `GET /api/transactions/:id` — Retrieve single transaction with recovery analysis and attempt history.
* `POST /api/transactions` — Create and automatically analyze a new simulated transaction.

### 3. Recovery Workflows
* `POST /api/recovery/:transactionId/retry` — Execute intelligent retry and update ledger state.
* `POST /api/recovery/:transactionId/remind` — Dispatch interactive recovery notification (WhatsApp/SMS).
* `POST /api/recovery/:transactionId/schedule` — Schedule retry for $T+N$ hours.
* `POST /api/recovery/:transactionId/mark-recovered` — Manually reconcile captured revenue.
* `POST /api/recovery/:transactionId/mark-lost` — Conclude recovery as unrecoverable.

### 4. Executive Analytics
* `GET /api/analytics/overview` — Dashboard summary metrics.
* `GET /api/analytics/revenue?range=7D|30D|90D` — Revenue time-series trend series.
* `GET /api/analytics/recovery` — Recovery funnel stages.
* `GET /api/analytics/payment-methods` — Rail conversion breakdown.
* `GET /api/analytics/failure-reasons` — Failure taxonomy matrix.
* `GET /api/analytics/insights` — Dynamic AI telemetry insights.

### 5. Strategy Simulations
* `POST /api/simulation/run` — Run portfolio simulation (100 to 5,000 txns) comparing Before-AI vs After-AI.
* `GET /api/strategies` — Retrieve strategy benchmark definitions.
* `POST /api/strategies/simulate` — Trigger simulation for a specific recovery strategy.

---

## 💻 Local Setup & Quickstart

### Prerequisites
* **Node.js**: v18+ or v20+
* **npm**: v9+

### 1. Clone & Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run setup
```
Or run individually:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# On macOS / Linux
cp .env.example .env

# On Windows (PowerShell / Command Prompt)
copy .env.example .env
```
*(Default configuration uses instant zero-config SQLite `file:./prisma/dev.db` for development, or configure standard PostgreSQL via `DATABASE_URL="postgresql://user:pass@localhost:5432/recoverai"`).*

### 3. Initialize & Seed Database
```bash
# Push Prisma schema and seed 33 authentic Indian customers & 130+ transactions
npm run db:push
npm run db:seed
```

### 4. Start Development Servers
```bash
# Run both backend (port 5000) and frontend (port 5173) concurrently:
npm run dev

# Or run separately:
# Backend on http://localhost:5000
npm run dev:backend

# Frontend on http://localhost:5173
npm run dev:frontend
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

RecoverAI includes automated test suites covering the recovery engine, failure classifier, API routing, and validation:

```bash
# Run all backend unit and integration tests
npm test
```

### Test Coverage Highlights
* `recoveryEngine.test.ts` — Deterministic scoring, factor weights, and score capping on fraud risk.
* `failureClassifier.test.ts` — Classification of gateway drops, insufficient funds, and card errors.
* `api.test.ts` — Endpoint contracts, Zod input validation, and `/api/health`.

---

## 🚀 Key Engineering & Product Highlights

1. **Fintech Product Thinking**: Built specifically around Indian payment infrastructure nuances (e.g. UPI high mobile conversion, bank downtime windows, payday balance cycles).
2. **Explainable AI**: Provides transparent factor points rather than opaque probabilities, enabling product managers to inspect and trust decisions.
3. **Real State Machine**: Executing a recovery action actually records a `RecoveryAttempt`, updates customer LTV and transaction status, and recalculates analytics in real-time.
4. **Resilient Architecture**: Zero external AI dependencies required for demo mode; modular provider interface ready for LLM augmentation if desired.
5. **Modern Frontend Aesthetics**: Built with deep navy/slate palettes, responsive layout drawers, Recharts data visualizers, and accessible micro-interactions.

---

## 📄 License
This project is licensed under the MIT License.
