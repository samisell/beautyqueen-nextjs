'use client';

import { useState } from 'react';
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
  Camera,
  FileText,
  ImageIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Ban,
  UserX,
  Lock,
  Eye,
  Edit3,
  PenTool,
  Upload,
  Banknote,
  Smartphone,
  Landmark,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    desc: 'Found your favorite? Click the vote button on their card. Each vote costs ₦200.',
    icon: Vote,
  },
  {
    step: 4,
    title: 'Confirm & Celebrate',
    desc: 'See the confirmation message and watch the vote count update in real-time. Share with friends!',
    icon: Heart,
  },
];

const contestantSteps = [
  {
    step: 1,
    title: 'Register & Join Tournament',
    desc: 'Log into your account, navigate to your dashboard, and click "Join Tournament" to enter the competition.',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Upload Stunning Photos',
    desc: 'Add your best high-quality photos to your gallery. Use natural lighting and authentic poses for maximum impact.',
    icon: Camera,
  },
  {
    step: 3,
    title: 'Write a Compelling Bio',
    desc: 'Share your story, interests, and what makes you unique. A great bio helps voters connect with you.',
    icon: PenTool,
  },
  {
    step: 4,
    title: 'Submit Tasks on Time',
    desc: 'Complete and submit all assigned tasks before the deadline. Tasks boost your visibility and voter engagement.',
    icon: Upload,
  },
];

const paymentMethods = [
  {
    title: 'Flutterwave (Card Payment)',
    steps: ['Select Flutterwave as payment method', 'Enter your card details securely', 'Complete OTP verification', 'Votes credited instantly'],
    icon: CreditCard,
    color: 'from-orange-500 to-amber-500',
    note: 'Supports Visa, Mastercard, and Verve cards',
  },
  {
    title: 'Paystack (Card Payment)',
    steps: ['Select Paystack as payment method', 'Enter your card details securely', 'Complete OTP verification', 'Votes credited instantly'],
    icon: Smartphone,
    color: 'from-green-500 to-emerald-500',
    note: 'Supports Visa and Mastercard',
  },
  {
    title: 'Offline (Bank Transfer)',
    steps: ['Select Offline Payment method', 'Copy our bank account details', 'Make the transfer at any bank', 'Upload payment proof for verification'],
    icon: Landmark,
    color: 'from-blue-500 to-indigo-500',
    note: 'Votes credited within 2-24 hours after verification',
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

const dosList = [
  { text: 'Vote fairly and honestly', icon: ThumbsUp },
  { text: 'Share contestant links with friends', icon: ShareIcon as typeof ShareIcon },
  { text: 'Participate in all assigned tasks', icon: CheckCircle2 },
  { text: 'Keep your profile updated', icon: Edit3 },
  { text: 'Engage with the community positively', icon: MessageSquare },
  { text: 'Report suspicious activity to support', icon: Shield },
];

const dontsList = [
  { text: 'Create multiple accounts', icon: UserX },
  { text: 'Use bots or automated tools', icon: Bot },
  { text: 'Harass other contestants or voters', icon: Ban },
  { text: 'Share your payment details with anyone', icon: Lock },
  { text: 'Attempt to manipulate vote counts', icon: AlertCircle },
  { text: 'Submit fake or stolen photos', icon: XCircle },
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
      'Each vote costs ₦200. There are no free votes.',
      'Votes are final once cast and cannot be reversed or transferred.',
      'Attempting to manipulate votes through any means is strictly prohibited.',
      'All vote purchases are final and non-refundable.',
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
    desc: 'Support your favorites consistently. Every vote counts toward the final result!',
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

// Helper component for missing ShareIcon
function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function InstructionPage() {
  const { navigate } = useNavigationStore();
  const [activeTab, setActiveTab] = useState('voting');

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
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Complete Guide
                </Badge>
              </motion.div>
              <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                How to <span className="gradient-text">Participate</span>
              </motion.h1>
              <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto lg:mx-0">
                Everything you need to know about voting, purchasing votes,
                referrals, and the competition rules.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:block w-80 h-64 rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop"
                alt="Guide and books"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Tabs */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Tabs value={activeTab} onValueChange={(val) => {
              setActiveTab(val);
              const el = document.getElementById(val);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>
              <TabsList className="bg-muted/50 rounded-2xl p-1.5 flex-wrap h-auto">
                <TabsTrigger value="voting" className="rounded-xl px-4 py-2.5 text-sm font-medium">Voting</TabsTrigger>
                <TabsTrigger value="contestants" className="rounded-xl px-4 py-2.5 text-sm font-medium">Contestants</TabsTrigger>
                <TabsTrigger value="payments" className="rounded-xl px-4 py-2.5 text-sm font-medium">Payments</TabsTrigger>
                <TabsTrigger value="referrals" className="rounded-xl px-4 py-2.5 text-sm font-medium">Referrals</TabsTrigger>
                <TabsTrigger value="rules" className="rounded-xl px-4 py-2.5 text-sm font-medium">Rules</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Voting Guide Section */}
      <section id="voting" className="py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Content */}
            <div className="flex-1">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
                className="mb-10"
              >
                <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Vote className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">How to Vote</h2>
                    <p className="text-muted-foreground text-sm">Follow these simple steps to cast your vote</p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {voteSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl group relative overflow-hidden border-0">
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Important Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <Card className="border-2 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl">
                  <CardContent className="p-5 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-1">Important Note</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        All votes require payment of <strong>₦200 per vote</strong>. There are no free votes on this platform. Vote purchases are final and non-refundable.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Side Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block w-80 shrink-0 sticky top-28"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=500&fit=crop"
                  alt="Crowd voting"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-2xl text-center">
                <p className="text-sm font-medium text-muted-foreground">Every vote makes a difference</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contestant Guide Section */}
      <section id="contestants" className="py-16 sm:py-20 bg-muted/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Camera className="w-3 h-3 mr-1" />
                Contestant Guide
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
              How to Become a <span className="gradient-text">Contestant</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Follow these steps to register and maximize your chances of winning
            </motion.p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contestantSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl group relative overflow-hidden border-0">
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Profile Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Card className="p-5 shadow-md rounded-2xl border-0 bg-background">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-3">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-sm">Photo Tips</h4>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Use natural, well-lit photos</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Show your authentic personality</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Upload at least 3 high-quality photos</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="p-5 shadow-md rounded-2xl border-0 bg-background">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-sm">Bio Writing Tips</h4>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Be authentic and engaging</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Share your passions and dreams</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" /> Keep it concise but memorable</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Side Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block w-80 shrink-0 sticky top-28"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop"
                  alt="Beauty portrait"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payment Guide Section */}
      <section id="payments" className="py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Banknote className="w-3 h-3 mr-1" />
                Payment Guide
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
              How to <span className="gradient-text">Make Payments</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Choose from our 3 secure payment methods. Each vote costs ₦200.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, i) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${method.color}`} />
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-5 shadow-lg`}>
                      <method.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-4">{method.title}</h3>
                    <ul className="space-y-3 mb-5">
                      {method.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary text-xs font-bold">{j + 1}</span>
                          </div>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary shrink-0" />
                      {method.note}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
                  <div className="w-48 h-32 rounded-2xl overflow-hidden shrink-0 hidden sm:block">
                    <img
                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop"
                      alt="Security"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Secure & Encrypted Payments</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All transactions are processed through PCI-DSS compliant payment partners. Your card details are never stored on our servers. We use bank-grade encryption to protect every transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Referral Program */}
      <section id="referrals" className="py-16 sm:py-20 bg-muted/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hidden lg:block w-72 h-72 rounded-3xl overflow-hidden shadow-2xl shrink-0"
            >
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=500&fit=crop"
                alt="Handshake partnership"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
                className="text-center lg:text-left mb-10"
              >
                <motion.div variants={fadeInUp} custom={0}>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <Users className="w-3 h-3 mr-1" />
                    Referral Program
                  </Badge>
                </motion.div>
                <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
                  Earn Bonus Votes Through <span className="gradient-text">Referrals</span>
                </motion.h2>
                <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Share your unique referral link and earn bonus votes for every friend who joins!
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
                    <Card className="h-full text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl group border-0">
                      <CardContent className="p-0 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                          <detail.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{detail.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{detail.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Do's and Don'ts Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-2xl sm:text-3xl font-bold mb-3">
              Do&apos;s & <span className="gradient-text">Don&apos;ts</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Follow these guidelines to ensure a fair and enjoyable experience for everyone
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Do's */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg rounded-2xl border-0 overflow-hidden h-full">
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <ThumbsUp className="w-6 h-6" />
                    Do&apos;s
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {dosList.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-muted-foreground pt-1">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Don'ts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg rounded-2xl border-0 overflow-hidden h-full">
                <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <ThumbsDown className="w-6 h-6" />
                    Don&apos;ts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {dontsList.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm text-muted-foreground pt-1">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rules & Regulations */}
      <section id="rules" className="py-16 sm:py-20 bg-muted/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Rules & Regulations</h2>
                <p className="text-muted-foreground text-sm">Please read carefully before participating</p>
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
                <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ruleGroup.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{ruleGroup.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {ruleGroup.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
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
        </div>
      </section>

      {/* Pro Tips Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="mb-10"
          >
            <motion.div variants={fadeInUp} custom={0} className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Pro Tips</h2>
                <p className="text-muted-foreground text-sm">Get the most out of your BeautyVote experience</p>
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
                <Card className="h-full p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl group border-0">
                  <CardContent className="p-0 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <tip.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Now that you know how it works, join the community and make your voice count!
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
        </div>
      </section>
    </div>
  );
}
