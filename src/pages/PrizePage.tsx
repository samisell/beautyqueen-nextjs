'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    items: [
      'Grand Crown Trophy',
      '$5,000 Cash Prize',
      'Brand Ambassador Deal',
      'Professional Photoshoot',
      'Feature in Magazine',
    ],
    gradient: 'linear-gradient(135deg, #fef3c7, #fbbf24, #f59e0b)',
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
    bgColor: 'bg-gray-50 dark:bg-gray-900/30',
    items: [
      'Silver Trophy',
      '$3,000 Cash Prize',
      'Gift Package Worth $500',
      'Professional Photoshoot',
      'Social Media Feature',
    ],
    gradient: 'linear-gradient(135deg, #f3f4f6, #d1d5db, #9ca3af)',
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
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    items: [
      'Bronze Trophy',
      '$1,500 Cash Prize',
      'Gift Package Worth $200',
      'Professional Photoshoot',
      'Social Media Shoutout',
    ],
    gradient: 'linear-gradient(135deg, #fed7aa, #fb923c, #ea580c)',
  },
];

const categoryPrizes = [
  {
    category: 'Miss Photogenic',
    icon: Camera,
    prize: '$500 + Professional Portfolio',
    color: 'from-pink-500 to-rose-500',
  },
  {
    category: 'Miss Talent',
    icon: Music,
    prize: '$500 + Recording Session',
    color: 'from-violet-500 to-purple-500',
  },
  {
    category: 'Miss Popularity',
    icon: Star,
    prize: '$500 + Social Media Package',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    category: 'People\'s Choice',
    icon: Heart,
    prize: '$300 + Gift Hamper',
    color: 'from-rose-500 to-pink-500',
  },
];

const awardSteps = [
  {
    step: 1,
    title: 'Voting Closes',
    desc: 'All voting concludes at the end of the final tournament stage. No more votes can be cast.',
  },
  {
    step: 2,
    title: 'Results Verification',
    desc: 'Our team verifies all votes to ensure fairness and accuracy. Fraudulent votes are removed.',
  },
  {
    step: 3,
    title: 'Winners Announced',
    desc: 'The final leaderboard is published and winners are announced across all our platforms.',
  },
  {
    step: 4,
    title: 'Prize Distribution',
    desc: 'Winners are contacted for verification, and prizes are distributed within 7 business days.',
  },
];

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} custom={0}>
              <div className="inline-flex items-center justify-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30"
                >
                  <Gem className="w-10 h-10 text-white" />
                </motion.div>
              </div>
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
          </motion.div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {prizeTiers.map((tier, i) => (
              <motion.div
                key={tier.rank}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`${i === 0 ? 'lg:-mt-4' : ''}`}
              >
                <Card
                  className={`relative overflow-hidden h-full border-2 ${tier.borderColor} ${
                    i === 0 ? 'shadow-2xl shadow-amber-500/10' : 'hover:shadow-xl'
                  } transition-shadow duration-300`}
                >
                  {/* Top gradient bar */}
                  <div
                    className="h-2"
                    style={{ background: tier.gradient }}
                  />

                  <CardContent className="p-6 sm:p-8">
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <Badge
                        className={`${tier.color} text-white font-bold px-3 py-1`}
                      >
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
                    <div className="flex justify-center mb-6">
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-xl ${
                          i === 0 ? 'ring-4 ring-yellow-400/30' : ''
                        }`}
                      >
                        <tier.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-1">{tier.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tier.subtitle}
                      </p>
                    </div>

                    {/* Prize Amount */}
                    <div className="text-center mb-6">
                      <p
                        className={`text-4xl font-extrabold ${tier.textColor}`}
                      >
                        {tier.prize}
                      </p>
                    </div>

                    <Separator className="mb-6" />

                    {/* Prize Items */}
                    <ul className="space-y-3">
                      {tier.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${tier.textColor} shrink-0`}
                          />
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
            <Card className="inline-flex items-center gap-3 px-6 py-3 border-dashed">
              <Gift className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Additional surprise prizes may be awarded to top performers!
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Category Prizes */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Category <span className="gradient-text">Prizes</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
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
                <Card className="h-full text-center p-6 hover:shadow-xl transition-all duration-300 group border-0">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <cat.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{cat.category}</h3>
                    <p className="text-sm text-primary font-semibold">
                      {cat.prize}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Prizes Are Awarded */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              How Prizes Are{' '}
              <span className="gradient-text">Awarded</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Our transparent prize distribution process ensures fairness for all
              participants.
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

                    <Card className="ml-16 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {step.step}
                          </div>
                          <h3 className="font-bold">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
