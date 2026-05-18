'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  Inbox,
  Star,
  Zap,
  Trophy,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Link,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface ReferralData {
  id: string;
  referrerId: string;
  referredId: string;
  bonusVotes: number;
  createdAt: string;
  referred: { name: string; email: string; createdAt: string };
}

interface UserStatsData {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
}

export default function DashboardReferrals() {
  const { user, token } = useAuthStore();
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats', { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      // fallback
    }
  }

  async function fetchReferrals(p: number = 1) {
    try {
      const res = await fetch(`/api/referrals?page=${p}&limit=10`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setReferrals(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch {
      // fallback
    }
  }

  async function fetchReferralLink() {
    try {
      const res = await fetch('/api/referral-link', { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.data) {
        setReferralCode(data.data.referralCode || '');
        setReferralUrl(
          data.data.referralUrl || `${window.location.origin}/register?ref=${data.data.referralCode}`
        );
      }
    } catch {
      // fallback to user store
      if (user?.referralCode) {
        setReferralCode(user.referralCode);
        setReferralUrl(`${window.location.origin}/register?ref=${user.referralCode}`);
      }
    }
  }

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchReferrals(1), fetchReferralLink()]);
      setLoading(false);
      setInitialLoad(false);
    }
    fetchData();
  }, [token, user]);

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    if (!initialLoad && !loading) {
      await fetchReferrals(newPage);
    }
  };

  const handleCopyLink = () => {
    const link = referralUrl || `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const howItWorks = [
    {
      icon: Share2,
      title: 'Share Your Link',
      desc: 'Send your unique referral link to friends and family',
      step: 1,
      color: 'from-primary to-orange-500',
    },
    {
      icon: UserPlus,
      title: 'They Register',
      desc: 'When someone signs up using your link, they get connected to you',
      step: 2,
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: PartyPopper,
      title: 'Earn Bonus Votes',
      desc: 'You both earn 5 bonus votes for each successful referral',
      step: 3,
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  const fullReferralUrl =
    referralUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.referralCode || '...'}`;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Referrals</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Earn bonus votes by inviting friends
              </p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Referrals</p>
                        <p className="text-2xl font-bold">
                          {loading ? (
                            <Skeleton className="h-8 w-12 inline-block" />
                          ) : (
                            stats?.referralCount ?? 0
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bonus Votes Earned</p>
                        <p className="text-2xl font-bold">
                          {loading ? (
                            <Skeleton className="h-8 w-12 inline-block" />
                          ) : (
                            stats?.referralBonusVotes ?? 0
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Referral Link Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">My Referral Link</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this link with friends to earn 5 bonus votes for each signup
                  </p>

                  {/* Referral Code Display */}
                  {loading ? (
                    <Skeleton className="h-10 w-full rounded-xl mb-3" />
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono truncate">
                          {fullReferralUrl}
                        </div>
                        <Button
                          className="rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                          onClick={handleCopyLink}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Referral Code Badge */}
                      {referralCode && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Your referral code:</p>
                          <Badge
                            variant="secondary"
                            className="font-mono text-sm px-3 py-1"
                          >
                            {referralCode}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* How Referrals Work */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold mb-4">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {howItWorks.map((step) => (
                  <Card key={step.title} className="text-center">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-center mb-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}
                        >
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Referral List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Your Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : referrals.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[48px]">#</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Date Joined</TableHead>
                              <TableHead>Bonus Votes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referrals.map((ref, index) => (
                              <TableRow key={ref.id}>
                                <TableCell className="text-sm text-muted-foreground">
                                  {(page - 1) * 10 + index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                      {(ref.referred?.name || 'U').charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {ref.referred?.name || 'Unknown'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {ref.referred?.email || '—'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(ref.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs border-0">
                                    +{ref.bonusVotes} votes
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handlePageChange(Math.max(1, page - 1))}
                              disabled={page <= 1}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                              disabled={page >= totalPages}
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">No referrals yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your referral link to start earning bonus votes!
                      </p>
                      <Button
                        className="rounded-xl bg-primary hover:bg-primary/90"
                        onClick={handleCopyLink}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Referral Link
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
  );
}
