'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  Users,
  Gift,
  ArrowRight,
  Trophy,
  Clock,
  Bell,
  ShoppingBag,
  Share2,
  Vote,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  UserX,
  LogIn,
  CalendarDays,
  X,
  ChevronRight,
  Crown,
  Copy,
  Check,
  MessageCircle,
  Send,
  Sparkles,
  ShieldCheck,
  UserPlus,
  ChevronDown,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// ────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────
interface RecentVote {
  id: string;
  contestantId: string;
  voteType: 'free' | 'paid' | 'referral';
  createdAt: string;
  contestant: { name: string; imageUrl: string };
}

interface UserStatsData {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
  recentVotes: RecentVote[];
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface ContestantData {
  id: string;
  contestantCode: string;
  name: string;
  bio?: string | null;
  imageUrl: string;
  category: string;
  categoryId?: string | null;
  status: 'active' | 'eliminated' | 'winner';
  totalVotes: number;
  voteCount: number;
  rank: number | null;
  votingEnabled: boolean;
  createdAt: string;
  eliminatedAt?: string | null;
  eliminationReason?: string | null;
  stage: {
    id: string;
    name: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    status: string;
    order: number;
    minVotes: number;
    maxContestants?: number | null;
  } | null;
  tournament: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
  } | null;
  categoryInfo: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
  } | null;
  platform: {
    name: string;
    votePrice: string;
    currency: string;
  };
}

interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  contestantCount: number;
}

// ────────────────────────────────────────────
// Animation variants
// ────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getNotifIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
    default:
      return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
  }
}

function getVoteTypeBadge(type: string) {
  switch (type) {
    case 'free':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs border-0">
          Free
        </Badge>
      );
    case 'paid':
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs border-0">
          Paid
        </Badge>
      );
    case 'referral':
      return (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs border-0">
          Referral
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{type}</Badge>;
  }
}

function getStageStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs border-0">
          ● Active
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs border-0">
          ○ Upcoming
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-400 text-xs border-0">
          ✓ Completed
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
}

// ────────────────────────────────────────────
// Competition Rules
// ────────────────────────────────────────────
const competitionRules = [
  'You must have a verified email address',
  'You can only join one tournament at a time',
  'Your profile will be visible on the public leaderboard',
  'Votes are counted from the public; encourage sharing your link',
  'Admin reserves the right to eliminate contestants for fraudulent activity',
  'Minimum votes are required to advance to the next stage',
  'All payments are final and non-refundable',
];

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export default function DashboardOverview() {
  const { navigate, pageParams } = useNavigationStore();
  const { user, token } = useAuthStore();

  // Data state
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Contestant state
  const [contestant, setContestant] = useState<ContestantData | null>(null);
  const [contestantLoading, setContestantLoading] = useState(true);
  const [isContestant, setIsContestant] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);

  // UI state
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [copied, setCopied] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Join Tournament Dialog state
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [joinForm, setJoinForm] = useState({
    name: '',
    category: '',
    bio: '',
    imageUrl: '',
  });
  const [joinLoading, setJoinLoading] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // ────────────────────────────────────────────
  // Data fetchers
  // ────────────────────────────────────────────
  const fetchContestant = useCallback(async () => {
    try {
      const res = await fetch('/api/user/my-contestant', { headers });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setContestant(data.data);
          setIsContestant(true);
          setIsEliminated(data.data.status === 'eliminated');
          setVotingEnabled(data.data.votingEnabled ?? true);
        } else {
          setContestant(null);
          setIsContestant(false);
          setIsEliminated(false);
        }
      }
    } catch {
      // Ignore
    } finally {
      setContestantLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/stats', { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      // Ignore
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notifications?limit=5', { headers });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.meta?.unreadCount ?? data.data?.filter((n: NotificationData) => !n.isRead).length ?? 0);
      }
    } catch {
      // Ignore
    }
  }, [token]);

  const checkVotingStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/tournament', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setVotingEnabled(data.data.votingEnabled ?? true);
      }
    } catch {
      // Ignore
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      // Ignore
    }
  }, []);

  // ────────────────────────────────────────────
  // Initial data load
  // ────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await Promise.all([fetchContestant(), fetchStats(), fetchNotifications(), checkVotingStatus()]);
      setLoading(false);
    }
    fetchData();
  }, [fetchContestant, fetchStats, fetchNotifications, checkVotingStatus]);

  // ────────────────────────────────────────────
  // Detect tournamentId / stageId from pageParams
  // ────────────────────────────────────────────
  useEffect(() => {
    if (pageParams?.tournamentId && pageParams?.stageId) {
      setRulesDialogOpen(true);
      fetchCategories();
      setJoinForm((prev) => ({
        ...prev,
        name: user?.name || '',
        imageUrl: user?.avatar || '',
      }));
      // Clear params so dialog doesn't re-open on re-render
      useNavigationStore.getState().navigate('dashboard', {});
    }
  }, []);

  // ────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ markAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        toast.error(data.message || 'Failed to mark notifications');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleShareReferral = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}/register?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share contestant profile
  const contestantShareUrl = contestant
    ? `${window.location.origin}/vote/${contestant.id}`
    : '';

  const handleCopyContestantLink = () => {
    navigator.clipboard.writeText(contestantShareUrl);
    setCopied(true);
    toast.success('Profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Vote for ${contestant?.name} in ${contestant?.tournament?.name || 'Beauty Vote'}! ${contestantShareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Vote for ${contestant?.name}!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(contestantShareUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = `Vote for ${contestant?.name}!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(contestantShareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Open join dialog from CTA or browse tournaments
  const openJoinDialog = () => {
    fetchCategories();
    setJoinForm({
      name: user?.name || '',
      category: '',
      bio: '',
      imageUrl: user?.avatar || '',
    });
    setRulesDialogOpen(true);
  };

  // Join tournament handler
  const handleJoinTournament = async () => {
    if (!pageParams?.tournamentId || !pageParams?.stageId) {
      toast.error('Missing tournament or stage information');
      return;
    }

    if (!joinForm.name.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    if (!joinForm.category) {
      toast.error('Please select a category');
      return;
    }

    setJoinLoading(true);
    try {
      const res = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tournamentId: pageParams.tournamentId,
          stageId: pageParams.stageId,
          name: joinForm.name.trim(),
          bio: joinForm.bio.trim() || undefined,
          imageUrl: joinForm.imageUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(joinForm.name.trim())}`,
          category: joinForm.category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Successfully joined the tournament!');
        setRulesDialogOpen(false);
        // Refresh contestant data
        await fetchContestant();
        // Clear params
        useNavigationStore.getState().navigate('dashboard', {});
      } else {
        toast.error(data.error || data.message || 'Failed to join tournament');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // Date display
  // ────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ────────────────────────────────────────────
  // Stat cards
  // ────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Votes Cast',
      value: stats?.totalVotes ?? 0,
      icon: Heart,
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-500',
      accent: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: 'Available Paid Votes',
      value: stats?.availableVotes ?? 0,
      icon: Star,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-500',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'My Referrals',
      value: stats?.referralCount ?? 0,
      icon: Users,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-500',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Referral Bonus',
      value: stats?.referralBonusVotes ?? 0,
      icon: Gift,
      iconBg: 'bg-purple-100 dark:bg-purple-950/40',
      iconColor: 'text-purple-500',
      accent: 'text-purple-600 dark:text-purple-400',
    },
  ];

  // ────────────────────────────────────────────
  // Quick actions
  // ────────────────────────────────────────────
  const quickActions = [
    {
      label: 'Vote Now',
      icon: Trophy,
      desc: 'Browse contestants and cast your votes',
      action: () => navigate('leaderboard'),
      iconBg: 'bg-gradient-to-br from-primary to-orange-500',
    },
    {
      label: 'Buy Votes',
      icon: ShoppingBag,
      desc: 'Get more votes with premium packages',
      action: () => navigate('dashboard-purchases'),
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    },
    {
      label: 'Share Link',
      icon: Share2,
      desc: 'Earn bonus votes by inviting friends',
      action: handleShareReferral,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
  ];

  const recentVotes = stats?.recentVotes?.slice(0, 5) ?? [];

  // ────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <DashboardSidebar />
          <div className="flex-1 min-w-0 space-y-6">

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back,{' '}
                <span className="gradient-text">{user?.name || 'Voter'}</span>!
              </h1>
              <p className="text-muted-foreground mt-1">{today}</p>
            </motion.div>

            {/* ────────────────────────────────────── */}
            {/* Contestant Status / Join CTA           */}
            {/* ────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {contestantLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Skeleton className="h-48 rounded-2xl" />
                </motion.div>
              ) : isContestant && contestant ? (
                <motion.div
                  key="contestant-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-0 shadow-sm overflow-hidden">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-6 py-5">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 overflow-hidden flex-shrink-0">
                          {contestant.imageUrl ? (
                            <img
                              src={contestant.imageUrl}
                              alt={contestant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                              {contestant.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {/* Name & info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-white truncate">{contestant.name}</h2>
                            <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                              #{contestant.contestantCode}
                            </Badge>
                            {contestant.status === 'active' && (
                              <Badge className="bg-green-500/30 text-white border-0 text-xs backdrop-blur-sm">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/80 text-sm mt-1 truncate">
                            {contestant.tournament?.name || 'Tournament'} &middot; {contestant.stage?.name || 'Stage'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {contestant.stage && getStageStatusBadge(contestant.stage.status)}
                            {contestant.categoryInfo && (
                              <Badge variant="secondary" className="text-xs bg-white/15 text-white border-0 backdrop-blur-sm">
                                {contestant.categoryInfo.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <CardContent className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl sm:text-3xl font-bold text-primary">
                            {contestant.voteCount?.toLocaleString() || contestant.totalVotes?.toLocaleString() || '0'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Total Votes</p>
                        </div>
                        <div className="text-center border-x border-border">
                          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {contestant.rank ? `#${contestant.rank}` : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Current Rank</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {contestant.stage?.minVotes || '0'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Min Votes to Advance</p>
                        </div>
                      </div>

                      {/* Share Profile Section */}
                      {contestant.status === 'active' && (
                        <>
                          <Separator className="mb-5" />
                          <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                              <Share2 className="w-4 h-4 text-primary" />
                              Share Your Profile & Get More Votes
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              Share your contestant link with friends and followers. Every vote counts toward your ranking!
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Copy Link */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={handleCopyContestantLink}
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1.5 text-green-500" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1.5" />
                                    Copy Link
                                  </>
                                )}
                              </Button>
                              {/* WhatsApp */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30"
                                onClick={handleShareWhatsApp}
                              >
                                <MessageCircle className="w-4 h-4 mr-1.5 text-green-600 dark:text-green-400" />
                                <span className="text-green-700 dark:text-green-400 font-medium">WhatsApp</span>
                              </Button>
                              {/* X (Twitter) */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/30"
                                onClick={handleShareTwitter}
                              >
                                <span className="font-bold text-sm mr-1.5">X</span>
                                <span className="font-medium">Post</span>
                              </Button>
                              {/* Telegram */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-sky-200 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-950/30"
                                onClick={handleShareTelegram}
                              >
                                <Send className="w-4 h-4 mr-1.5 text-sky-600 dark:text-sky-400" />
                                <span className="text-sky-700 dark:text-sky-400 font-medium">Telegram</span>
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Voting disabled banner for contestant */}
                      {contestant.status === 'active' && !votingEnabled && (
                        <div className="mt-4">
                          <Card className="border-2 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">Voting is Temporarily Paused</p>
                                <p className="text-xs text-muted-foreground">Please check back later for updates</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : !isEliminated ? (
                /* ────────────────────────────────────── */
                /* Not a contestant — Join Tournament CTA */
                /* ────────────────────────────────────── */
                <motion.div
                  key="join-cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-6 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
                      {/* Background decorations */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                      <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          Join a Tournament
                        </h2>
                        <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto mb-6">
                          Enter the competition and let the world vote for you! Showcase your talent and win amazing prizes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          <Button
                            size="lg"
                            className="bg-white text-orange-600 hover:bg-white/90 rounded-xl font-semibold shadow-lg"
                            onClick={() => navigate('tournament')}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Browse Tournaments
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 rounded-xl bg-transparent"
                            onClick={() => navigate('leaderboard')}
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            View Leaderboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Eliminated Contestant Banner */}
            {isEliminated && contestant && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-red-500/30 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <UserX className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                          Contestant Status: Eliminated
                        </h2>
                        <p className="text-sm text-muted-foreground mb-3">
                          {contestant.eliminationReason
                            ? `Reason: ${contestant.eliminationReason}`
                            : 'You have been eliminated from the current tournament stage.'}
                          {contestant.eliminatedAt && (
                            <span className="block text-xs text-muted-foreground mt-1">
                              Eliminated on {new Date(contestant.eliminatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => navigate('tournament')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Enroll in New Tournament
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => navigate('tournament')}
                          >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            View Tournaments
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ────────────────────────────────────── */}
            {/* Join Tournament Rules Dialog           */}
            {/* ────────────────────────────────────── */}
            <Dialog open={rulesDialogOpen} onOpenChange={(open) => {
              setRulesDialogOpen(open);
              if (!open) {
                useNavigationStore.getState().navigate('dashboard', {});
              }
            }}>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Competition Rules & Guidelines
                  </DialogTitle>
                  <DialogDescription>
                    Please read and accept the rules before joining the tournament.
                  </DialogDescription>
                </DialogHeader>

                {/* Rules list */}
                <div className="space-y-2.5 py-2">
                  {competitionRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Registration Form */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    Contestant Registration
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="join-name">Display Name *</Label>
                    <Input
                      id="join-name"
                      placeholder="Enter your display name"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-category">Category *</Label>
                    <Select
                      value={joinForm.category}
                      onValueChange={(val) => setJoinForm((prev) => ({ ...prev, category: val }))}
                    >
                      <SelectTrigger id="join-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                        {/* Fallback categories */}
                        {categories.length === 0 && (
                          <>
                            <SelectItem value="Miss">Miss</SelectItem>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Kids">Kids</SelectItem>
                            <SelectItem value="Teens">Teens</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-bio">Bio (optional)</Label>
                    <Textarea
                      id="join-bio"
                      placeholder="Tell us about yourself..."
                      value={joinForm.bio}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-image" className="flex items-center gap-1.5">
                      Profile Image URL
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </Label>
                    <Input
                      id="join-image"
                      placeholder="https://example.com/your-photo.jpg"
                      value={joinForm.imageUrl}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave empty to use a default avatar
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRulesDialogOpen(false);
                      useNavigationStore.getState().navigate('dashboard', {});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinTournament}
                    disabled={joinLoading || !joinForm.name.trim() || !joinForm.category}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {joinLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        I Agree — Join Tournament
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ────────────────────────────────────── */}
            {/* Stats Cards                           */}
            {/* ────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                  ))
                : statCards.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      custom={i}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                            <TrendingUp className={`w-4 h-4 ${stat.accent} opacity-60`} />
                          </div>
                          <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </div>

            {/* ────────────────────────────────────── */}
            {/* Quick Actions                         */}
            {/* ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.label}
                    className="cursor-pointer hover:shadow-lg transition-all group"
                    onClick={action.action}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shadow-sm`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{action.label}</h3>
                          <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* ────────────────────────────────────── */}
            {/* Notifications + Recent Activity       */}
            {/* ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notifications
                        {unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </CardTitle>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground hover:text-foreground"
                          onClick={handleMarkAllRead}
                          disabled={markingAllRead}
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3.5 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="space-y-1">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                !notif.isRead
                                  ? 'bg-primary/5 border border-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              {getNotifIcon(notif.type)}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(notif.createdAt)}
                                </div>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3.5 w-2/3" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentVotes.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="space-y-1">
                          {recentVotes.map((vote) => (
                            <div
                              key={vote.id}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => navigate('vote', { id: vote.contestantId })}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                                {vote.contestant?.imageUrl ? (
                                  <img
                                    src={vote.contestant.imageUrl}
                                    alt={vote.contestant.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  vote.contestant?.name?.charAt(0) || '?'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {vote.contestant?.name || 'Unknown'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatRelativeTime(vote.createdAt)}
                                </p>
                              </div>
                              {getVoteTypeBadge(vote.voteType)}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Start voting to see your activity
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => navigate('leaderboard')}
                        >
                          <Vote className="w-4 h-4 mr-1" />
                          Vote Now
                        </Button>
                      </div>
                    )}
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
