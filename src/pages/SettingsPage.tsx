import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe, deleteMe } from '@/api/users.api';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
} from '@/lib/validators';
import { sanitizeHtml } from '@/lib/sanitize';
import { toast } from 'sonner';

export function SettingsPage() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
  });

  // Profile form
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: '',
    sessionThreshold: 30,
    startOfDay: 6,
    notificationsEnabled: true,
  });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<string, string>>>({});

  // Password form
  const [passwordForm, setPasswordForm] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<string, string>>>({});

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username,
        email: user.email,
        sessionThreshold: user.sessionThreshold,
        startOfDay: user.startOfDay,
        notificationsEnabled: user.notificationsEnabled,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      updateMe({
        username: sanitizeHtml(data.username),
        email: data.email,
        sessionThreshold: data.sessionThreshold,
        startOfDay: data.startOfDay,
        notificationsEnabled: data.notificationsEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Profile updated!');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateMe({
        currentPassword: data.currentPassword,
        password: data.newPassword,
      }),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      clearAuth();
      navigate('/login', { replace: true });
      toast.success('Account deleted.');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(profileForm);
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errs[field]) errs[field] = issue.message;
      }
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    updateProfileMutation.mutate(result.data);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = changePasswordSchema.safeParse(passwordForm);
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errs[field]) errs[field] = issue.message;
      }
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});
    updatePasswordMutation.mutate(result.data);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Username"
            value={profileForm.username}
            onChange={(e) => {
              setProfileForm((p) => ({ ...p, username: e.target.value }));
              setProfileErrors((p) => ({ ...p, username: undefined }));
            }}
            error={profileErrors.username}
            disabled={updateProfileMutation.isPending}
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => {
              setProfileForm((p) => ({ ...p, email: e.target.value }));
              setProfileErrors((p) => ({ ...p, email: undefined }));
            }}
            error={profileErrors.email}
            disabled={updateProfileMutation.isPending}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sessionThreshold" className="block text-sm font-medium text-slate-700 mb-1">
                Session Threshold (min)
              </label>
              <input
                id="sessionThreshold"
                type="number"
                min={5}
                max={360}
                value={profileForm.sessionThreshold}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, sessionThreshold: Number(e.target.value) }))
                }
                disabled={updateProfileMutation.isPending}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="startOfDay" className="block text-sm font-medium text-slate-700 mb-1">
                Start of Day (hour)
              </label>
              <input
                id="startOfDay"
                type="number"
                min={0}
                max={23}
                value={profileForm.startOfDay}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, startOfDay: Number(e.target.value) }))
                }
                disabled={updateProfileMutation.isPending}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="notifications"
              type="checkbox"
              checked={profileForm.notificationsEnabled}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, notificationsEnabled: e.target.checked }))
              }
              disabled={updateProfileMutation.isPending}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="notifications" className="text-sm text-slate-700">
              Enable notifications
            </label>
          </div>

          <Button type="submit" isLoading={updateProfileMutation.isPending}>
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => {
              setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }));
              setPasswordErrors((p) => ({ ...p, currentPassword: undefined }));
            }}
            error={passwordErrors.currentPassword}
            disabled={updatePasswordMutation.isPending}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => {
              setPasswordForm((p) => ({ ...p, newPassword: e.target.value }));
              setPasswordErrors((p) => ({ ...p, newPassword: undefined }));
            }}
            error={passwordErrors.newPassword}
            disabled={updatePasswordMutation.isPending}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => {
              setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
              setPasswordErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            error={passwordErrors.confirmPassword}
            disabled={updatePasswordMutation.isPending}
            autoComplete="new-password"
          />
          <Button type="submit" isLoading={updatePasswordMutation.isPending}>
            Change Password
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
          Delete Account
        </Button>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => deleteAccountMutation.mutate()}
        title="Delete Account"
        message="This will permanently delete your account and all your decks, cards, and study history. This action cannot be undone."
        confirmLabel="Delete My Account"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
