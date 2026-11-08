import React from 'react';
import { ShieldCheck, Layers, Cpu, Database, Award, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Clean Architecture &bull; Modern Stack
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          About EduSphere LMS
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade Learning Management System engineered to provide exceptional educational delivery with resilient software craftsmanship.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Engineered with Clean Architecture
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            EduSphere separates technical concerns into decoupled layers. Business rules reside securely in the core Domain layer without external dependencies, while Application contracts orchestrate business workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Domain Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pure C# entities, domain enums, value objects, and business rules without external library coupling.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Application Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Business orchestration, DTOs, interfaces, and validation keeping code maintainable and testable.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Infrastructure Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              EF Core 10, SQL Server database persistence, JWT authentication, and file storage abstractions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Globe className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Modern Frontend</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              React 19, TypeScript, Tailwind CSS v4, Vite, and TanStack React Query with in-memory token security.
            </p>
          </div>
        </div>
      </div>

      {/* Security Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Zero Token Leaks</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            EduSphere strictly prohibits persistent tokens in <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">localStorage</code>. JWT access credentials are retained in memory and isolated browser tab sessions to defend against Cross-Site Scripting (XSS) vectors.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Cryptographic Certificates</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every completed course automatically issues a tamper-evident digital certificate with a globally unique verification identifier. Verifiers can authenticate certificates instantly via our public verification portal.
          </p>
        </div>
      </div>
    </div>
  );
};

