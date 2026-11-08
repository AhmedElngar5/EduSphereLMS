import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Award,
  CreditCard,
  Bell,
  Settings,
  Sparkles,
  Menu,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Drawer } from '../components/common/Drawer';
import { useAuth } from '../context/AuthContext';

export const StudentLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', to: '/student/my-courses', icon: BookOpen },
    { name: 'Wishlist', to: '/student/wishlist', icon: Heart },
    { name: 'Certificates', to: '/student/certificates', icon: Award },
    { name: 'Payment History', to: '/student/payments', icon: CreditCard },
    { name: 'Notifications', to: '/student/notifications', icon: Bell },
    { name: 'Profile Settings', to: '/student/profile', icon: Settings },
  ];

  const currentNav = navItems.find((item) => location.pathname === item.to) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <Navbar />

      {/* Mobile Sub-bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <currentNav.icon className="w-4 h-4 text-indigo-600" />
          <span>{currentNav.name}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Learning Menu</span>
        </button>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Student Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* User Profile Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.firstName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-base flex items-center justify-center uppercase shadow-xs">
                      {user?.firstName?.[0] || 'S'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{user?.headline || 'Student'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Active Learner
                  </span>
                  <Link
                    to="/student/profile"
                    className="text-slate-400 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1">
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
          </aside>

          {/* Main student page content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Student Portal"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center uppercase">
                {user?.firstName?.[0] || 'S'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
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
        </div>
      </Drawer>

      <Footer />
    </div>
  );
};
