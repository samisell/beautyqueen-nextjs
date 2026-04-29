'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  Heart,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  UserPlus,
  BarChart3,
  Trophy,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import type { AdminStats, TournamentStage } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// Simple mock chart component using divs since recharts may be heavy
function SimpleBarChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((value, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex-1 bg-gradient-to-t from-primary to-amber-400 rounded-t-md min-h-[4px]"
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { navigate } = useNavigationStore();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    { id: string; action: string; detail: string; time: string }[]
  >([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  // Mock activity data
  useEffect(() => {
    setRecentActivity([
      { id: '1', action: 'New Registration', detail: 'jane@example.com joined', time: '2 min ago' },
      { id: '2', action: 'Vote Cast', detail: 'Free vote for Contestant #3', time: '5 min ago' },
      { id: '3', action: 'Purchase', detail: 'Premium Pack ($9.99) purchased', time: '12 min ago' },
      { id: '4', action: 'New Registration', detail: 'mark@example.com joined via referral', time: '18 min ago' },
      { id: '5', action: 'Vote Cast', detail: 'Paid vote for Contestant #1', time: '25 min ago' },
    ]);
  }, []);

  const mockWeeklyVotes = [45, 62, 38, 71, 55, 89, 67];
  const mockCategoryData = [
    { name: 'Miss Photogenic', votes: 245 },
    { name: 'Miss Talent', votes: 189 },
    { name: 'Miss Popularity', votes: 312 },
    { name: 'People\'s Choice', votes: 278 },
  ];

  const adminStatCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      change: '+12%',
    },
    {
      label: 'Total Contestants',
      value: stats?.totalContestants ?? 0,
      icon: Crown,
      color: 'from-primary to-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      change: '+3',
    },
    {
      label: 'Total Votes',
      value: stats?.totalVotes ?? 0,
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      change: '+156 today',
    },
    {
      label: 'Revenue',
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      change: '+$42.50',
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have admin privileges</p>
          <Button onClick={() => navigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    <span className="gradient-text">Admin</span> Dashboard
                  </h1>
                  <Badge className="bg-primary text-primary-foreground">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Platform management and analytics
                </p>
              </div>
              {stats?.activeStage && (
                <Card className="border-primary/20 bg-primary/5 shrink-0">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Stage</p>
                      <p className="text-sm font-semibold">{stats.activeStage.name}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))
                : adminStatCards.map((stat, i) => (
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
                              <stat.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                              <ArrowUpRight className="w-3 h-3" />
                              {stat.change}
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Votes Over Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Votes This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleBarChart data={mockWeeklyVotes} label="Daily vote distribution" />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Votes by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCategoryData.map((cat) => (
                        <div key={cat.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-muted-foreground">{cat.votes} votes</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(cat.votes / Math.max(...mockCategoryData.map((c) => c.votes))) * 100}%`,
                              }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-amber-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      onClick={() => navigate('leaderboard')}
                    >
                      <Crown className="w-4 h-4 mr-2 text-primary" />
                      Manage Contestants
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                    >
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      View Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                    >
                      <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                      View Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      Manage Stages
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Detail</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentActivity.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell className="font-medium text-sm">
                                {activity.action}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {activity.detail}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground text-right">
                                {activity.time}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
