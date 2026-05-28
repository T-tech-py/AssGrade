import Link from 'next/link';
import type { AdminQuickAction } from '@/data/admin-dashboard';
import { AdminMaterialIcon } from './admin-icons';

export function QuickActionCard({ action }: { action: AdminQuickAction }) {
  return (
    <Link
      href={action.href}
      className="dashboard-panel-strong group rounded-[1.6rem] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(10,18,14,0.14)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
        <AdminMaterialIcon name={action.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">
        {action.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{action.description}</p>
    </Link>
  );
}
