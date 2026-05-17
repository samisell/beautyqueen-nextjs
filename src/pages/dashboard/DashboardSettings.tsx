'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Trash2,
  Info,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useNavigationStore } from '@/stores/navigation-store';
import { toast } from 'sonner';

const PREFS_KEY = 'beauty-vote-notification-prefs';

interface NotificationPrefs {
  emailNotifications: boolean;
  voteReminders: boolean;
  tournamentUpdates: boolean;
  referralNotifications: boolean;
}

const defaultPrefs: NotificationPrefs = {
  emailNotifications: true,
  voteReminders: true,
  tournamentUpdates: true,
  referralNotifications: true,
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return { ...defaultPrefs, ...JSON.parse(stored) };
  } catch {
    // fallback
  }
  return defaultPrefs;
}

function savePrefs(prefs: NotificationPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // fallback
  }
}

export default function DashboardSettings() {
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { navigate } = useNavigationStore();
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs());
  const [deleting, setDeleting] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(true);

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Mock delete - just logout after a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDeleting(false);
    toast.success('Account deleted successfully');
    logout();
    navigate('home');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6 max-w-2xl">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Settings</span>
              </h1>
              <p className="text-muted-foreground mt-1">Manage your preferences</p>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 mr-4">
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive voting updates and news via email
                      </p>
                    </div>
                    {!prefsLoaded ? (
                      <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
                    ) : (
                      <Switch
                        checked={prefs.emailNotifications}
                        onCheckedChange={(v) => updatePref('emailNotifications', v)}
                      />
                    )}
                  </div>
                  <Separator />

                  {/* Vote Reminders */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 mr-4">
                      <p className="text-sm font-medium">Vote Reminders</p>
                      <p className="text-xs text-muted-foreground">
                        Get reminded to cast your daily free votes
                      </p>
                    </div>
                    {!prefsLoaded ? (
                      <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
                    ) : (
                      <Switch
                        checked={prefs.voteReminders}
                        onCheckedChange={(v) => updatePref('voteReminders', v)}
                      />
                    )}
                  </div>
                  <Separator />

                  {/* Tournament Updates */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 mr-4">
                      <p className="text-sm font-medium">Tournament Updates</p>
                      <p className="text-xs text-muted-foreground">
                        Stay informed about stage changes and results
                      </p>
                    </div>
                    {!prefsLoaded ? (
                      <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
                    ) : (
                      <Switch
                        checked={prefs.tournamentUpdates}
                        onCheckedChange={(v) => updatePref('tournamentUpdates', v)}
                      />
                    )}
                  </div>
                  <Separator />

                  {/* Referral Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 mr-4">
                      <p className="text-sm font-medium">Referral Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when someone uses your referral link
                      </p>
                    </div>
                    {!prefsLoaded ? (
                      <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
                    ) : (
                      <Switch
                        checked={prefs.referralNotifications}
                        onCheckedChange={(v) => updatePref('referralNotifications', v)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">App Name</p>
                    <p className="text-sm font-medium">BeautyVote</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <Badge variant="secondary" className="text-xs">
                      v1.0.0
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="text-sm font-medium">Web (Next.js 16)</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">License</p>
                    <p className="text-sm font-medium">MIT</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions. Please proceed with caution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="text-sm font-medium text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="rounded-xl shrink-0"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account, all your votes, purchase history, and referral data from
                            our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                            disabled={deleting}
                          >
                            {deleting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Yes, Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
