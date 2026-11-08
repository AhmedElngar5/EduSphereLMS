import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, CreditCard, PieChart, ShieldCheck } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const EarningsPage: React.FC = () => {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['instructorEarnings'],
    queryFn: () => paymentService.getInstructorEarnings(),
  });

  const netEarnings = earnings?.instructorEarnings || 0;
  const grossRevenue = earnings?.totalRevenue || 0;
  const platformFee = earnings?.platformFee || 0;
  const totalSales = earnings?.totalSalesCount || 0;
  const courseBreakdown = earnings?.courseBreakdown || [];
  const recentTransactions = earnings?.recentTransactions || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earnings &amp; Payouts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time instructor sales, revenue shares (80%), and transaction records
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Calculating revenue and payouts..." />
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-emerald-200">
                <span className="text-xs font-bold uppercase tracking-wider">Your Net Payout</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black">${netEarnings.toFixed(2)}</p>
              <p className="text-xs text-emerald-100 font-medium">80% Net Instructor Share</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">${grossRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-500 font-medium">Total checkout volume</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Fee</span>
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">${platformFee.toFixed(2)}</p>
              <p className="text-xs text-slate-500 font-medium">20% hosting &amp; video fee</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                <CreditCard className="w-5 h-5 text-sky-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{totalSales}</p>
              <p className="text-xs text-slate-500 font-medium">Paid orders fulfilled</p>
            </div>
          </div>

          {/* Revenue Breakdown by Course */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Course Revenue Breakdown</h3>
            {courseBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Course Title</th>
                      <th className="px-4 py-3">Sales Count</th>
                      <th className="px-4 py-3">Gross Sales</th>
                      <th className="px-4 py-3">Your Net Earnings (80%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseBreakdown.map((item) => (
                      <tr key={item.courseId} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{item.courseTitle}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">{item.salesCount}</td>
                        <td className="px-4 py-3.5 text-slate-600">${item.totalRevenue.toFixed(2)}</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600">
                          ${item.instructorEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">No course sales recorded yet.</p>
            )}
          </div>

          {/* Recent Payout Transactions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Sales Transactions</h3>
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Sale Amount</th>
                      <th className="px-4 py-3">Your Share</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.orderId} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">#{tx.orderId}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{tx.courseTitle}</td>
                        <td className="px-4 py-3.5">{tx.studentName}</td>
                        <td className="px-4 py-3.5">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600">
                          ${tx.instructorEarnings.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {new Date(tx.paidAtUtc).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">No sales transactions processed yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

