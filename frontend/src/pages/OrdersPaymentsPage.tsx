import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { PaymentStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const OrdersPaymentsPage: React.FC = () => {
  const { data: report, isLoading } = useQuery({
    queryKey: ['adminPaymentReport'],
    queryFn: () => paymentService.getAdminPaymentReport(),
  });

  const grossRevenue = report?.totalGrossRevenue || 0;
  const netPlatformRevenue = report?.totalNetPlatformRevenue || 0;
  const instructorPayouts = report?.totalInstructorPayouts || 0;
  const completedOrders = report?.totalCompletedOrders || 0;
  const payments = report?.recentPayments || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Orders &amp; Payments</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Platform-wide financial settlements, student checkouts, and mock gateway audit logs
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Auditing payment ledgers..." />
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Volume</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">${grossRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-400">Total customer checkout value</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Retained</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">${netPlatformRevenue.toFixed(2)}</p>
              <p className="text-xs text-amber-400 font-semibold">20% Platform fee cut</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Faculty Payouts</span>
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-white">${instructorPayouts.toFixed(2)}</p>
              <p className="text-xs text-slate-400">80% Total paid to instructors</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Orders</span>
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-white">{completedOrders}</p>
              <p className="text-xs text-slate-400">Successful checkout transactions</p>
            </div>
          </div>

          {/* Recent Payments Ledger */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
            <h3 className="font-bold text-white text-base">Transactions Ledger</h3>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Course Title</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {p.gatewayTransactionId || `TX-${p.id}`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-300">
                          {p.courseTitle || `Order #${p.orderId}`}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          ${p.amount.toFixed(2)} {p.currency || 'USD'}
                        </td>
                        <td className="px-6 py-4">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(p.createdAtUtc).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {p.paymentGateway || 'MockPaymentGateway'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">
                No orders or payment records processed yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

