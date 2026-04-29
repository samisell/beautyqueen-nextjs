'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Clock,
  CheckCircle2,
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
import { toast } from 'sonner';

interface VoteRecord {
  id: string;
  contestantId: string;
  userId: string;
  voteType: 'free' | 'paid' | 'referral';
  ipAddress: string;
  createdAt: string;
  contestant: { id: string; name: string; imageUrl: string };
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getVoteTypeBadge(type: string) {
  switch (type) {
    case 'free':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs border-0">
          Free
        </Badge>
      );
    case 'paid':
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs border-0">
          Paid
        </Badge>
      );
    case 'referral':
      return (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs border-0">
          Referral
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{type}</Badge>;
  }
}

export default function DashboardVotes() {
  const { navigate } = useNavigationStore();
  const { token } = useAuthStore();
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchVotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (typeFilter !== 'all') params.set('voteType', typeFilter);

      const res = await fetch(`/api/user/votes?${params}`, { headers });
      const data = await res.json();

      if (data.success) {
        setVotes(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotal(data.pagination.total || 0);
        }
      } else {
        toast.error(data.message || 'Failed to load votes');
      }
    } catch {
      toast.error('Failed to load votes');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, token]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    setPage(1);
  };

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
                My <span className="gradient-text">Votes</span>
              </h1>
              <p className="text-muted-foreground mt-1">View your complete voting history</p>
            </motion.div>

            {/* Filter Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by type:</span>
              </div>
              <div className="flex items-center gap-3">
                {!loading && total > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {total} vote{total !== 1 ? 's' : ''} total
                  </p>
                )}
                <Select value={typeFilter} onValueChange={handleTypeChange}>
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
              </div>
            </motion.div>

            {/* Vote History Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
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
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24 shrink-0" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-5 w-16 shrink-0" />
                          <Skeleton className="h-5 w-20 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : votes.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[160px]">Date</TableHead>
                              <TableHead>Contestant</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {votes.map((vote) => (
                              <TableRow
                                key={vote.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() =>
                                  navigate('vote', { id: vote.contestantId })
                                }
                              >
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>{formatRelativeTime(vote.createdAt)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                                      {vote.contestant?.imageUrl ? (
                                        <img
                                          src={vote.contestant.imageUrl}
                                          alt={vote.contestant.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        vote.contestant?.name?.charAt(0) || '?'
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {vote.contestant?.name || 'Unknown'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{getVoteTypeBadge(vote.voteType)}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
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
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                    <div className="text-center py-16">
                      <Inbox className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">No votes yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {typeFilter !== 'all'
                          ? `No ${typeFilter} votes found. Try a different filter.`
                          : "You haven't cast any votes yet. Start voting for your favorite contestants!"}
                      </p>
                      {typeFilter !== 'all' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setTypeFilter('all')}
                        >
                          <Filter className="w-4 h-4 mr-1" />
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


