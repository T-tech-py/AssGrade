import type { AttemptsPoint, PassFailPoint } from '@/data/admin-dashboard';

export function AttemptsLineCard({ data }: { data: AttemptsPoint[] }) {
  const width = 680;
  const height = 240;
  const padding = 28;
  const maxValue = Math.max(...data.map((item) => item.attempts), 100);

  const points = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - (point.attempts / maxValue) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = points.length
    ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
    : '';

  return (
    <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
      <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">Attempts Over Time</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">
        Weekly submission activity and platform throughput.
      </p>
      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-3 py-4 sm:px-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
          {[25, 50, 75].map((tick) => {
            const y = height - padding - (tick / 100) * (height - padding * 2);

            return (
              <line
                key={tick}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--dashboard-panel-border)"
                strokeDasharray="6 6"
              />
            );
          })}
          <path d={path} fill="none" stroke="var(--dashboard-accent-foreground)" strokeWidth="3.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="adminAttemptsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dashboard-accent-foreground)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#adminAttemptsFill)"
            opacity="0.18"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5.5"
                fill="var(--dashboard-board-bg)"
                stroke="var(--dashboard-accent-foreground)"
                strokeWidth="3"
              />
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--dashboard-muted)"
                fontSize="12"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function PassFailChartCard({ data }: { data: PassFailPoint[] }) {
  return (
    <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
      <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">Pass / Fail Mix</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">
        A fast view of passing pressure across key assessment categories.
      </p>
      <div className="mt-6 space-y-4">
        {data.map((item) => {
          const total = item.passed + item.failed;
          const passPercent = total === 0 ? 0 : Math.round((item.passed / total) * 100);
          const failPercent = total === 0 ? 0 : Math.round((item.failed / total) * 100);
          const passWidth = `${total === 0 ? 0 : (item.passed / total) * 100}%`;
          const failWidth = `${total === 0 ? 0 : (item.failed / total) * 100}%`;

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--dashboard-text)]">{item.label}</span>
                <span className="text-[var(--dashboard-muted)]">
                  {passPercent}% pass • {failPercent}% fail
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--dashboard-soft-tile-border)]">
                <div style={{ width: passWidth }} className="bg-[var(--dashboard-accent-foreground)]" />
                <div style={{ width: failWidth }} className="bg-[rgb(190,24,93)]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
