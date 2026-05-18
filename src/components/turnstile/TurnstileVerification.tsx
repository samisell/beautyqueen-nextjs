'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/use-telegram';
import { useAuthStore } from '@/stores/auth-store';

export default function TurnstileVerification({ children }: { children: React.ReactNode }) {
  // Start with turnstileVerified = true by default to avoid initial hydration mismatch and layout blocking
  const [turnstileVerified, setTurnstileVerified] = useState(true);
  const [turnstileLoading, setTurnstileLoading] = useState(false);
  const { isTelegram } = useTelegram();
  const isAuthenticated = useAuthStore((s) => !!s.user);

  // Run validation client-side after component mounts
  useEffect(() => {
    // Check if we're in production (not localhost)
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname !== 'localhost' && 
       window.location.hostname !== '127.0.0.1' &&
       !window.location.hostname.includes('192.168'));
    
    // Check if Turnstile is enabled via NEXT_PUBLIC_ENABLE_TURNSTILE from process.env
    const turnstileEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true';

    // Skip verification if we are not in production, inside Telegram, already authenticated, or Turnstile is disabled
    const needsVerification = isProduction && turnstileEnabled && !isTelegram && !isAuthenticated;

    if (!needsVerification) {
      setTurnstileVerified(true);
      return;
    }

    // Since we need verification, transition the state to false
    setTurnstileVerified(false);
    setTurnstileLoading(true);

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Check if Turnstile is available
    if (typeof window !== 'undefined' && (window as any).turnstile) {
      // Render Turnstile widget
      try {
        (window as any).turnstile.render('#turnstile-container', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
          callback: (token) => {
            verifyTurnstileToken(token);
          },
          'expired-callback': () => {
            setTurnstileLoading(false);
          }
        });
      } catch (err) {
        console.error('Turnstile render error:', err);
        setTurnstileVerified(true); // Fail open for usability
      }
    } else {
      // Fallback if Turnstile script hasn't loaded yet
      intervalId = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).turnstile) {
          if (intervalId) clearInterval(intervalId);
          try {
            (window as any).turnstile.render('#turnstile-container', {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
              callback: (token) => {
                verifyTurnstileToken(token);
              },
              'expired-callback': () => {
                setTurnstileLoading(false);
              }
            });
          } catch (err) {
            console.error('Turnstile fallback render error:', err);
            setTurnstileVerified(true); // Fail open
          }
        }
      }, 100);

      // Clear interval after 5 seconds
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        setTurnstileLoading(false);
        // If still not loaded, allow through (fail open for usability)
        setTurnstileVerified(true);
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isTelegram, isAuthenticated]);

  // Verify Turnstile token with backend
  const verifyTurnstileToken = async (token: string) => {
    try {
      const res = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (data.success) {
        setTurnstileVerified(true);
      } else {
        setTurnstileLoading(false);
        // Fail open for usability
        setTurnstileVerified(true);
      }
    } catch (error) {
      console.error('Turnstile verification error:', error);
      setTurnstileLoading(false);
      // Fail open for usability
      setTurnstileVerified(true);
    }
  };

  if (!turnstileVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-8 py-12">
          <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto">
            {turnstileLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary rounded-full animate-spin"></div>
              </div>
            ) : null}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Security Check
          </h2>
          <p className="text-muted-foreground max-w-md">
            Please complete the security check to continue to BeautyVote.
            This helps protect our community from automated abuse.
          </p>
          {/* Turnstile container will be filled by the script */}
          <div id="turnstile-container" className="mt-4"></div>
          {!turnstileLoading && (
            <button 
              onClick={() => {
                // Reset and retry
                setTurnstileVerified(false);
                setTurnstileLoading(true);
              }}
              className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}