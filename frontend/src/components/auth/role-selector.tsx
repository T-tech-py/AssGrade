'use client';

import { motion } from 'framer-motion';

type Role = 'student' | 'admin';

type RoleSelectorProps = {
  value: Role;
  onChange: (role: Role) => void;
};

const roles = [
  {
    value: 'student' as const,
    title: 'Student',
    helper: 'Take assessments, track progress, and earn certificates.',
    icon: '◐',
  },
  {
    value: 'admin' as const,
    title: 'Admin',
    helper: 'Request access to manage users, assessments, and certificates after approval.',
    icon: '▣',
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-3.5">
      <div>
        <legend className="auth-label text-[var(--auth-text)]">Choose your role</legend>
        <p className="mt-1 text-sm leading-6 text-[var(--auth-muted-text)]">
          Student is the default public option. Admin sign-up creates an approval request for internal platform managers.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const active = value === role.value;

          return (
            <motion.button
              key={role.value}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(role.value)}
              role="radio"
              aria-checked={active}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                active
                  ? 'border-[var(--dashboard-accent-foreground)] bg-[var(--auth-chip-bg)] shadow-[0_18px_40px_rgba(0,0,0,0.12)]'
                  : 'border-[var(--auth-chip-border)] bg-[color-mix(in_srgb,var(--auth-form-bg)_92%,transparent)] hover:-translate-y-0.5 hover:border-[var(--dashboard-accent-foreground)]/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${active ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]' : 'bg-[var(--auth-chip-bg)] text-[var(--auth-text)]'}`}>
                  {role.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[var(--auth-text)]">{role.title}</p>
                  <p className="text-sm leading-6 text-[var(--auth-muted-text)]">{role.helper}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
