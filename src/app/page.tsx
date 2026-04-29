'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
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

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for existing auth token on mount
  useEffect(() => {
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
  }, []);

  const isDashboardPage = dashboardPages.includes(currentPage);
  const isAuthPage = ['login', 'register', 'forgot-password'].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
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
      </main>

      {/* Footer only on non-dashboard, non-auth pages */}
      {!isDashboardPage && !isAuthPage && <Footer />}
    </div>
  );
}
