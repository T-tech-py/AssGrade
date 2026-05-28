'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { queueAppToast } from '@/components/ui/app-toast';

type InstructionsStartPanelProps = {
  href: string;
};

export function InstructionsStartPanel({ href }: InstructionsStartPanelProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAssessment = async () => {
    if (!agreed || isStarting) return;

    setIsStarting(true);

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      queueAppToast({
        title: 'Fullscreen not enabled',
        description:
          'Your browser blocked automatic fullscreen. You can still continue, but returning to fullscreen is recommended.',
        tone: 'error',
      });
    } finally {
      router.push(href);
    }
  };

  return (
    <section className="dashboard-panel-strong rounded-[2rem] p-6">
      <label className="flex items-start gap-3 rounded-[1.3rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-4 text-sm text-[var(--dashboard-text)]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span className="leading-6">
          I understand and agree to the assessment rules.
        </span>
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!agreed || isStarting}
          onClick={() => void handleStartAssessment()}
          className={`inline-flex justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold ${
            agreed
              ? 'dashboard-lime-panel text-[#203100]'
              : 'cursor-not-allowed border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-muted)] opacity-70'
          }`}
        >
          {isStarting ? 'Starting...' : 'Start Assessment'}
        </button>
        <Link href="/assessments" className="dashboard-dark-button inline-flex justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition">
          Back to Assessments
        </Link>
      </div>
    </section>
  );
}
