import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Receipt, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { PaymentStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const PaymentHistoryPage: React.FC = () => {
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: () => paymentService.getMyPayments(),
  });

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => paymentService.getMyOrders(),
  });

  const isLoading = isPaymentsLoading || isOrdersLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Receipts and simulated transaction records for all your course purchases
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading transaction records..." />
        </div>
      ) : payments.length > 0 || orders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {p.gatewayTransactionId || `TX-${p.id}`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {p.courseTitle || `Order #${p.orderId}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${p.amount.toFixed(2)} {p.currency || 'USD'}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.paymentGateway || 'MockGateway'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="No transaction records"
          description="You haven't made any purchases yet. Enrolled free courses do not generate invoices."
        />
      )}
    </div>
  );
};

