'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { getDisplayName, useAuth } from '@/components/auth/auth-provider';
import { studentNavItems, studentProfile } from '@/data/student-dashboard';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const student = {
    name: getDisplayName(user, studentProfile.name),
    role: user?.role === 'ADMIN' ? 'Admin' : studentProfile.role,
    school: user?.school || '',
    course: user?.course || 'Course not set',
  };

  return (
    <div className="dashboard-shell min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:h-screen lg:overflow-hidden lg:px-4 lg:py-4">
      <div className="dashboard-board mx-auto flex min-h-[calc(100vh-1rem)] max-w-[96rem] overflow-hidden rounded-[2rem] lg:h-[calc(100vh-2rem)] lg:min-h-0 lg:rounded-[2.2rem]">
        <div className="hidden lg:block lg:w-[19rem] xl:w-[20rem]">
          <Sidebar navItems={studentNavItems} student={student} onLogout={logout} />
        </div>

        <AnimatePresence>
          {isSidebarOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-[rgba(8,18,14,0.42)] lg:hidden"
                aria-label="Close navigation"
              />
              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 22 }}
                className="fixed inset-y-2 left-2 z-50 w-[18rem] lg:hidden"
              >
                <Sidebar
                  navItems={studentNavItems}
                  student={student}
                  onNavigate={() => setIsSidebarOpen(false)}
                  onLogout={logout}
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:min-h-0 lg:gap-5 lg:p-5">
          <TopNavbar
            title={title}
            subtitle={subtitle}
            student={student}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
          <main className="min-w-0 space-y-4 pb-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
