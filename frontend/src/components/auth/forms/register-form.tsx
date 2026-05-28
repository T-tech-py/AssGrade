'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerRequest } from '@/lib/auth-api';
import { persistAuthSession } from '@/lib/auth-session';
import { queueAppToast } from '@/components/ui/app-toast';
import { emailPattern, getPasswordStrength, hasNumber, hasUppercase } from '@/lib/auth-validation';
import { AuthCard } from '../auth-card';
import { AuthHeader } from '../auth-header';
import { AuthSubmitButton } from '../auth-submit-button';
import { CheckboxField } from '../checkbox-field';
import { FormFooterLink } from '../form-footer-link';
import { InputField } from '../input-field';
import { PasswordField } from '../password-field';
import { PasswordRules } from '../password-rules';
import { RoleSelector } from '../role-selector';

type RegisterErrors = Partial<Record<'fullName' | 'email' | 'password' | 'confirmPassword' | 'terms', string>>;

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const passwordStrength = getPasswordStrength(password);

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!email.trim()) nextErrors.email = 'Email address is required.';
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < 8 || !hasUppercase(password) || !hasNumber(password)) {
      nextErrors.password = 'Use at least 8 characters, one uppercase letter, and one number.';
    }
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!agreeToTerms) nextErrors.terms = 'You must agree to the terms and privacy policy.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) setFormError(undefined);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setFormError(undefined);

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    try {
      const auth = await registerRequest({
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
        role: role === 'admin' ? 'ADMIN' : 'STUDENT',
      });

      if ('requiresApproval' in auth) {
        queueAppToast({
          title: 'Admin request received',
          description: auth.message,
          tone: 'success',
        });
        router.push('/login');
        return;
      }

      persistAuthSession(auth, 'local');
      queueAppToast({
        title: 'Account created successfully',
        description: 'Your student account is ready. Welcome to GradAssess AI.',
        tone: 'success',
      });
      router.push('/dashboard');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create account right now.');
      setIsLoading(false);
      return;
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        <AuthHeader
          title="Create your account"
          subtitle="Start your employability journey with AI-powered assessments and career insights."
          eyebrow="Create account"
        />

        {formError ? (
          <div className="rounded-[1.2rem] border border-rose-400/35 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
            {formError}
          </div>
        ) : null}

        <div className="space-y-4.5 sm:space-y-5">
          <InputField
            id="full-name"
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            placeholder="e.g. Adaeze Okafor"
            error={errors.fullName}
            autoComplete="name"
            required
          />

          <InputField
            id="register-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            required
          />

          <RoleSelector value={role} onChange={setRole} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2.5">
              <PasswordField
                id="register-password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Create a secure password"
                error={errors.password}
                helperText={`Strength: ${passwordStrength}`}
                autoComplete="new-password"
                required
              />
            </div>
            <PasswordField
              id="register-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
          </div>

          <PasswordRules password={password} />

          <CheckboxField
            id="register-terms"
            checked={agreeToTerms}
            onChange={setAgreeToTerms}
            error={errors.terms}
            description="You can update your communication preferences later from your account settings."
            label={
              <>
                I agree to the{' '}
                <Link href="#" className="font-semibold text-[var(--dashboard-accent-foreground)]">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="#" className="font-semibold text-[var(--dashboard-accent-foreground)]">
                  Privacy Policy
                </Link>
                .
              </>
            }
          />
        </div>

        <AuthSubmitButton
          label="Create Account"
          loadingLabel="Creating account..."
          isLoading={isLoading}
        />

        <FormFooterLink text="Already have an account?" linkText="Log in" href="/login" />
      </form>
    </AuthCard>
  );
}
