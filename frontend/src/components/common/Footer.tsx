import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">EduSphere</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50">
                LMS
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              EduSphere is a premier learning management system built on .NET 10 Clean Architecture and modern React. Delivering industry-standard verified certifications and hands-on skill development.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Enterprise Security
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                Verified Certificates
              </span>
            </div>
          </div>

          {/* Learn & Explore */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?isFree=true" className="hover:text-white transition-colors">
                  Free Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?level=Beginner" className="hover:text-white transition-colors">
                  Beginner Friendly
                </Link>
              </li>
              <li>
                <Link to="/courses?level=Advanced" className="hover:text-white transition-colors">
                  Advanced Enterprise
                </Link>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-white transition-colors">
                  Certificate Lookup
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/instructor/dashboard" className="hover:text-white transition-colors">
                  Instructor Studio
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                  Admin Control Center
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Demo Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About EduSphere
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500 block pt-1">
                  Powered by ASP.NET Core &amp; React 19
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EduSphere LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Secure In-Memory Auth</span>
            <span>No localStorage Tokens</span>
            <span>SQL Server LocalDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

