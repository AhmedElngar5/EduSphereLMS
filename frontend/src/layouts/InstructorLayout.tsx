import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  DollarSign,
  TrendingUp,
  LogOut,
  ArrowLeft,
  Briefcase,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/common/Drawer';

export const InstructorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', to: '/instructor/courses', icon: BookOpen },
    { name: 'Create Course', to: '/instructor/courses/new', icon: PlusCircle },
    { name: 'Students Enrolled', to: '/instructor/students', icon: Users },
    { name: 'Earnings & Sales', to: '/instructor/earnings', icon: DollarSign },
    { name: 'Performance Analytics', to: '/instructor/performance', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentNav = navItems.find((item) => location.pathname === item.to) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">EduSphere</span>
            </Link>

            <span className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Instructor Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Student View
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">Course Creator</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sub-bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <currentNav.icon className="w-4 h-4 text-indigo-600" />
          <span>{currentNav.name}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          Menu
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Instructor Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="px-3 py-2 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Instructor Workspace
                  </p>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Creator Support Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-2xl border border-indigo-100 text-slate-800 shadow-xs">
                <p className="text-xs font-bold text-indigo-900 mb-1">Need Instructor Help?</p>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Check best practices for curriculum design, video bitrate, and student retention.
                </p>
                <Link
                  to="/instructor/courses/new"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Course Guide
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content outlet */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Instructor Studio"
      >
        <div className="space-y-6">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-indigo-600 font-medium">Course Creator</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              to="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Student View</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
