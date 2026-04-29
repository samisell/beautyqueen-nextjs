'use client';

import { useState, useEffect } from 'react';
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
import type { VotePackage, PurchasedVote, UserStats } from '@/types';

export default function DashboardPurchases() {
  const { token } = useAuthStore();
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [purchases, setPurchases] = useState<PurchasedVote[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [pkgRes, purchaseRes, statsRes] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/user/purchases', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/user/stats', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const pkgData = await pkgRes.json();
        const purchaseData = await purchaseRes.json();
        const statsData = await statsRes.json();

        if (pkgData.success) setPackages(pkgData.data || []);
        if (purchaseData.success) setPurchases(purchaseData.data || []);
        if (statsData.success) setStats(statsData.data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handlePurchase = async (pkg: VotePackage) => {
    setPurchasingId(pkg.id);
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
        toast.success(`${pkg.name} purchased! +${pkg.votes + pkg.bonusVotes} votes`);
        // Refresh purchases and stats
        const [purchaseRes, statsRes] = await Promise.all([
          fetch('/api/user/purchases', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/user/stats', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);
        const purchaseData = await purchaseRes.json();
        const statsData = await statsRes.json();
        if (purchaseData.success) setPurchases(purchaseData.data || []);
        if (statsData.success) setStats(statsData.data);
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setPurchasingId(null);
    }
  };

  const packageIcons = [Star, Zap, Crown, Gift];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Vote <span className="gradient-text">Packages</span>
              </h1>
              <p className="text-muted-foreground mt-1">Purchase votes to support your favorites</p>
            </motion.div>

            {/* Available Votes Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Paid Votes</p>
                        <p className="text-3xl font-bold">
                          {loading ? '...' : (stats?.availableVotes ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Purchased</p>
                      <p className="text-lg font-semibold">
                        {loading ? '...' : (stats?.purchasedVotes ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vote Packages Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${
                            pkg.isPopular ? 'border-2 border-primary shadow-lg shadow-primary/10' : ''
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
                                <span className="text-3xl font-bold">${pkg.price}</span>
                                <span className="text-sm text-muted-foreground">one-time</span>
                              </div>

                              {pkg.bonusVotes > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Gift className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-green-600 font-medium">
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
                                onClick={() => handlePurchase(pkg)}
                                disabled={isPurchasing}
                              >
                                {isPurchasing ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 mr-2" />
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
                  <p className="text-muted-foreground">No packages available</p>
                </Card>
              )}
            </motion.div>

            {/* Purchase History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Package</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead>Used</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-medium text-sm">
                                {purchase.package?.name || 'Package'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {purchase.votesAmount}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{purchase.votesUsed}</TableCell>
                              <TableCell>
                                <Badge className="bg-primary/10 text-primary text-xs border-0">
                                  {purchase.votesAmount - purchase.votesUsed} left
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(purchase.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground">No purchases yet</p>
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
