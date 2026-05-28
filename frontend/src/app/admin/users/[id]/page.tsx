'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import type { AdminUserDetailResponse } from '@/lib/admin-api';
import {
  approveAdminUserRequestRequest,
  getAdminUserDetailRequest,
  rejectAdminUserRequestRequest,
  resetAdminUserAccessRequest,
  toggleAdminUserStatusRequest,
} from '@/lib/admin-api';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, user: authUser, isLoading: isAuthLoading } = useAuth();
  const [user, setUser] = useState<AdminUserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'status' | 'reset' | null>(null);
  const [pageError, setPageError] = useState<string | undefined>();

  useEffect(() => {
    if (isAuthLoading || !session || !params?.id) return;

    let active = true;
    setIsLoading(true);
    setPageError(undefined);

    void getAdminUserDetailRequest(params.id)
      .then((payload) => {
        if (active) {
          setUser(payload);
        }
      })
      .catch((error) => {
        if (active) {
          setPageError(error instanceof Error ? error.message : 'Unable to load the user record right now.');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, session, params?.id]);

  if (!session && !isAuthLoading) {
    return (
      <AdminLayout
        title="User Details"
        subtitle="Review the account record, activity snapshot, and access information from one place."
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

  if (!isAuthLoading && authUser?.role !== 'ADMIN') {
    return (
      <AdminLayout
        title="User Details"
        subtitle="Review the account record, activity snapshot, and access information from one place."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Admin access only</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            This workspace is reserved for administrator accounts.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!isLoading && !user && !pageError) {
    notFound();
  }

  const handleToggleStatus = async () => {
    if (!user) return;

    setActionLoading('status');

    try {
      const payload = await toggleAdminUserStatusRequest(user.id);
      setUser((current) =>
        current
          ? {
              ...current,
              ...payload.item,
              phone: current.phone,
              school: current.school,
              location: current.location,
              bio: current.bio,
              stats: current.stats,
            }
          : current,
      );
      emitAppToast({
        title: 'Account status updated',
        description: payload.message,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to update account',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetAccess = async () => {
    if (!user) return;

    setActionLoading('reset');

    try {
      const payload = await resetAdminUserAccessRequest(user.id);
      emitAppToast({
        title: 'Access reset',
        description: payload.message,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to reset access',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAdminRequest = async () => {
    if (!user) return;

    setActionLoading('status');

    try {
      const payload = await approveAdminUserRequestRequest(user.id);
      setUser((current) =>
        current
          ? {
              ...current,
              ...payload.item,
              phone: current.phone,
              school: current.school,
              location: current.location,
              bio: current.bio,
              stats: current.stats,
              requestSubmittedAt: current.requestSubmittedAt,
              requestReviewedAt: new Date().toLocaleString(),
            }
          : current,
      );
      emitAppToast({
        title: 'Admin request approved',
        description: payload.message,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to approve request',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAdminRequest = async () => {
    if (!user) return;

    setActionLoading('status');

    try {
      const payload = await rejectAdminUserRequestRequest(user.id);
      setUser((current) =>
        current
          ? {
              ...current,
              ...payload.item,
              phone: current.phone,
              school: current.school,
              location: current.location,
              bio: current.bio,
              stats: current.stats,
              requestSubmittedAt: current.requestSubmittedAt,
              requestReviewedAt: new Date().toLocaleString(),
            }
          : current,
      );
      emitAppToast({
        title: 'Admin request rejected',
        description: payload.message,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to reject request',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTone = (statusValue: string) =>
    statusValue === 'Active'
      ? 'active'
      : statusValue === 'Pending'
        ? 'warning'
        : statusValue === 'Rejected'
          ? 'neutral'
          : 'danger';

  return (
    <AdminLayout
      title="User Details"
      subtitle="Review the account record, activity snapshot, and access information from one place."
    >
      {pageError ? (
        <div className="rounded-[1.4rem] border border-rose-400/35 bg-rose-50/80 px-4 py-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          {pageError}
        </div>
      ) : null}

      {isLoading || !user ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6 text-sm text-[var(--dashboard-muted)]">
          Loading user record...
        </div>
      ) : (
      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="dashboard-panel-strong rounded-[1.9rem] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-[var(--dashboard-accent-soft)] text-lg font-semibold text-[var(--dashboard-accent-foreground)]">
                {user.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                  {user.role === 'Admin' ? 'Admin record' : 'Student record'}
                </p>
                <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                  {user.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge value={user.status} tone={getStatusTone(user.status)} />
                  <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/users"
              className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Back to users
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ['Field', user.field],
              ['Graduation year', user.graduationYear],
              ['School', user.school],
              ['Phone', user.phone],
              ['Location', user.location],
              ['Request submitted', user.requestSubmittedAt ?? 'Not applicable'],
              ['Assessments', `${user.assessmentsTaken}`],
            ].map(([label, value]) => (
              <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-soft-tile mt-4 rounded-[1.2rem] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
              Bio
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--dashboard-muted)]">{user.bio}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="dashboard-panel rounded-[1.8rem] p-5">
            <AdminSectionHeader
              eyebrow="Account activity"
              title="Recent account signal"
              subtitle="A quick operational summary to help with review and follow-up."
            />
            <div className="mt-5 grid gap-3">
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Last active
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{user.lastActive}</p>
              </div>
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Joined
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{user.joinedAt}</p>
              </div>
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Role access
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">
                  {user.role} account
                </p>
              </div>
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Average score
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{user.stats.averageScore}</p>
              </div>
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                  Certificates
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">
                  {user.stats.certificatesEarned}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel rounded-[1.8rem] p-5">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">Admin actions</p>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() =>
                  user.role === 'Admin' ? router.push(`/admin/users/${user.id}`) : router.push(`/admin/attempts?student=${user.id}`)
                }
                className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold"
              >
                {user.role === 'Admin' ? 'Review account' : 'View results'}
              </button>
              {user.role === 'Admin' && user.status === 'Pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void handleApproveAdminRequest()}
                    disabled={actionLoading !== null}
                    className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === 'status' ? 'Approving request...' : 'Accept admin request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRejectAdminRequest()}
                    disabled={actionLoading !== null}
                    className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === 'status' ? 'Rejecting request...' : 'Reject admin request'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleToggleStatus()}
                  disabled={actionLoading !== null}
                  className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === 'status'
                    ? user.status === 'Active'
                      ? 'Suspending account...'
                      : 'Reactivating account...'
                    : user.status === 'Active'
                      ? 'Suspend account'
                      : 'Reactivate account'}
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleResetAccess()}
                disabled={actionLoading !== null}
                className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === 'reset' ? 'Resetting access...' : 'Reset access'}
              </button>
              <button
                type="button"
                onClick={() =>
                  user.role === 'Admin' ? router.push('/admin/users') : router.push(`/admin/attempts?student=${user.id}`)
                }
                className="dashboard-dark-button rounded-2xl px-4 py-3 text-left text-sm font-semibold"
              >
                {user.role === 'Admin' ? 'Back to users' : 'Review attempts'}
              </button>
            </div>
          </div>
        </div>
      </section>
      )}
    </AdminLayout>
  );
}
