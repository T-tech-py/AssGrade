import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/forms/reset-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      panelTitle="Secure your account and continue your journey"
      panelDescription="Choose a stronger password and return to your assessments, question management, and employability progress."
      panelEyebrow="Reset access"
      accentLabel="Assess your readiness. Improve your future."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
