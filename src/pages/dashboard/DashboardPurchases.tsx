'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Star,
  Zap,
  Crown,
  Gift,
  Check,
  Loader2,
  Inbox,
  Receipt,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

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

interface PurchasedVote {
  id: string;
  userId: string;
  packageId: string;
  votesAmount: number;
  votesUsed: number;
  createdAt: string;
  package?: { id: string; name: string; votes: number; price: number; bonusVotes: number };
}

interface UserStatsData {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
}

const packageIcons = [Star, Zap, Crown, Gift];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function DashboardPurchases() {
  const { token } = useAuthStore();
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [purchases, setPurchases] = useState<PurchasedVote[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [confirmPurchase, setConfirmPurchase] = useState<VotePackage | null>(null);
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(1);

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
      // fallback
    }
  }, [token]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success) {
        const activePackages = (data.data || []).filter((p: VotePackage) => p.isActive);
        setPackages(activePackages);
      }
    } catch {
      // fallback
    }
  }, []);

  const fetchPurchases = useCallback(
    async (page: number = 1) => {
      try {
        const res = await fetch(`/api/user/purchases?page=${page}&limit=10`, { headers });
        const data = await res.json();
        if (data.success) {
          setPurchases(data.data || []);
          if (data.pagination) {
            setPurchaseTotalPages(data.pagination.totalPages || 1);
          }
        }
      } catch {
        // fallback
      }
    },
    [token]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPackages(), fetchPurchases(1)]);
      setLoading(false);
    }
    fetchData();
  }, [fetchStats, fetchPackages, fetchPurchases]);

  useEffect(() => {
    if (!loading) {
      fetchPurchases(purchasePage);
    }
  }, [loading, purchasePage, fetchPurchases]);

  const handlePurchase = async (pkg: VotePackage) => {
    setPurchasingId(pkg.id);
    setConfirmPurchase(null);
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers,
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();

      if (data.success) {
        const totalVotes = pkg.votes + pkg.bonusVotes;
        toast.success(`${pkg.name} purchased! You received ${totalVotes} votes.`);
        await fetchStats();
        await fetchPurchases(1);
        setPurchasePage(1);
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setPurchasingId(null);
    }
  };

  const usedVotes = stats ? stats.purchasedVotes - stats.availableVotes : 0;
  const usedPercent = stats?.purchasedVotes
    ? Math.round((usedVotes / stats.purchasedVotes) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">
                Vote <span className="gradient-text">Packages</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Purchase votes to support your favorites
              </p>
            </motion.div>

            {/* Available Votes Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-primary/10">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Paid Votes</p>
                        <p className="text-3xl font-bold">
                          {loading ? (
                            <Skeleton className="h-9 w-20 inline-block" />
                          ) : (
                            (stats?.availableVotes ?? 0).toLocaleString()
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Purchased</p>
                        <p className="text-lg font-semibold">
                          {loading ? '...' : (stats?.purchasedVotes ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-lg font-semibold">{loading ? '...' : usedVotes}</p>
                      </div>
                    </div>
                  </div>
                  {!loading && stats?.purchasedVotes ? (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{usedPercent}% used</span>
                        <span>{stats.availableVotes} remaining</span>
                      </div>
                      <Progress value={usedPercent} className="h-2" />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            {/* Vote Packages Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Available Packages
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 rounded-2xl" />
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg, i) => {
                    const Icon = packageIcons[i % packageIcons.length];
                    const isPurchasing = purchasingId === pkg.id;
                    const totalVotes = pkg.votes + pkg.bonusVotes;
                    const priceFormatted = pkg.price.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    });

                    return (
                      <motion.div
                        key={pkg.id}
                        custom={i}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card
                          className={`relative overflow-hidden h-full transition-all hover:shadow-lg ${
                            pkg.isPopular
                              ? 'border-2 border-primary shadow-md shadow-primary/10'
                              : ''
                          }`}
                        >
                          {pkg.isPopular && (
                            <div className="absolute top-0 right-0">
                              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                MOST POPULAR
                              </div>
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-sm">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold">{pkg.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {pkg.votes} votes
                                  {pkg.bonusVotes > 0 && ` + ${pkg.bonusVotes} bonus`}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1" />

                            <div className="space-y-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{priceFormatted}</span>
                              </div>

                              {pkg.bonusVotes > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Gift className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    +{pkg.bonusVotes} bonus votes free!
                                  </span>
                                </div>
                              )}

                              <Button
                                className={`w-full rounded-xl ${
                                  pkg.isPopular
                                    ? 'bg-primary hover:bg-primary/90'
                                    : 'bg-primary hover:bg-primary/90'
                                }`}
                                onClick={() => setConfirmPurchase(pkg)}
                                disabled={isPurchasing}
                              >
                                {isPurchasing ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 mr-2" />
                                )}
                                Buy Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground">No packages available at the moment</p>
                </Card>
              )}
            </motion.div>

            {/* Purchase Confirmation Dialog */}
            <AlertDialog
              open={!!confirmPurchase}
              onOpenChange={(open) => !open && setConfirmPurchase(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to purchase{' '}
                    <span className="font-semibold text-foreground">
                      {confirmPurchase?.name}
                    </span>{' '}
                    for{' '}
                    <span className="font-semibold text-foreground">
                      {confirmPurchase?.price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </span>
                    . This will give you{' '}
                    <span className="font-semibold text-foreground">
                      {confirmPurchase ? confirmPurchase.votes + confirmPurchase.bonusVotes : 0} votes
                    </span>
                    {confirmPurchase?.bonusVotes ? (
                      <span className="text-green-600"> (includes {confirmPurchase.bonusVotes} bonus)</span>
                    ) : null}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-primary hover:bg-primary/90 rounded-xl"
                    onClick={() => confirmPurchase && handlePurchase(confirmPurchase)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Confirm Purchase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Purchase History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : purchases.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Package</TableHead>
                              <TableHead>Votes</TableHead>
                              <TableHead>Remaining</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchases.map((purchase) => {
                              const remaining = purchase.votesAmount - purchase.votesUsed;
                              const usedPct = purchase.votesAmount
                                ? Math.round((purchase.votesUsed / purchase.votesAmount) * 100)
                                : 0;

                              return (
                                <TableRow key={purchase.id}>
                                  <TableCell className="font-medium text-sm">
                                    {purchase.package?.name || 'Package'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1.5 min-w-[140px]">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                          {purchase.votesUsed}/{purchase.votesAmount} used
                                        </span>
                                        <span className="font-medium">{usedPct}%</span>
                                      </div>
                                      <Progress value={usedPct} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`text-xs border-0 ${
                                        remaining > 0
                                          ? 'bg-primary/10 text-primary'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {remaining} left
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {purchaseTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Page {purchasePage} of {purchaseTotalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => setPurchasePage((p) => Math.max(1, p - 1))}
                              disabled={purchasePage <= 1}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() =>
                                setPurchasePage((p) => Math.min(purchaseTotalPages, p + 1))
                              }
                              disabled={purchasePage >= purchaseTotalPages}
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
                      <h3 className="font-semibold mb-1">No purchases yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchase a vote package to get started
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
