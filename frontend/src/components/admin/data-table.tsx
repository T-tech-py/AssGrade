import type { ReactNode } from 'react';

type DataTableProps = {
  columns: string[];
  children: ReactNode;
  gridTemplate?: string;
  className?: string;
};

export function DataTable({
  columns,
  children,
  gridTemplate = '1.3fr 1.4fr 1fr 0.9fr 0.9fr 1fr 0.9fr',
  className,
}: DataTableProps) {
  return (
    <div className={`hidden overflow-hidden rounded-[1.35rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] xl:block ${className ?? ''}`}>
      <div
        className="grid gap-4 border-b border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
