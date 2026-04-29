'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ContestantCard from '@/components/contestants/ContestantCard';
import { useNavigationStore } from '@/stores/navigation-store';
import type { TournamentStage, Contestant } from '@/types';

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

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  active: { label: 'Active', color: 'bg-green-500 text-white', icon: Flame },
  upcoming: { label: 'Upcoming', color: 'bg-amber-500 text-white', icon: Clock },
  completed: { label: 'Completed', color: 'bg-gray-400 text-white', icon: CheckCircle2 },
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
      'Contestants must remain active throughout all stages to qualify.',
      'The lowest-voted contestants are eliminated at each stage.',
      'Tie-breakers are resolved by the highest number of unique voters.',
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

export default function TournamentPage() {
  const { navigate } = useNavigationStore();
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [activeContestants, setActiveContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const tournamentRes = await fetch('/api/tournament');
        const tournamentData = await tournamentRes.json();

        if (tournamentData.success && tournamentData.data) {
          setStages(tournamentData.data);

          // Fetch contestants from active stage
          const activeStage = tournamentData.data.find(
            (s: TournamentStage) => s.status === 'active'
          );
          if (activeStage) {
            const contestantsRes = await fetch(
              `/api/contestants?limit=8&status=active`
            );
            const contestantsData = await contestantsRes.json();
            if (contestantsData.success) {
              setActiveContestants(contestantsData.data || []);
            }
          }
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeStage = stages.find((s) => s.status === 'active');

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
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : stages.length > 0 ? (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

              <div className="space-y-8">
                {stages.map((stage, i) => {
                  const config = statusConfig[stage.status] || statusConfig.upcoming;
                  const StatusIcon = config.icon;

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
                          stage.status === 'active'
                            ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                            : stage.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'bg-background border-muted-foreground/30'
                        }`}
                        style={{ top: '2rem' }}
                      />

                      <Card
                        className={`ml-14 sm:ml-20 overflow-hidden transition-all duration-300 ${
                          stage.status === 'active'
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
                                {stage.status === 'active' && (
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
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span>
                                    {new Date(stage.startDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}{' '}
                                    —{' '}
                                    {new Date(stage.endDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-primary" />
                                  <span>
                                    {stage.contestantCount || 0} Contestants
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stage number badge */}
                            <div
                              className={`hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center font-bold text-2xl shrink-0 ${
                                stage.status === 'active'
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
                          {stage.status === 'active' && (
                            <div className="mt-6">
                              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>Progress</span>
                                <span>Vote Now!</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: '45%' }}
                                  transition={{ duration: 1.5, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
                                />
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
                    Vote for your favorites in the current stage!
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
