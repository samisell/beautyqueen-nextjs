'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Trophy,
  Star,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Crown,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { useNavigationStore } from '@/stores/navigation-store';
import { useVotingStore } from '@/stores/voting-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface Contestant {
  id: string;
  name: string;
  bio?: string;
  imageUrl: string;
  category: string;
  categoryId?: string;
  status: 'active' | 'eliminated' | 'winner';
  totalVotes: number;
  stageId?: string;
  createdAt: string;
}

interface VoteStatsData {
  totalVotes: number;
  freeVotes: number;
  paidVotes: number;
  referralVotes: number;
  todayVotes: number;
  userVoted: boolean;
}

interface VotePackage {
  id: string;
  name: string;
  votes: number;
  price: number;
  bonusVotes: number;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

interface UserStatsData {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
}

export default function VotingPage() {
  const { pageParams, navigate } = useNavigationStore();
  const contestantId = pageParams.id;
  const { isAuthenticated, token } = useAuthStore();
  const { incrementVote } = useVotingStore();

  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStatsData | null>(null);
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingPaid, setVotingPaid] = useState(false);
  const [votingReferral, setVotingReferral] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);
  const [copied, setCopied] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState(false);
  const [displayVotes, setDisplayVotes] = useState(0);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchContestant = useCallback(async () => {
    if (!contestantId) return;
    try {
      const res = await fetch(`/api/contestants/${contestantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContestant(data.data);
        setDisplayVotes(data.data.totalVotes);
      } else {
        setError('Contestant not found');
      }
    } catch {
      setError('Failed to load contestant');
    }
  }, [contestantId]);

  const fetchVoteStats = useCallback(async () => {
    if (!contestantId) return;
    try {
      const res = await fetch(`/api/vote-stats/${contestantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setVoteStats(data.data);
      }
    } catch {
      // fallback
    }
  }, [contestantId]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success && data.data) {
        setPackages(data.data.filter((p: VotePackage) => p.isActive));
      }
    } catch {
      // fallback
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch('/api/user/stats', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setUserStats(data.data);
      }
    } catch {
      // fallback
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchContestant(),
        fetchVoteStats(),
        fetchPackages(),
        fetchUserStats(),
      ]);
      setLoading(false);
    }
    loadAll();
  }, [fetchContestant, fetchVoteStats, fetchPackages, fetchUserStats]);

  // Animate vote count
  useEffect(() => {
    if (contestant && displayVotes < contestant.totalVotes) {
      const diff = contestant.totalVotes - displayVotes;
      const step = Math.max(1, Math.ceil(diff / 20));
      const timer = setTimeout(() => {
        setDisplayVotes((prev) => Math.min(prev + step, contestant.totalVotes));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [displayVotes, contestant]);

  const triggerVoteAnimation = () => {
    setVoteAnimation(true);
    setTimeout(() => setVoteAnimation(false), 1000);
  };

  const handlePaidVote = async () => {
    if (votingPaid) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to use paid votes');
      navigate('login');
      return;
    }

    setVotingPaid(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contestantId, voteType: 'paid' }),
      });
      const data = await res.json();

      if (data.success) {
        incrementVote(contestantId!);
        triggerVoteAnimation();
        toast.success('Paid vote cast! ⭐');
        fetchVoteStats();
        fetchUserStats();
      } else {
        toast.error(data.message || 'Failed to cast paid vote');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVotingPaid(false);
    }
  };

  const handleReferralVote = async () => {
    if (votingReferral) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to use referral votes');
      navigate('login');
      return;
    }

    setVotingReferral(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contestantId, voteType: 'referral' }),
      });
      const data = await res.json();

      if (data.success) {
        incrementVote(contestantId!);
        triggerVoteAnimation();
        toast.success('Referral vote cast! 🎁');
        fetchVoteStats();
        fetchUserStats();
      } else {
        toast.error(data.message || 'Failed to cast referral vote');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVotingReferral(false);
    }
  };

  const handlePurchase = (pkg: VotePackage) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to buy vote packages');
      navigate('login');
      return;
    }

    setSelectedPackage(pkg);
    setPaymentDialogOpen(true);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/vote/${contestantId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Contestant link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const availablePaidVotes = userStats?.availableVotes ?? 0;

  const handlePurchaseComplete = async () => {
    await fetchUserStats();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-[4/5] rounded-2xl" />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!contestant || error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="text-center space-y-4">
          <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold">Contestant not found</h2>
          <p className="text-sm text-muted-foreground">
            The contestant you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => navigate('leaderboard')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>
      </div>
    );
  }

  const priceFormatted = (price: number) =>
    price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const statusColors: Record<string, string> = {
    active: 'bg-green-500 text-white',
    eliminated: 'bg-red-500 text-white',
    winner: 'bg-amber-500 text-white',
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('leaderboard')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Contestant Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={contestant.imageUrl}
                alt={contestant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Vote count overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                  <span className="text-3xl font-bold">{displayVotes.toLocaleString()}</span>
                  <span className="text-white/70 text-sm">votes</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <Badge className={statusColors[contestant.status] || 'bg-gray-500 text-white'}>
                  {contestant.status.charAt(0).toUpperCase() + contestant.status.slice(1)}
                </Badge>
              </div>

              {/* Vote animation */}
              <AnimatePresence>
                {voteAnimation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                    animate={{ opacity: 1, y: -80, scale: 1.5 }}
                    exit={{ opacity: 0, y: -120 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <Heart className="w-16 h-16 fill-red-500 text-red-500 drop-shadow-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Contestant Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 space-y-5"
          >
            {/* Name and Category */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">{contestant.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {contestant.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Joined{' '}
                      {new Date(contestant.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl shrink-0"
                  onClick={handleShare}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <Share2 className="w-4 h-4 ml-1" />
                  Share
                </Button>
              </div>

              {contestant.bio && (
                <p className="text-muted-foreground mt-3 leading-relaxed">{contestant.bio}</p>
              )}
            </div>

            {/* Vote Stats Grid */}
            {voteStats && (
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-xl font-bold">{voteStats.totalVotes.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Total Votes</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-xl font-bold">{voteStats.paidVotes.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Purchased</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-xl font-bold">{voteStats.todayVotes}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Today</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator />

            {/* Vote Actions */}
            <div className="space-y-3">
              {/* Buy Votes Button - navigates to public-vote */}
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:opacity-90 shadow-primary/30 transition-all"
                  onClick={() => navigate('public-vote', { id: contestantId })}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Purchase Votes to Support {contestant.name}
                </Button>
              </motion.div>

              <p className="text-xs text-center text-muted-foreground">
                Purchase votes to support your favorite contestant and help them climb the leaderboard!
              </p>
            </div>

            {/* Vote Packages */}
            {packages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Boost with Vote Packages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => {
                    const isPurchasing = paymentDialogOpen && selectedPackage?.id === pkg.id;
                    const totalVotes = pkg.votes + pkg.bonusVotes;

                    return (
                      <Card
                        key={pkg.id}
                        className={`relative overflow-hidden transition-all hover:shadow-md ${
                          pkg.isPopular
                            ? 'border-2 border-primary shadow-sm shadow-primary/10'
                            : ''
                        }`}
                      >
                        {pkg.isPopular && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                              POPULAR
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{pkg.name}</h4>
                            <span className="text-lg font-bold text-primary">
                              {priceFormatted(pkg.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {pkg.votes} votes
                            </Badge>
                            {pkg.bonusVotes > 0 && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs border-0">
                                +{pkg.bonusVotes} bonus
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              = {totalVotes} total
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full rounded-xl bg-primary hover:bg-primary/90"
                            onClick={() => handlePurchase(pkg)}
                            disabled={isPurchasing}
                          >
                            {isPurchasing ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Buy Package
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Share Section */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Share this contestant with friends</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={handleShare}>
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <PaymentMethodSelector
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        selectedPackage={selectedPackage}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}
