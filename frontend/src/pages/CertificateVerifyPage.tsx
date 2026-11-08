import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Award, Search, CheckCircle2, XCircle, Download, ShieldCheck } from 'lucide-react';
import { certificateService } from '../services/certificateService';
import { CertificateVerification } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CertificateVerifyPage: React.FC = () => {
  const { certificateNumber: routeCertNum } = useParams<{ certificateNumber: string }>();
  const [searchParams] = useSearchParams();
  const queryCertNum = searchParams.get('id') || '';

  const initialCode = routeCertNum || queryCertNum || '';
  const [certInput, setCertInput] = useState(initialCode);
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performVerification = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    try {
      const data = await certificateService.verifyCertificate(code.trim());
      setResult(data);
    } catch {
      setResult(null);
      setErrorMsg('No valid certificate found matching this identification number.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      performVerification(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(certInput);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Verify Course Certificate
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Authenticate completion credentials issued by EduSphere LMS against our tamper-evident registry.
        </p>
      </div>

      {/* Verification Lookup Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          required
          placeholder="Enter certificate number (e.g. EDU-2026-XXXXX)..."
          value={certInput}
          onChange={(e) => setCertInput(e.target.value)}
          className="w-full pl-12 pr-32 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-mono shadow-xs focus:outline-none focus:border-indigo-500"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4" />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {/* Result Display */}
      {isLoading && (
        <div className="py-12">
          <LoadingSpinner size="md" message="Consulting registry..." />
        </div>
      )}

      {!isLoading && result && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-lg space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Officially Verified Credential</h3>
              <p className="text-xs text-emerald-600 font-semibold">Valid certificate of completion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Certificate Number</span>
              <p className="font-mono font-bold text-slate-900 text-sm">{result.certificateNumber}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Issued To</span>
              <p className="font-bold text-slate-900 text-sm">{result.studentName}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
              <span className="text-slate-400 font-medium">Course Title</span>
              <p className="font-bold text-slate-900 text-sm">{result.courseTitle}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Instructor</span>
              <p className="font-bold text-slate-900">{result.instructorName}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Date of Issue</span>
              <p className="font-bold text-slate-900">
                {new Date(result.issuedAtUtc).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <a
              href={certificateService.getDownloadUrl(result.certificateNumber)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" /> Download Official PDF
            </a>
          </div>
        </div>
      )}

      {!isLoading && hasSearched && !result && errorMsg && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-xs text-center space-y-3">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Invalid Certificate ID</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

