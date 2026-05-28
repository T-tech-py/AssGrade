'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#about', label: 'About' },
];

export function LandingNavbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className="sticky top-0 z-40 px-4 pt-3 sm:px-6 lg:px-8"
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="landing-nav mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[1.75rem] px-4 py-3 sm:rounded-full sm:px-6"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="dashboard-lime-panel flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-[#223200]">
            GA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">GradAssess AI</p>
            <p className="text-xs text-[var(--muted)]">Graduate Employability Assessment Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
            className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="landing-dark-button hidden rounded-full px-4 py-2 text-sm font-semibold transition sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="dashboard-lime-panel rounded-full px-4 py-2 text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
}
