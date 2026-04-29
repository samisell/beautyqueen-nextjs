'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  Star,
  Shield,
  BookOpen,
  Heart,
  Timer,
  ArrowDown,
  Zap,
  Target,
  Ban,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import ContestantCard from '@/components/contestants/ContestantCard';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import type { TournamentPublicData, Tournament, TournamentStage } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const stageStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  active: { label: 'Live Now', color: 'bg-green-500 text-white', icon: Flame },
  upcoming: { label: 'Upcoming', color: 'bg-amber-500 text-white', icon: Clock },
  completed: { label: 'Completed', color: 'bg-gray-500 text-white', icon: CheckCircle2 },
};

const rules = [
  {
    title: 'Voting Rules',
    items: [
      'Each registered user gets 3 free votes per contestant per day.',
      'Paid votes are available for purchase and have no daily limit.',
      'Votes are final once cast and cannot be reversed.',
      'IP-based fraud prevention ensures fair voting.',
    ],
    icon: Shield,
  },
  {
    title: 'Tournament Rules',
    items: [
      'Contestants must reach the minimum vote threshold to advance.',
      'When a stage ends, contestants below the threshold are automatically eliminated.',
      'Qualified contestants advance to the next stage automatically.',
      'The final stage determines the ultimate winner.',
    ],
    icon: BookOpen,
  },
  {
    title: 'Prize Rules',
    items: [
      'Prizes are awarded to the top 3 contestants based on total votes.',
      'Category-specific winners receive special recognition and prizes.',
      'All prize winners must complete verification to claim rewards.',
      'Prize distribution occurs within 7 days of the final results.',
    ],
    icon: Trophy,
  },
];

// ──────────────────────────────────────────────
// Countdown Component
// ──────────────────────────────────────────────

function CountdownTimer({ targetDate, label }: { targetDate: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return (
      <span className="text-sm text-muted-foreground font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-green-500" />
        {label} ended
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <span className="bg-primary/10 text-primary font-mono font-bold text-sm px-1.5 py-0.5 rounded">
            {timeLeft.days}d
          </span>
        )}
        <span className="bg-primary/10 text-primary font-mono font-bold text-sm px-1.5 py-0.5 rounded">
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span className="bg-primary/10 text-primary font-mono font-bold text-sm px-1.5 py-0.5 rounded">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        <span className="bg-primary/10 text-primary font-mono font-bold text-sm px-1.5 py-0.5 rounded">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
}

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function formatCurrency(amount: number, currency: string) {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return amount.toLocaleString('en-US', { style: 'currency', currency });
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export default function TournamentPage() {
  const { navigate } = useNavigationStore();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<TournamentPublicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/tournament');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const tournament = data?.tournament || null;
  const votePrice = data?.votePrice || 200;
  const currency = data?.currency || 'NGN';
  const platformName = data?.platformName || 'Beauty Vote';
  const votingEnabled = data?.votingEnabled ?? true;

  const activeStage = tournament?.stages.find((s) => s.status === 'active');
  const activeContestants = activeStage?.contestants || [];

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <Badge
              variant="secondary"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Competition
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
          >
            <span className="gradient-text">Tournament</span> Stages
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Follow the competition through multiple exciting stages. The journey
            to the crown is filled with twists and turns!
          </motion.p>
        </motion.div>

        {/* Vote Price Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">Vote Price</p>
                  <p className="text-sm text-muted-foreground">Current per-vote rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                  {formatCurrency(votePrice, currency)}
                </p>
                <p className="text-xs text-muted-foreground">per vote</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tournament Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : tournament && tournament.stages.length > 0 ? (
            <div>
              {/* Tournament Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold">{tournament.name}</h2>
                  <Badge
                    className={
                      tournament.status === 'active'
                        ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
                        : tournament.status === 'completed'
                        ? 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
                    }
                    variant="outline"
                  >
                    {tournament.status === 'active' ? 'Active' : tournament.status === 'completed' ? 'Completed' : 'Draft'}
                  </Badge>
                </div>
                {tournament.description && (
                  <p className="text-muted-foreground">{tournament.description}</p>
                )}
              </div>

              {/* Stages Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

                <div className="space-y-8">
                  {tournament.stages.map((stage, i) => {
                    const config = stageStatusConfig[stage.status] || stageStatusConfig.upcoming;
                    const StatusIcon = config.icon;
                    const isActive = stage.status === 'active';
                    const isLast = i === tournament.stages.length - 1;
                    const now = new Date();
                    const startDate = new Date(stage.startDate);
                    const endDate = new Date(stage.endDate);
                    const hasStarted = now >= startDate;
                    const hasEnded = now >= endDate;
                    const totalDuration = endDate.getTime() - startDate.getTime();
                    const elapsed = Math.max(0, Math.min(now.getTime() - startDate.getTime(), totalDuration));
                    const progressPercent = hasStarted ? Math.round((elapsed / totalDuration) * 100) : 0;

                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-6 sm:left-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10 ${
                            isActive
                              ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                              : stage.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'bg-background border-muted-foreground/30'
                          }`}
                          style={{ top: '2rem' }}
                        />

                        {/* Connector arrow between stages */}
                        {!isLast && (
                          <div className="absolute left-6 sm:left-8 -translate-x-1/2 z-10" style={{ top: 'calc(2rem + 12px)' }}>
                            <ArrowDown className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        )}

                        <Card
                          className={`ml-14 sm:ml-20 overflow-hidden transition-all duration-300 ${
                            isActive
                              ? 'border-2 border-primary/30 shadow-lg shadow-primary/5'
                              : 'hover:shadow-md'
                          }`}
                        >
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge className={config.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {config.label}
                                  </Badge>
                                  <Badge variant="outline" className="border-primary/20">
                                    Stage {stage.order}
                                  </Badge>
                                  {isActive && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                      <Flame className="w-3 h-3 mr-1" />
                                      Live
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                                  {stage.name}
                                </h3>
                                {stage.description && (
                                  <p className="text-muted-foreground text-sm mb-4">
                                    {stage.description}
                                  </p>
                                )}

                                {/* Countdown or Status */}
                                <div className="space-y-3">
                                  {!hasStarted && (
                                    <CountdownTimer targetDate={stage.startDate} label="Starts in" />
                                  )}
                                  {hasStarted && !hasEnded && (
                                    <CountdownTimer targetDate={stage.endDate} label="Ends in" />
                                  )}

                                  {/* Dates & Stats Row */}
                                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4 text-primary" />
                                      <span>
                                        {new Date(stage.startDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                        {' — '}
                                        {new Date(stage.endDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Users className="w-4 h-4 text-primary" />
                                      <span>{stage.contestantCount || 0} Contestants</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Target className="w-4 h-4 text-primary" />
                                      <span>Min: {stage.minVotes} votes</span>
                                    </div>
                                    {stage.maxContestants && (
                                      <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        <span>Max: {stage.maxContestants}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Stage number badge */}
                              <div
                                className={`hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center font-bold text-2xl shrink-0 ${
                                  isActive
                                    ? 'bg-primary text-white'
                                    : stage.status === 'completed'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {stage.order}
                              </div>
                            </div>

                            {/* Progress bar for active stage */}
                            {isActive && (
                              <div className="mt-6">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                  <span>Stage Progress</span>
                                  <span>{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-2" />
                              </div>
                            )}

                            {/* Join This Stage button for active/upcoming stages */}
                            {(isActive || stage.status === 'upcoming') && isAuthenticated && (
                              <div className="mt-5">
                                <Button
                                  className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-semibold"
                                  onClick={() => navigate('dashboard', { tournamentId: tournament!.id, stageId: stage.id })}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Join This Stage
                                </Button>
                              </div>
                            )}
                            {(isActive || stage.status === 'upcoming') && !isAuthenticated && (
                              <div className="mt-5">
                                <Button
                                  className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-semibold"
                                  onClick={() => navigate('login')}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Sign In to Join This Stage
                                </Button>
                              </div>
                            )}

                            {/* Top 3 contestants for active/completed stage */}
                            {stage.topContestants && stage.topContestants.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-border/50">
                                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                  Top Contestants
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {stage.topContestants.map((c, j) => (
                                    <div
                                      key={c.id}
                                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {j + 1}
                                      </div>
                                      <img
                                        src={c.imageUrl}
                                        alt={c.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          <Heart className="w-3 h-3 inline mr-0.5 text-rose-500" />
                                          {c.totalVotes} votes
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Tournament Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tournament stages are being finalized. Stay tuned for exciting
                updates!
              </p>
            </Card>
          )}
        </motion.div>

        {/* Active Stage Contestants */}
        {activeStage && activeContestants.length > 0 && (
          <section className="mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="mb-10"
            >
              <motion.div variants={fadeInUp} custom={0} className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Active Stage Contestants
                  </h2>
                  <p className="text-muted-foreground">
                    Vote for your favorites in <span className="font-semibold text-primary">{activeStage.name}</span>!
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl hidden sm:flex"
                  onClick={() => navigate('leaderboard')}
                >
                  Full Leaderboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeContestants.map((contestant, i) => (
                <motion.div
                  key={contestant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ContestantCard contestant={contestant} rank={i + 1} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Voting Disabled Banner */}
        {!votingEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="border-2 border-red-500/30 bg-red-500/5">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">Voting is Currently Paused</p>
                  <p className="text-sm text-muted-foreground">
                    The admin has temporarily disabled voting. Please check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Vote CTA when tournament is active */}
        {tournament?.status === 'active' && votingEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-amber-500/10 overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Timer className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Every Vote Counts!
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  Support your favorite contestant with just {formatCurrency(votePrice, currency)} per vote.
                  Every vote brings them closer to the next stage!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="rounded-xl px-8"
                    onClick={() => navigate('leaderboard')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Vote Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-8"
                    onClick={() => navigate('dashboard-purchases')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Buy Votes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rules Section */}
        <section className="mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-2xl sm:text-3xl font-bold mb-4"
            >
              Tournament <span className="gradient-text">Rules</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Please familiarize yourself with the competition rules before
              participating.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rules.map((ruleGroup, i) => (
              <motion.div
                key={ruleGroup.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ruleGroup.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{ruleGroup.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {ruleGroup.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
