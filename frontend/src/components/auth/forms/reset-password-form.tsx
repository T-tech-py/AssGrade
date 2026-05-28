'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPasswordRequest } from '@/lib/auth-api';
import { hasNumber, hasUppercase } from '@/lib/auth-validation';
import { AuthCard } from '../auth-card';
import { AuthHeader } from '../auth-header';
import { AuthSubmitButton } from '../auth-submit-button';
import { PasswordField } from '../password-field';
import { PasswordRules } from '../password-rules';
import { SuccessMessage } from '../success-message';

type ResetErrors = Partial<Record<'password' | 'confirmPassword', string>>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ResetErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const nextErrors: ResetErrors = {};

    if (!password) nextErrors.password = 'New password is required.';
    else if (password.length < 8 || !hasUppercase(password) || !hasNumber(password)) {
      nextErrors.password = 'Use at least 8 characters, one uppercase letter, and one number.';
    }

    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your new password.';
    else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    setFormError(undefined);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    if (!token) {
      setFormError('This reset link is missing or invalid.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordRequest({ token, password });
      setIsSuccess(true);
    } catch (submissionError) {
      setFormError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to reset your password right now.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      {isSuccess ? (
        <SuccessMessage
          title="Password updated"
          description="Your password has been reset successfully."
          action={
            <Link
              href="/login"
              className="inline-flex rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Go to Login
            </Link>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
          <AuthHeader
            title="Reset your password"
            subtitle="Choose a new password to secure your account."
            eyebrow="Password reset"
          />

          {formError ? (
            <div className="rounded-[1.2rem] border border-rose-400/35 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
              {formError}
            </div>
          ) : null}

          <div className="space-y-5 sm:space-y-6">
            <PasswordField
              id="new-password"
              label="New Password"
              value={password}
              onChange={setPassword}
              placeholder="Create a new password"
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <PasswordField
              id="confirm-new-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
          </div>

          <PasswordRules password={password} />

          <AuthSubmitButton
            label="Reset Password"
            loadingLabel="Updating password..."
            isLoading={isLoading}
          />
        </form>
      )}
    </AuthCard>
  );
}
