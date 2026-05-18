'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  Trophy,
  Copy,
  Check,
  Crown,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Package,
  User,
  Mail,
  Loader2,
  Share2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigationStore } from '@/stores/navigation-store';
import { toast } from 'sonner';

// ────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────
interface ContestantData {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl: string;
  category: string;
  status: string;
  totalVotes: number;
  voteCount: number;
  stage?: {
    id: string;
    name: string;
    tournament?: { id: string; name: string };
  } | null;
  categoryRel?: {
    id: string;
    name: string;
  } | null;
}

interface VotePackage {
  id: string;
  name: string;
  votes: number;
  price: number;
  bonusVotes: number;
  totalVotes: number;
  isPopular: boolean;
  order: number;
  purchaseCount: number;
}

interface PaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string | null;
    reference: string;
    amount: number;
    votes: number;
    contestant: {
      id: string;
      name: string;
      imageUrl: string;
    };
    platform: {
      votePrice: string;
      currency: string;
      platformName: string;
    };
    message?: string;
  };
  error?: string;
  message?: string;
}

interface VerifyResponse {
  success: boolean;
  data?: {
    paymentId: string;
    status: string;
    message: string;
    votesCredited: number;
    contestantId: string;
    contestantName: string | null;
  };
  error?: string;
  message?: string;
}

// ────────────────────────────────────────────
// Animation variants
// ────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as any },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as any },
  },
};

const checkmarkAnim = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { delay: 0.2, duration: 0.6, ease: 'easeOut' as any },
  },
};

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export default function PublicVotingPage() {
  const { navigate, pageParams } = useNavigationStore();
  const contestantId = pageParams?.id || '';

  // Data state
  const [contestant, setContestant] = useState<ContestantData | null>(null);
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Form state
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');

  // Payment state
  const [processing, setProcessing] = useState(false);

  // Success state
  const [successData, setSuccessData] = useState<{
    contestantName: string;
    votesAdded: number;
    newTotal: number;
  } | null>(null);

  // ────────────────────────────────────────────
  // Fetch data
  // ────────────────────────────────────────────
  const fetchContestant = useCallback(async () => {
    if (!contestantId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/contestants/${contestantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContestant(data.data);
      } else {
        toast.error(data.error || 'Contestant not found');
      }
    } catch {
      toast.error('Failed to load contestant');
    } finally {
      setLoading(false);
    }
  }, [contestantId]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.data || []);
      }
    } catch {
      toast.error('Failed to load vote packages');
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContestant();
    fetchPackages();
  }, [fetchContestant, fetchPackages]);

  // ────────────────────────────────────────────
  // Handle payment
  // ────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!contestantId) {
      toast.error('No contestant selected');
      return;
    }
    if (!selectedPackage) {
      toast.error('Please select a vote package');
      return;
    }
    if (!payerEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/public-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId,
          packageId: selectedPackage.id,
          payerEmail: payerEmail.trim(),
          payerName: payerName.trim() || undefined,
        }),
      });
      const data: PaymentResponse = await res.json();

      if (data.success && data.data) {
        const reference = data.data.reference;

        // Mock mode: paymentUrl is null, auto-verify
        if (!data.data.paymentUrl) {
          // Auto-verify the payment
          const verifyRes = await fetch('/api/public-vote/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
          });
          const verifyData: VerifyResponse = await verifyRes.json();

          if (verifyData.success && verifyData.data) {
            setSuccessData({
              contestantName: verifyData.data.contestantName || contestant?.name || 'Contestant',
              votesAdded: verifyData.data.votesCredited,
              newTotal: (contestant?.totalVotes || 0) + verifyData.data.votesCredited,
            });
            toast.success(verifyData.data.message || 'Votes credited successfully!');
          } else {
            toast.error(verifyData.error || verifyData.message || 'Payment verification failed');
          }
        } else {
          // Real payment: redirect to gateway
          window.location.href = data.data.paymentUrl;
        }
      } else {
        toast.error(data.error || data.message || 'Payment initiation failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ────────────────────────────────────────────
  // Share handler
  // ────────────────────────────────────────────
  const handleShareContestant = () => {
    const link = `${window.location.origin}/vote/${contestantId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  // ────────────────────────────────────────────
  // Currency helper
  // ────────────────────────────────────────────
  const formatPrice = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // ────────────────────────────────────────────
  // Render: Success state
  // ────────────────────────────────────────────
  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 px-8 py-10 text-center">
              <motion.div
                variants={checkmarkAnim}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-5"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                Votes Credited Successfully!
              </motion.h2>
            </div>
            <CardContent className="p-6 space-y-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center space-y-3"
              >
                <div className="flex items-center justify-center gap-2">
                  {contestant?.imageUrl && (
                    <img
                      src={contestant.imageUrl}
                      alt={successData.contestantName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <p className="text-lg font-semibold">{successData.contestantName}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-5 space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      +{successData.votesAdded}
                    </p>
                    <p className="text-xs text-muted-foreground">Votes Added</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xl font-bold">
                      {successData.newTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">New Total Votes</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2 pt-2"
              >
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
                  onClick={() => navigate('leaderboard')}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Vote for Another Contestant
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={handleShareContestant}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share This Contestant
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // Render: Main page
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => navigate('leaderboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">Vote for a Contestant</h1>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Public Voting
          </Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Contestant Card */}
        {loading ? (
          <Card className="border-0 shadow-sm overflow-hidden">
            <Skeleton className="h-40" />
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ) : contestant ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 shadow-sm overflow-hidden">
              {/* Contestant header with gradient */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-6 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 overflow-hidden flex-shrink-0 shadow-lg">
                    {contestant.imageUrl ? (
                      <img
                        src={contestant.imageUrl}
                        alt={contestant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {contestant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Crown className="w-5 h-5 text-yellow-200" />
                      <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                        {contestant.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {contestant.category && (
                        <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                          {contestant.category}
                        </Badge>
                      )}
                      {contestant.stage?.tournament?.name && (
                        <Badge variant="secondary" className="text-xs bg-white/15 text-white border-0 backdrop-blur-sm">
                          {contestant.stage.tournament.name}
                        </Badge>
                      )}
                    </div>
                    {contestant.bio && (
                      <p className="text-white/70 text-sm mt-2 line-clamp-2">{contestant.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-5 text-center">
                    <Heart className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {(contestant.totalVotes || contestant.voteCount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total Votes</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-2xl p-5 text-center">
                    <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                      #
                      {contestant.stage?.tournament?.name
                        ? 'Active'
                        : 'Competing'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center">
              <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-1">Contestant Not Found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The contestant you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                onClick={() => navigate('leaderboard')}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Browse Leaderboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vote Packages */}
        {contestant && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                Select Vote Package
              </h2>

              {packagesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg, i) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <motion.div
                        key={pkg.id}
                        custom={i}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? 'border-2 border-orange-500 ring-2 ring-orange-500/20'
                              : 'border-0 shadow-sm'
                          }`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <CardContent className="p-5 relative">
                            {pkg.isPopular && (
                              <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-[10px] px-2 py-0.5">
                                <Sparkles className="w-3 h-3 mr-0.5" />
                                Popular
                              </Badge>
                            )}

                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-sm">{pkg.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {pkg.votes} votes
                                  {pkg.bonusVotes > 0 && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      {' '}+ {pkg.bonusVotes} bonus
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {formatPrice(pkg.price)}
                                </p>
                              </div>
                            </div>

                            {/* Total votes indicator */}
                            <div className={`rounded-xl p-3 text-center ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
                                : 'bg-muted/50'
                            }`}>
                              <div className="flex items-center justify-center gap-1.5">
                                <Gift className="w-4 h-4 text-orange-500" />
                                <span className={`text-sm font-bold ${isSelected ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                  {pkg.totalVotes} Total Votes
                                </span>
                              </div>
                              {pkg.bonusVotes > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Includes {Math.round((pkg.bonusVotes / pkg.votes) * 100)}% bonus votes
                                </p>
                              )}
                            </div>

                            {/* Selection indicator */}
                            {isSelected && (
                              <div className="absolute top-3 left-3">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No vote packages available</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Payment Form */}
            {selectedPackage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Complete Your Vote
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Selected package summary */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{selectedPackage.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPackage.votes} votes + {selectedPackage.bonusVotes} bonus
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{formatPrice(selectedPackage.price)}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPackage.totalVotes} total votes
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Payer details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="payer-name" className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Your Name (optional)
                        </Label>
                        <Input
                          id="payer-name"
                          placeholder="Enter your name"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payer-email" className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="payer-email"
                          type="email"
                          placeholder="you@example.com"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          required
                          className="rounded-xl"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Required to receive your payment receipt
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Proceed button */}
                    <Button
                      className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-base py-6 shadow-lg shadow-orange-500/20"
                      onClick={handleProceedToPayment}
                      disabled={processing || !payerEmail.trim()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Proceed to Payment
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-[11px] text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 inline mr-1" />
                      Secure payment powered by Paystack. Your data is protected.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
