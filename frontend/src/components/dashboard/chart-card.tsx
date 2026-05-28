import type { PerformancePoint } from '@/data/student-dashboard';

type ChartCardProps = {
  data: PerformancePoint[];
};

export function ChartCard({ data }: ChartCardProps) {
  const width = 640;
  const height = 240;
  const padding = 28;
  const maxValue = 100;

  const points = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - (point.score / maxValue) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">Performance Overview</h3>
        <p className="text-sm leading-6 text-[var(--dashboard-muted)]">Your assessment results across recent attempts.</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-3 py-4 sm:px-4">
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            {[20, 40, 60, 80].map((tick) => {
              const y = height - padding - (tick / maxValue) * (height - padding * 2);

              return (
                <g key={tick}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--dashboard-panel-border)" strokeDasharray="6 6" />
                  <text x={8} y={y + 4} fill="var(--dashboard-muted)" fontSize="11">
                    {tick}
                  </text>
                </g>
              );
            })}

            <path d={path} fill="none" stroke="var(--dashboard-accent-foreground)" strokeWidth="3.5" strokeLinecap="round" />
            <path
              d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="url(#chartFill)"
              opacity="0.18"
            />

            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--dashboard-accent-foreground)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {points.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="6" fill="var(--dashboard-board-bg)" stroke="var(--dashboard-accent-foreground)" strokeWidth="3" />
                <text x={point.x} y={height - 8} textAnchor="middle" fill="var(--dashboard-muted)" fontSize="12">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
