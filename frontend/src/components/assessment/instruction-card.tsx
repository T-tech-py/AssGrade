type InstructionCardProps = {
  title: string;
  items: string[];
  tone?: 'default' | 'security';
};

export function InstructionCard({ title, items, tone = 'default' }: InstructionCardProps) {
  const toneClasses =
    tone === 'security'
      ? 'bg-[var(--dashboard-soft-tile-bg)] border-[var(--dashboard-panel-border)]'
      : 'bg-[var(--dashboard-panel-bg)] border-[var(--dashboard-panel-border)]';
  const firstItem = items[0]?.trim() ?? '';
  const hasLeadIn =
    firstItem.endsWith(':') ||
    firstItem.toLowerCase().startsWith('please read');
  const leadIn = hasLeadIn ? firstItem : null;
  const instructionItems = hasLeadIn ? items.slice(1) : items;

  return (
    <div className={`rounded-[1.6rem] border p-5 ${toneClasses}`}>
      <h3 className="text-lg font-semibold text-[var(--dashboard-text)]">{title}</h3>
      {leadIn ? (
        <p className="mt-4 text-sm leading-6 text-[var(--dashboard-muted)]">{leadIn}</p>
      ) : null}
      <div className={`space-y-3 ${leadIn ? 'mt-3' : 'mt-4'}`}>
        {instructionItems.map((item, index) => (
          <div key={item} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dashboard-accent-soft)] text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-[var(--dashboard-muted)]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
