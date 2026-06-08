import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '@/api/auth.api';
import { useTimeZone } from '@/hooks/useTimeZone';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { registerSchema } from '@/lib/validators';
import { sanitizeHtml } from '@/lib/sanitize';
import { AxiosError } from 'axios';
import type { ProblemDetail } from '@/types/api.types';

export function RegisterPage() {
  const timeZone = useTimeZone();
  const { retryAfter, isRateLimited, handleRateLimitError } = useRateLimit();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const data = { ...form, zoneInfo: timeZone };
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register({
        username: sanitizeHtml(result.data.username),
        email: result.data.email,
        password: result.data.password,
        zoneInfo: result.data.zoneInfo,
      });
      setSuccessMessage(response.message || 'Verification email sent. Please check your inbox.');
    } catch (error) {
      handleRateLimitError(error);
      if (error instanceof AxiosError) {
        const problem = error.response?.data as ProblemDetail | undefined;
        setServerError(problem?.detail || 'Registration failed. Please try again.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🧠</span>
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-2">Start mastering your flashcards</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {successMessage ? (
            <div className="text-center space-y-6">
              <span className="text-5xl block">📧</span>
              <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {successMessage}
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center w-full bg-indigo-600 text-white rounded-xl py-3 px-4 text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Go to Sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={errors.username}
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                disabled={isSubmitting}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={isRateLimited}
              >
                {isRateLimited ? `Try again in ${retryAfter}s` : 'Create account'}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                Timezone detected: {timeZone}
              </p>
            </form>
          )}
        </div>

        {!successMessage && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
