'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Trophy,
  Users,
  Gift,
  Star,
  Zap,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigationStore } from '@/stores/navigation-store';
import { useVotingStore } from '@/stores/voting-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { Contestant, VoteStats, VotePackage } from '@/types';

export default function VotingPage() {
  const { pageParams, navigate } = useNavigationStore();
  const contestantId = pageParams.id;
  const { isAuthenticated, token } = useAuthStore();
  const { incrementVote, markVotedToday, hasVotedToday } = useVotingStore();

  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingFree, setVotingFree] = useState(false);
  const [votingPaid, setVotingPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState(false);
  const [displayVotes, setDisplayVotes] = useState(0);

  const fetchContestant = useCallback(async () => {
    if (!contestantId) return;
    try {
      const res = await fetch(`/api/contestants/${contestantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContestant(data.data);
        setDisplayVotes(data.data.totalVotes);
      }
    } catch {
      // fallback
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
        setPackages(data.data);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await Promise.all([fetchContestant(), fetchVoteStats(), fetchPackages()]);
      setLoading(false);
    }
    loadAll();
  }, [fetchContestant, fetchVoteStats, fetchPackages]);

  // Animate vote count
  useEffect(() => {
    if (contestant && displayVotes < contestant.totalVotes) {
      const timer = setTimeout(() => {
        setDisplayVotes((prev) => Math.min(prev + 1, contestant.totalVotes));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [displayVotes, contestant]);

  const handleFreeVote = async () => {
    if (votingFree || hasVotedToday[contestantId!]) return;

    if (!isAuthenticated) {
      toast.error('Please login to vote');
      navigate('login');
      return;
    }

    setVotingFree(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId,
          voteType: 'free',
        }),
      });
      const data = await res.json();

      if (data.success) {
        incrementVote(contestantId!);
        markVotedToday(contestantId!);
        setVoteAnimation(true);
        setTimeout(() => setVoteAnimation(false), 1000);
        toast.success('Free vote cast! 🎉');
        fetchVoteStats();
      } else {
        toast.error(data.message || 'Failed to cast vote');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVotingFree(false);
    }
  };

  const handlePaidVote = async () => {
    if (votingPaid) return;

    setVotingPaid(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contestantId,
          voteType: 'paid',
        }),
      });
      const data = await res.json();

      if (data.success) {
        incrementVote(contestantId!);
        setVoteAnimation(true);
        setTimeout(() => setVoteAnimation(false), 1000);
        toast.success('Paid vote cast! ⭐');
        fetchVoteStats();
      } else {
        toast.error(data.message || 'Failed to cast paid vote');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVotingPaid(false);
    }
  };

  const handlePurchase = async (pkg: VotePackage) => {
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`${pkg.name} purchased! You received ${pkg.votes + pkg.bonusVotes} votes.`);
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?ref=${contestantId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contestant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg text-muted-foreground">Contestant not found</p>
          <Button onClick={() => navigate('leaderboard')}>Back to Leaderboard</Button>
        </div>
      </div>
    );
  }

  const hasVoted = hasVotedToday[contestantId!];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('leaderboard')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contestant Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shine">
              <img
                src={contestant.imageUrl}
                alt={contestant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Vote count overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  <span className="text-3xl font-bold">{displayVotes.toLocaleString()}</span>
                  <span className="text-white/70 text-sm">votes</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <Badge
                  className={
                    contestant.status === 'active'
                      ? 'bg-green-500 text-white'
                      : contestant.status === 'winner'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-500 text-white'
                  }
                >
                  {contestant.status.charAt(0).toUpperCase() + contestant.status.slice(1)}
                </Badge>
              </div>

              {/* Vote animation */}
              <AnimatePresence>
                {voteAnimation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                    animate={{ opacity: 1, y: -60, scale: 1.5 }}
                    exit={{ opacity: 0, y: -100 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Name and Category */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">{contestant.name}</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {contestant.category}
                  </Badge>
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
                </Button>
              </div>

              {contestant.bio && (
                <p className="text-muted-foreground mt-3 leading-relaxed">{contestant.bio}</p>
              )}
            </div>

            {/* Vote Stats */}
            {voteStats && (
              <Card className="border-2 border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Vote Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-bold">{voteStats.freeVotes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Free Votes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-2xl font-bold">{voteStats.paidVotes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Paid Votes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Gift className="w-4 h-4 text-green-500" />
                        <span className="text-2xl font-bold">{voteStats.referralVotes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Referral Votes</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Today&apos;s votes</span>
                      <span>{voteStats.todayVotes}</span>
                    </div>
                    <Progress
                      value={Math.min((voteStats.todayVotes / 50) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Vote Buttons */}
            <div className="space-y-3">
              {/* Free Vote Button */}
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className={`w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all ${
                    hasVoted
                      ? 'bg-green-500 hover:bg-green-500 shadow-green-500/25'
                      : 'bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:opacity-90 shadow-primary/30'
                  }`}
                  onClick={handleFreeVote}
                  disabled={votingFree || hasVoted}
                >
                  {votingFree ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  <Heart className={`w-5 h-5 mr-2 ${hasVoted ? 'fill-white' : ''}`} />
                  {hasVoted ? 'Voted Today ✓' : 'Cast Free Vote'}
                </Button>
              </motion.div>

              {/* Paid Vote Button (authenticated only) */}
              {isAuthenticated && (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/5"
                    onClick={handlePaidVote}
                    disabled={votingPaid}
                  >
                    {votingPaid ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    <Star className="w-4 h-4 mr-2" />
                    Use Paid Vote
                  </Button>
                </motion.div>
              )}

              {!isAuthenticated && (
                <p className="text-center text-sm text-muted-foreground">
                  <button
                    onClick={() => navigate('login')}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>{' '}
                  to unlock paid votes and more features
                </p>
              )}
            </div>

            {/* Vote Packages */}
            {packages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Boost with Vote Packages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.slice(0, 4).map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={`relative overflow-hidden ${
                        pkg.isPopular ? 'border-2 border-primary shadow-lg shadow-primary/10' : ''
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
                          <span className="text-lg font-bold text-primary">${pkg.price}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {pkg.votes} votes
                          </Badge>
                          {pkg.bonusVotes > 0 && (
                            <Badge className="bg-green-100 text-green-700 text-xs border-0">
                              +{pkg.bonusVotes} bonus
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-primary hover:bg-primary/90"
                          onClick={() => handlePurchase(pkg)}
                        >
                          Buy Package
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
