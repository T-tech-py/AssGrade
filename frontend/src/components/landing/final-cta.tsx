'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function FinalCta() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="gradient-ring rounded-[2rem] p-px"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 20px 60px rgba(20,32,43,0.10)',
            '0 28px 80px rgba(19,118,74,0.18)',
            '0 20px 60px rgba(20,32,43,0.10)',
          ],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="landing-section rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-14"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dashboard-accent-foreground)]">
          Start Today
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Start Your Employability Journey Today
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
          Help graduates measure what matters, prove their readiness, and improve with confidence before entering the job market.
        </p>
        <div className="landing-soft mx-auto mt-6 max-w-xl rounded-[1.25rem] px-4 py-3 text-sm text-[var(--muted)]">
          Built for students across Lagos, Abuja, Enugu, Ibadan, and every campus preparing talent for real jobs.
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <motion.div whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
            href="/register"
            className="dashboard-lime-panel rounded-full px-6 py-3 text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5"
          >
            Get Started
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
            href="/login"
            className="landing-dark-button rounded-full px-6 py-3 text-sm font-semibold transition"
          >
            Login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
