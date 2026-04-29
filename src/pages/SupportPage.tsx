'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Headphones,
  HelpCircle,
  MessageCircle,
  FileText,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Search,
  Plus,
  Paperclip,
  Send,
  ChevronRight,
  Clock,
  BookOpen,
  Shield,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Loader2,
  FileQuestion,
  Settings,
  Banknote,
  Users,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/navigation-store';
import { toast } from 'sonner';

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

const quickLinks = [
  {
    icon: HelpCircle,
    title: 'FAQ',
    description: 'Browse our frequently asked questions for instant answers.',
    color: 'from-blue-500 to-cyan-500',
    action: () => {},
  },
  {
    icon: MessageCircle,
    title: 'Contact Us',
    description: 'Get in touch with our support team directly.',
    color: 'from-green-500 to-emerald-500',
    action: () => {},
  },
  {
    icon: BookOpen,
    title: 'Instructions',
    description: 'Learn how to vote, register, and participate.',
    color: 'from-purple-500 to-violet-500',
    action: () => {},
  },
  {
    icon: AlertTriangle,
    title: 'Report Issue',
    description: 'Report a bug, abuse, or technical issue.',
    color: 'from-red-500 to-orange-500',
    action: () => {},
  },
  {
    icon: CreditCard,
    title: 'Payment Issues',
    description: 'Help with failed payments or missing votes.',
    color: 'from-amber-500 to-yellow-500',
    action: () => {},
  },
  {
    icon: UserCheck,
    title: 'Account Help',
    description: 'Reset password, update profile, or verify email.',
    color: 'from-pink-500 to-rose-500',
    action: () => {},
  },
];

const faqs = [
  { question: 'How do I reset my password?', answer: 'Go to the login page and click "Forgot Password". Enter your email and follow the instructions sent to your inbox.' },
  { question: 'Why was my payment not credited?', answer: 'Payments may take up to 30 minutes to process. If your votes are still not credited after 1 hour, please contact support with your transaction reference.' },
  { question: 'How do I register as a contestant?', answer: 'Log into your account, go to your dashboard, and click "Join Tournament". Upload your photos and bio, then submit for admin approval.' },
  { question: 'Can I change my vote after casting?', answer: 'No, all votes are final once cast. Please double-check before confirming your vote.' },
  { question: 'What are the voting fees?', answer: 'Each vote costs ₦200. You can purchase vote packages that include bonus votes at discounted rates.' },
  { question: 'How do referrals work?', answer: 'Share your unique referral link with friends. When they register, both of you receive bonus votes automatically.' },
  { question: 'When are winners announced?', answer: 'Winners are announced within 48 hours after the final voting stage closes. Results are verified before publication.' },
  { question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption and never share your personal data with third parties without consent.' },
];

const mockTickets = [
  { id: 'BV-1042', subject: 'Payment not reflected in my account', date: '2025-01-15', priority: 'High', status: 'Open' as const },
  { id: 'BV-1038', subject: 'Cannot upload contestant photos', date: '2025-01-14', priority: 'Medium', status: 'In Progress' as const },
  { id: 'BV-1031', subject: 'Referral bonus votes not received', date: '2025-01-12', priority: 'High', status: 'Resolved' as const },
  { id: 'BV-1025', subject: 'Request for account name change', date: '2025-01-10', priority: 'Low', status: 'Closed' as const },
  { id: 'BV-1019', subject: 'How to increase vote count quickly?', date: '2025-01-08', priority: 'Low', status: 'Closed' as const },
];

const popularArticles = [
  {
    icon: CreditCard,
    title: 'Payment Troubleshooting Guide',
    description: 'Step-by-step guide to resolve common payment issues including failed transactions and missing votes.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Account Security Best Practices',
    description: 'Learn how to keep your account safe with strong passwords, 2FA, and recognizing phishing attempts.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Contestant Registration Guide',
    description: 'Complete guide on how to register as a contestant, upload photos, and submit your profile for approval.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Banknote,
    title: 'Understanding Vote Packages',
    description: 'Compare all vote packages, bonus vote offers, and find the best value for your budget.',
    color: 'from-green-500 to-emerald-500',
  },
];

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  Resolved: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  Closed: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function SupportPage() {
  const { navigate } = useNavigationStore();
  const [faqSearch, setFaqSearch] = useState('');
  const [ticketForm, setTicketForm] = useState({
    category: '',
    priority: '',
    subject: '',
    description: '',
  });
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.category || !ticketForm.priority || !ticketForm.subject || !ticketForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Support ticket submitted successfully! We will respond within 24 hours.');
    setTicketForm({ category: '', priority: '', subject: '', description: '' });
    setFileName('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=600&fit=crop"
            alt="Customer support"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Headphones className="w-3 h-3 mr-1" />
                Support Center
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Help & <span className="text-amber-400">Support</span> Center
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="text-white/80 max-w-2xl mx-auto text-lg">
              Find answers, create support tickets, and get help from our dedicated support team. We&apos;re here for you 24/7.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links Grid */}
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
              How Can We <span className="gradient-text">Help?</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Choose a category below to find the help you need quickly
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quickLinks.map((link, i) => (
              <motion.div key={link.title} variants={fadeInUp} custom={i}>
                <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer group border-0">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{link.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search FAQs */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-2xl sm:text-3xl font-bold mb-3">
              Search Our <span className="gradient-text">FAQs</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Find instant answers to common questions
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers... e.g., payment, voting, account"
                className="pl-12 h-14 rounded-2xl text-base shadow-lg border-0 bg-background"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
            </div>
          </motion.div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl border-0">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                      <FileQuestion className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No results found. Try a different search term or <button onClick={() => navigate('faq')} className="text-primary underline">browse all FAQs</button>.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Create Support Ticket */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Plus className="w-3 h-3 mr-1" />
                New Ticket
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
              Create a <span className="gradient-text">Support Ticket</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Describe your issue and our team will get back to you within 24 hours
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-lg rounded-2xl border-0">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select value={ticketForm.category} onValueChange={(val) => setTicketForm({ ...ticketForm, category: val })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account Issues</SelectItem>
                          <SelectItem value="payment">Payment Problems</SelectItem>
                          <SelectItem value="voting">Voting Issues</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="contestant">Contestant Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        Priority <span className="text-destructive">*</span>
                      </Label>
                      <Select value={ticketForm.priority} onValueChange={(val) => setTicketForm({ ...ticketForm, priority: val })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      className="rounded-xl h-12"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe your issue in detail. Include any relevant information such as error messages, transaction IDs, or screenshots."
                      className="rounded-xl min-h-[150px] resize-y"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    />
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label>Attach File (optional)</Label>
                    <div className="border-2 border-dashed rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFileName(file.name);
                        }}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Paperclip className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {fileName || 'Click to upload a screenshot or document'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, PDF up to 5MB
                        </p>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 rounded-2xl font-semibold shadow-lg shadow-primary/25 h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Support Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* My Tickets */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-2xl sm:text-3xl font-bold mb-3">
              My <span className="gradient-text">Support Tickets</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Track the status of your submitted tickets
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {mockTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <CircleDot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="font-mono">{ticket.id}</span>
                            <span>{ticket.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 pl-13 sm:pl-0">
                        <Badge className={`text-xs ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={`text-xs border ${statusColors[ticket.status]}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
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
              Popular <span className="gradient-text">Articles</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Helpful guides and resources to resolve common issues
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {popularArticles.map((article, i) => (
              <motion.div key={article.title} variants={fadeInUp} custom={i}>
                <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0 cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${article.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <article.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{article.description}</p>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read Article <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Still Need <span className="gradient-text">Help?</span>
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    Can&apos;t find what you&apos;re looking for? Our support team is just a click away.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                      onClick={() => navigate('contact')}
                    >
                      <Headphones className="w-5 h-5 mr-2" />
                      Contact Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-2xl font-semibold"
                      onClick={() => navigate('faq')}
                    >
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Browse FAQ
                    </Button>
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
