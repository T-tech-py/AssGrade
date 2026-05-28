import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppToastViewport } from '@/components/ui/app-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'GradAssess AI',
  description: 'AI-powered graduate employability assessment platform with secure exams, AI practice, and verifiable certificates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AuthProvider>
          <AppToastViewport />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
