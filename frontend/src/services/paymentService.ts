import api from './api';
import { CheckoutResult, Order, Payment, InstructorEarningsSummary, AdminPaymentReport } from '../types';

export const paymentService = {
  checkout: async (courseId: number, couponCode?: string): Promise<CheckoutResult> => {
    const response = await api.post<CheckoutResult>('/payments/checkout', {
      courseId,
      couponCode,
    });
    return response.data;
  },

  simulateSuccess: async (paymentId: number): Promise<Payment> => {
    const response = await api.post<Payment>(`/payments/${paymentId}/simulate-success`);
    return response.data;
  },

  simulateFailure: async (paymentId: number, failureReason?: string): Promise<Payment> => {
    const response = await api.post<Payment>(`/payments/${paymentId}/simulate-failure`, {
      failureReason: failureReason || 'Card declined (Simulated)',
    });
    return response.data;
  },

  getPaymentStatus: async (paymentId: number): Promise<any> => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/my-orders');
    return response.data;
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments/my-payments');
    return response.data;
  },

  getInstructorEarnings: async (): Promise<InstructorEarningsSummary> => {
    const response = await api.get<InstructorEarningsSummary>('/payments/instructor/earnings');
    return response.data;
  },

  getAdminPaymentReport: async (): Promise<AdminPaymentReport> => {
    const response = await api.get<AdminPaymentReport>('/payments/admin/report');
    return response.data;
  },
};
