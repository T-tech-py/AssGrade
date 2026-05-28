'use client';

import { useEffect, useState } from 'react';
import { CertificateListCard } from '@/components/certificates/certificate-list-card';
import { CertificateOverviewCard } from '@/components/certificates/certificate-overview-card';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionHeader } from '@/components/dashboard/section-header';
import type { StudentCertificate } from '@/data/certificates-data';
import { getStudentCertificatesRequest } from '@/lib/student-dashboard-api';

type CertificatesState = {
  overview: {
    totalIssued: string;
    shareableNow: string;
    pendingUnlocks: string;
    latestIssued: string;
  };
  items: StudentCertificate[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const emptyState: CertificatesState = {
  overview: {
    totalIssued: '0',
    shareableNow: '0',
    pendingUnlocks: '0',
    latestIssued: 'Not issued yet',
  },
  items: [],
  pagination: {
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 1,
  },
};

export function StudentCertificatesPageClient() {
  const [page, setPage] = useState(1);
  const [certificates, setCertificates] = useState<CertificatesState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadCertificates = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentCertificatesRequest({ page, pageSize: 6 });
        if (isCancelled) return;
        setCertificates(response);
        setHasLoadedOnce(true);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load your certificates right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCertificates();

    return () => {
      isCancelled = true;
    };
  }, [page]);

  const showInitialLoading = isLoading && !hasLoadedOnce;
  const showRefreshingState = isLoading && hasLoadedOnce;
  const startIndex =
    certificates.pagination.total === 0
      ? 0
      : (certificates.pagination.page - 1) * certificates.pagination.pageSize + 1;
  const endIndex = Math.min(
    certificates.pagination.page * certificates.pagination.pageSize,
    certificates.pagination.total,
  );

  return (
    <DashboardLayout
      title="Certificates"
      subtitle="Manage issued credentials, review verification details, and keep your strongest employability proof ready to share."
    >
      {showRefreshingState ? (
        <div className="dashboard-panel rounded-[1.4rem] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
          Refreshing your certificates...
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CertificateOverviewCard
          title="Issued"
          value={certificates.overview.totalIssued}
          helper="Certificates currently available in your profile"
        />
        <CertificateOverviewCard
          title="Shareable now"
          value={certificates.overview.shareableNow}
          helper="Credentials ready for employers and institutions"
        />
        <CertificateOverviewCard
          title="Pending unlocks"
          value={certificates.overview.pendingUnlocks}
          helper="Assessments that still need a stronger score"
        />
        <CertificateOverviewCard
          title="Latest issue"
          value={certificates.overview.latestIssued}
          helper="Most recent credential issuance date"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Credential library"
          title="Your certificates"
          subtitle="Open a certificate to view its preview, verification details, and share or download actions."
        />

        {showInitialLoading ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`certificate-loading-${index}`}
                className="dashboard-panel h-[26rem] animate-pulse rounded-[1.8rem]"
              />
            ))}
          </div>
        ) : errorMessage && !hasLoadedOnce ? (
          <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
            <p className="font-semibold text-[var(--dashboard-text)]">
              We could not load your certificates.
            </p>
            <p className="mt-2 leading-6">{errorMessage}</p>
          </div>
        ) : certificates.items.length ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--dashboard-muted)]">
                Showing {startIndex}-{endIndex} of {certificates.pagination.total} certificates
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={certificates.pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="dashboard-dark-button rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={certificates.pagination.page >= certificates.pagination.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(certificates.pagination.totalPages, current + 1),
                    )
                  }
                  className="dashboard-dark-button rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {certificates.items.map((certificate) => (
                <CertificateListCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No certificates yet"
            description="Complete a qualifying assessment and reach the required score to unlock your first verifiable certificate."
            actionLabel="Browse assessments"
            actionHref="/assessments"
          />
        )}
      </section>
    </DashboardLayout>
  );
}
