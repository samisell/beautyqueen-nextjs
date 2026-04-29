'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Users,
  Trophy,
  Heart,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ContestantCard from '@/components/contestants/ContestantCard';
import { useNavigationStore } from '@/stores/navigation-store';
import type { Contestant, TournamentStage, AdminStats } from '@/types';

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

export default function HomePage() {
  const { navigate } = useNavigationStore();
  const [featured, setFeatured] = useState<Contestant[]>([]);
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [stats, setStats] = useState({ contestants: 0, stages: 0, votes: 0 });
  const [activeStage, setActiveStage] = useState<TournamentStage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, tournamentRes] = await Promise.all([
          fetch('/api/contestants?limit=4&sort=votes'),
          fetch('/api/tournament'),
        ]);

        const featuredData = await featuredRes.json();
        const tournamentData = await tournamentRes.json();

        if (featuredData.success && featuredData.data) {
          setFeatured(featuredData.data);
        }

        if (tournamentData.success && tournamentData.data) {
          setStages(tournamentData.data);
          const active = tournamentData.data.find(
            (s: TournamentStage) => s.status === 'active'
          );
          setActiveStage(active || tournamentData.data[0] || null);

          const totalContestants = tournamentData.data.reduce(
            (sum: number, s: TournamentStage) => sum + (s.contestantCount || 0),
            0
          );

          setStats({
            contestants: totalContestants,
            stages: tournamentData.data.length,
            votes: 1000 + Math.floor(Math.random() * 500),
          });
        }
      } catch {
        // Use fallback data
        setStats({ contestants: 12, stages: 3, votes: 1200 });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const steps = [
    {
      icon: Users,
      title: 'Register',
      desc: 'Create your free account in seconds and start participating in the competition.',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Heart,
      title: 'Vote',
      desc: 'Browse contestants, pick your favorites, and cast your votes to support them.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Trophy,
      title: 'Win',
      desc: 'Top contestants win amazing prizes. The queen with the most votes claims the crown!',
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="flex flex-col items-center text-center">
            {/* Animated Crown */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-yellow-900" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.7 }}
                  className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center"
                >
                  <Star className="w-3 h-3 text-amber-900" />
                </motion.div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
            >
              <span className="gradient-text">Crown Your</span>
              <br />
              <span className="text-foreground">Queen</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10"
            >
              Join thousands of voters in the most exciting beauty competition.
              Your vote has the power to crown the next queen!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-xl shadow-primary/25 rounded-2xl"
                onClick={() => navigate('register')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Register Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base font-semibold rounded-2xl border-2"
                onClick={() => navigate('leaderboard')}
              >
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                View Leaderboard
              </Button>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-20"
          >
            <div className="bg-card/80 backdrop-blur-sm border rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                {[
                  {
                    value: loading ? '...' : stats.contestants,
                    label: 'Contestants',
                    icon: Users,
                  },
                  {
                    value: loading ? '...' : stats.stages,
                    label: 'Tournament Stages',
                    icon: Trophy,
                  },
                  {
                    value: loading ? '...' : `${stats.votes}+`,
                    label: 'Votes Cast',
                    icon: Heart,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="w-5 h-5 text-primary" />
                      <span className="text-2xl sm:text-3xl font-bold gradient-text">
                        {stat.value}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Contestants */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                <Flame className="w-3 h-3 mr-1" />
                Featured Contestants
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Meet the <span className="gradient-text">Top Contenders</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              These contestants are leading the competition. Show your support
              and help your favorite reach the top!
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[3/4] rounded-2xl"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((contestant, i) => (
                <motion.div
                  key={contestant.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ContestantCard contestant={contestant} rank={i + 1} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Contestants are being prepared. Stay tuned!
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="rounded-2xl px-8"
              onClick={() => navigate('leaderboard')}
            >
              See All Contestants
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Current Tournament Stage */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                <Trophy className="w-3 h-3 mr-1" />
                Tournament
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Current <span className="gradient-text">Stage</span>
            </motion.h2>
          </motion.div>

          {loading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : activeStage ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-2 border-primary/20 shine">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 sm:p-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={
                              activeStage.status === 'active'
                                ? 'bg-green-500 text-white'
                                : activeStage.status === 'completed'
                                ? 'bg-gray-400 text-white'
                                : 'bg-amber-500 text-white'
                            }
                          >
                            {activeStage.status === 'active'
                              ? 'Live Now'
                              : activeStage.status === 'completed'
                              ? 'Completed'
                              : 'Upcoming'}
                          </Badge>
                          <Badge variant="outline" className="border-primary/30">
                            Stage {activeStage.order}
                          </Badge>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                          {activeStage.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {activeStage.description ||
                            'The competition is heating up! Cast your votes now.'}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(activeStage.startDate).toLocaleDateString()} —{' '}
                          {new Date(activeStage.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {activeStage.contestantCount || 0} Contestants
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Tournament stages are being finalized. Check back soon!
              </p>
            </Card>
          )}

          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="rounded-2xl px-8"
              onClick={() => navigate('tournament')}
            >
              View Full Tournament
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                <Zap className="w-3 h-3 mr-1" />
                Simple Process
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Getting started is easy. Just follow these three simple steps
              to join the excitement!
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full text-center p-8 hover:shadow-xl transition-shadow duration-300 border-0 bg-card group">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                      Step {i + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-10 sm:p-16 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 left-8 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                Ready to Make Your Voice Count?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                Join the BeautyVote community and help crown the next queen.
                Every vote matters!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-2xl shadow-xl"
                  onClick={() => navigate('register')}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-2xl"
                  onClick={() => navigate('instruction')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
