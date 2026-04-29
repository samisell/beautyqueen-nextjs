'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { UserStats, Notification } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function DashboardOverview() {
  const { navigate } = useNavigationStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, notifRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/user/notifications'),
        ]);

        const statsData = await statsRes.json();
        const notifData = await notifRes.json();

        if (statsData.success) setStats(statsData.data);
        if (notifData.success) setNotifications(notifData.data || []);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleShareReferral = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statCards = [
    {
      label: 'Total Votes Cast',
      value: stats?.totalVotes ?? 0,
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: 'Available Paid Votes',
      value: stats?.availableVotes ?? 0,
      icon: Star,
      color: 'from-amber-500 to-yellow-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Referrals',
      value: stats?.referralCount ?? 0,
      icon: Users,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Referral Bonus',
      value: stats?.referralBonusVotes ?? 0,
      icon: Gift,
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
  ];

  const quickActions = [
    {
      label: 'Vote Now',
      icon: Trophy,
      desc: 'Browse contestants and cast your votes',
      action: () => navigate('leaderboard'),
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    {
      label: 'Buy Votes',
      icon: ShoppingBag,
      desc: 'Get more votes with premium packages',
      action: () => navigate('dashboard-purchases'),
      color: 'bg-amber-500 hover:bg-amber-500/90 text-white',
    },
    {
      label: 'Share Referral',
      icon: Share2,
      desc: 'Earn bonus votes by inviting friends',
      action: handleShareReferral,
      color: 'bg-emerald-500 hover:bg-emerald-500/90 text-white',
    },
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '💡';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back,{' '}
                <span className="gradient-text">{user?.name || 'Voter'}</span>!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here&apos;s your voting dashboard overview
              </p>
            </motion.div>

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
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                              <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'var(--primary)' }} />
                            </div>
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
              transition={{ delay: 0.3 }}
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
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shadow-sm`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{action.label}</h3>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Notifications
                      {notifications.some((n) => !n.isRead) && (
                        <Badge className="bg-primary text-primary-foreground ml-auto">
                          New
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 rounded-xl" />
                        ))}
                      </div>
                    ) : notifications.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="space-y-2">
                          {notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                !notif.isRead ? 'bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <span className="text-lg mt-0.5">
                                {getNotifIcon(notif.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{notif.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {new Date(notif.createdAt).toLocaleDateString()}
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
                transition={{ delay: 0.5 }}
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
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 rounded-xl" />
                        ))}
                      </div>
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
