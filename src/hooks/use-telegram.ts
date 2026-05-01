// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote — Telegram WebApp Detection Hook
// ─────────────────────────────────────────────────────────────────────────────
// Detects if the app is running inside Telegram's built-in browser (Mini App).
// Provides the initData string and auto-authentication logic.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          auth_date: number;
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
        };
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        headerColor: (color: string) => void;
        backgroundColor: (color: string) => void;
      };
    };
  }
}

export interface TelegramContext {
  isTelegram: boolean;
  isReady: boolean;
  isInited: boolean;
  initData: string;
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
  startParam: string | null;
  loginWithTelegram: () => Promise<boolean>;
}

export function useTelegram(): TelegramContext {
  const [isReady, setIsReady] = useState(false);
  const [isInited, setIsInited] = useState(false);
  const loginAttemptedRef = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const { navigate } = useNavigationStore();

  const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const initData = webApp?.initData || '';
  const user = webApp?.initDataUnsafe?.user || null;
  const startParam = webApp?.initDataUnsafe?.start_param || null;

  // Initialize Telegram WebApp — runs once on mount
  useEffect(() => {
    if (!webApp) return;

    // Tell Telegram the web app is ready
    webApp.ready();
    webApp.expand();

    // Apply Telegram's color scheme
    if (webApp.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Mark as ready after a tick (avoids synchronous setState in effect)
    const frame = requestAnimationFrame(() => {
      setIsReady(true);
      setIsInited(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [webApp]);

  // Auto-authenticate when inside Telegram (if not already logged in)
  const loginWithTelegram = useCallback(async (): Promise<boolean> => {
    if (!initData) return false;

    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const result = await res.json();

      if (result.success && result.data) {
        useAuthStore.getState().login(result.data.user, result.data.token);

        // Navigate based on start_param or to dashboard
        if (startParam) {
          if (startParam === 'profile') {
            navigate('dashboard-profile');
          } else if (startParam === 'vote') {
            navigate('vote');
          } else {
            navigate('dashboard');
          }
        } else {
          navigate('dashboard');
        }

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [initData, startParam, navigate]);

  // Trigger auto-login once when conditions are met, using a ref to prevent re-triggers
  useEffect(() => {
    if (
      isTelegram &&
      isInited &&
      !isAuthenticated &&
      initData &&
      !loginAttemptedRef.current
    ) {
      loginAttemptedRef.current = true;
      // Schedule the login call asynchronously (not synchronous setState in effect)
      void loginWithTelegram();
    }
  }, [isTelegram, isInited, isAuthenticated, initData, loginWithTelegram]);

  return {
    isTelegram,
    isReady,
    isInited,
    initData,
    user,
    startParam,
    loginWithTelegram,
  };
}
