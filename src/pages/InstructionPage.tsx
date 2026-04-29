'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Vote,
  ShoppingCart,
  Users,
  Shield,
  Lightbulb,
  Heart,
  Crown,
  CheckCircle2,
  Zap,
  Gift,
  UserPlus,
  ArrowRight,
  Star,
  AlertTriangle,
  Clock,
  CreditCard,
  Link2,
  BadgeDollarSign,
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

const voteSteps = [
  {
    step: 1,
    title: 'Create an Account',
    desc: 'Register with your name, email, and password. It takes less than a minute and is completely free.',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Browse Contestants',
    desc: 'Explore the leaderboard to see all competing contestants. View their profiles, photos, and vote counts.',
    icon: Crown,
  },
  {
    step: 3,
    title: 'Click "Vote"',
    desc: 'Found your favorite? Click the vote button on their card. You get 3 free votes per contestant daily.',
    icon: Vote,
  },
  {
    step: 4,
    title: 'Confirm & Celebrate',
    desc: 'See the confirmation message and watch the vote count update in real-time. Share with friends!',
    icon: Heart,
  },
];

const purchaseSteps = [
  {
    title: 'Go to Vote Packages',
    desc: 'Navigate to your dashboard and find the "Buy Votes" section with available packages.',
    icon: ShoppingCart,
  },
  {
    title: 'Choose a Package',
    desc: 'Select the vote package that suits you. Popular packages come with bonus votes!',
    icon: Gift,
  },
  {
    title: 'Complete Payment',
    desc: 'Pay securely using your preferred method. Votes are credited instantly after payment.',
    icon: CreditCard,
  },
  {
    title: 'Start Voting',
    desc: 'Use your purchased votes to support contestants. There\'s no daily limit on paid votes.',
    icon: Zap,
  },
];

const referralDetails = [
  {
    title: 'Get Your Link',
    desc: 'After registering, you\'ll receive a unique referral link in your dashboard.',
    icon: Link2,
  },
  {
    title: 'Share with Friends',
    desc: 'Share your link on social media, WhatsApp, or directly with friends and family.',
    icon: Users,
  },
  {
    title: 'Earn Bonus Votes',
    desc: 'When someone registers using your link, both of you receive bonus votes instantly.',
    icon: BadgeDollarSign,
  },
];

const rules = [
  {
    title: 'Account Rules',
    items: [
      'Each person can only have one account. Multiple accounts will be banned.',
      'You must provide accurate information during registration.',
      'Accounts found using bots or automated voting tools will be permanently banned.',
      'You must be at least 18 years old to participate.',
    ],
    icon: Shield,
  },
  {
    title: 'Voting Rules',
    items: [
      'Free votes are limited to 3 per contestant per day (resets at midnight).',
      'Paid votes have no daily limit and can be used anytime.',
      'Votes are final once cast and cannot be reversed or transferred.',
      'Attempting to manipulate votes through any means is strictly prohibited.',
    ],
    icon: Vote,
  },
  {
    title: 'Contestant Rules',
    items: [
      'All contestants must submit authentic photos and information.',
      'Contestants cannot vote for themselves using multiple accounts.',
      'Harassment of other contestants or voters will result in disqualification.',
      'The platform reserves the right to disqualify any contestant for misconduct.',
    ],
    icon: AlertTriangle,
  },
  {
    title: 'Payment Rules',
    items: [
      'All vote purchases are final and non-refundable.',
      'Purchased votes must be used within the active tournament period.',
      'Fraudulent payment attempts will result in account suspension.',
      'Prices are subject to change with prior notice.',
    ],
    icon: CreditCard,
  },
];

const tips = [
  {
    title: 'Vote Daily',
    desc: 'Remember to use your 3 free votes every day. Consistent voting makes a big difference!',
    icon: Clock,
  },
  {
    title: 'Share Your Link',
    desc: 'Refer friends to earn bonus votes. The more referrals, the more power you have!',
    icon: Users,
  },
  {
    title: 'Diversify Your Support',
    desc: 'Spread your votes across your favorite contestants to keep the competition exciting.',
    icon: Star,
  },
  {
    title: 'Follow on Social Media',
    desc: 'Stay updated with announcements, bonus vote events, and special promotions.',
    icon: Heart,
  },
  {
    title: 'Buy Vote Packages',
    desc: 'Popular packages include bonus votes — get more value for your money.',
    icon: Gift,
  },
  {
    title: 'Engage the Community',
    desc: 'Discuss with other voters, share opinions, and build a community around your favorites.',
    icon: Lightbulb,
  },
];

export default function InstructionPage() {
  const { navigate } = useNavigationStore();

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
              <BookOpen className="w-3 h-3 mr-1" />
              Guide
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
          >
            How to <span className="gradient-text">Participate</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Everything you need to know about voting, purchasing votes,
            referrals, and the competition rules.
          </motion.p>
        </motion.div>

        {/* How to Vote */}
        <section className="mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Vote className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  How to Vote
                </h2>
                <p className="text-muted-foreground text-sm">
                  Follow these simple steps to cast your vote
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {voteSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  {/* Step number background */}
                  <div className="absolute -top-4 -right-4 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                    {step.step}
                  </div>
                  <CardContent className="p-0 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <step.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How to Purchase Votes */}
        <section className="mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  How to Purchase Votes
                </h2>
                <p className="text-muted-foreground text-sm">
                  Get more voting power with vote packages
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchaseSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-md transition-shadow">
                  <CardContent className="p-0 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Referral Program */}
        <section className="mb-20 bg-muted/30 rounded-3xl p-8 sm:p-12 -mx-4 sm:-mx-8 lg:-mx-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="text-center mb-10"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <Badge
                  variant="secondary"
                  className="mb-4 bg-primary/10 text-primary border-primary/20"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Referral Program
                </Badge>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                custom={1}
                className="text-2xl sm:text-3xl font-bold mb-3"
              >
                Earn Bonus Votes Through Referrals
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-muted-foreground max-w-xl mx-auto"
              >
                Share your unique referral link and earn bonus votes for every
                friend who joins!
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {referralDetails.map((detail, i) => (
                <motion.div
                  key={detail.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow group">
                    <CardContent className="p-0 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <detail.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{detail.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {detail.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Rules & Regulations */}
        <section className="mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Rules & Regulations
                </h2>
                <p className="text-muted-foreground text-sm">
                  Please read carefully before participating
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Tips Section */}
        <section className="mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Pro Tips
                </h2>
                <p className="text-muted-foreground text-sm">
                  Get the most out of your BeautyVote experience
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full p-5 hover:shadow-md transition-shadow group">
                  <CardContent className="p-0 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <tip.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-10 sm:p-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Start <span className="gradient-text">Voting?</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Now that you know how it works, join the community and make your
              voice count!
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
                View Leaderboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
