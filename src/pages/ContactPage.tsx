'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle2,
  User,
  FileText,
  Headphones,
  Shield,
  Zap,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Star,
  ThumbsUp,
  Timer,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@beautyvote.com',
    subDetail: 'We reply within 24 hours',
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=200&fit=crop',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+234 800 123 4567',
    subDetail: 'Mon-Fri, 9am - 6pm WAT',
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Lagos, Nigeria',
    subDetail: 'Victoria Island, Lagos',
    color: 'from-purple-500 to-violet-500',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
  },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-500/10 hover:text-blue-500' },
  { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500/10 hover:text-sky-500' },
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-500/10 hover:text-pink-500' },
  { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:bg-red-500/10 hover:text-red-500' },
];

const popularFaqs = [
  {
    question: 'How do I create an account?',
    answer: 'Click the "Register" button on the top navigation bar. Fill in your name, email, and password. Registration is completely free and takes less than a minute.',
  },
  {
    question: 'How much does each vote cost?',
    answer: 'Each vote costs ₦200. You can purchase vote packages that include bonus votes at discounted rates. Payment can be made via Flutterwave, Paystack, or bank transfer.',
  },
  {
    question: 'How are winners determined?',
    answer: 'Winners are determined by total votes received across all tournament stages. At the end of each stage, the lowest-performing contestants may be eliminated.',
  },
];

const trustIndicators = [
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Our team is always available to help',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Secure Connection',
    desc: 'All data is encrypted and protected',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Fast Response',
    desc: 'Average response time under 2 hours',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ThumbsUp,
    title: 'Satisfaction Guaranteed',
    desc: '98% of users rate us 4+ stars',
    color: 'from-purple-500 to-violet-500',
  },
];

export default function ContactPage() {
  const { navigate } = useNavigationStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Message sent successfully! We'll get back to you soon.");
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
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
              <Badge className="mb-4 bg-white/10 text-white border-white/20">
                <MessageSquare className="w-3 h-3 mr-1" />
                Contact
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Get in <span className="text-amber-400">Touch</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="text-white/80 max-w-2xl mx-auto text-lg">
              Have a question, suggestion, or feedback? We&apos;d love to hear from you. Our team is ready to help!
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {trustIndicators.map((item, i) => (
              <motion.div key={item.title} variants={fadeInUp} custom={i}>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0 p-4 text-center">
                  <CardContent className="p-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {contactInfo.map((info, i) => (
              <motion.div key={info.title} variants={fadeInUp} custom={i}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden border-0 group">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={info.image}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 -mt-12 relative z-10 border-4 border-background`}>
                      <info.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                    <p className="text-primary font-medium text-sm">{info.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{info.subDetail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Send Us a Message
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form below and we&apos;ll respond as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We&apos;ll respond within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              name="name"
                              placeholder="John Doe"
                              className="pl-10 rounded-xl h-12"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email Address <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="john@example.com"
                              className="pl-10 rounded-xl h-12"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="What is this about?"
                            className="pl-10 rounded-xl h-12"
                            value={formData.subject}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          className="rounded-xl min-h-[150px] resize-y"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 rounded-2xl font-semibold shadow-lg shadow-primary/25 h-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Decorative Image */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="h-48">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop"
                    alt="Team meeting"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Card>

              {/* Office Hours */}
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold">Office Hours</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs">9am - 6pm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs">10am - 4pm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map((social) => (
                      <button
                        key={social.label}
                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors border hover:border-primary/20 ${social.color}`}
                      >
                        <social.icon className="w-4 h-4" />
                        {social.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
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
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-2xl sm:text-3xl font-bold mb-3">
              Frequently Asked <span className="gradient-text">Questions</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              Here are the top questions our users ask. Need more answers?
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-2 sm:p-4">
                <Accordion type="single" collapsible className="w-full">
                  {popularFaqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="px-4 sm:px-6">
                      <AccordionTrigger className="text-left hover:no-underline py-4 text-sm sm:text-base font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-6"
          >
            <Button
              variant="outline"
              className="rounded-2xl font-medium"
              onClick={() => navigate('faq')}
            >
              View All FAQs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Headphones className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Need <span className="gradient-text">Immediate Help?</span>
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    Our support team is standing by. Create a ticket or call us directly for urgent matters.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                      onClick={() => navigate('support')}
                    >
                      <Headphones className="w-5 h-5 mr-2" />
                      Support Center
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-2xl font-semibold"
                      onClick={() => navigate('faq')}
                    >
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Read FAQ
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
