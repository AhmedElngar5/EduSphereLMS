import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, XCircle, Power } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';

export const ManageUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getAllUsers(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => adminService.toggleUserStatus(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success(`User status updated to ${data.isActive ? 'Active' : 'Suspended'}.`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    },
  });

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Platform Users</h1>
          <p className="text-xs text-slate-500 mt-1">
            Full user accounts directory with role credentials and account active toggles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Student">Students</option>
            <option value="Instructor">Instructors</option>
            <option value="Admin">Administrators</option>
          </select>

          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Search user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading users directory..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {user.headline || 'No headline set'}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600">{user.email}</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              r === 'Admin'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : r === 'Instructor'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(user.createdAtUtc).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={user.isActive ? 'ghost' : 'outline'}
                        size="sm"
                        isLoading={toggleStatusMutation.isPending}
                        onClick={() => toggleStatusMutation.mutate(user.id)}
                        leftIcon={<Power className="w-3.5 h-3.5" />}
                        className={
                          user.isActive
                            ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
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
          title="No users found"
          description="No user accounts match your search and filter criteria."
        />
      )}
    </div>
  );
};
