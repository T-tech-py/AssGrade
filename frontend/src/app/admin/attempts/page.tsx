import { Suspense } from 'react';
import { AdminAttemptsPageClient } from '@/components/admin/admin-attempts-page-client';

function AttemptsPageFallback() {
  return <div className="min-h-[18rem] rounded-[1.8rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] animate-pulse" />;
}

export default function AdminAttemptsPage() {
  return (
    <Suspense fallback={<AttemptsPageFallback />}>
      <AdminAttemptsPageClient />
    </Suspense>
  );
}
