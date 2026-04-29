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
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { Referral, UserStats } from '@/types';

export default function DashboardReferrals() {
  const { user, token } = useAuthStore();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [refRes, statsRes, linkRes] = await Promise.all([
          fetch('/api/referrals', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/user/stats', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/referral-link', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const refData = await refRes.json();
        const statsData = await statsRes.json();
        const linkData = await linkRes.json();

        if (refData.success) setReferrals(refData.data || []);
        if (statsData.success) setStats(statsData.data);
        if (linkData.success && linkData.data) setReferralLink(linkData.data.link || '');
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleCopyLink = () => {
    const link = referralLink || `${window.location.origin}?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const howItWorks = [
    {
      icon: Share2,
      title: 'Share Your Link',
      desc: 'Send your unique referral link to friends and family',
      color: 'from-primary to-orange-500',
    },
    {
      icon: UserPlus,
      title: 'They Register',
      desc: 'When someone signs up using your link, they get connected to you',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: Gift,
      title: 'Earn Bonus Votes',
      desc: 'You receive 5 bonus votes for each successful referral',
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Referrals</span>
              </h1>
              <p className="text-muted-foreground mt-1">Earn bonus votes by inviting friends</p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                          {loading ? '...' : (stats?.referralCount ?? 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
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
                          {loading ? '...' : (stats?.referralBonusVotes ?? 0)}
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
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Your Referral Link</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this link with friends to earn 5 bonus votes for each signup
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono truncate">
                      {referralLink || `${window.location.origin}?ref=${user?.referralCode || '...'}`}
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
                  {/* Share Buttons (Mock) */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">Share via:</span>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs" disabled>
                      <Share2 className="w-3 h-3 mr-1" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs" disabled>
                      <Share2 className="w-3 h-3 mr-1" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs" disabled>
                      <Share2 className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* How Referrals Work */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {howItWorks.map((step, i) => (
                  <Card key={step.title} className="text-center">
                    <CardContent className="p-5">
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-sm`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Referral List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Date Joined</TableHead>
                            <TableHead>Bonus Votes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referrals.map((ref) => (
                            <TableRow key={ref.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {(ref.referred?.name || 'U').charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {ref.referred?.name || 'Unknown'}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {ref.referred?.email || ''}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(ref.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700 text-xs border-0">
                                  +{ref.bonusVotes} votes
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">No referrals yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your referral link to start earning bonus votes
                      </p>
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
