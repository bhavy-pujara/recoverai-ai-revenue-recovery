import axios from 'axios';
import {
  Customer,
  OverviewMetrics,
  Pagination,
  PaymentMethodStat,
  FailureReasonStat,
  RecoveryAnalysis,
  SimulationResult,
  StrategyItem,
  Transaction,
  TrendDataPoint,
  AIInsight,
  AIScoringInput,
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Network communication error. Please try again.';
    console.error('API Error Response:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  health: {
    check: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    },
  },

  transactions: {
    getAll: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      failureCategory?: string;
      paymentMethod?: string;
      priority?: string;
      sortBy?: string;
      sortOrder?: string;
    }): Promise<{ data: Transaction[]; pagination: Pagination }> => {
      const res = await apiClient.get('/transactions', { params });
      return res.data;
    },

    getById: async (id: string): Promise<Transaction> => {
      const res = await apiClient.get(`/transactions/${id}`);
      return res.data.data;
    },

    create: async (data: {
      customerId: string;
      amount: number;
      currency?: string;
      paymentMethod: string;
      failureReason: string;
      failureCode?: string;
    }): Promise<Transaction> => {
      const res = await apiClient.post('/transactions', data);
      return res.data.data;
    },
  },

  customers: {
    getAll: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      segment?: string;
    }): Promise<{ data: Customer[]; pagination: Pagination }> => {
      const res = await apiClient.get('/customers', { params });
      return res.data;
    },

    getById: async (id: string): Promise<Customer & { aiInsights: string[] }> => {
      const res = await apiClient.get(`/customers/${id}`);
      return res.data.data;
    },
  },

  analytics: {
    getOverview: async (): Promise<OverviewMetrics> => {
      const res = await apiClient.get('/analytics/overview');
      return res.data.data;
    },

    getRevenueTrend: async (range: '7D' | '30D' | '90D' = '30D'): Promise<{ range: string; data: TrendDataPoint[] }> => {
      const res = await apiClient.get('/analytics/revenue', { params: { range } });
      return res.data.data;
    },

    getRecoveryFunnel: async () => {
      const res = await apiClient.get('/analytics/recovery');
      return res.data.data;
    },

    getPaymentMethods: async (): Promise<PaymentMethodStat[]> => {
      const res = await apiClient.get('/analytics/payment-methods');
      return res.data.data;
    },

    getFailureReasons: async (): Promise<FailureReasonStat[]> => {
      const res = await apiClient.get('/analytics/failure-reasons');
      return res.data.data;
    },

    getAIInsights: async (): Promise<AIInsight[]> => {
      const res = await apiClient.get('/analytics/insights');
      return res.data.data;
    },
  },

  recovery: {
    retry: async (transactionId: string, channel?: string) => {
      const res = await apiClient.post(`/recovery/${transactionId}/retry`, { channel });
      return res.data;
    },

    remind: async (transactionId: string, channel?: string) => {
      const res = await apiClient.post(`/recovery/${transactionId}/remind`, { channel });
      return res.data;
    },

    schedule: async (transactionId: string, scheduledHours: number = 4) => {
      const res = await apiClient.post(`/recovery/${transactionId}/schedule`, { scheduledHours });
      return res.data;
    },

    markRecovered: async (transactionId: string, amount?: number) => {
      const res = await apiClient.post(`/recovery/${transactionId}/mark-recovered`, { amount });
      return res.data;
    },

    markLost: async (transactionId: string) => {
      const res = await apiClient.post(`/recovery/${transactionId}/mark-lost`);
      return res.data;
    },
  },

  simulation: {
    run: async (params: {
      transactionCount: number;
      avgTicketSize?: number;
      strategyProfile?: string;
    }): Promise<SimulationResult> => {
      const res = await apiClient.post('/simulation/run', params);
      return res.data.data;
    },

    getById: async (id: string) => {
      const res = await apiClient.get(`/simulation/${id}`);
      return res.data.data;
    },
  },

  strategies: {
    getAll: async (): Promise<StrategyItem[]> => {
      const res = await apiClient.get('/strategies');
      return res.data.data;
    },

    simulate: async (strategy: string, transactionCount: number = 500) => {
      const res = await apiClient.post('/strategies/simulate', { strategy, transactionCount });
      return res.data.data;
    },
  },

  ai: {
    analyze: async (input: Partial<AIScoringInput>) => {
      const res = await apiClient.post('/ai/analyze', input);
      return res.data.data;
    },
  },
};

export default api;
