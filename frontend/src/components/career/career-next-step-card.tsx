import Link from 'next/link';
import type { CareerNextStep } from '@/data/career-insights-data';

export function CareerNextStepCard({ step }: { step: CareerNextStep }) {
  return (
    <Link
      href={step.href}
      className={`flex h-full flex-col rounded-[1.6rem] p-5 transition hover:-translate-y-1 ${
        step.tone === 'primary' ? 'dashboard-lime-panel text-[#223200]' : 'dashboard-panel'
      }`}
    >
      <p className={`text-lg font-semibold tracking-[-0.03em] ${step.tone === 'primary' ? 'text-[#223200]' : 'text-[var(--dashboard-text)]'}`}>
        {step.title}
      </p>
      <p className={`mt-3 text-sm leading-6 ${step.tone === 'primary' ? 'text-[#3f5311]' : 'text-[var(--dashboard-muted)]'}`}>
        {step.description}
      </p>
    </Link>
  );
}
