type ProgressCardProps = {
  score: number;
  label: string;
  nextGoal: string;
};

export function ProgressCard({ score, label, nextGoal }: ProgressCardProps) {
  const angle = `${Math.max(8, Math.min(100, score))}%`;

  return (
    <div className="dashboard-lime-panel rounded-[1.8rem] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#375000]">Readiness signal</p>
          <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[#203100]">{label}</p>
          <p className="mt-2 text-sm leading-6 text-[#3a4a17]">{nextGoal}</p>
        </div>
        <div
          className="grid h-24 w-24 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#253700 0 ${angle}, rgba(72,96,21,0.18) ${angle} 100%)`,
          }}
        >
          <div className="grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full bg-[rgba(241,250,218,0.9)] shadow-[0_12px_24px_rgba(78,100,19,0.18)]">
            <div className="text-center">
              <p className="text-[1.05rem] font-semibold text-[#233500]">{score}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#496117]">Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
