'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Search,
  Filter,
  Users,
  X,
  ChevronDown,
  SlidersHorizontal,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ContestantCard from '@/components/contestants/ContestantCard';
import { useUIStore } from '@/stores/ui-store';
import type { LeaderboardEntry, Category } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function LeaderboardPage() {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    useUIStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch {
      // Ignore
    }
  }, []);

  const fetchLeaderboard = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(limit),
        });

        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }

        if (searchQuery) {
          params.set('search', searchQuery.trim());
        }

        const res = await fetch(`/api/leaderboard?${params}`);
        const data = await res.json();

        if (data.success) {
          if (append) {
            setEntries((prev) => [...prev, ...data.data]);
          } else {
            setEntries(data.data || []);
          }
          setTotalPages(data.pagination?.totalPages || 1);
          setTotal(data.pagination?.total || 0);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchQuery]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Debounce search — re-fetch when searchQuery changes
    const timer = setTimeout(() => {
      setPage(1);
      fetchLeaderboard(1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchLeaderboard]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleSearch = () => {
    setPage(1);
    fetchLeaderboard(1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLeaderboard(nextPage, true);
  };

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See who&apos;s leading the competition. Every vote brings your
            favorite contestant closer to the crown!
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className={`rounded-full shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary hover:bg-primary/90'
                  : ''
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                className={`rounded-full shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-primary hover:bg-primary/90'
                    : ''
                }`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                {cat.name}
                {cat.contestantCount !== undefined && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-[10px] px-1.5 py-0"
                  >
                    {cat.contestantCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contestants..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleSearch}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Results Info */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">
                {entries.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">{total}</span>{' '}
              contestants
            </p>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedCategory}
                <button onClick={() => handleCategoryChange('all')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <>
            {/* Contestants Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.contestant.id}
                  variants={fadeInUp}
                  custom={i}
                  className={i < 3 ? 'md:col-span-1' : ''}
                >
                  {i === 0 && selectedCategory === 'all' ? (
                    // Top 1 featured card
                    <div className="md:col-span-2 lg:col-span-2">
                      <ContestantCard
                        contestant={entry.contestant}
                        rank={entry.rank}
                      />
                    </div>
                  ) : (
                    <ContestantCard
                      contestant={entry.contestant}
                      rank={entry.rank}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Load More */}
            {page < totalPages && (
              <div className="text-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-8"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      Load More
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Page {page} of {totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No contestants found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'There are no contestants in this category yet. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
