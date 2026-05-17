'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTelegram } from '@/hooks/use-telegram';
import ChatWidget from '@/components/chat/ChatWidget';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import TournamentPage from '@/pages/TournamentPage';
import PrizePage from '@/pages/PrizePage';
import FaqPage from '@/pages/FaqPage';
import ContactPage from '@/pages/ContactPage';
import InstructionPage from '@/pages/InstructionPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VotingPage from '@/pages/VotingPage';
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import DashboardProfile from '@/pages/dashboard/DashboardProfile';
import DashboardVotes from '@/pages/dashboard/DashboardVotes';
import DashboardPurchases from '@/pages/dashboard/DashboardPurchases';
import DashboardReferrals from '@/pages/dashboard/DashboardReferrals';
import DashboardSettings from '@/pages/dashboard/DashboardSettings';
import DashboardNotifications from '@/pages/dashboard/DashboardNotifications';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import PublicVotingPage from '@/pages/PublicVotingPage';
import SupportPage from '@/pages/SupportPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';

import type { PageRoute } from '@/types';

const dashboardPages: PageRoute[] = [
  'dashboard',
  'dashboard-profile',
  'dashboard-votes',
  'dashboard-purchases',
  'dashboard-referrals',
  'dashboard-settings',
  'dashboard-notifications',
  'admin',
  'public-vote',
  'support',
];

function PageRenderer() {
  const { currentPage } = useNavigationStore();

  const pageMap: Record<PageRoute, React.ReactNode> = {
    home: <HomePage />,
    about: <AboutPage />,
    leaderboard: <LeaderboardPage />,
    tournament: <TournamentPage />,
    prize: <PrizePage />,
    instruction: <InstructionPage />,
    faq: <FaqPage />,
    contact: <ContactPage />,
    login: <LoginPage />,
    register: <RegisterPage />,
    'forgot-password': <ForgotPasswordPage />,
    vote: <VotingPage />,
    dashboard: <DashboardOverview />,
    'dashboard-profile': <DashboardProfile />,
    'dashboard-votes': <DashboardVotes />,
    'dashboard-purchases': <DashboardPurchases />,
    'dashboard-referrals': <DashboardReferrals />,
    'dashboard-settings': <DashboardSettings />,
    'dashboard-notifications': <DashboardNotifications />,
    admin: <AdminDashboard />,
    'public-vote': <PublicVotingPage />,
    support: <SupportPage />,
    terms: <TermsPage />,
    privacy: <PrivacyPage />,
  };

  return pageMap[currentPage] || <HomePage />;
}

export default function App() {
  const { currentPage } = useNavigationStore();
  const { theme } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();

  // ── Telegram WebApp integration ──
  // When running inside Telegram, this handles:
  // 1. Initializing the WebApp SDK (ready, expand)
  // 2. Auto-authenticating via initData
  // 3. Applying Telegram's color scheme
  // This is completely independent of the existing email/password auth.
  const telegram = useTelegram();

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for existing auth token on mount
  // Skip if already authenticated via Telegram
  useEffect(() => {
    if (isAuthenticated) return;

    // If inside Telegram, the useTelegram hook handles auth
    if (telegram.isTelegram) return;

    // Normal auth check for regular browsers
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            useAuthStore.getState().setUser(data.data);
          }
        }
      } catch {
        // Not authenticated
      }
    };
    checkAuth();
  }, [isAuthenticated, telegram.isTelegram]);

  // Add Telegram class to body for CSS targeting
  useEffect(() => {
    if (telegram.isTelegram) {
      document.body.classList.add('telegram-webapp');
    }
  }, [telegram.isTelegram]);

  const isDashboardPage = dashboardPages.includes(currentPage);
  const isAuthPage = ['login', 'register', 'forgot-password'].includes(currentPage);

  // In Telegram mode, hide the navbar and footer for a cleaner in-app experience
  // (users can still navigate via the Telegram back button and in-app navigation)
  const showNavbar = !telegram.isTelegram || !isAuthenticated;
  const showFooter = !isDashboardPage && !isAuthPage && !telegram.isTelegram;

  return (
    <div className={`min-h-screen flex flex-col ${telegram.isTelegram ? 'telegram-webapp-wrapper' : ''}`}>
      {showNavbar && <Navbar />}

      <main className="flex-1">
        {/* Show a loading state while Telegram auto-auth is in progress */}
        {telegram.isTelegram && telegram.isInited && !isAuthenticated ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-sm px-4">
              {telegram.error ? (
                <>
                  <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                    ⚠️
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Sign In Failed</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {telegram.error}
                    </p>
                  </div>
                  <button
                    onClick={() => telegram.loginWithTelegram()}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/95 text-sm font-medium transition-colors cursor-pointer shadow-md inline-block"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm font-medium">Signing in via Telegram...</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={
                isAuthPage
                  ? 'min-h-[calc(100vh-4rem)]'
                  : isDashboardPage
                  ? ''
                  : ''
              }
            >
              <PageRenderer />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer only on non-dashboard, non-auth, non-telegram pages */}
      {showFooter && <Footer />}

      {/* Live Chat Widget — floating button at bottom-right */}
      {/* Hidden inside Telegram WebApp (users use Telegram's native chat instead) */}
      {!telegram.isTelegram && <ChatWidget />}
    </div>
  );
}
