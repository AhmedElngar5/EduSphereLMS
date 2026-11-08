import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Search, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const ManageInstructorsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getAllUsers(),
  });

  const instructors = users.filter((u) => u.roles.includes('Instructor'));

  const filtered = instructors.filter(
    (ins) =>
      ins.email.toLowerCase().includes(search.toLowerCase()) ||
      `${ins.firstName} ${ins.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Instructor Faculty</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage certified educators and inspect instructor course portfolios ({instructors.length} instructors)
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading instructors..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ins) => (
            <div
              key={ins.id}
              className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold text-lg flex items-center justify-center">
                    {ins.firstName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base truncate">
                      {ins.firstName} {ins.lastName}
                    </h3>
                    <p className="text-xs text-indigo-400 truncate">{ins.headline || 'Faculty Member'}</p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ins.email}</span>
                  </p>
                  <p className="text-[11px]">
                    Joined: {new Date(ins.createdAtUtc).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Active Faculty
                </span>
                <a
                  href={`/instructors/${ins.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="No instructors found"
          description="No registered instructors match your current search query."
        />
      )}
    </div>
  );
};

