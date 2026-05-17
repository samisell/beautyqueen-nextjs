'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  BookOpen,
  Shield,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Loader2,
  FileQuestion,
  Banknote,
  Users,
  Inbox,
  RefreshCw,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
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

interface Ticket {
  id: string;
  ticketId: string;
  category: string;
  priority: string;
  subject: string;
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
  isReadByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  resolved: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  closed: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const categoryLabels: Record<string, string> = {
  account: 'Account Issues',
  payment: 'Payment Problems',
  voting: 'Voting Issues',
  technical: 'Technical Support',
  contestant: 'Contestant Support',
  other: 'Other',
};

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];
const MIN_SUBJECT_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 20;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SupportPage() {
  const { navigate } = useNavigationStore();
  const { isAuthenticated, token } = useAuthStore();
  const [faqSearch, setFaqSearch] = useState('');
  const [ticketForm, setTicketForm] = useState({
    category: '',
    priority: '',
    subject: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch {
      // Silently fail — tickets section shows login prompt
    } finally {
      setIsLoadingTickets(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleQuickLink = (title: string) => {
    switch (title) {
      case 'FAQ':
        navigate('faq');
        break;
      case 'Contact Us':
        navigate('contact');
        break;
      case 'Instructions':
        navigate('instruction');
        break;
      default:
        break;
    }
  };

  // --- Client-side validation ---
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!ticketForm.category) {
      newErrors.category = 'Please select a category.';
    }
    if (!ticketForm.priority) {
      newErrors.priority = 'Please select a priority level.';
    }
    if (!ticketForm.subject || ticketForm.subject.trim().length < MIN_SUBJECT_LENGTH) {
      newErrors.subject = `Subject must be at least ${MIN_SUBJECT_LENGTH} characters long.`;
    }
    if (!ticketForm.description || ticketForm.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- File handling ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    // Reset if no file
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      setFileError(`Invalid file type "${ext || file.type}". Allowed: PNG, JPG, WEBP, PDF.`);
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g. "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // --- Form submission ---
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build request body
      const body: Record<string, unknown> = {
        category: ticketForm.category,
        priority: ticketForm.priority,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
      };

      // Convert file to base64 if present
      if (selectedFile) {
        const base64Data = await fileToBase64(selectedFile);
        body.attachment = {
          name: selectedFile.name,
          type: selectedFile.type,
          data: base64Data,
        };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.data.message);
        setTicketForm({ category: '', priority: '', subject: '', description: '' });
        removeFile();
        setErrors({});
        fetchTickets();
      } else {
        toast.error(data.message || 'Failed to submit ticket. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when user edits a field
  const handleSubjectChange = (val: string) => {
    setTicketForm({ ...ticketForm, subject: val });
    if (errors.subject && val.trim().length >= MIN_SUBJECT_LENGTH) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.subject;
        return next;
      });
    }
  };

  const handleDescriptionChange = (val: string) => {
    setTicketForm({ ...ticketForm, description: val });
    if (errors.description && val.trim().length >= MIN_DESCRIPTION_LENGTH) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.description;
        return next;
      });
    }
  };

  const handleCategoryChange = (val: string) => {
    setTicketForm({ ...ticketForm, category: val });
    if (errors.category) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }
  };

  const handlePriorityChange = (val: string) => {
    setTicketForm({ ...ticketForm, priority: val });
    if (errors.priority) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.priority;
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <img
            src="/cleopas-monbest-FPfSFs5_tvM-unsplash.jpg"
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
            {[
              { icon: HelpCircle, title: 'FAQ', description: 'Browse our frequently asked questions for instant answers.', color: 'from-blue-500 to-cyan-500' },
              { icon: MessageCircle, title: 'Contact Us', description: 'Get in touch with our support team directly.', color: 'from-green-500 to-emerald-500' },
              { icon: BookOpen, title: 'Instructions', description: 'Learn how to vote, register, and participate.', color: 'from-purple-500 to-violet-500' },
              { icon: AlertTriangle, title: 'Report Issue', description: 'Report a bug, abuse, or technical issue.', color: 'from-red-500 to-orange-500' },
              { icon: CreditCard, title: 'Payment Issues', description: 'Help with failed payments or missing votes.', color: 'from-amber-500 to-yellow-500' },
              { icon: UserCheck, title: 'Account Help', description: 'Reset password, update profile, or verify email.', color: 'from-pink-500 to-rose-500' },
            ].map((link, i) => (
              <motion.div key={link.title} variants={fadeInUp} custom={i}>
                <Card
                  className="h-full p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer group border-0"
                  onClick={() => handleQuickLink(link.title)}
                >
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
                      <Select value={ticketForm.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className={`rounded-xl ${errors.category ? 'border-destructive ring-destructive/20 ring-2' : ''}`}>
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
                      {errors.category && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        Priority <span className="text-destructive">*</span>
                      </Label>
                      <Select value={ticketForm.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger className={`rounded-xl ${errors.priority ? 'border-destructive ring-destructive/20 ring-2' : ''}`}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.priority}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      className={`rounded-xl h-12 ${errors.subject ? 'border-destructive ring-destructive/20 ring-2' : ''}`}
                      value={ticketForm.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      {errors.subject ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.subject}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-xs ${ticketForm.subject.length < MIN_SUBJECT_LENGTH && ticketForm.subject.length > 0 ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                        {ticketForm.subject.length}/{MIN_SUBJECT_LENGTH} min
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe your issue in detail. Include any relevant information such as error messages, transaction IDs, or screenshots."
                      className={`rounded-xl min-h-[150px] resize-y ${errors.description ? 'border-destructive ring-destructive/20 ring-2' : ''}`}
                      value={ticketForm.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      {errors.description ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.description}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-xs ${ticketForm.description.length < MIN_DESCRIPTION_LENGTH && ticketForm.description.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/50'}`}>
                        {ticketForm.description.length}/{MIN_DESCRIPTION_LENGTH} min
                      </span>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label>Attach File (optional)</Label>

                    {/* File preview when a file is selected */}
                    {selectedFile && !fileError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-muted/40 overflow-hidden"
                      >
                        <div className="flex items-center gap-4 p-4">
                          {/* Thumbnail for images */}
                          {filePreview ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                              <img
                                src={filePreview}
                                alt={selectedFile.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              <FileText className="w-7 h-7 text-muted-foreground" />
                            </div>
                          )}
                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {selectedFile.type.split('/').pop()?.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={removeFile}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Image preview strip */}
                        {filePreview && (
                          <div className="border-t border-border">
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="w-full max-h-48 object-contain bg-muted/50"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* File error */}
                    {fileError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-destructive font-medium">Invalid File</p>
                          <p className="text-xs text-destructive/80 mt-0.5">{fileError}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive rounded-lg"
                          onClick={() => setFileError(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Upload drop zone */}
                    {!selectedFile && !fileError && (
                      <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer bg-muted/30 hover:border-primary/50`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            // Use a synthetic event pattern
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            if (fileInputRef.current) {
                              fileInputRef.current.files = dt.files;
                              // Trigger the onChange handler
                              fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                          }
                        }}
                      >
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          ref={fileInputRef}
                          accept=".png,.jpg,.jpeg,.webp,.pdf"
                          onChange={handleFileSelect}
                        />
                        <Paperclip className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP, PDF up to {formatFileSize(MAX_FILE_SIZE)}
                        </p>
                      </div>
                    )}

                    {/* Re-show upload button after removal */}
                    {selectedFile && !fileError && (
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        Replace file
                      </button>
                    )}
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

          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg rounded-2xl border-0">
                <CardContent className="p-10 text-center">
                  <Inbox className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Login to View Your Tickets</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Sign in to your account to create and track support tickets.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="rounded-xl font-medium"
                      onClick={() => navigate('login')}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl font-medium"
                      onClick={() => navigate('register')}
                    >
                      Create Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : isLoadingTickets ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg rounded-2xl border-0">
                <CardContent className="p-10 text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    You haven&apos;t created any support tickets. Create one above if you need help!
                  </p>
                  <Button
                    className="rounded-xl font-medium"
                    onClick={() => {
                      document.querySelector<HTMLFormElement>('form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={fetchTickets}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
              {tickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0">
                    <CardContent className="p-5">
                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              ticket.adminReply && !ticket.isReadByUser
                                ? 'bg-primary/20'
                                : 'bg-primary/10'
                            }`}>
                              <CircleDot className={`w-5 h-5 ${ticket.adminReply && !ticket.isReadByUser ? 'text-primary' : 'text-primary/70'}`} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm truncate">{ticket.subject}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="font-mono">{ticket.ticketId}</span>
                                <span>{categoryLabels[ticket.category] || ticket.category}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                {ticket.adminReply && (
                                  <span className="text-primary font-medium">Has reply</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 pl-13 sm:pl-0">
                            <Badge className={`text-xs ${priorityColors[ticket.priority] || ''}`}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={`text-xs border ${statusColors[ticket.status] || ''}`}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedTicket === ticket.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </button>

                      {/* Expanded reply section */}
                      {expandedTicket === ticket.id && ticket.adminReply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 ml-13 sm:ml-[52px]"
                        >
                          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Headphones className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold text-primary">Admin Reply</span>
                              {ticket.repliedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.repliedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{ticket.adminReply}</p>
                          </div>
                        </motion.div>
                      )}

                      {expandedTicket === ticket.id && !ticket.adminReply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 ml-13 sm:ml-[52px]"
                        >
                          <p className="text-sm text-muted-foreground italic">No reply yet. Our team will respond within 24 hours.</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
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
