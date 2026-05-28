'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPasswordRequest } from '@/lib/auth-api';
import { emailPattern } from '@/lib/auth-validation';
import { AuthCard } from '../auth-card';
import { AuthHeader } from '../auth-header';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormFooterLink } from '../form-footer-link';
import { InputField } from '../input-field';
import { SuccessMessage } from '../success-message';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | undefined>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!emailPattern.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await forgotPasswordRequest(email.trim().toLowerCase());
      setResetUrl(response.resetUrl);
      setIsSuccess(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to send a reset link right now.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      {isSuccess ? (
        <SuccessMessage
          title="Reset link requested"
          description="If an account exists for this email, we’ve sent a password reset link."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {resetUrl ? (
                <Link
                  href={resetUrl}
                  className="auth-primary-button inline-flex rounded-2xl px-4 py-2 text-sm font-semibold transition hover:brightness-[1.04]"
                >
                  Continue to Reset
                </Link>
              ) : null}
              <Link
                href="/login"
                className="auth-primary-button inline-flex rounded-2xl px-4 py-2 text-sm font-semibold transition hover:brightness-[1.04]"
              >
                Back to Login
              </Link>
            </div>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
          <AuthHeader
            title="Forgot your password?"
            subtitle="Enter your email and we’ll send you a link to reset your password."
            eyebrow="Password help"
          />

          <InputField
            id="forgot-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={error}
            autoComplete="email"
            inputMode="email"
            required
            helperText="We’ll send instructions only if the account exists."
          />

          <AuthSubmitButton
            label="Send Reset Link"
            loadingLabel="Sending link..."
            isLoading={isLoading}
          />

          <FormFooterLink text="Remembered your password?" linkText="Log in" href="/login" />
        </form>
      )}
    </AuthCard>
  );
}
