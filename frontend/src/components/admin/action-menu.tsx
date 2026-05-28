 'use client';

import { useEffect, useRef, useState } from 'react';

export type ActionMenuAction = {
  label: string;
  onClick?: () => void;
  tone?: 'default' | 'danger';
};

type ActionMenuProps = {
  actions: Array<string | ActionMenuAction>;
  variant?: 'chips' | 'icon';
};

export function ActionMenu({ actions, variant = 'chips' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
    };
  }, [open]);

  if (variant === 'icon') {
    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-label={`Open actions`}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] text-[var(--dashboard-muted)] transition hover:bg-[var(--dashboard-icon-surface)] hover:text-[var(--dashboard-text)]"
        >
          <span className="text-lg leading-none">⋮</span>
        </button>

        {open ? (
          <div
            className="absolute right-0 top-11 z-20 min-w-[11rem] rounded-[1rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] p-2 shadow-[0_18px_34px_rgba(0,0,0,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            {actions.map((action) => {
              const item =
                typeof action === 'string'
                  ? { label: action, tone: 'default' as const }
                  : action;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    item.tone === 'danger'
                      ? 'text-rose-500 hover:bg-rose-500/10 dark:text-rose-200'
                      : 'text-[var(--dashboard-text)] hover:bg-[var(--dashboard-soft-tile-bg)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={typeof action === 'string' ? action : action.label}
          type="button"
          onClick={typeof action === 'string' ? undefined : action.onClick}
          className="dashboard-dark-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          {typeof action === 'string' ? action : action.label}
        </button>
      ))}
    </div>
  );
}
