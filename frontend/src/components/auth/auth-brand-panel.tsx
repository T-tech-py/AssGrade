'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type AuthBrandPanelProps = {
  title: string;
  description: string;
  eyebrow?: string;
  accentLabel?: string;
};

export function AuthBrandPanel({
  title,
  description,
  eyebrow = 'GradAssess AI',
  accentLabel = 'Assess your readiness. Improve your future.',
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden border-r border-[var(--line)] lg:flex">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0d12,#141823)]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(60deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(-60deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '58px 58px, 58px 58px',
          backgroundPosition: '0 0, 29px 0',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(113,96,255,0.22),transparent_20%),radial-gradient(circle_at_82%_76%,rgba(117,255,192,0.18),transparent_24%)]" />
      <div className="relative flex w-full flex-col p-8 xl:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 110, damping: 18 }}
          className="absolute left-8 top-8 z-10 xl:left-10 xl:top-10"
        >
          <Link href="/" className="inline-flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] text-sm font-bold shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
              style={{
                background: 'rgba(255,255,255,0.92)',
                color: '#0f172a',
                boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
              }}
            >
              GA
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">{eyebrow}</p>
              <p className="mt-1 text-sm leading-6 text-white/70">{accentLabel}</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.08 }}
          className="hidden"
        >
          <div />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.16 }}
          className="flex flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col">
            <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-8 pt-24 xl:px-8 xl:pb-10 xl:pt-28">
              <div className="relative">
                <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white/68">
                  Student spotlight
                </p>
                <p className="mt-2 max-w-md text-[0.94rem] leading-6 text-white/86">
                  A calmer and more human entry point into assessments, practice, certificates, and readiness tracking.
                </p>
              </div>

              <div className="relative mt-6 flex flex-1 items-center justify-center">
                <div className="absolute left-[8%] top-[7%] h-20 w-20 rotate-[22deg] rounded-[1.6rem] bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95),rgba(167,157,255,0.58)_58%,rgba(167,157,255,0.18)_100%)] blur-[0.4px]" />
                <div className="absolute right-[9%] top-[16%] h-5 w-5 rotate-[18deg] rounded-[0.35rem] border-[3px] border-[#9fdc86]" />
                <div className="absolute left-[12%] bottom-[16%] h-5 w-5 rotate-[14deg] border-[3px] border-[#9fdc86]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                <div className="absolute right-[10%] bottom-[10%] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(238,255,244,0.95),rgba(168,255,214,0.86)_48%,rgba(122,255,196,0.18)_72%,transparent_73%)]" />

                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.2 }}
                  className="relative h-[23rem] w-[23rem] overflow-hidden rounded-[3rem] xl:h-[27rem] xl:w-[27rem]"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(130,126,255,0.28), rgba(83,255,197,0.18))',
                    border: '1px solid rgba(163, 170, 255, 0.6)',
                    boxShadow:
                      '0 28px 60px rgba(0,0,0,0.35), inset 0 0 30px rgba(255,255,255,0.08)',
                    clipPath: 'polygon(22% 0%, 78% 0%, 100% 20%, 100% 80%, 78% 100%, 22% 100%, 0% 80%, 0% 20%)',
                  }}
                >
                  <div className="absolute inset-[1px] rounded-[3rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(180deg,rgba(72,76,86,0.88),rgba(28,33,39,0.86))]" style={{ clipPath: 'inherit' }} />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                    className="absolute inset-[1px]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(162,151,255,0.28),transparent_32%),radial-gradient(circle_at_50%_82%,rgba(136,255,206,0.16),transparent_28%)]" />
                    <Image
                      src="/auth-graduation-hero.png"
                      alt="Portrait of a student for the GradAssess login panel"
                      fill
                      priority
                      className="object-contain p-6 xl:p-8"
                    />
                  </motion.div>
                </motion.div>
              </div>

              <div className="relative mt-3 text-center">
                <h3 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-white xl:text-[1.8rem]">
                  Continue your readiness journey with confidence
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-[0.95rem] leading-6 text-white/60">
                  Log in to manage assessments, view certificates, practice with AI support, and track employability growth in one place.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
