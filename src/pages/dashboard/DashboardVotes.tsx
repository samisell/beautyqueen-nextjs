'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Vote,
  Filter,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Gift,
  Inbox,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';
import type { VoteType } from '@/types';

interface VoteRecord {
  id: string;
  contestantId: string;
  contestant?: { name: string; imageUrl: string };
  voteType: VoteType;
  createdAt: string;
  status?: string;
}

export default function DashboardVotes() {
  const { navigate } = useNavigationStore();
  const { token } = useAuthStore();
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchVotes() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '10' });
        if (typeFilter !== 'all') params.set('type', typeFilter);

        const res = await fetch(`/api/user/votes?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        if (data.success) {
          if (data.pagination) {
            setVotes(data.data || []);
            setTotalPages(data.pagination.totalPages || 1);
          } else {
            setVotes(data.data || []);
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchVotes();
  }, [page, typeFilter, token]);

  const getTypeIcon = (type: VoteType) => {
    switch (type) {
      case 'free': return <Heart className="w-3.5 h-3.5 text-primary" />;
      case 'paid': return <Star className="w-3.5 h-3.5 text-amber-500" />;
      case 'referral': return <Gift className="w-3.5 h-3.5 text-green-500" />;
      default: return <Vote className="w-3.5 h-3.5" />;
    }
  };

  const getTypeBadge = (type: VoteType) => {
    switch (type) {
      case 'free': return <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">Free</Badge>;
      case 'paid': return <Badge className="bg-amber-100 text-amber-700 text-xs border-0">Paid</Badge>;
      case 'referral': return <Badge className="bg-green-100 text-green-700 text-xs border-0">Referral</Badge>;
      default: return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold">
                My <span className="gradient-text">Votes</span>
              </h1>
              <p className="text-muted-foreground mt-1">View your voting history</p>
            </motion.div>

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by type:</span>
              </div>
              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free Votes</SelectItem>
                  <SelectItem value="paid">Paid Votes</SelectItem>
                  <SelectItem value="referral">Referral Votes</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Vote History Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Vote className="w-5 h-5 text-primary" />
                    Vote History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : votes.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Contestant</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {votes.map((vote) => (
                              <TableRow
                                key={vote.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => vote.contestantId && navigate('vote', { id: vote.contestantId })}
                              >
                                <TableCell className="text-sm">
                                  {new Date(vote.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                      {vote.contestant?.name?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {vote.contestant?.name || 'Unknown'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    {getTypeIcon(vote.voteType)}
                                    {getTypeBadge(vote.voteType)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700 text-xs border-0">
                                    Confirmed
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
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page <= 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={page >= totalPages}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <Inbox className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">No votes yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {typeFilter !== 'all'
                          ? `No ${typeFilter} votes found`
                          : 'Start voting for your favorite contestants'}
                      </p>
                      {typeFilter !== 'all' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setTypeFilter('all')}
                        >
                          Clear Filter
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-xl bg-primary hover:bg-primary/90"
                          onClick={() => navigate('leaderboard')}
                        >
                          <Vote className="w-4 h-4 mr-1" />
                          Vote Now
                        </Button>
                      )}
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
