import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { certificateService } from '../services/certificateService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const CertificatesPage: React.FC = () => {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['myCertificates'],
    queryFn: () => certificateService.getMyCertificates(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earned Certificates</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View, download, and share your verified completion diplomas
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading your certificates..." />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Gold Ribbon Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent pointer-events-none rounded-bl-full" />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                  <Award className="w-5 h-5 shrink-0" />
                  <span>Verified Diploma of Completion</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {cert.courseTitle}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <p>
                    Recipient: <span className="font-semibold text-slate-800">{cert.studentName}</span>
                  </p>
                  <p>
                    Instructor:{' '}
                    <span className="font-semibold text-slate-800">{cert.instructorName}</span>
                  </p>
                  <p>
                    Issued on:{' '}
                    <span className="font-semibold text-slate-800">
                      {new Date(cert.issuedAtUtc).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="font-mono text-[11px] text-slate-400 pt-1">
                    ID: {cert.certificateNumber}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/verify-certificate/${encodeURIComponent(cert.certificateNumber)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Online</span>
                </Link>

                <a
                  href={certificateService.getDownloadUrl(cert.certificateNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="alert"
          title="No certificates earned yet"
          description="Complete 100% of the lessons in any enrolled course to generate your official verified diploma."
          actionLabel="Go to My Courses"
          onAction={() => (window.location.href = '/student/my-courses')}
        />
      )}
    </div>
  );
};

