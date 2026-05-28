import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/forms/login-form';

export default function LoginPage() {
  return (
    <AuthLayout
      panelTitle="A secure place to continue your employability journey"
      panelDescription="Log back in to take assessments, review organization-submitted questions, track readiness, and manage your account with confidence."
      panelEyebrow="Sign in"
      accentLabel="Assess your readiness. Improve your future."
    >
      <LoginForm />
    </AuthLayout>
  );
}
