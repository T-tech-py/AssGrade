'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const dashboardMetrics = [
  { label: 'Assessments taken', value: '12,400+' },
  { label: 'Certificates verified', value: '3,180' },
  { label: 'Readiness improvement', value: '+38%' },
];

export function LandingHero() {
  return (
    <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="space-y-7"
        >
          <motion.div
            animate={{ y: [0, -3, 0], scale: [1, 1.01, 1] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
            className="landing-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-[var(--muted)] shadow-[var(--shadow-soft)] sm:text-sm"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            Built for graduate readiness in Nigeria and beyond
          </motion.div>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Know If You&apos;re Job-Ready Before You Graduate
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-8 text-[var(--muted)] sm:text-xl">
              Take AI-powered assessments, track your performance, and get certified for real-world employability.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
              href="/register"
                className="dashboard-lime-panel rounded-full px-6 py-3 text-center text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5"
            >
              Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
              href="/login"
                className="landing-dark-button rounded-full px-6 py-3 text-center text-sm font-semibold transition"
            >
              Try Practice Mode
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.2 }}
            className="landing-section nigerian-flag-glow rounded-[1.5rem] p-4"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Made for</p>
                <p className="mt-2 text-sm font-semibold">Nigerian universities, bootcamps, and talent programs</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Use case</p>
                <p className="mt-2 text-sm font-semibold">Support NYSC prep, internships, and first-job readiness</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Value</p>
                <p className="mt-2 text-sm font-semibold">Clear employability signals for students, schools, and employers</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {dashboardMetrics.map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
                className="landing-card rounded-[1.5rem] p-4 shadow-[var(--shadow-soft)]"
              >
                <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
          className="gradient-ring rounded-[2rem] p-px"
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 0.25, 0] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
            className="landing-section hero-grid rounded-[2rem] p-3 sm:p-6"
          >
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -8, rotateX: 3 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.18 }}
                className="landing-card rounded-[1.75rem] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Assessment Dashboard</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Graduate readiness overview</p>
                  </div>
                    <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
                      Live
                    </span>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="landing-soft rounded-[1.5rem] p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--muted)]">Readiness score</p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight">84%</p>
                      </div>
                      <div className="practice-highlight rounded-2xl px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Grade</p>
                        <p className="mt-1 text-2xl font-semibold text-[var(--dashboard-accent-foreground)]">A-</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="landing-soft rounded-[1.5rem] p-4">
                      <p className="text-sm text-[var(--muted)]">Top competency</p>
                      <p className="mt-2 text-lg font-semibold">Problem Solving</p>
                      <div className="mt-4 h-2 rounded-full bg-[var(--landing-soft-border)]">
                        <div className="h-2 w-[88%] rounded-full bg-[var(--dashboard-accent-foreground)]" />
                      </div>
                    </div>
                    <div className="landing-soft rounded-[1.5rem] p-4">
                      <p className="text-sm text-[var(--muted)]">Needs improvement</p>
                      <p className="mt-2 text-lg font-semibold">Interview Readiness</p>
                      <div className="mt-4 h-2 rounded-full bg-[var(--landing-soft-border)]">
                        <div className="h-2 w-[56%] rounded-full bg-[var(--accent-alt)]" />
                      </div>
                    </div>
                  </div>

                  <div className="landing-soft rounded-[1.5rem] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">AI Practice Assistant</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Recommended next action</p>
                      </div>
                      <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
                        Adaptive
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                      Generate a 15-question practice set focused on analytical reasoning and professional communication.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.24 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
              >
                <motion.div
                  whileHover={{ y: -8, rotate: -1.2, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className="landing-card overflow-hidden rounded-[1.75rem] p-2"
                >
                  <img
                    src="https://images.pexels.com/photos/31437215/pexels-photo-31437215.jpeg?cs=srgb&dl=pexels-abdulkadir-pai-410963469-31437215.jpg&fm=jpg"
                    alt="University student portrait representing campus ambition and academic confidence"
                    className="h-56 w-full rounded-[1.3rem] object-cover sm:h-64 lg:h-56"
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold">Assessments built by real organizations</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Employers, schools, and training organizations can submit questions for students to take as they prepare for the workplace.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -8, rotate: 1.1, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className="landing-card overflow-hidden rounded-[1.75rem] p-2"
                >
                  <img
                    src="https://images.pexels.com/photos/18028052/pexels-photo-18028052.jpeg?cs=srgb&dl=pexels-judah-01-11929093-18028052.jpg&fm=jpg"
                    alt="Portrait of a Nigerian university student"
                    className="h-56 w-full rounded-[1.3rem] object-cover sm:h-64 lg:h-56"
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold">A clearer signal of job readiness</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Students approaching the work phase can take trusted assessments and see whether they are truly ready for real job opportunities.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
