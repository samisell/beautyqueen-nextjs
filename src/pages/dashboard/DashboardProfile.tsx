'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Calendar,
  Copy,
  Check,
  Loader2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Award,
  ImageIcon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  avatar: z
    .string()
    .url('Please enter a valid URL')
    .or(z.literal(''))
    .optional()
    .default(''),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function DashboardProfile() {
  const { user, token, updateUser } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    isVerified: boolean;
    referralCode: string;
    createdAt: string;
  } | null>(null);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user', { headers });
        const data = await res.json();
        if (data.success) {
          setProfileData(data.data);
        }
      } catch {
        // fallback to store data
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [token]);

  const displayUser = profileData || user;
  const memberSince = displayUser?.createdAt
    ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: displayUser?.name || '',
      avatar: displayUser?.avatar || '',
    },
    values: {
      name: displayUser?.name || '',
      avatar: displayUser?.avatar || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = passwordForm.watch('newPassword');
  const passwordStrength = useMemo(
    () => getPasswordStrength(newPasswordValue),
    [newPasswordValue]
  );

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const body: { name: string; avatar?: string } = { name: data.name };
      if (data.avatar) body.avatar = data.avatar;

      const res = await fetch('/api/user', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result.success) {
        updateUser({ name: data.name, avatar: data.avatar || undefined });
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setSavingPassword(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success('Password changed successfully');
        passwordForm.reset();
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCopyReferral = () => {
    const code = displayUser?.referralCode || user?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground mt-1">Manage your account information</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {loadingProfile ? (
                <Card>
                  <div className="h-24 bg-muted animate-pulse" />
                  <CardContent className="pt-0 pb-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                      <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 h-24" />
                  <CardContent className="pt-0 pb-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={displayUser?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                          {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{displayUser?.name}</h2>
                        <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {displayUser?.role === 'admin' && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {displayUser?.isVerified && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-0">
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            <User className="w-3 h-3 mr-1" />
                            {displayUser?.role || 'user'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-5" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Member Since</p>
                          <p className="text-sm font-medium">{memberSince}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                          <Award className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Referral Code</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-mono font-medium">
                              {displayUser?.referralCode || 'N/A'}
                            </p>
                            <button
                              onClick={handleCopyReferral}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Copy referral code"
                            >
                              {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate max-w-[160px]">
                            {displayUser?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Edit Profile Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      Edit Profile
                    </CardTitle>
                    <CardDescription>Update your name and avatar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-name"
                            placeholder="Enter your name"
                            className="pl-10"
                            {...profileForm.register('name')}
                          />
                        </div>
                        {profileForm.formState.errors.name && (
                          <p className="text-destructive text-xs">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-avatar" className="text-sm font-medium">
                          Avatar URL{' '}
                          <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          <Input
                            id="profile-avatar"
                            placeholder="https://example.com/avatar.jpg"
                            className="pl-10"
                            {...profileForm.register('avatar')}
                          />
                        </div>
                        {profileForm.formState.errors.avatar && (
                          <p className="text-destructive text-xs">
                            {profileForm.formState.errors.avatar.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl bg-primary hover:bg-primary/90"
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Change Password Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password (8+ chars, uppercase, lowercase, digit)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            className="pl-10 pr-10"
                            {...passwordForm.register('currentPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-destructive text-xs">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            className="pl-10 pr-10"
                            {...passwordForm.register('newPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-destructive text-xs">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}

                        {/* Password Strength Indicator */}
                        {newPasswordValue && (
                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Password strength
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  passwordStrength.label === 'Weak'
                                    ? 'text-red-500'
                                    : passwordStrength.label === 'Medium'
                                    ? 'text-amber-500'
                                    : 'text-green-500'
                                }`}
                              >
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                                    level <= Math.min(Math.ceil(passwordStrength.score / 2), 3)
                                      ? passwordStrength.color
                                      : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="space-y-1 mt-1.5">
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {newPasswordValue.length >= 8 ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-muted-foreground/40" />
                                )}
                                <span
                                  className={
                                    newPasswordValue.length >= 8
                                      ? 'text-green-600'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  At least 8 characters
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {/[A-Z]/.test(newPasswordValue) ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-muted-foreground/40" />
                                )}
                                <span
                                  className={
                                    /[A-Z]/.test(newPasswordValue)
                                      ? 'text-green-600'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  Uppercase letter
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {/[a-z]/.test(newPasswordValue) ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-muted-foreground/40" />
                                )}
                                <span
                                  className={
                                    /[a-z]/.test(newPasswordValue)
                                      ? 'text-green-600'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  Lowercase letter
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {/[0-9]/.test(newPasswordValue) ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-muted-foreground/40" />
                                )}
                                <span
                                  className={
                                    /[0-9]/.test(newPasswordValue)
                                      ? 'text-green-600'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  Number
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter new password"
                            className="pl-10 pr-10"
                            {...passwordForm.register('confirmPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-destructive text-xs">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full rounded-xl"
                        disabled={savingPassword}
                      >
                        {savingPassword ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
