import { ForgotPasswordForm } from '@/components/auth/forms/forgot-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      panelTitle="Recover access without losing momentum"
      panelDescription="Students and admins can request a reset link and get back to assessments, management tools, and progress tracking quickly."
      panelEyebrow="Password recovery"
      accentLabel="Assess your readiness. Improve your future."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
