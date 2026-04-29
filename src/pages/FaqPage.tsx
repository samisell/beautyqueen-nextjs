'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  Mail,
  Phone,
  Search,
  CircleHelp,
  Star,
  Play,
  BookOpen,
  CreditCard,
  Vote,
  Users,
  Crown,
  Zap,
  FileQuestion,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

type FaqCategory = 'general' | 'voting' | 'payments' | 'tournament';

interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
  isPopular?: boolean;
}

const faqCategories: { key: FaqCategory; label: string; icon: typeof HelpCircle }[] = [
  { key: 'general', label: 'General', icon: CircleHelp },
  { key: 'voting', label: 'Voting', icon: Vote },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'tournament', label: 'Tournament', icon: Crown },
];

const faqItems: FaqItem[] = [
  {
    question: 'What is BeautyVote?',
    answer:
      'BeautyVote is an online beauty voting platform where contestants compete across multiple stages, and the community votes to determine the winner. It features real-time leaderboards, fair voting mechanisms, and amazing cash prizes for winners.',
    category: 'general',
    isPopular: true,
  },
  {
    question: 'How do I create an account?',
    answer:
      'Click the "Register" button on the top navigation bar. Fill in your name, email, and password. You can also use a referral code from a friend to earn bonus votes. Registration is completely free and takes less than a minute.',
    category: 'general',
    isPopular: true,
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'Absolutely! We take data privacy seriously. Your information is encrypted and stored securely. We never share your personal data with third parties without your consent. Our platform uses industry-standard security practices.',
    category: 'general',
  },
  {
    question: 'How many free votes do I get?',
    answer:
      'Every registered user gets 3 free votes per contestant per day. This means you can vote for multiple contestants each day, up to 3 times for each one. Free votes reset every day at midnight.',
    category: 'voting',
  },
  {
    question: 'Can I buy additional votes?',
    answer:
      'Yes! You can purchase vote packages through our platform. We offer various packages with different numbers of votes and bonus votes. Paid votes have no daily limit, so you can support your favorite contestant as much as you want.',
    category: 'voting',
  },
  {
    question: 'How do I know my vote was counted?',
    answer:
      'After casting a vote, you\'ll see a confirmation message and the vote count on the leaderboard will update in real-time. You can also check your vote history in your dashboard to see all the votes you\'ve cast.',
    category: 'voting',
    isPopular: true,
  },
  {
    question: 'Can I change my vote?',
    answer:
      'Once a vote is cast, it cannot be reversed or changed. Please make sure you\'re voting for the right contestant before confirming. This policy ensures the integrity and fairness of the competition.',
    category: 'voting',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept various payment methods including credit/debit cards (via Flutterwave and Paystack), and bank transfers for offline payments. All transactions are processed securely through our payment partners. Payment details are never stored on our servers.',
    category: 'payments',
  },
  {
    question: 'Are refunds available for purchased votes?',
    answer:
      'Vote purchases are final and non-refundable. Once votes are credited to your account, they cannot be exchanged for cash. Please make sure to choose the right vote package before completing your purchase.',
    category: 'payments',
  },
  {
    question: 'How much does each vote cost?',
    answer:
      'Each vote costs ₦200 (two hundred Naira). You can purchase vote packages in bulk which may include bonus votes for better value. Payments can be made via Flutterwave, Paystack, or direct bank transfer.',
    category: 'payments',
  },
  {
    question: 'How are tournament stages determined?',
    answer:
      'The tournament consists of multiple stages: Preliminary, Semi-Final, and Final rounds. Contestants progress through stages based on their total votes. The lowest-performing contestants may be eliminated at each stage.',
    category: 'tournament',
  },
  {
    question: 'When will the winners be announced?',
    answer:
      'Winners are announced within 48 hours after the final voting stage closes. Results are verified for accuracy before being published. Winners will be notified via email and announced on all our social media platforms.',
    category: 'tournament',
  },
  {
    question: 'How does the referral program work?',
    answer:
      'When you register, you receive a unique referral link. Share this link with friends — when they register using your link, both you and your friend receive bonus votes. The more friends you refer, the more bonus votes you earn!',
    category: 'general',
  },
];

const videoTutorials = [
  {
    title: 'How to Vote',
    description: 'Learn how to navigate the leaderboard and cast your first vote step by step.',
    icon: Vote,
    color: 'from-orange-500 to-amber-500',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
    duration: '3:45',
  },
  {
    title: 'How to Register as Contestant',
    description: 'Complete guide to joining a tournament, uploading photos, and submitting your profile.',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop',
    duration: '5:20',
  },
  {
    title: 'Payment Guide',
    description: 'Understanding payment methods, vote packages, and how to complete your purchase.',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
    duration: '4:10',
  },
];

export default function FaqPage() {
  const { navigate } = useNavigationStore();
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularQuestions = faqItems.filter((item) => item.isPopular);

  const groupedFaqs: Record<FaqCategory, FaqItem[]> = {
    general: filteredFaqs.filter((f) => f.category === 'general'),
    voting: filteredFaqs.filter((f) => f.category === 'voting'),
    payments: filteredFaqs.filter((f) => f.category === 'payments'),
    tournament: filteredFaqs.filter((f) => f.category === 'tournament'),
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeInUp} custom={0}>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Help Center
                  </Badge>
                </motion.div>
                <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Frequently Asked{' '}
                  <span className="gradient-text">Questions</span>
                </motion.h1>
                <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-lg">
                  Find answers to the most common questions about BeautyVote. Can&apos;t
                  find what you&apos;re looking for? Contact us!
                </motion.p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:block w-72 h-56 rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=500&fit=crop"
                alt="Help desk"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Questions Highlight */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-8"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Most Asked Questions</h2>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {popularQuestions.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0 overflow-hidden group cursor-pointer relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-primary/90 text-white text-xs shadow-md">
                      <Star className="w-3 h-3 mr-1" />
                      Top Asked
                    </Badge>
                  </div>
                  <CardContent className="p-6 pt-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                      <FileQuestion className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.answer}</p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search questions... e.g., payment, voting, account"
                className="pl-14 h-14 rounded-2xl text-base shadow-lg border-0 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <Button
              size="sm"
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className={`rounded-full shadow-sm ${
                activeCategory === 'all' ? 'bg-primary hover:bg-primary/90' : ''
              }`}
              onClick={() => setActiveCategory('all')}
            >
              All Questions
            </Button>
            {faqCategories.map((cat) => (
              <Button
                key={cat.key}
                size="sm"
                variant={activeCategory === cat.key ? 'default' : 'outline'}
                className={`rounded-full shadow-sm ${
                  activeCategory === cat.key ? 'bg-primary hover:bg-primary/90' : ''
                }`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <cat.icon className="w-3.5 h-3.5 mr-1" />
                {cat.label}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {(activeCategory === 'all'
            ? faqCategories
            : faqCategories.filter((c) => c.key === activeCategory)
          ).map((catGroup) => {
            const items = groupedFaqs[catGroup.key];
            if (items.length === 0) return null;

            return (
              <motion.div
                key={catGroup.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <catGroup.icon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">{catGroup.label}</h2>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary"
                  >
                    {items.length}
                  </Badge>
                </div>
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {items.map((item, i) => (
                        <AccordionItem
                          key={i}
                          value={`${catGroup.key}-${i}`}
                          className="px-6 border-b last:border-b-0"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="pr-4 font-medium text-sm sm:text-base">
                              {item.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* No results */}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No questions found
              </h3>
              <p className="text-muted-foreground">
                No results for &ldquo;{searchQuery}&rdquo;. Try a different search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Video Tutorial Section */}
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
                <Play className="w-3 h-3 mr-1" />
                Video Tutorials
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
              Learn by <span className="gradient-text">Watching</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Watch these quick video guides to get started with BeautyVote
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {videoTutorials.map((video, i) => (
              <motion.div key={video.title} variants={fadeInUp} custom={i}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border-0 group cursor-pointer">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 text-primary ml-1" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/70 text-white text-xs border-0">
                        {video.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${video.color} flex items-center justify-center`}>
                        <video.icon className="w-4 h-4 text-white" />
                      </div>
                      <Badge className="text-xs bg-muted text-muted-foreground border-0">Tutorial</Badge>
                    </div>
                    <h3 className="font-bold text-base mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14 text-center relative">
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-8 text-2xl opacity-15">💬</div>
                  <div className="absolute bottom-4 right-8 text-2xl opacity-15">🤝</div>

                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Still Have <span className="gradient-text">Questions?</span>
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    Our support team is always ready to help. Reach out to us
                    through any of the channels below.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                      onClick={() => navigate('contact')}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-2xl font-semibold"
                      onClick={() => navigate('support')}
                    >
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Support Center
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      support@beautyvote.com
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      +234 800 123 4567
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
