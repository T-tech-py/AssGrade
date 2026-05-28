'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionMenu } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { DrawerPanel } from '@/components/admin/drawer-panel';
import { MetricCard } from '@/components/admin/metric-card';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { RiskBadge } from '@/components/admin/risk-badge';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import {
  getAdminSecurityAlertDetailRequest,
  getAdminSecurityAlertsRequest,
  type AdminSecurityAlertDetailResponse,
  type AdminSecurityAlertListItem,
  updateAdminSecurityAlertStatusRequest,
} from '@/lib/admin-api';

function getStatusTone(status: AdminSecurityAlertListItem['status']) {
  return status === 'Escalated'
    ? ('danger' as const)
    : status === 'Reviewed'
      ? ('active' as const)
      : status === 'Cleared'
        ? ('success' as const)
        : ('draft' as const);
}

function getRiskSurface(risk: AdminSecurityAlertListItem['risk']) {
  return risk === 'High'
    ? 'border-[rgba(190,24,93,0.22)] bg-[rgba(190,24,93,0.06)]'
    : risk === 'Medium'
      ? 'border-[rgba(202,138,4,0.18)] bg-[rgba(202,138,4,0.06)]'
      : 'border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)]';
}

export default function AdminSecurityPage() {
  const [items, setItems] = useState<AdminSecurityAlertListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<AdminSecurityAlertDetailResponse | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('all');
  const [assessment, setAssessment] = useState('all');
  const [date, setDate] = useState<'all' | '7d' | '14d' | '30d' | '90d'>('14d');
  const [violation, setViolation] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableAssessments, setAvailableAssessments] = useState<string[]>([]);
  const [availableViolations, setAvailableViolations] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    totalFlaggedAttempts: 0,
    highRiskSessions: 0,
    webcamViolations: 0,
    tabSwitchIncidents: 0,
  });

  async function loadSecurityAlertDetail(alertId: string) {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const detail = await getAdminSecurityAlertDetailRequest(alertId);
      setSelectedIncident(detail);
      setReviewNotes(detail.review.notes);
    } catch (requestError) {
      setDetailError(
        requestError instanceof Error ? requestError.message : 'Unable to load incident details.',
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadSecurityAlerts() {
    try {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await getAdminSecurityAlertsRequest({
        page,
        pageSize: 12,
        search,
        risk,
        assessment,
        date,
        violation,
        status,
      });

      setItems(response.items);
      setMetrics(response.metrics);
      setTotalPages(response.meta.totalPages);
      setAvailableAssessments(response.meta.availableAssessments);
      setAvailableViolations(response.meta.availableViolations);
      setHasLoadedOnce(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load security alerts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadSecurityAlerts();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [page, search, risk, assessment, date, violation, status]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedIncident(null);
      setReviewNotes('');
      setDetailError(null);
      return;
    }

    const alertId = selectedId;

    async function loadDetail() {
      await loadSecurityAlertDetail(alertId);
    }

    void loadDetail();
  }, [selectedId]);

  const metricCards = useMemo(
    () => [
      {
        title: 'Flagged Attempts',
        value: `${metrics.totalFlaggedAttempts}`,
        helper: 'Flagged sessions matching your current filters',
        trend: metrics.totalFlaggedAttempts > 0 ? 'Active queue' : 'All clear',
        tone: 'danger' as const,
        icon: 'alert' as const,
      },
      {
        title: 'High-Risk Sessions',
        value: `${metrics.highRiskSessions}`,
        helper: 'Require urgent admin review',
        trend: metrics.highRiskSessions > 0 ? 'Escalate fast' : 'Stable',
        tone: metrics.highRiskSessions > 0 ? ('danger' as const) : ('neutral' as const),
        icon: 'security' as const,
      },
      {
        title: 'Webcam Violations',
        value: `${metrics.webcamViolations}`,
        helper: 'Camera disconnects, no-face, or multi-face events',
        trend: metrics.webcamViolations > 0 ? 'Review camera trail' : 'No issues',
        tone: 'warm' as const,
        icon: 'review' as const,
      },
      {
        title: 'Tab Switch Incidents',
        value: `${metrics.tabSwitchIncidents}`,
        helper: 'Browser context changes recorded during active attempts',
        trend: metrics.tabSwitchIncidents > 0 ? 'Most common trigger' : 'No switches',
        tone: 'neutral' as const,
        icon: 'attempts' as const,
      },
    ],
    [metrics],
  );

  async function handleStatusUpdate(nextStatus: 'REVIEWED' | 'ESCALATED' | 'CLEARED') {
    if (!selectedId) return;

    try {
      setIsUpdating(true);
      const response = await updateAdminSecurityAlertStatusRequest(selectedId, {
        status: nextStatus,
        notes: reviewNotes,
      });

      setItems((current) =>
        current.map((item) => (item.id === response.item.id ? { ...item, ...response.item } : item)),
      );
      await loadSecurityAlertDetail(selectedId);

      emitAppToast({
        tone: 'success',
        title: 'Security review updated',
        description: response.message,
      });

      void loadSecurityAlerts();
    } catch (requestError) {
      emitAppToast({
        tone: 'error',
        title: 'Unable to update incident',
        description:
          requestError instanceof Error
            ? requestError.message
            : 'The security action could not be completed right now.',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleQuickStatusUpdate(
    incidentId: string,
    nextStatus: 'REVIEWED' | 'ESCALATED' | 'CLEARED',
    successTitle: string,
    successDescription: string,
  ) {
    try {
      const response = await updateAdminSecurityAlertStatusRequest(incidentId, { status: nextStatus });
      setItems((current) =>
        current.map((item) => (item.id === response.item.id ? { ...item, ...response.item } : item)),
      );

      if (selectedId === incidentId) {
        await loadSecurityAlertDetail(incidentId);
      }

      emitAppToast({
        tone: 'success',
        title: successTitle,
        description: successDescription,
      });

      void loadSecurityAlerts();
    } catch (requestError) {
      emitAppToast({
        tone: 'error',
        title: 'Unable to update incident',
        description:
          requestError instanceof Error
            ? requestError.message
            : 'The security action could not be completed right now.',
      });
    }
  }

  function renderActions(incident: AdminSecurityAlertListItem) {
    return (
      <ActionMenu
        variant="icon"
        actions={[
          { label: 'View details', onClick: () => setSelectedId(incident.id) },
          {
            label: incident.status === 'Escalated' ? 'Keep escalated' : 'Mark reviewed',
            onClick: () => {
              setSelectedId(incident.id);
              void handleQuickStatusUpdate(
                incident.id,
                'REVIEWED',
                'Incident reviewed',
                'The flagged session has been marked as reviewed.',
              );
            },
          },
          {
            label: 'Escalate',
            onClick: () => {
              setSelectedId(incident.id);
              void handleQuickStatusUpdate(
                incident.id,
                'ESCALATED',
                'Incident escalated',
                'The flagged session has been escalated for follow-up.',
              );
            },
            tone: 'danger',
          },
          {
            label: 'Clear flag',
            onClick: () => {
              setSelectedId(incident.id);
              void handleQuickStatusUpdate(
                incident.id,
                'CLEARED',
                'Incident cleared',
                'The flagged session has been cleared.',
              );
            },
          },
        ]}
      />
    );
  }

  return (
    <AdminLayout
      title="Security Alerts"
      subtitle="Review flagged proctoring events, assess risk, and resolve suspicious exam sessions."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <div className="dashboard-panel rounded-[1.6rem] p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="space-y-4">
            <label className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3.5 py-2.5">
              <span className="text-sm text-[var(--dashboard-muted)]">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search incidents by student, assessment, or violation type"
                className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <select
                value={risk}
                onChange={(event) => {
                  setPage(1);
                  setRisk(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All risk levels</option>
                <option value="high">High risk</option>
                <option value="medium">Medium risk</option>
                <option value="low">Low risk</option>
              </select>
              <select
                value={assessment}
                onChange={(event) => {
                  setPage(1);
                  setAssessment(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All assessments</option>
                {availableAssessments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={date}
                onChange={(event) => {
                  setPage(1);
                  setDate(event.target.value as typeof date);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="14d">Last 14 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <select
                value={violation}
                onChange={(event) => {
                  setPage(1);
                  setViolation(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">Any violation</option>
                {availableViolations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">Any review state</option>
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
                <option value="escalated">Escalated</option>
                <option value="cleared">Cleared</option>
              </select>
            </div>
          </div>
        </div>
        {isRefreshing ? (
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
            Refreshing security alerts...
          </p>
        ) : null}
      </div>

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Incident review"
          title="Flagged sessions"
          subtitle="Open serious cases quickly, mark reviewed incidents, and escalate suspicious activity when needed."
        />

        {isLoading ? (
          <div className="dashboard-panel rounded-[1.6rem] p-6 text-sm text-[var(--dashboard-muted)]">
            Loading security incidents...
          </div>
        ) : error ? (
          <div className="dashboard-panel rounded-[1.6rem] p-6">
            <p className="text-sm font-semibold text-rose-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadSecurityAlerts()}
              className="dashboard-lime-panel mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-[#223200]"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="dashboard-panel rounded-[1.6rem] p-6 text-sm text-[var(--dashboard-muted)]">
            No flagged sessions matched the current filters.
          </div>
        ) : (
          <>
            <div className="space-y-4 lg:hidden">
              {items.map((incident) => (
                <MobileDataCard
                  key={incident.id}
                  title={incident.student}
                  subtitle={incident.assessment}
                  meta={incident.detectedAt}
                  badges={
                    <>
                      <RiskBadge value={incident.risk} />
                      <StatusBadge value={incident.status} tone={getStatusTone(incident.status)} />
                    </>
                  }
                  rows={[
                    { label: 'Violation', value: incident.violation },
                    { label: 'Warnings', value: `${incident.warningCount}` },
                    { label: 'Device', value: incident.device },
                    { label: 'IP', value: incident.ipAddress },
                  ]}
                  actions={
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(incident.id)}
                        className="dashboard-lime-panel rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#223200]"
                      >
                        View incident
                      </button>
                      {renderActions(incident)}
                    </div>
                  }
                />
              ))}
            </div>

            <div className="hidden gap-3 xl:grid">
              <div className="grid grid-cols-[1.1fr_1.2fr_1fr_0.7fr_0.9fr_1fr_0.85fr_0.45fr] gap-4 rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                <div>Student</div>
                <div>Assessment</div>
                <div>Violation</div>
                <div>Warnings</div>
                <div>Risk</div>
                <div>Detected</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </div>
              {items.map((incident) => (
                <div
                  key={incident.id}
                  className={`dashboard-panel rounded-[1.45rem] border px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(2,8,6,0.16)] ${getRiskSurface(incident.risk)}`}
                >
                  <div className="grid grid-cols-[1.1fr_1.2fr_1fr_0.7fr_0.9fr_1fr_0.85fr_0.45fr] gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">{incident.student}</p>
                      <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{incident.device}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--dashboard-text)]">{incident.assessment}</p>
                      <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{incident.ipAddress}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--dashboard-text)]">{incident.violation}</p>
                      <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Session flagged for review</p>
                    </div>
                    <div className="text-sm font-semibold text-[var(--dashboard-text)]">{incident.warningCount}</div>
                    <div><RiskBadge value={incident.risk} /></div>
                    <div className="text-sm text-[var(--dashboard-muted)]">{incident.detectedAt}</div>
                    <div>
                      <StatusBadge value={incident.status} tone={getStatusTone(incident.status)} />
                    </div>
                    <div className="flex justify-end">{renderActions(incident)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:grid xl:hidden gap-3">
              {items.map((incident) => (
                <div
                  key={incident.id}
                  className={`dashboard-panel rounded-[1.45rem] border p-5 ${getRiskSurface(incident.risk)}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-[var(--dashboard-text)]">{incident.student}</p>
                      <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{incident.assessment}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <RiskBadge value={incident.risk} />
                      <StatusBadge value={incident.status} tone={getStatusTone(incident.status)} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Violation</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{incident.violation}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Warnings</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{incident.warningCount}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Detected</p>
                      <p className="mt-1 text-sm text-[var(--dashboard-text)]">{incident.detectedAt}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Device</p>
                      <p className="mt-1 text-sm text-[var(--dashboard-text)]">{incident.device}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{incident.ipAddress}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(incident.id)}
                        className="dashboard-lime-panel rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#223200]"
                      >
                        View incident
                      </button>
                      {renderActions(incident)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--dashboard-panel-border)] pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="dashboard-dark-button rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="dashboard-lime-panel rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#223200] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <DrawerPanel
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title={selectedIncident?.student ?? 'Incident details'}
        subtitle={
          selectedIncident ? `${selectedIncident.assessment} • ${selectedIncident.violation}` : ''
        }
      >
        {detailLoading ? (
          <div className="space-y-4 text-sm text-[var(--dashboard-muted)]">
            <p>Loading incident details...</p>
          </div>
        ) : detailError ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-rose-500">{detailError}</p>
            <button
              type="button"
              onClick={() => {
                if (selectedId) {
                  void loadSecurityAlertDetail(selectedId);
                }
              }}
              className="dashboard-lime-panel rounded-xl px-4 py-2 text-sm font-semibold text-[#223200]"
            >
              Retry
            </button>
          </div>
        ) : selectedIncident ? (
          <div className="space-y-5">
            <div className={`rounded-[1.45rem] border px-4 py-4 ${getRiskSurface(selectedIncident.risk)}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-subtle)]">
                    Incident summary
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">
                    {selectedIncident.violation}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">
                    Detected on {selectedIncident.detectedAt} during {selectedIncident.assessment}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RiskBadge value={selectedIncident.risk} />
                  <StatusBadge
                    value={selectedIncident.status}
                    tone={getStatusTone(selectedIncident.status)}
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Warnings</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{selectedIncident.warningCount}</p>
                </div>
                <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">IP address</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{selectedIncident.ipAddress}</p>
                </div>
                <div className="dashboard-soft-tile rounded-[1rem] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Environment</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{selectedIncident.device}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Candidate</p>
                <p className="mt-2 text-base font-semibold text-[var(--dashboard-text)]">{selectedIncident.student}</p>
                <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{selectedIncident.studentEmail}</p>
                <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{selectedIncident.studentSchool}</p>
              </div>
              <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Attempt info</p>
                <p className="mt-2 text-sm text-[var(--dashboard-text)]">Field: {selectedIncident.field}</p>
                <p className="mt-1 text-sm text-[var(--dashboard-text)]">Started: {selectedIncident.startedAt}</p>
                <p className="mt-1 text-sm text-[var(--dashboard-text)]">Submitted: {selectedIncident.submittedAt}</p>
                <p className="mt-1 text-sm text-[var(--dashboard-text)]">Duration: {selectedIncident.duration}</p>
              </div>
            </div>

            <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Incident timeline</p>
                <span className="text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  {selectedIncident.timeline.length} events
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {selectedIncident.timeline.map((item, index) => (
                  <div key={item.id} className="relative pl-7">
                    {index !== selectedIncident.timeline.length - 1 ? (
                      <span className="absolute left-[4px] top-4 h-[calc(100%-0.2rem)] w-px bg-[var(--dashboard-panel-border)]" />
                    ) : null}
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--dashboard-accent-foreground)]" />
                    <div className="rounded-[1rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.title}</p>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{item.time}</p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-muted)]">{item.severity}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Evidence preview</p>
                <span className="rounded-full border border-[var(--dashboard-panel-border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Placeholder
                </span>
              </div>
              <div className="mt-4 flex h-40 items-center justify-center rounded-[1.2rem] border border-dashed border-[var(--dashboard-panel-border)] text-sm text-[var(--dashboard-muted)]">
                Snapshot preview will appear here when backend media review is wired.
              </div>
            </div>

            <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">Admin notes</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                    Current state: {selectedIncident.review.status} • Updated {selectedIncident.review.updatedAt}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void handleStatusUpdate('REVIEWED')}
                    className="dashboard-dark-button rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
                  >
                    Mark reviewed
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void handleStatusUpdate('ESCALATED')}
                    className="dashboard-lime-panel rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#223200] disabled:opacity-50"
                  >
                    Escalate
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void handleStatusUpdate('CLEARED')}
                    className="rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)] disabled:opacity-50"
                  >
                    Clear flag
                  </button>
                </div>
              </div>
              <textarea
                className="mt-3 min-h-[120px] w-full rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                placeholder="Add review notes, escalation context, or resolution details..."
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </DrawerPanel>
    </AdminLayout>
  );
}
