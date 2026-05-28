'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest } from '@/lib/auth-api';
import { getOrCreateDeviceId, persistAuthSession } from '@/lib/auth-session';
import { queueAppToast } from '@/components/ui/app-toast';
import { emailPattern } from '@/lib/auth-validation';
import { AuthCard } from '../auth-card';
import { AuthHeader } from '../auth-header';
import { AuthSubmitButton } from '../auth-submit-button';
import { CheckboxField } from '../checkbox-field';
import { FormFooterLink } from '../form-footer-link';
import { InputField } from '../input-field';
import { PasswordField } from '../password-field';

type LoginErrors = Partial<Record<'email' | 'password', string>>;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors: LoginErrors = {};
    if (!email.trim()) nextErrors.email = 'Email address is required.';
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) setFormError(undefined);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setFormError(undefined);

    try {
      const auth = await loginRequest({
        email: email.trim().toLowerCase(),
        password,
        deviceId: getOrCreateDeviceId(),
      });

      persistAuthSession(auth, rememberMe ? 'local' : 'session');
      queueAppToast({
        title: 'Login successful',
        description: auth.user.role === 'ADMIN' ? 'Welcome back to the admin workspace.' : 'Welcome back. Your dashboard is ready.',
        tone: 'success',
      });
      router.push(auth.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to log in right now.');
      setIsLoading(false);
      return;
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
        <AuthHeader
          title="Welcome back"
          subtitle="Log in to continue your assessments, practice, and progress tracking."
          eyebrow="Secure login"
        />

        {formError ? (
          <div className="rounded-[1.2rem] border border-rose-400/35 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
            {formError}
          </div>
        ) : null}

        <div className="space-y-5 sm:space-y-6">
          <InputField
            id="login-email"
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

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
            required
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CheckboxField
              id="remember-me"
              checked={rememberMe}
              onChange={setRememberMe}
              label="Remember me"
            />
            <Link href="/forgot-password" className="text-sm font-semibold text-[var(--dashboard-accent-foreground)] transition hover:opacity-80">
              Forgot password?
            </Link>
          </div>
        </div>

        <AuthSubmitButton label="Log In" loadingLabel="Logging in..." isLoading={isLoading} />

        <FormFooterLink text="Don’t have an account?" linkText="Create one" href="/register" />
      </form>
    </AuthCard>
  );
}
