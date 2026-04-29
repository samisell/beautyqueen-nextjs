'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Contestant } from '@/types';
import { useNavigationStore } from '@/stores/navigation-store';
import { useVotingStore } from '@/stores/voting-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface ContestantCardProps {
  contestant: Contestant;
  rank?: number;
  showVoteButton?: boolean;
  compact?: boolean;
}

export default function ContestantCard({
  contestant,
  rank,
  showVoteButton = true,
  compact = false,
}: ContestantCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { navigate } = useNavigationStore();
  const { incrementVote, markVotedToday, hasVotedToday } = useVotingStore();
  const { isAuthenticated } = useAuthStore();

  const hasVoted = hasVotedToday[contestant.id];

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting) return;

    if (!isAuthenticated) {
      toast.error('Please login to vote');
      navigate('login');
      return;
    }

    if (hasVoted) {
      toast.info('You have already voted for this contestant today');
      return;
    }

    setIsVoting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: contestant.id,
          voteType: 'free',
        }),
      });

      const data = await res.json();

      if (data.success) {
        incrementVote(contestant.id);
        markVotedToday(contestant.id);
        toast.success('Vote cast successfully! 🎉');
      } else {
        toast.error(data.message || 'Failed to cast vote');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsVoting(false);
    }
  };

  const handleClick = () => {
    navigate('vote', { id: contestant.id });
  };

  if (compact) {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
        onClick={handleClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-primary/30 group-hover:border-primary transition-colors">
              <AvatarImage src={contestant.imageUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {contestant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {rank && (
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                #{rank}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {contestant.name}
            </p>
            <p className="text-xs text-muted-foreground">{contestant.category}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {contestant.totalVotes.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">votes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 group overflow-hidden shine"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={contestant.imageUrl}
            alt={contestant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Rank Badge */}
          {rank && (
            <div className="absolute top-3 left-3">
              <div className="w-10 h-10 rounded-xl bg-primary/90 backdrop-blur-sm text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                #{rank}
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-black/40 backdrop-blur-sm text-white border-0 text-xs"
            >
              {contestant.category}
            </Badge>
          </div>

          {/* Vote Count */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="text-white font-bold text-lg drop-shadow-md">
                {contestant.name}
              </h3>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span className="font-semibold">
                  {contestant.totalVotes.toLocaleString()}
                </span>
                <span className="text-white/60">votes</span>
              </div>
            </div>

            {showVoteButton && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  size="sm"
                  className={`rounded-full shadow-lg ${
                    hasVoted
                      ? 'bg-green-500 hover:bg-green-500'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={handleVote}
                  disabled={isVoting || hasVoted}
                >
                  <Heart
                    className={`w-3.5 h-3.5 mr-1 ${hasVoted ? 'fill-white' : ''}`}
                  />
                  {hasVoted ? 'Voted' : 'Vote'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
