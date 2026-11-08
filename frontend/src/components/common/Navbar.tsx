import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  Bell,
  Menu,
  X,
  User as UserIcon,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  Award,
  LogOut,
  Settings,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { wishlistService } from '../../services/wishlistService';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isInstructor, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getUnreadCount()
        .then((res) => setUnreadCount(res.unreadCount || 0))
        .catch(() => {});

      wishlistService
        .getWishlist()
        .then((items) => setWishlistCount(items.length || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    EduSphere
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                    LMS
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Explore Catalog link */}
            <nav className="hidden md:flex items-center ml-4 space-x-1">
              <Link
                to="/courses"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Explore Courses
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                About
              </Link>
              <Link
                to="/verify-certificate"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Verify Certificate
              </Link>
            </nav>
          </div>

          {/* Search Bar - hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search courses, skills, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-transparent rounded-full focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Right Action Icons / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Wishlist Icon */}
                <Link
                  to="/student/wishlist"
                  className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Icon */}
                <Link
                  to="/student/notifications"
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Quick Role Portal Buttons on Desktop */}
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                ) : isInstructor ? (
                  <Link
                    to="/instructor/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Instructor
                  </Link>
                ) : (
                  <Link
                    to="/student/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    My Learning
                  </Link>
                )}

                {/* User Avatar Menu Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all cursor-pointer"
                  >
                    {user?.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center uppercase">
                        {user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user?.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/student/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Student Dashboard
                        </Link>
                        <Link
                          to="/student/my-courses"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          My Enrolled Courses
                        </Link>
                        <Link
                          to="/student/certificates"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Award className="w-4 h-4 text-slate-400" />
                          My Certificates
                        </Link>
                        <Link
                          to="/student/payments"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          Payment History
                        </Link>
                        <Link
                          to="/student/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Profile Settings
                        </Link>

                        {(isInstructor || isAdmin) && (
                          <div className="border-t border-slate-100 my-1 pt-1">
                            <Link
                              to="/instructor/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              <Briefcase className="w-4 h-4 text-indigo-500" />
                              Instructor Studio
                            </Link>
                          </div>
                        )}

                        {isAdmin && (
                          <div className="border-t border-slate-100 my-1 pt-1">
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              Admin Portal
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-200"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-indigo-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </form>

          <div className="flex flex-col space-y-1 pt-2">
            <Link
              to="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Explore Courses
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              About Platform
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Contact Support
            </Link>
            <Link
              to="/verify-certificate"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

