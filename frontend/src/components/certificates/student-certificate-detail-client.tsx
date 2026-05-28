'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { StudentCertificate } from '@/data/certificates-data';
import { getStudentCertificateDetailRequest } from '@/lib/student-dashboard-api';
import { CertificateActionsCard } from './certificate-actions-card';
import { CertificateHero } from './certificate-hero';
import { CertificateMetaCard } from './certificate-meta-card';
import { CertificatePreviewCard } from './certificate-preview-card';
import { CertificateSignalCard } from './certificate-signal-card';

export function StudentCertificateDetailClient({ id }: { id: string }) {
  const [certificate, setCertificate] = useState<StudentCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadCertificate = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentCertificateDetailRequest(id);
        if (isCancelled) return;
        setCertificate(response);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load this certificate right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCertificate();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <DashboardLayout
      title="Certificate"
      subtitle="View credential details, verification information, and share-ready proof of assessment performance."
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="dashboard-panel h-[14rem] animate-pulse rounded-[2rem]" />
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-4">
              <div className="dashboard-panel h-[16rem] animate-pulse rounded-[1.8rem]" />
              <div className="dashboard-panel h-[11rem] animate-pulse rounded-[1.8rem]" />
              <div className="dashboard-panel h-[12rem] animate-pulse rounded-[1.8rem]" />
            </div>
            <div className="dashboard-panel h-[20rem] animate-pulse rounded-[1.8rem]" />
          </div>
        </div>
      ) : errorMessage || !certificate ? (
        <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
          <p className="font-semibold text-[var(--dashboard-text)]">
            We could not load this certificate.
          </p>
          <p className="mt-2 leading-6">{errorMessage ?? 'Certificate not found.'}</p>
        </div>
      ) : (
        <>
          <CertificateHero certificate={certificate} />

          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-4">
              <CertificateMetaCard certificate={certificate} />
              <CertificateSignalCard certificate={certificate} />
              <CertificateActionsCard certificate={certificate} />
            </div>
            <div className="dashboard-panel rounded-[1.8rem] p-5 sm:p-6">
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">Preview note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                The downloadable certificate is now generated from the backend using the same recipient details, verification ID, and readiness theme shown below.
              </p>
              <div className="mt-4 space-y-3">
                <div className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  Carries student identity, score, grade, and verification reference.
                </div>
                <div className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  Keeps the current GradAssess AI green-lime visual language instead of a generic template.
                </div>
                <div className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  Delivered as a backend-generated certificate file for more reliable downloads.
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                Download preview
              </p>
              <h3 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                Certificate document preview
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dashboard-muted)]">
                A larger preview of the styled certificate layout students can now download and share.
              </p>
            </div>

            <CertificatePreviewCard certificate={certificate} />
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
