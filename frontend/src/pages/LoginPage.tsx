import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, BookOpen, ShieldCheck, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/api';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      handleRedirect(res.roles);
    } catch (err: any) {
      const parsed = parseApiError(err, 'Invalid email or password. Please try again.');
      setError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ email: demoEmail, password: demoPass });
      handleRedirect(res.roles);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedirect = (roles?: string[]) => {
    if (redirect) {
      navigate(redirect, { replace: true });
      return;
    }
    if (roles?.includes('Admin')) {
      navigate('/admin/dashboard', { replace: true });
    } else if (roles?.includes('Instructor')) {
      navigate('/instructor/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to continue your learning journey on EduSphere
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            One-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemoLogin('student@edusphere.com', 'Student@123456')}
              className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 shadow-2xs hover:bg-indigo-50/50 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Student</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemoLogin('instructor@edusphere.com', 'Instructor@123456')}
              className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 shadow-2xs hover:bg-indigo-50/50 transition-colors cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Instructor</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemoLogin('admin@edusphere.com', 'Admin@123456')}
              className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-500 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 shadow-2xs hover:bg-amber-50/50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

