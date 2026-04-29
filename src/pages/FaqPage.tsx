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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
}

const faqCategories: { key: FaqCategory; label: string; icon: typeof HelpCircle }[] = [
  { key: 'general', label: 'General', icon: CircleHelp },
  { key: 'voting', label: 'Voting', icon: ChevronDown },
  { key: 'payments', label: 'Payments', icon: Mail },
  { key: 'tournament', label: 'Tournament', icon: MessageCircle },
];

const faqItems: FaqItem[] = [
  {
    question: 'What is BeautyVote?',
    answer:
      'BeautyVote is an online beauty voting platform where contestants compete across multiple stages, and the community votes to determine the winner. It features real-time leaderboards, fair voting mechanisms, and amazing cash prizes for winners.',
    category: 'general',
  },
  {
    question: 'How do I create an account?',
    answer:
      'Click the "Register" button on the top navigation bar. Fill in your name, email, and password. You can also use a referral code from a friend to earn bonus votes. Registration is completely free and takes less than a minute.',
    category: 'general',
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
      'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. All transactions are processed securely through our payment partners. Payment details are never stored on our servers.',
    category: 'payments',
  },
  {
    question: 'Are refunds available for purchased votes?',
    answer:
      'Vote purchases are final and non-refundable. Once votes are credited to your account, they cannot be exchanged for cash. Please make sure to choose the right vote package before completing your purchase.',
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

  const groupedFaqs: Record<FaqCategory, FaqItem[]> = {
    general: filteredFaqs.filter((f) => f.category === 'general'),
    voting: filteredFaqs.filter((f) => f.category === 'voting'),
    payments: filteredFaqs.filter((f) => f.category === 'payments'),
    tournament: filteredFaqs.filter((f) => f.category === 'tournament'),
  };

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
          >
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Find answers to the most common questions about BeautyVote. Can&apos;t
            find what you&apos;re looking for? Contact us!
          </motion.p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-12 h-12 rounded-xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            className={`rounded-full ${
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
              className={`rounded-full ${
                activeCategory === cat.key ? 'bg-primary hover:bg-primary/90' : ''
              }`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <cat.icon className="w-3.5 h-3.5 mr-1" />
              {cat.label}
            </Button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          {(activeCategory === 'all'
            ? faqCategories
            : faqCategories.filter((c) => c.key === activeCategory)
          ).map((catGroup) => {
            const items = groupedFaqs[catGroup.key];
            if (items.length === 0) return null;

            return (
              <div key={catGroup.key}>
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
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {items.map((item, i) => (
                        <AccordionItem
                          key={i}
                          value={`${catGroup.key}-${i}`}
                          className="px-6 border-b last:border-b-0"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="pr-4 font-medium">
                              {item.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
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
        </motion.div>

        {/* Contact CTA */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Still Have Questions?
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
                      onClick={() => navigate('instruction')}
                    >
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Read Instructions
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
        </section>
      </div>
    </div>
  );
}
