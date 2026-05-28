'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminCertificateDetailResponse } from '@/lib/admin-api';
import { getAdminCertificateDetailRequest } from '@/lib/admin-api';

type AdminCertificateDetailPageProps = {
  params: Promise<{ id: string }>;
};

function statusTone(status: 'Issued' | 'Reissued') {
  return status === 'Reissued' ? 'draft' : 'active';
}

export default function AdminCertificateDetailPage({ params }: AdminCertificateDetailPageProps) {
  const resolvedParams = use(params);
  const [certificate, setCertificate] = useState<AdminCertificateDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCertificate() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminCertificateDetailRequest(resolvedParams.id);
        if (!cancelled) {
          setCertificate(response);
          setMissing(false);
        }
      } catch (requestError) {
        if (!cancelled) {
          const message =
            requestError instanceof Error ? requestError.message : 'Unable to load certificate.';
          if (message.toLowerCase().includes('not found')) {
            setMissing(true);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  if (missing) {
    notFound();
  }

  return (
    <AdminLayout
      title={certificate ? `${certificate.student} Certificate` : 'Certificate Detail'}
      subtitle="Inspect certificate metadata, verification identifiers, and the downloadable record from one page."
    >
      <div className="mb-4">
        <Link
          href="/admin/certificates"
          className="dashboard-dark-button inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          ← Back to Certificates
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <div className="dashboard-panel-strong h-64 rounded-[1.9rem] animate-pulse" />
          <div className="dashboard-panel h-[28rem] rounded-[1.9rem] animate-pulse" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-rose-400">Unable to load certificate</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && certificate ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge value={certificate.status} tone={statusTone(certificate.status)} />
                <StatusBadge value={certificate.field} tone="neutral" />
              </div>

              <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
                {certificate.student}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                {certificate.studentEmail} • {certificate.studentSchool}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Assessment', certificate.assessment],
                  ['Score', `${certificate.score} • ${certificate.grade}`],
                  ['Issued', certificate.issuedDate],
                  ['Verification ID', certificate.verificationId],
                ].map(([label, value]) => (
                  <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
              <AdminSectionHeader
                eyebrow="Record metadata"
                title="Certificate reference"
                subtitle="A concise admin view of the data attached to this credential."
              />

              <div className="mt-5 space-y-3">
                {[
                  ['Attempt ID', certificate.attemptId],
                  ['Submitted at', certificate.submittedAt],
                  ['Duration', certificate.duration],
                  ['Marks', certificate.scoreValue],
                  ['Total marks', certificate.totalMarks],
                  ['Verification hash', certificate.verificationHash],
                ].map(([label, value]) => (
                  <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                      {label}
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
            <AdminSectionHeader
              eyebrow="Document preview"
              title="Certificate layout"
              subtitle="A preview of the student-facing document generated from the stored certificate record."
            />

            <div className="mt-5 rounded-[2rem] border border-[var(--dashboard-panel-border)] bg-white p-5 shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
              <div className="relative overflow-hidden rounded-[1.7rem] border border-[#d8dfd2] bg-[linear-gradient(145deg,#fefef8,white_58%,#f1f6e9)] px-6 py-8 sm:px-10 sm:py-10">
                <div className="absolute left-0 top-0 h-28 w-28 rounded-br-[4rem] bg-[rgba(199,242,65,0.24)]" />
                <div className="absolute bottom-0 right-0 h-36 w-36 rounded-tl-[4.5rem] bg-[rgba(34,78,48,0.08)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#577a1a]">
                    GradAssess AI
                  </p>
                  <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.24em] text-[#7a8677]">
                    Certificate of Employability Readiness
                  </p>
                  <h3 className="mt-4 text-center text-[2rem] font-semibold tracking-[-0.05em] text-[#17311d] sm:text-[2.5rem]">
                    {certificate.preview.studentName}
                  </h3>
                  <p className="mt-4 text-center text-base text-[#536255]">
                    successfully completed the {certificate.preview.assessmentTitle}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-[#536255]">
                    <span className="rounded-full bg-[#eef5e2] px-4 py-2">Score {certificate.score}</span>
                    <span className="rounded-full bg-[#eef5e2] px-4 py-2">Grade {certificate.grade}</span>
                    <span className="rounded-full bg-[#eef5e2] px-4 py-2">{certificate.preview.issuedDate}</span>
                  </div>
                  <div className="mt-10 flex flex-col gap-5 border-t border-[#dde5d5] pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#7a8677]">Verification ID</p>
                      <p className="mt-2 text-lg font-semibold text-[#17311d]">{certificate.verificationId}</p>
                    </div>
                    <div className="rounded-full border border-[#d8dfd2] px-4 py-2 text-sm font-semibold text-[#17311d]">
                      {certificate.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AdminLayout>
  );
}
