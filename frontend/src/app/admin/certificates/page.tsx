'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { ActionMenu, type ActionMenuAction } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { DataTable } from '@/components/admin/data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import {
  exportAdminCertificatesCsvRequest,
  getAdminCertificatesRequest,
  reissueAdminCertificateRequest,
  type AdminCertificateListItem,
  verifyAdminCertificateRequest,
} from '@/lib/admin-api';

type CertificateStatusFilter = 'all' | 'issued' | 'reissued';
type CertificateDateFilter = 'all' | '30d' | '90d' | 'month';

const certificateMetrics = [
  {
    title: 'Issued records',
    value: '284',
    helper: 'Certificate records currently available for verification',
    trend: '+18',
    tone: 'success' as const,
    icon: 'certificates' as const,
  },
  {
    title: 'Pending review',
    value: '14',
    helper: 'Records waiting for manual verification or metadata correction',
    trend: 'Watch',
    tone: 'warm' as const,
    icon: 'review' as const,
  },
  {
    title: 'Reissued this month',
    value: '47',
    helper: 'Mostly reissued after score updates or corrected student details',
    trend: '-4%',
    tone: 'neutral' as const,
    icon: 'verified' as const,
  },
];

function getCertificateTone(status: string) {
  return status === 'Reissued' ? ('draft' as const) : ('active' as const);
}

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<AdminCertificateListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CertificateStatusFilter>('all');
  const [field, setField] = useState('all');
  const [date, setDate] = useState<CertificateDateFilter>('90d');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    startTransition(() => {
      setPage(1);
    });
  }, [deferredSearch, status, field, date]);

  useEffect(() => {
    if (isAuthLoading || !session) return;

    let active = true;
    if (!hasLoadedOnce) {
      setIsLoading(true);
    }
    setPageError(undefined);

    void getAdminCertificatesRequest({
      page,
      pageSize,
      search: deferredSearch.trim(),
      status,
      field,
      date,
    })
      .then((payload) => {
        if (!active) return;
        setItems(payload.items);
        setTotalItems(payload.meta.total);
        setTotalPages(payload.meta.totalPages);
        setFieldOptions(payload.meta.availableFields);
        setHasLoadedOnce(true);
      })
      .catch((error) => {
        if (!active) return;
        setPageError(
          error instanceof Error ? error.message : 'Unable to load certificate records right now.',
        );
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, session?.accessToken, hasLoadedOnce, page, pageSize, deferredSearch, status, field, date]);

  const derivedMetrics = useMemo(() => {
    const reissuedCount = items.filter((item) => item.status === 'Reissued').length;
    const issuedCount = items.length - reissuedCount;
    const monthLabel =
      date === 'month'
        ? 'this month'
        : date === '30d'
          ? 'last 30 days'
          : date === '90d'
            ? 'last 90 days'
            : 'all time';

    return [
      {
        ...certificateMetrics[0],
        value: `${totalItems}`,
        helper: `Certificate records visible for ${monthLabel}`,
        trend: `+${issuedCount}`,
      },
      {
        ...certificateMetrics[1],
        value: `${Math.max(0, totalItems - items.length)}`,
        helper: 'Filtered records currently outside the active workspace view',
        trend: pageError ? 'Check' : 'Clear',
      },
      {
        ...certificateMetrics[2],
        value: `${reissuedCount}`,
        helper: 'Records reissued within the current filtered result set',
        trend: reissuedCount > 0 ? 'Active' : 'Stable',
      },
    ];
  }, [date, items, pageError, totalItems]);

  const filterChips = useMemo(
    () => [
      { label: 'Status', value: status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1) },
      { label: 'Field', value: field === 'all' ? 'All categories' : field },
      {
        label: 'Date issued',
        value:
          date === 'all'
            ? 'All time'
            : date === '30d'
              ? 'Last 30 days'
              : date === '90d'
                ? 'Last 90 days'
                : 'This month',
      },
    ],
    [date, field, status],
  );
  const canShowRecords = !pageError && (hasLoadedOnce || items.length > 0);

  const handleCopyVerificationId = async (certificate: AdminCertificateListItem) => {
    try {
      await navigator.clipboard.writeText(certificate.verificationId);
      emitAppToast({
        title: 'Verification ID copied',
        description: `${certificate.verificationId} is now on your clipboard.`,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to copy verification ID',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const handleVerify = async (certificate: AdminCertificateListItem) => {
    setActiveActionId(certificate.id);

    try {
      const payload = await verifyAdminCertificateRequest(certificate.id);
      emitAppToast({
        title: 'Certificate verified',
        description: `${payload.record.certificateNumber} was confirmed successfully.`,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to verify certificate',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReissue = async (certificate: AdminCertificateListItem) => {
    setActiveActionId(certificate.id);

    try {
      const payload = await reissueAdminCertificateRequest(certificate.id);
      setItems((current) => current.map((item) => (item.id === certificate.id ? payload.item : item)));
      emitAppToast({
        title: 'Certificate reissued',
        description: payload.message,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to reissue certificate',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);

    try {
      const { blob, filename } = await exportAdminCertificatesCsvRequest({
        search: deferredSearch.trim(),
        status,
        field,
        date,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      emitAppToast({
        title: 'CSV exported',
        description: 'The filtered certificate list has been downloaded.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to export CSV',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const buildActions = (certificate: AdminCertificateListItem): ActionMenuAction[] => [
    {
      label: 'View certificate',
      onClick: () => router.push(`/admin/certificates/${certificate.id}`),
    },
    {
      label: activeActionId === certificate.id ? 'Reissuing...' : 'Reissue certificate',
      onClick: () => {
        if (activeActionId === certificate.id) return;
        void handleReissue(certificate);
      },
    },
    {
      label: 'Copy verification ID',
      onClick: () => {
        void handleCopyVerificationId(certificate);
      },
    },
    {
      label: activeActionId === certificate.id ? 'Verifying...' : 'Verify record',
      onClick: () => {
        if (activeActionId === certificate.id) return;
        void handleVerify(certificate);
      },
    },
  ];

  if (!session && !isAuthLoading) {
    return (
      <AdminLayout
        title="Certificates"
        subtitle="Review issued credentials, verification records, and reissue actions from one operational workspace."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Sign in required</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            Your admin session has ended. Please sign in again to continue.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="dashboard-lime-panel mt-5 rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
          >
            Go to login
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Certificates"
      subtitle="Review issued credentials, verification records, and reissue actions from one operational workspace."
    >
      {/* TODO: enrich this view with verification audit history once the backend exposes it. */}
      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            Credential operations
          </p>
          <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            Keep certificate issuance clean, traceable, and ready to verify
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dashboard-muted)]">
            Use this view to spot records that need reissue, confirm verification identifiers, and keep the
            certificate trail reliable for students and external reviewers.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {derivedMetrics.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>
        </div>

        <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
          <AdminSectionHeader
            eyebrow="Priority queue"
            title="What admins should review next"
            subtitle="A quick summary of the tasks that usually block clean certificate delivery."
          />
          <div className="mt-5 space-y-3">
            {[
              'Verify certificate records before students share public verification links.',
              'Reissue certificates after any score change, identity correction, or result appeal.',
              'Confirm verification IDs are copied correctly into external reporting workflows.',
            ].map((item) => (
              <div
                key={item}
                className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-text)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="dashboard-panel rounded-[1.6rem] p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 border-b border-[var(--dashboard-panel-border)] pb-4 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">
              Certificate records ({totalItems})
            </p>
            <button
              type="button"
              onClick={() => {
                void handleExportCsv();
              }}
              disabled={isExporting}
              className="inline-flex items-center gap-2 text-xs font-medium text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-text)]"
            >
              <span className="text-sm">⇪</span>
              {isExporting ? 'Exporting CSV' : 'Export CSV'}
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <label className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3.5 py-2.5 xl:max-w-md">
              <span className="text-sm text-[var(--dashboard-muted)]">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search certificates by student, assessment, or verification ID"
                className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as CertificateStatusFilter)}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="issued">Issued</option>
                <option value="reissued">Reissued</option>
              </select>
              <select
                value={field}
                onChange={(event) => setField(event.target.value)}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All fields</option>
                {fieldOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={date}
                onChange={(event) => setDate(event.target.value as CertificateDateFilter)}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="90d">Last 90 days</option>
                <option value="30d">Last 30 days</option>
                <option value="month">This month</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--dashboard-panel-border)] pt-4">
            {filterChips.map((chip) => (
              <button
                key={`${chip.label}-${chip.value}`}
                type="button"
                className="rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]"
              >
                {chip.label}: {chip.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Credential records"
          title="Certificate records"
          subtitle="Track verification IDs, issuance state, and certificate actions from one structured table."
        />

        {pageError ? (
          <div className="dashboard-panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold text-rose-400">Unable to load certificates</p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{pageError}</p>
          </div>
        ) : null}

        {isLoading && !hasLoadedOnce ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="dashboard-panel h-28 rounded-[1.6rem] animate-pulse" />
            ))}
          </div>
        ) : null}

        {canShowRecords && items.length ? (
          <>
            {isLoading && hasLoadedOnce ? (
              <div className="dashboard-panel rounded-[1.4rem] border border-[var(--dashboard-panel-border)] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
                Refreshing certificate records...
              </div>
            ) : null}

            <div className="space-y-4 xl:hidden">
              {items.map((certificate) => (
                <MobileDataCard
                  key={certificate.id}
                  title={certificate.student}
                  subtitle={certificate.assessment}
                  meta={certificate.verificationId}
                  badges={<StatusBadge value={certificate.status} tone={getCertificateTone(certificate.status)} />}
                  rows={[
                    { label: 'Score', value: certificate.score },
                    { label: 'Grade', value: certificate.grade },
                    { label: 'Issued', value: certificate.issuedAt },
                    { label: 'Field', value: certificate.field },
                  ]}
                  actions={<ActionMenu variant="icon" actions={buildActions(certificate)} />}
                />
              ))}
            </div>

            <DataTable
              columns={['Student', 'Assessment', 'Outcome', 'Verification ID', 'Issued', 'Status', 'Actions']}
              gridTemplate="1.15fr 1.45fr 0.8fr 1fr 0.9fr 0.8fr 0.45fr"
            >
              {items.map((certificate) => (
                <div
                  key={certificate.id}
                  className="grid min-w-0 cursor-pointer gap-4 border-b border-[var(--dashboard-panel-border)] px-5 py-4 last:border-b-0"
                  style={{ gridTemplateColumns: '1.15fr 1.45fr 0.8fr 1fr 0.9fr 0.8fr 0.45fr' }}
                  onClick={() => router.push(`/admin/certificates/${certificate.id}`)}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">{certificate.student}</p>
                    <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{certificate.field}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">{certificate.assessment}</p>
                    <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{certificate.studentEmail}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dashboard-text)]">{certificate.score}</p>
                    <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Grade {certificate.grade}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--dashboard-text)]">{certificate.verificationId}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-[var(--dashboard-text)]">{certificate.issuedAt}</p>
                  </div>

                  <div className="min-w-0">
                    <StatusBadge value={certificate.status} tone={getCertificateTone(certificate.status)} />
                  </div>

                  <div className="flex justify-end">
                    <ActionMenu variant="icon" actions={buildActions(certificate)} />
                  </div>
                </div>
              ))}
            </DataTable>
          </>
        ) : null}

        {!isLoading && !items.length ? (
          <div className="dashboard-panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">
              No certificates match the current filters
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
              Adjust the search or filters to surface a different certificate record.
            </p>
          </div>
        ) : null}

        {!isLoading && items.length ? (
          <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-4 py-3">
            <p className="text-sm text-[var(--dashboard-muted)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="dashboard-dark-button rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="dashboard-dark-button rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}
