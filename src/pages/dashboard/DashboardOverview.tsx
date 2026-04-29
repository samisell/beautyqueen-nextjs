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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface AvailableTournament {
  id: string;
  name: string;
  description?: string;
  nextStage: {
    id: string;
    name: string;
    startDate: string;
    minVotes: number;
    maxContestants?: number;
    _count: { contestants: number };
  } | null;
  totalStages: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

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

export default function DashboardOverview() {
  const { navigate } = useNavigationStore();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [eliminationInfo, setEliminationInfo] = useState<{ reason?: string; date?: string }>({});
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState<AvailableTournament[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/stats', { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      toast.error('Failed to load stats');
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
      toast.error('Failed to load notifications');
    }
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchNotifications(), checkEliminationStatus(), checkVotingStatus()]);
      setLoading(false);
    }
    fetchData();
  }, [fetchStats, fetchNotifications, checkEliminationStatus, checkVotingStatus]);

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

  // Check if current user (as contestant) is eliminated
  const checkEliminationStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/contestants?limit=100', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        const myContestant = data.data.find((c: { status: string; eliminationReason?: string | null; eliminatedAt?: string | null }) => c.status === 'eliminated');
        if (myContestant) {
          setIsEliminated(true);
          setEliminationInfo({
            reason: myContestant.eliminationReason || undefined,
            date: myContestant.eliminatedAt || undefined,
          });
        } else {
          setIsEliminated(false);
        }
      }
    } catch {
      // Ignore
    }
  }, [user, token]);

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

  const fetchAvailableTournaments = useCallback(async () => {
    setEnrollLoading(true);
    try {
      const res = await fetch('/api/tournaments/available', { headers });
      const data = await res.json();
      if (data.success) setAvailableTournaments(data.data || []);
    } catch {
      // Ignore
    } finally {
      setEnrollLoading(false);
    }
  }, [token]);

  const openEnrollDialog = () => {
    setEnrollDialogOpen(true);
    fetchAvailableTournaments();
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

            {/* Eliminated Contestant Banner */}
            {isEliminated && (
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
                          {eliminationInfo.reason
                            ? `Reason: ${eliminationInfo.reason}`
                            : 'You have been eliminated from the current tournament stage.'}
                          {eliminationInfo.date && (
                            <span className="block text-xs text-muted-foreground mt-1">
                              Eliminated on {new Date(eliminationInfo.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={openEnrollDialog}
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

            {/* Voting Disabled Banner (for non-eliminated users) */}
            {!isEliminated && !votingEnabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-2 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Voting is Temporarily Paused</p>
                      <p className="text-xs text-muted-foreground">Please check back later for updates</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enrollment Dialog */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Available Tournaments
                  </DialogTitle>
                  <DialogDescription>
                    Choose a tournament to enroll in. Only tournaments with upcoming stages are shown.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto py-2">
                  {enrollLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                      ))}
                    </div>
                  ) : availableTournaments.length > 0 ? (
                    <div className="space-y-3">
                      {availableTournaments.map((t) => (
                        <Card key={t.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setEnrollDialogOpen(false); navigate('tournament'); }}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Trophy className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{t.name}</p>
                                {t.description && (
                                  <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                                )}
                                {t.nextStage && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Badge variant="secondary" className="text-[10px] mr-1">Next Stage</Badge>
                                    {t.nextStage.name} · Starts{' '}
                                    {new Date(t.nextStage.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No available tournaments at this time</p>
                      <p className="text-xs text-muted-foreground mt-1">Check back later for new opportunities!</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Stats Cards */}
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

            {/* Quick Actions */}
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

            {/* Notifications + Recent Activity */}
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
