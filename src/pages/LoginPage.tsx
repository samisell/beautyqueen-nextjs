'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Chrome,
  Apple,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigationStore();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success && result.data) {
        login(result.data.user, result.data.token);
        toast.success('Welcome back! 👋');
        navigate('dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Telegram Login Handler ──
  // Opens the Telegram bot where the user can click "Start" to auto-login
  const handleTelegramLogin = () => {
    // Get bot username from env or use a default
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (botUsername) {
      window.open(`https://t.me/${botUsername}`, '_blank');
      toast.info('Opening Telegram... Click "Start" to sign in automatically!');
    } else {
      toast.info('Telegram bot is not configured. Please contact support.');
    }
  };

  // Check if running inside Telegram (auto-login is handled by useTelegram hook)
  const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl shadow-primary/5">
          <CardHeader className="text-center space-y-4 pb-2 pt-8 px-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Welcome <span className="gradient-text">Back</span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                Sign in to your account to continue voting
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* ── Telegram Quick Login (shown first when NOT inside Telegram) ── */}
            {!isTelegram && (
              <>
                <Button
                  type="button"
                  onClick={handleTelegramLogin}
                  className="w-full h-11 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-semibold rounded-xl shadow-lg shadow-[#2AABEE]/25 mb-4"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Continue with Telegram
                </Button>
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    or sign in with email
                  </span>
                </div>
              </>
            )}

            {/* ── Inside Telegram notice ── */}
            {isTelegram && (
              <div className="mb-4 p-3 rounded-xl bg-[#2AABEE]/10 border border-[#2AABEE]/20">
                <p className="text-sm text-center text-muted-foreground">
                  You&apos;re in Telegram — signing in automatically...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Divider (only show if not already shown above) */}
            {!isTelegram ? (
              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            ) : (
              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                disabled
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                disabled
              >
                <Apple className="w-4 h-4 mr-2" />
                Apple
              </Button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Create one
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
