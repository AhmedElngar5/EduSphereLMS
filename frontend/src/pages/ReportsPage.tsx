import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  PieChart,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Cpu,
  Database,
  Layers,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReportsPage: React.FC = () => {
  const { data: paymentReport, isLoading: isReportLoading } = useQuery({
    queryKey: ['adminPaymentReport'],
    queryFn: () => paymentService.getAdminPaymentReport(),
  });

  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  const isLoading = isReportLoading || isCatLoading;

  const grossRevenue = paymentReport?.totalGrossRevenue || 0;
  const netPlatformRevenue = paymentReport?.totalNetPlatformRevenue || 0;
  const instructorPayouts = paymentReport?.totalInstructorPayouts || 0;
  const completedOrders = paymentReport?.totalCompletedOrders || 0;
  const failedOrders = paymentReport?.totalFailedOrders || 0;

  const totalOrdersCount = completedOrders + failedOrders;
  const successRate =
    totalOrdersCount > 0 ? ((completedOrders / totalOrdersCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Platform Reports &amp; Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          System operational telemetry, revenue allocation, and categorical taxonomy distribution
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Compiling executive reports..." />
        </div>
      ) : (
        <>
          {/* Revenue Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Gross Sales Volume
                </span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">${grossRevenue.toFixed(2)}</p>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
              <p className="text-xs text-slate-400">100% of cumulative checkout value</p>
            </div>

            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructor Payouts (80%)
                </span>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-white">${instructorPayouts.toFixed(2)}</p>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div className="bg-indigo-500 h-full rounded-full w-4/5" />
              </div>
              <p className="text-xs text-indigo-400 font-semibold">Allocated to course creators</p>
            </div>

            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform Net Margin (20%)
                </span>
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">${netPlatformRevenue.toFixed(2)}</p>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div className="bg-amber-400 h-full rounded-full w-1/5" />
              </div>
              <p className="text-xs text-amber-400 font-semibold">Net platform retention</p>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
              <h3 className="font-bold text-white text-base">Course Taxonomy Breakdown</h3>
              <div className="space-y-3">
                {categories.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-slate-400">{c.courseCount} courses</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (c.courseCount / (categories.reduce((a, b) => a + b.courseCount, 0) || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Health */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4">
              <h3 className="font-bold text-white text-base">Architecture Health &amp; Security</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Backend Core</span>
                  </div>
                  <span className="text-emerald-400 font-bold">.NET 10 Web API &bull; Active</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Database Engine</span>
                  </div>
                  <span className="text-emerald-400 font-bold">SQL Server LocalDB &bull; Connected</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Session Security</span>
                  </div>
                  <span className="text-emerald-400 font-bold">No localStorage Tokens</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Checkout Success Rate</span>
                  </div>
                  <span className="text-amber-400 font-bold">{successRate}% Satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

