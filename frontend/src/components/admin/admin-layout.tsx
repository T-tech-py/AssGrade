'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { getDisplayName, useAuth } from '@/components/auth/auth-provider';
import { adminNavItems, adminProfile } from '@/data/admin-dashboard';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopNavbar } from './admin-top-navbar';

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const profile = {
    name: getDisplayName(user, adminProfile.name),
    role: 'Platform Admin',
    team: adminProfile.team,
  };

  return (
    <div className="dashboard-shell min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="dashboard-board mx-auto flex min-h-[calc(100vh-1rem)] max-w-[98rem] overflow-hidden rounded-[2rem] lg:rounded-[2.2rem]">
        <div className="hidden lg:block lg:w-[19.5rem] xl:w-[20.5rem]">
          <AdminSidebar navItems={adminNavItems} profile={profile} onLogout={logout} />
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
                aria-label="Close admin navigation"
              />
              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 22 }}
                className="fixed inset-y-2 left-2 z-50 w-[18.5rem] lg:hidden"
              >
                <AdminSidebar
                  navItems={adminNavItems}
                  profile={profile}
                  onNavigate={() => setIsSidebarOpen(false)}
                  onLogout={logout}
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-5 lg:p-5">
          <AdminTopNavbar
            title={title}
            subtitle={subtitle}
            profile={profile}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
          <main className="min-w-0 space-y-4 pb-6 lg:space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
