import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  BookCheck,
  Clock,
  Layers,
  CreditCard,
  BarChart3,
  Users,
  GraduationCap,
  LogOut,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/common/Drawer';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Courses', to: '/admin/courses', icon: BookCheck },
    { name: 'Pending Approvals', to: '/admin/courses/pending', icon: Clock },
    { name: 'Categories', to: '/admin/categories', icon: Layers },
    { name: 'Orders & Payments', to: '/admin/orders', icon: CreditCard },
    { name: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { name: 'Manage Users', to: '/admin/users', icon: Users },
    { name: 'Manage Instructors', to: '/admin/instructors', icon: GraduationCap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentNav = navItems.find((item) => location.pathname === item.to) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Enterprise Slate Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">EduSphere</span>
            </Link>

            <span className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront View</span>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">Administrator</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Breadcrumb / Action Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <currentNav.icon className="w-4 h-4 text-amber-600" />
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
          {/* Desktop Admin Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="px-3 py-2 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Control Center
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
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          />
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Quick System Badge */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-white shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Security</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Role-based permissions & audit logging active.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Admin Control Center"
      >
        <div className="space-y-6">
          <div className="p-3 rounded-xl bg-slate-950 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-amber-400">System Administrator</p>
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
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
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
              <span>Storefront View</span>
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
