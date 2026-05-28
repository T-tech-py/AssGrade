'use client';

type TabsSectionProps<T extends string> = {
  items: Array<{ key: T; label: string }>;
  active: T;
  onChange: (next: T) => void;
};

export function TabsSection<T extends string>({ items, active, onChange }: TabsSectionProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === item.key
              ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
              : 'dashboard-dark-button'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
