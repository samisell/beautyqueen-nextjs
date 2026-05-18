'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface PendingPayment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  reference?: string;
  proofImageUrl?: string;
  adminNote?: string;
  totalVotes: number;
  packageName: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStatsData {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const packageIcons = [Star, Zap, Crown, Gift];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as any },
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPurchases() {
  const { token } = useAuthStore();
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [purchases, setPurchases] = useState<PurchasedVote[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(1);

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);

  // Proof preview dialog
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // ──────────────────────────────────────────────
  // Fetch functions
  // ──────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/stats', { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* fallback */ }
  }, [headers]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success) {
        const activePackages = (data.data || []).filter((p: VotePackage) => p.isActive);
        setPackages(activePackages);
      }
    } catch { /* fallback */ }
  }, []);

  const fetchPurchases = useCallback(async (page: number = 1) => {
    try {
      const res = await fetch(`/api/user/purchases?page=${page}&limit=10`, { headers });
      const data = await res.json();
      if (data.success) {
        // New format wraps purchases in data.purchases
        if (data.data && typeof data.data === 'object' && 'purchases' in data.data) {
          setPurchases(data.data.purchases || []);
          setPendingPayments(data.data.pendingPayments || []);
        } else {
          // Legacy format: data is directly the array
          setPurchases(Array.isArray(data.data) ? data.data : []);
          setPendingPayments([]);
        }
        if (data.pagination) {
          setPurchaseTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch { /* fallback */ }
  }, [headers]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPackages(), fetchPurchases(1)]);
      setLoading(false);
    }
    fetchData();
  }, [fetchStats, fetchPackages, fetchPurchases]);

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────

  function handleBuyClick(pkg: VotePackage) {
    setSelectedPackage(pkg);
    setPaymentDialogOpen(true);
  }

  function handlePurchaseComplete() {
    fetchStats();
    fetchPurchases(purchasePage);
  }

  function viewProof(imageUrl: string) {
    setProofImageUrl(imageUrl);
    setProofDialogOpen(true);
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  const usedVotes = stats ? stats.purchasedVotes - stats.availableVotes : 0;
  const usedPercent = stats?.purchasedVotes
    ? Math.round((usedVotes / stats.purchasedVotes) * 100)
    : 0;

  function paymentMethodIcon(method: string) {
    switch (method) {
      case 'paystack': return <CreditCard className="w-3.5 h-3.5" />;
      case 'flutterwave': return <Zap className="w-3.5 h-3.5" />;
      case 'offline': return <Building2 className="w-3.5 h-3.5" />;
      default: return <ShoppingBag className="w-3.5 h-3.5" />;
    }
  }

  function paymentStatusBadge(status: string) {
    switch (status) {
      case 'awaiting_review':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Awaiting Review
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  }

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Vote <span className="gradient-text">Packages</span>
              </h1>
              <p className="text-muted-foreground mt-1">Purchase votes to support your favorites</p>
            </motion.div>

            {/* Available Votes Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
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
                          {loading ? <Skeleton className="h-9 w-20 inline-block" /> : (stats?.availableVotes ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Purchased</p>
                        <p className="text-lg font-semibold">{loading ? '...' : (stats?.purchasedVotes ?? 0).toLocaleString()}</p>
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

            {/* Pending Payments Alert */}
            {!loading && pendingPayments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Pending Payments ({pendingPayments.length})
                    </CardTitle>
                    <CardDescription className="text-xs">Payments awaiting processing or admin review</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingPayments.map((pp) => (
                      <div key={pp.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {paymentMethodIcon(pp.paymentMethod)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{pp.packageName}</p>
                            <p className="text-xs text-muted-foreground">
                              {pp.totalVotes} votes · {pp.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {pp.proofImageUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => viewProof(pp.proofImageUrl || '')}
                            >
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Proof
                            </Button>
                          )}
                          {paymentStatusBadge(pp.status)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Vote Packages Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
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
                    const totalVotes = pkg.votes + pkg.bonusVotes;
                    const priceFormatted = pkg.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

                    return (
                      <motion.div key={pkg.id} custom={i} variants={fadeInUp} initial="hidden" animate="visible">
                        <Card
                          className={`relative overflow-hidden h-full transition-all hover:shadow-lg ${
                            pkg.isPopular ? 'border-2 border-primary shadow-md shadow-primary/10' : ''
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
                                  {pkg.votes} votes{pkg.bonusVotes > 0 && ` + ${pkg.bonusVotes} bonus`}
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
                                className="w-full rounded-xl bg-primary hover:bg-primary/90"
                                onClick={() => handleBuyClick(pkg)}
                              >
                                <ShoppingBag className="w-4 h-4 mr-2" />
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

            {/* Payment Method Dialog */}
            <PaymentMethodSelector
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
              selectedPackage={selectedPackage}
              onPurchaseComplete={handlePurchaseComplete}
            />

            {/* Proof Preview Dialog */}
            <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Payment Proof</DialogTitle>
                  <DialogDescription>Payment screenshot uploaded by you</DialogDescription>
                </DialogHeader>
                <div className="rounded-lg overflow-hidden">
                  <img src={proofImageUrl} alt="Payment proof" className="w-full max-h-[70vh] object-contain bg-muted" />
                </div>
              </DialogContent>
            </Dialog>

            {/* Purchase History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
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
                                        <span className="text-muted-foreground">{purchase.votesUsed}/{purchase.votesAmount} used</span>
                                        <span className="font-medium">{usedPct}%</span>
                                      </div>
                                      <Progress value={usedPct} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs border-0 ${remaining > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
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

                      {purchaseTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Page {purchasePage} of {purchaseTotalPages}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" size="sm" className="rounded-lg"
                              onClick={() => setPurchasePage((p) => Math.max(1, p - 1))}
                              disabled={purchasePage <= 1}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />Previous
                            </Button>
                            <Button
                              variant="outline" size="sm" className="rounded-lg"
                              onClick={() => setPurchasePage((p) => Math.min(purchaseTotalPages, p + 1))}
                              disabled={purchasePage >= purchaseTotalPages}
                            >
                              Next<ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">No purchases yet</h3>
                      <p className="text-sm text-muted-foreground">Purchase a vote package to get started</p>
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
