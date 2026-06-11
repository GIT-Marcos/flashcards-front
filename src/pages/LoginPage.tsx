import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { ProblemDetail } from '@/types/api.types';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { retryAfter, isRateLimited, handleRateLimitError } = useRateLimit();
  const { t } = useTranslation();

  const [form, setForm] = useState<LoginFormData>({ username: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(result.data);
      toast.success(t('common.welcome.back'));
      navigate('/decks', { replace: true });
    } catch (error) {
      handleRateLimitError(error);
      if (error instanceof AxiosError) {
        const problem = error.response?.data as ProblemDetail | undefined;
        setServerError(problem?.detail || t('common.loginFailed'));
      } else {
        setServerError(t('common.unexpectedError'));
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
          <h1 className="text-3xl font-bold text-slate-900">{t('common.welcome.back')}</h1>
          <p className="text-slate-500 mt-2">{t('common.sign.in.to.continue.studying')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('common.username')}
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              error={errors.username}
              disabled={isSubmitting}
              autoComplete="username"
              autoFocus
            />
            <Input
              label={t('common.password')}
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
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
              {isRateLimited ? `Try again in ${retryAfter}s` : t('common.sign.in')}
            </Button>

            <p className="text-center">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                {t('common.forgot.password')}
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('common.dont.have.an.account')}{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            {t('common.create.account')}
          </Link>
        </p>
      </div>
    </div>
  );
}
