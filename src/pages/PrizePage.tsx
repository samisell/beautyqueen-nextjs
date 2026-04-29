'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Crown,
  Trophy,
  Medal,
  Gift,
  Star,
  Sparkles,
  Gem,
  Zap,
  CheckCircle2,
  DollarSign,
  Camera,
  Music,
  ArrowRight,
  Heart,
  Timer,
  ClipboardCheck,
  PartyPopper,
  Quote,
  ChevronUp,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/navigation-store';

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

const prizeTiers = [
  {
    rank: 1,
    title: '1st Place — The Crown',
    subtitle: 'Queen of BeautyVote',
    prize: '$5,000',
    icon: Crown,
    color: 'from-yellow-400 via-amber-500 to-yellow-600',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-yellow-400/50',
    items: [
      'Grand Crown Trophy',
      '$5,000 Cash Prize',
      'Brand Ambassador Deal',
      'Professional Photoshoot',
      'Feature in Magazine',
    ],
    gradient: 'linear-gradient(135deg, #fef3c7, #fbbf24, #f59e0b)',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=500&fit=crop',
  },
  {
    rank: 2,
    title: '2nd Place — The Scepter',
    subtitle: 'Princess of BeautyVote',
    prize: '$3,000',
    icon: Medal,
    color: 'from-gray-300 via-gray-400 to-gray-500',
    textColor: 'text-gray-600 dark:text-gray-300',
    borderColor: 'border-gray-300/50',
    items: [
      'Silver Trophy',
      '$3,000 Cash Prize',
      'Gift Package Worth $500',
      'Professional Photoshoot',
      'Social Media Feature',
    ],
    gradient: 'linear-gradient(135deg, #f3f4f6, #d1d5db, #9ca3af)',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
  },
  {
    rank: 3,
    title: '3rd Place — The Tiara',
    subtitle: 'Duchess of BeautyVote',
    prize: '$1,500',
    icon: Trophy,
    color: 'from-orange-600 via-amber-700 to-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-400/50',
    items: [
      'Bronze Trophy',
      '$1,500 Cash Prize',
      'Gift Package Worth $200',
      'Professional Photoshoot',
      'Social Media Shoutout',
    ],
    gradient: 'linear-gradient(135deg, #fed7aa, #fb923c, #ea580c)',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop',
  },
];

const categoryPrizes = [
  {
    category: 'Miss Photogenic',
    icon: Camera,
    prize: '$500 + Professional Portfolio',
    color: 'from-pink-500 to-rose-500',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop',
  },
  {
    category: 'Miss Talent',
    icon: Music,
    prize: '$500 + Recording Session',
    color: 'from-violet-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
  },
  {
    category: 'Miss Popularity',
    icon: Star,
    prize: '$500 + Social Media Package',
    color: 'from-cyan-500 to-blue-500',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
  },
  {
    category: 'People\'s Choice',
    icon: Heart,
    prize: '$300 + Gift Hamper',
    color: 'from-rose-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
  },
];

const awardSteps = [
  {
    step: 1,
    title: 'Voting Closes',
    desc: 'All voting concludes at the end of the final tournament stage. No more votes can be cast.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
  },
  {
    step: 2,
    title: 'Results Verification',
    desc: 'Our team verifies all votes to ensure fairness and accuracy. Fraudulent votes are removed.',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
  },
  {
    step: 3,
    title: 'Winners Announced',
    desc: 'The final leaderboard is published and winners are announced across all our platforms.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop',
  },
  {
    step: 4,
    title: 'Prize Distribution',
    desc: 'Winners are contacted for verification, and prizes are distributed within 7 business days.',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
  },
];

const pastWinners = [
  {
    name: 'Adaeze Okonkwo',
    title: 'Season 1 Winner',
    quote: 'BeautyVote changed my life! Winning the grand prize opened so many doors for my modeling career.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  },
  {
    name: 'Chidinma Eze',
    title: 'Season 2 Winner',
    quote: 'The competition was tough but fair. I\'m grateful for the platform and the amazing prizes.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    name: 'Funke Adeyemi',
    title: 'Season 3 Winner',
    quote: 'From contestant to brand ambassador — BeautyVote gave me the exposure I always dreamed of.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    name: 'Blessing Udo',
    title: 'Season 4 Winner',
    quote: 'The experience was incredible. The support from voters made me feel like a true queen.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  },
];

// Animated counter component
function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function PrizePage() {
  const { navigate } = useNavigationStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/3 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex-1 text-center"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Flame className="w-3 h-3 mr-1" />
                  Rewards
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
              >
                Amazing Prizes{' '}
                <span className="gradient-text">Await!</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Compete for incredible prizes worth thousands of dollars. The
                competition rewards beauty, talent, and popularity!
              </motion.p>
              <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                  onClick={() => navigate('register')}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Competing
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 rounded-2xl font-semibold"
                  onClick={() => navigate('leaderboard')}
                >
                  View Leaderboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block w-80 shrink-0"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=500&fit=crop"
                    alt="Trophy"
                    className="w-full rounded-3xl shadow-2xl"
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30"
                >
                  <Gem className="w-10 h-10 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Total Prize Pool Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-8 sm:p-12 text-center relative">
                  {/* Confetti decoration */}
                  <div className="absolute top-3 left-8 text-2xl opacity-30">🎉</div>
                  <div className="absolute top-5 right-12 text-xl opacity-30">🏆</div>
                  <div className="absolute bottom-4 left-16 text-lg opacity-30">✨</div>
                  <div className="absolute bottom-3 right-8 text-2xl opacity-30">🎊</div>

                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Prize Pool</p>
                  <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-amber-600 dark:text-amber-400 mb-3">
                    <AnimatedCounter target={10000} prefix="$" suffix="+" />
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Including cash prizes, professional photoshoots, brand deals, and more
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">3</p>
                      <p className="text-xs text-muted-foreground">Main Prizes</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">4</p>
                      <p className="text-xs text-muted-foreground">Categories</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">7</p>
                      <p className="text-xs text-muted-foreground">Total Winners</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-4xl font-bold mb-4">
              Grand <span className="gradient-text">Prize Tiers</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Three incredible prize packages for the top performers
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {prizeTiers.map((tier, i) => (
              <motion.div
                key={tier.rank}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={i === 0 ? 'lg:-mt-4' : ''}
              >
                <Card
                  className={`relative overflow-hidden h-full border-2 ${tier.borderColor} ${
                    i === 0 ? 'shadow-2xl shadow-amber-500/10' : 'shadow-lg hover:shadow-xl'
                  } transition-shadow duration-300 rounded-2xl`}
                >
                  {/* Top gradient bar */}
                  <div className="h-2" style={{ background: tier.gradient }} />

                  {/* Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={tier.image}
                      alt={tier.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <CardContent className="p-6 sm:p-8">
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${tier.color} text-white font-bold px-3 py-1`}>
                        #{tier.rank} Place
                      </Badge>
                      {i === 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Grand Prize
                        </Badge>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-xl ${
                          i === 0 ? 'ring-4 ring-yellow-400/30' : ''
                        }`}
                      >
                        <tier.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold mb-1">{tier.title}</h3>
                      <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                    </div>

                    {/* Prize Amount */}
                    <div className="text-center mb-4">
                      <p className={`text-4xl font-extrabold ${tier.textColor}`}>{tier.prize}</p>
                    </div>

                    <Separator className="mb-4" />

                    {/* Prize Items */}
                    <ul className="space-y-3">
                      {tier.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 ${tier.textColor} shrink-0`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional prizes note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Card className="inline-flex items-center gap-3 px-6 py-3 border-dashed shadow-md rounded-2xl">
              <Gift className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Additional surprise prizes may be awarded to top performers!
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Category Prizes */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-4xl font-bold mb-4">
              Category <span className="gradient-text">Prizes</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Special prizes are awarded to winners in each competition category.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryPrizes.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group border-0 rounded-2xl overflow-hidden">
                  <div className="h-36 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-5 text-center">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <cat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{cat.category}</h3>
                    <p className="text-sm text-primary font-semibold">{cat.prize}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Prizes Are Awarded */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-4xl font-bold mb-4">
              Prize Distribution <span className="gradient-text">Timeline</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Our transparent prize distribution process ensures fairness for all participants.
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

              <div className="space-y-8">
                {awardSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    {/* Step dot */}
                    <div
                      className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10"
                      style={{ top: '1.25rem' }}
                    />

                    <Card className="ml-16 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-40 shrink-0">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-32 sm:h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                {step.step}
                              </div>
                              <h3 className="font-bold">{step.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Winners Gallery */}
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
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Crown className="w-3 h-3 mr-1" />
                Hall of Fame
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl font-bold mb-4">
              Past <span className="gradient-text">Winners</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Meet the queens who have reigned in previous seasons
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastWinners.map((winner, i) => (
              <motion.div
                key={winner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden border-0">
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={winner.image}
                      alt={winner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg">{winner.name}</h3>
                      <p className="text-white/80 text-xs">{winner.title}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground italic leading-relaxed">{winner.quote}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Winner's Journey Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop"
                      alt="Winner celebration"
                      className="w-full h-64 md:h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8 sm:p-10 flex-1">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                      <Star className="w-3 h-3 mr-1" />
                      Winner&apos;s Story
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                      From Contestant to <span className="gradient-text">Brand Ambassador</span>
                    </h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        &ldquo;When I first joined BeautyVote, I never imagined it would change my life so dramatically. The platform gave me the confidence to showcase who I truly am, and the support from the community was overwhelming.&rdquo;
                      </p>
                      <p>
                        &ldquo;Winning the grand prize was just the beginning — the brand ambassador deal, professional photoshoot, and magazine feature opened doors I never knew existed. I&apos;ve gained thousands of followers and multiple modeling contracts since winning.&rdquo;
                      </p>
                      <p>
                        &ldquo;To every aspiring contestant reading this: believe in yourself, share your authentic story, and the world will take notice. BeautyVote is more than a competition — it&apos;s a launchpad for dreams.&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop"
                          alt="Adaeze Okonkwo"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Adaeze Okonkwo</p>
                        <p className="text-xs text-muted-foreground">Season 1 Winner • Brand Ambassador</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14 relative overflow-hidden">
                  {/* Confetti decoration */}
                  <div className="absolute top-4 left-8 text-2xl opacity-20">🎉</div>
                  <div className="absolute top-8 right-12 text-xl opacity-20">⭐</div>
                  <div className="absolute bottom-6 left-16 text-lg opacity-20">✨</div>
                  <div className="absolute bottom-4 right-8 text-2xl opacity-20">🎊</div>
                  <div className="absolute top-1/2 left-6 text-xl opacity-20">🏆</div>
                  <div className="absolute top-1/2 right-6 text-xl opacity-20">💎</div>

                  <div className="relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 mx-auto mb-6"
                    >
                      <Gem className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4">
                      Want to Win These <span className="gradient-text">Prizes?</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                      Start voting or register as a contestant to compete for these
                      amazing rewards!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                        onClick={() => navigate('register')}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Register Now
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="px-8 py-6 rounded-2xl font-semibold"
                        onClick={() => navigate('leaderboard')}
                      >
                        Vote for Contestants
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
