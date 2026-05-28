'use client';

import Link from 'next/link';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { ActionMenu, type ActionMenuAction } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { DataTable } from '@/components/admin/data-table';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import { adminUsers } from '@/data/admin-dashboard';
import {
  approveAdminUserRequestRequest,
  exportAdminUsersCsvRequest,
  getAdminUsersRequest,
  rejectAdminUserRequestRequest,
  resetAdminUserAccessRequest,
  toggleAdminUserStatusRequest,
} from '@/lib/admin-api';

export default function AdminUsersPage() {
  const router = useRouter();
  const { session, user, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState(adminUsers);
  const [totalUsers, setTotalUsers] = useState(adminUsers.length);
  const [totalPages, setTotalPages] = useState(1);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [field, setField] = useState('all');
  const [joined, setJoined] = useState('90d');
  const [activity, setActivity] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    startTransition(() => {
      setPage(1);
    });
  }, [deferredSearch, status, field, joined, activity]);

  useEffect(() => {
    if (isAuthLoading || !session) return;

    let active = true;
    if (!hasLoadedOnce) {
      setIsLoading(true);
    }
    setPageError(undefined);

    void getAdminUsersRequest({
      page,
      pageSize,
      search: deferredSearch.trim(),
      status,
      field,
      joined,
      activity,
    })
      .then((payload) => {
        if (!active) return;
        setUsers(payload.items);
        setTotalUsers(payload.meta.total);
        setTotalPages(payload.meta.totalPages);
        setFieldOptions(payload.meta.availableFields);
        setHasLoadedOnce(true);
      })
      .catch((error) => {
        if (!active) return;
        setPageError(error instanceof Error ? error.message : 'Unable to load student accounts right now.');
        setUsers(adminUsers);
        setTotalUsers(adminUsers.length);
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
  }, [isAuthLoading, session?.accessToken, hasLoadedOnce, page, pageSize, deferredSearch, status, field, joined, activity]);
 

  const handleToggleStatus = async (userId: string) => {
    setActionUserId(userId);

    try {
      const payload = await toggleAdminUserStatusRequest(userId);
      setUsers((current) =>
        current.map((item) => (item.id === userId ? payload.item : item)),
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
      setActionUserId(null);
    }
  };

  const handleResetAccess = async (userId: string) => {
    setActionUserId(userId);

    try {
      const payload = await resetAdminUserAccessRequest(userId);
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
      setActionUserId(null);
    }
  };

  const handleApproveAdminRequest = async (userId: string) => {
    setActionUserId(userId);

    try {
      const payload = await approveAdminUserRequestRequest(userId);
      setUsers((current) => current.map((item) => (item.id === userId ? payload.item : item)));
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
      setActionUserId(null);
    }
  };

  const handleRejectAdminRequest = async (userId: string) => {
    setActionUserId(userId);

    try {
      const payload = await rejectAdminUserRequestRequest(userId);
      setUsers((current) => current.map((item) => (item.id === userId ? payload.item : item)));
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
      setActionUserId(null);
    }
  };

  const getStatusTone = (statusValue: (typeof users)[number]['status']) =>
    statusValue === 'Active'
      ? 'active'
      : statusValue === 'Pending'
        ? 'warning'
        : statusValue === 'Rejected'
          ? 'neutral'
          : 'danger';

  const buildUserActions = (account: (typeof users)[number]): ActionMenuAction[] => {
    if (account.status === 'Pending' && account.role === 'Admin') {
      return [
        {
          label: 'Review request',
          onClick: () => router.push(`/admin/users/${account.id}`),
        },
        {
          label: actionUserId === account.id ? 'Approving...' : 'Approve request',
          onClick: () => {
            if (actionUserId === account.id) return;
            void handleApproveAdminRequest(account.id);
          },
        },
        {
          label: actionUserId === account.id ? 'Rejecting...' : 'Reject request',
          onClick: () => {
            if (actionUserId === account.id) return;
            void handleRejectAdminRequest(account.id);
          },
          tone: 'danger',
        },
      ];
    }

    return [
      {
        label: 'View profile',
        onClick: () => router.push(`/admin/users/${account.id}`),
      },
      {
        label: account.role === 'Admin' ? 'Review access' : 'View results',
        onClick: () =>
          account.role === 'Admin'
            ? router.push(`/admin/users/${account.id}`)
            : router.push(`/admin/attempts?student=${account.id}`),
      },
      {
        label:
          actionUserId === account.id
            ? account.status === 'Active'
              ? 'Suspending...'
              : 'Reactivating...'
            : account.status === 'Active'
              ? 'Suspend user'
              : 'Reactivate user',
        onClick: () => {
          if (actionUserId === account.id) return;
          void handleToggleStatus(account.id);
        },
        tone: account.status === 'Active' ? 'danger' : 'default',
      },
      {
        label: actionUserId === account.id ? 'Resetting...' : 'Reset access',
        onClick: () => {
          if (actionUserId === account.id) return;
          void handleResetAccess(account.id);
        },
      },
    ];
  };

  const handleExportCsv = async () => {
    setIsExporting(true);

    try {
      const { blob, filename } = await exportAdminUsersCsvRequest({
        search: deferredSearch.trim(),
        status,
        field,
        joined,
        activity,
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
        description: 'The filtered user list has been downloaded.',
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

  if (!session && !isAuthLoading) {
    return (
      <AdminLayout
        title="Users"
        subtitle="Manage student accounts, monitor activity, and review access status across the platform."
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

  if (!isAuthLoading && user?.role !== 'ADMIN') {
    return (
      <AdminLayout
        title="Users"
        subtitle="Manage student accounts, monitor activity, and review access status across the platform."
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

  return (
    <AdminLayout
      title="Users"
      subtitle="Manage student accounts, monitor activity, and review access status across the platform."
    >
      {/* TODO: Fetch user list, filters, and account actions from the backend admin users endpoints. */}
      <section className="dashboard-panel rounded-[1.8rem] p-4 sm:p-5 lg:p-6">
        <div className="mb-4">
          <AdminSectionHeader
            eyebrow="User management"
            title={`Users (${totalUsers})`}
            subtitle="Track student accounts, admin access requests, learning activity, and account actions from one compact operations view."
          />
        </div>

        <div className="rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-[var(--dashboard-panel-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3.5 py-2.5 sm:max-w-xs">
              <span className="text-sm text-[var(--dashboard-muted)]">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleExportCsv()}
              disabled={isExporting}
              className="inline-flex items-center gap-2 text-xs font-medium text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-text)]"
            >
              <span className="text-sm">⇪</span>
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--dashboard-panel-border)] pt-4">
            {[
              {
                label: 'Status',
                value: status,
                onChange: setStatus,
                options: [
                  { value: 'all', label: 'Any status' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'rejected', label: 'Rejected' },
                ],
              },
              {
                label: 'Field',
                value: field,
                onChange: setField,
                options: [
                  { value: 'all', label: 'All categories' },
                  ...fieldOptions.map((option) => ({ value: option, label: option })),
                ],
              },
              {
                label: 'Date joined',
                value: joined,
                onChange: setJoined,
                options: [
                  { value: 'all', label: 'Any time' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' },
                  { value: 'year', label: 'Last year' },
                ],
              },
              {
                label: 'Activity',
                value: activity,
                onChange: setActivity,
                options: [
                  { value: 'all', label: 'Any activity' },
                  { value: '7d', label: 'Active in 7 days' },
                  { value: '30d', label: 'Active in 30 days' },
                  { value: 'inactive', label: 'Inactive' },
                ],
              },
            ].map((filter) => (
              <label
                key={filter.label}
                className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3 py-2"
              >
                <span className="text-[11px] font-medium text-[var(--dashboard-muted)]">{filter.label}</span>
                <select
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                  className="bg-transparent text-[11px] font-medium text-[var(--dashboard-text)] outline-none"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        {pageError ? (
          <div className="mt-4 rounded-[1.4rem] border border-amber-400/35 bg-amber-50/80 px-4 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
            {pageError} Showing the latest available user snapshot while the live data connection recovers.
          </div>
        ) : null}

        {isLoading && !hasLoadedOnce ? (
          <div className="dashboard-panel mt-4 rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
            Loading student accounts...
          </div>
        ) : null}

        {isLoading && hasLoadedOnce ? (
          <div className="mt-4 rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
            Refreshing student accounts...
          </div>
        ) : null}

        <div className="mt-4 space-y-4 lg:hidden">
            {users.map((user) => (
              <MobileDataCard
                key={user.id}
                href={`/admin/users/${user.id}`}
                title={user.name}
                subtitle={user.email}
                meta={user.field}
                badges={<StatusBadge value={user.status} tone={getStatusTone(user.status)} />}
                rows={[
                  { label: 'Role', value: user.role },
                  { label: 'Graduation year', value: user.graduationYear },
                { label: 'Assessments', value: `${user.assessmentsTaken}` },
                { label: 'Last active', value: user.lastActive },
                { label: 'Joined', value: user.joinedAt },
              ]}
              actions={
                <div onClick={(event) => event.preventDefault()}>
                  <ActionMenu actions={buildUserActions(user)} />
                </div>
              }
            />
          ))}
        </div>

        <DataTable
          className="mt-4"
          gridTemplate="1.2fr 1.3fr 0.8fr 0.9fr 0.85fr 0.8fr 0.95fr 44px"
          columns={['Name', 'Email', 'Status', 'Role', 'Field', 'Grad Year', 'Assessments', '']}
        >
          {users.map((user) => (
            <div
              key={user.id}
              className="grid cursor-pointer items-center gap-4 border-b border-[var(--dashboard-panel-border)] px-5 py-3.5 transition hover:bg-[var(--dashboard-soft-tile-bg)] last:border-b-0"
              style={{ gridTemplateColumns: '1.2fr 1.3fr 0.8fr 0.9fr 0.85fr 0.8fr 0.95fr 44px' }}
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/users/${user.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="block text-sm font-semibold leading-5 text-[var(--dashboard-text)] hover:text-[var(--dashboard-accent-foreground)]"
                >
                  <span className="line-clamp-2 break-words">{user.name}</span>
                </Link>
                <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{user.lastActive}</p>
              </div>
              <div className="min-w-0 truncate text-sm text-[var(--dashboard-muted)]">{user.email}</div>
              <div>
                <StatusBadge value={user.status} tone={getStatusTone(user.status)} />
              </div>
              <div className="min-w-0 truncate text-sm text-[var(--dashboard-text)]">{user.role}</div>
              <div className="min-w-0 truncate text-sm text-[var(--dashboard-text)]">{user.field}</div>
              <div className="min-w-0 truncate text-sm text-[var(--dashboard-text)]">{user.graduationYear}</div>
              <div className="min-w-0 text-sm text-[var(--dashboard-text)]">
                {user.assessmentsTaken}
                <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">Joined {user.joinedAt}</p>
              </div>
              <div className="flex justify-end">
                <ActionMenu actions={buildUserActions(user)} variant="icon" />
              </div>
            </div>
          ))}
        </DataTable>

        <div className="mt-4 flex flex-col gap-3 rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--dashboard-muted)]">
            Page {page} of {totalPages} • Showing {users.length} of {totalUsers} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isLoading}
              className="dashboard-dark-button rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || isLoading}
              className="dashboard-dark-button rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
