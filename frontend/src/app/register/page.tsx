import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/forms/register-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      panelTitle="Create a trusted account for assessments and readiness tracking"
      panelDescription="Students can take employability assessments and earn certificates, while admins can manage users, exams, and question submissions from partner organizations."
      panelEyebrow="Get started"
      accentLabel="Assess your readiness. Improve your future."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
