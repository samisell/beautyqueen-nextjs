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
  Shield,
  BarChart3,
  Lock,
  Gift,
  Quote,
  Mail,
  CheckCircle,
  PartyPopper,
  Medal,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import ContestantCard from '@/components/contestants/ContestantCard';
import { useNavigationStore } from '@/stores/navigation-store';
import type { Contestant, TournamentStage } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as any },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Shield,
    title: 'Fair & Transparent Voting',
    desc: 'Every vote is verified and counted accurately with blockchain-inspired auditability. No manipulation, no doubt.',
    image: '/cleopas-monbest-LtJMm2rIopY-unsplash.jpg',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Leaderboard',
    desc: 'Watch rankings update live as votes come in. Feel the excitement of the competition as it unfolds.',
    image: '/cleopas-monbest-FPfSFs5_tvM-unsplash.jpg',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    desc: 'Industry-standard encryption protects every transaction. Your financial data is always safe with us.',
    image: '/lera-kogan-B4v-mppq4yc-unsplash.jpg',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Gift,
    title: 'Amazing Prizes',
    desc: 'Winners take home incredible prizes including cash awards, brand partnerships, and exclusive opportunities.',
    image: '/beautiful-african-woman-monochrome-portrait.jpg',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Competition Winner 2024',
    quote: 'BeautyVote changed my life! The entire experience was so professional and exciting. I felt like a true queen throughout the competition.',
    image: '/beautiful-african-woman-with-big-curly-afro-flowers-her-hair.jpg',
    rating: 5,
  },
  {
    name: 'Maria Chen',
    role: 'Active Voter & Supporter',
    quote: "I love how transparent the voting process is. I can see real-time updates and I know my vote truly counts. It's such a fun community!",
    image: '/black-woman-with-ideal-skin-short-haircut-grey.jpg',
    rating: 5,
  },
  {
    name: 'Amara Okafor',
    role: 'Brand Partner & Sponsor',
    quote: "Partnering with BeautyVote has been incredible. The engagement and reach we get through this platform is unmatched in the industry.",
    image: '/portrait-attractive-african-american-female-with-beautiful-makeup-posing-with-her-eyes-closed.jpg',
    rating: 5,
  },
];

const partners = [
  'GLAM Corp',
  'StyleHouse',
  'BeautyPro',
  'CrownMedia',
  'VogueVibe',
  'StarMaker',
  'EliteFash',
  'RadianceCo',
];

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
      image: '/cleopas-monbest-fMwDeDI_ykE-unsplash.jpg',
    },
    {
      icon: Heart,
      title: 'Vote',
      desc: 'Browse contestants, pick your favorites, and cast your votes to support them.',
      color: 'from-rose-500 to-pink-500',
      image: '/portrait-medieval-queen-with-crown-her-head (3).jpg',
    },
    {
      icon: Trophy,
      title: 'Win',
      desc: 'Top contestants win amazing prizes. The queen with the most votes claims the crown!',
      color: 'from-amber-500 to-yellow-500',
      image: '/portrait-medieval-queen-with-crown-her-head.jpg',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="flex flex-col text-center lg:text-left">
              {/* Animated Crown */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mb-8 lg:self-start"
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
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 mx-auto lg:mx-0"
              >
                Join thousands of voters in the most exciting beauty competition.
                Your vote has the power to crown the next queen!
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' as any }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
                <img
                  src="/portrait-medieval-queen-with-crown-her-head (2).jpg"
                  alt="Beauty Queen Contestant"
                  className="w-full h-[480px] object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                {/* Floating badge on image */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Season 2025</p>
                      <p className="text-xs text-muted-foreground">Now accepting entries</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative element behind image */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-3xl border-2 border-primary/20 -z-10" />
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

      {/* ==================== 2. FEATURED CONTESTANTS ==================== */}
      <section className="py-16 sm:py-20 bg-muted/30 relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 -z-0">
          <img
            src="/portrait-medieval-queen-with-crown-her-head (1).jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.04]"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 -z-0 bg-gradient-to-b from-muted/80 via-muted/50 to-muted/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* ==================== 3. WHY CHOOSE BEAUTYVOTE ==================== */}
      <section className="py-16 sm:py-20">
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
                <CheckCircle className="w-3 h-3 mr-1" />
                Why BeautyVote
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Why Choose <span className="gradient-text">BeautyVote</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              We&apos;re committed to delivering the fairest, most exciting beauty
              competition experience in the world.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <Card className="h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card group">
                  {/* Card image */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4. CURRENT TOURNAMENT STAGE ==================== */}
      <section className="py-16 sm:py-20 bg-muted/30">
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
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Follow the competition progress through multiple exciting stages.
            </motion.p>
          </motion.div>

          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : activeStage ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden rounded-3xl shadow-lg border-2 border-primary/20">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Background decorative image */}
                    <div className="absolute inset-0">
                      <img
                        src="/cleopas-monbest-LtJMm2rIopY-unsplash.jpg"
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover opacity-10"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 sm:p-12">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {activeStage.status === 'active' && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              >
                                <Badge className="bg-green-500 text-white shadow-lg shadow-green-500/25">
                                  <span className="relative flex h-2 w-2 mr-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                  </span>
                                  Live Now
                                </Badge>
                              </motion.div>
                            )}
                            {activeStage.status === 'completed' && (
                              <Badge className="bg-gray-400 text-white">Completed</Badge>
                            )}
                            {activeStage.status === 'upcoming' && (
                              <Badge className="bg-amber-500 text-white">Upcoming</Badge>
                            )}
                            <Badge variant="outline" className="border-primary/30">
                              Stage {activeStage.order}
                            </Badge>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                            {activeStage.name}
                          </h3>
                          <p className="text-muted-foreground max-w-lg">
                            {activeStage.description ||
                              'The competition is heating up! Cast your votes now.'}
                          </p>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                              Duration
                            </p>
                            <p className="text-sm text-foreground font-medium mb-3">
                              {new Date(activeStage.startDate).toLocaleDateString()} —{' '}
                              {new Date(activeStage.endDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 justify-end">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="text-2xl font-bold gradient-text">
                                {activeStage.contestantCount || 0}
                              </span>
                              <span className="text-sm text-muted-foreground">Contestants</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-8 text-center rounded-2xl shadow-lg">
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

      {/* ==================== 5. TESTIMONIALS ==================== */}
      <section className="py-16 sm:py-20">
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
                <Star className="w-3 h-3 mr-1" />
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              What People <span className="gradient-text">Say</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Hear from winners, voters, and partners who love BeautyVote.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card p-6 sm:p-8 flex flex-col">
                  {/* Quote icon */}
                  <Quote className="w-10 h-10 text-primary/20 mb-4 shrink-0" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-foreground/80 text-sm leading-relaxed mb-6 flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Person info */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md shrink-0">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. HOW IT WORKS ==================== */}
      <section className="py-16 sm:py-20 bg-muted/30">
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

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] -translate-y-1/2 h-0.5 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10"
              >
                <Card className="h-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card overflow-hidden group">
                  {/* Step image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Step number badge */}
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-primary text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}
                    >
                      <step.icon className="w-7 h-7 text-white" />
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

                {/* Arrow connector (visible between cards on desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 7. SPONSORS / PARTNERS ==================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeInUp}
              custom={0}
              className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4"
            >
              Trusted By Industry Leaders
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-2xl sm:text-3xl font-bold mb-4"
            >
              Our <span className="gradient-text">Partners</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
          >
            {partners.map((partner, i) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-center rounded-2xl bg-muted/50 border p-6 sm:p-8 grayscale hover:grayscale-0 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted-200 dark:bg-muted-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-muted-foreground">
                      {partner.charAt(0)}
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-muted-foreground/70 whitespace-nowrap">
                    {partner}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== 8. CTA SECTION ==================== */}
      <section className="py-16 sm:py-20 bg-muted/30">
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

            {/* Confetti-like decorative elements */}
            <div className="absolute top-8 left-[15%] w-3 h-3 rounded-full bg-yellow-300/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-12 right-[20%] w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0.8s' }} />
            <div className="absolute bottom-16 left-[25%] w-4 h-4 rounded-full bg-pink-300/30 animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-10 right-[30%] w-2.5 h-2.5 rounded-full bg-yellow-200/40 animate-bounce" style={{ animationDelay: '1.1s' }} />
            <div className="absolute top-1/3 left-[8%] w-2 h-6 rounded-sm bg-white/20 rotate-45 animate-bounce" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-1/4 right-[12%] w-3 h-3 rounded-sm bg-yellow-300/25 rotate-12 animate-bounce" style={{ animationDelay: '0.9s' }} />
            <div className="absolute bottom-1/4 left-[40%] w-2 h-2 rounded-full bg-white/25 animate-bounce" style={{ animationDelay: '0.6s' }} />
            <div className="absolute top-20 right-[40%] w-1.5 h-1.5 rounded-full bg-pink-200/30 animate-bounce" style={{ animationDelay: '1.3s' }} />

            {/* Decorative star shapes */}
            <div className="absolute top-10 left-[35%] text-yellow-200/30 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-[15%] text-yellow-200/25 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Star className="w-5 h-5" />
            </div>
            <div className="absolute top-1/2 right-[8%] text-white/15 animate-pulse" style={{ animationDelay: '1s' }}>
              <PartyPopper className="w-8 h-8" />
            </div>

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

      {/* ==================== 9. NEWSLETTER SECTION ==================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Stay <span className="gradient-text">Updated</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Subscribe to our newsletter and never miss a competition update,
              winner announcement, or exclusive event.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-12 rounded-2xl px-5 shadow-sm"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 font-semibold shrink-0">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, ever. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
