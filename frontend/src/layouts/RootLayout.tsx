import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-indigo-600">EduSphere</span>
            <span className="text-xs uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">LMS</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          EduSphere LMS &bull; Clean Architecture Foundation
        </div>
      </footer>
    </div>
  );
};

