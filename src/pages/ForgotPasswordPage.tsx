import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth.api';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema } from '@/lib/validators';
import { AxiosError } from 'axios';
import type { ProblemDetail } from '@/types/api.types';

export function ForgotPasswordPage() {
  const { retryAfter, isRateLimited, handleRateLimitError } = useRateLimit();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email: result.data.email });
      setSuccessMessage(response.message);
    } catch (error) {
      handleRateLimitError(error);
      if (error instanceof AxiosError) {
        const problem = error.response?.data as ProblemDetail | undefined;
        setError(problem?.detail || 'Something went wrong. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🔑</span>
          <h1 className="text-3xl font-bold text-slate-900">Forgot your password?</h1>
          <p className="text-slate-500 mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {successMessage ? (
            <div className="text-center space-y-6">
              <span className="text-5xl block">📧</span>
              <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{successMessage}</p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center w-full bg-indigo-600 text-white rounded-xl py-3 px-4 text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Back to Sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={error}
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={isRateLimited}
              >
                {isRateLimited ? `Try again in ${retryAfter}s` : 'Send reset link'}
              </Button>
            </form>
          )}
        </div>

        {!successMessage && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
