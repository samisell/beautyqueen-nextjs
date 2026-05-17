'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Heart,
  Youtube,
  Send,
  ShieldCheck,
  Award,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Download,
  Zap,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/stores/navigation-store';
import { toast } from 'sonner';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', page: 'home' },
    { label: 'Leaderboard', page: 'leaderboard' },
    { label: 'Tournament', page: 'tournament' },
    { label: 'Prizes', page: 'prize' },
    { label: 'Vote Now', page: 'vote' },
  ],
  Information: [
    { label: 'About Us', page: 'about' },
    { label: 'FAQ', page: 'faq' },
    { label: 'Contact Us', page: 'contact' },
    { label: 'Instructions', page: 'instruction' },
    { label: 'Support Center', page: 'support' },
  ],
  Legal: [
    { label: 'Privacy Policy', page: 'privacy' },
    { label: 'Terms of Service', page: 'terms' },
    { label: 'Contest Rules', page: 'instruction' },
  ],
};

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#', hoverColor: 'hover:bg-[#1877F2] hover:shadow-[0_0_20px_rgba(24,119,242,0.4)]' },
  { icon: Twitter, label: 'Twitter', href: '#', hoverColor: 'hover:bg-[#1DA1F2] hover:shadow-[0_0_20px_rgba(29,161,242,0.4)]' },
  { icon: Instagram, label: 'Instagram', href: '#', hoverColor: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:shadow-[0_0_20px_rgba(238,42,123,0.4)]' },
  { icon: Youtube, label: 'YouTube', href: '#', hoverColor: 'hover:bg-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]' },
  { icon: Sparkles, label: 'TikTok', href: '#', hoverColor: 'hover:bg-[#00f2ea] hover:shadow-[0_0_20px_rgba(0,242,234,0.4)]' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Secure Payments', desc: '256-bit SSL encryption' },
  { icon: Award, label: 'Verified Platform', desc: 'Trusted by thousands' },
  { icon: Users, label: '10K+ Users', desc: 'Active community' },
  { icon: Globe, label: "Nigeria's #1", desc: 'Beauty voting platform' },
];

const stats = [
  { icon: Crown, value: '50K+', label: 'Votes Cast' },
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: TrendingUp, value: '200+', label: 'Contestants' },
  { icon: Star, value: '4.9', label: 'User Rating' },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Footer() {
  const { navigate } = useNavigationStore();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleNavClick = (page: string) => {
    navigate(page as Parameters<typeof navigate>[0]);
    window.scrollTo(0, 0);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email,
          subject: 'newsletter',
          message: `Newsletter subscription from ${email}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Successfully subscribed to our newsletter!');
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 4000);
      } else {
        toast.error(data.message || 'Failed to subscribe.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="relative mt-auto">
      {/* ===== ANIMATED GRADIENT BORDER ===== */}
      <div className="relative h-[3px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)',
              'linear-gradient(90deg, #ec4899, #8b5cf6, #f59e0b, #ec4899)',
              'linear-gradient(90deg, #8b5cf6, #f59e0b, #ec4899, #8b5cf6)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-0 left-0 h-full w-32 bg-white/60 blur-sm"
          animate={{ x: ['-128px', 'calc(100% + 128px)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />
      </div>

      {/* ===== MAIN FOOTER BACKGROUND ===== */}
      <div className="relative bg-[#0a0a1a] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient orb top-left */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          {/* Large gradient orb bottom-right */}
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          {/* Center subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/3 rounded-full blur-3xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ===== NEWSLETTER SECTION ===== */}
          <div className="pt-16 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Glassmorphism card */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Card gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-pink-500/10" />
                <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.03] border border-white/[0.06]" />

                <div className="relative px-6 py-10 sm:px-10 sm:py-12">
                  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Left: Newsletter content */}
                    <div className="flex-1 text-center lg:text-left">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                          <Send className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-medium text-amber-300">Newsletter</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                          Stay in the
                          <span className="bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent"> Spotlight</span>
                        </h3>
                        <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto lg:mx-0">
                          Get exclusive updates on tournaments, voting events, winner announcements, and special offers delivered to your inbox.
                        </p>
                      </motion.div>
                    </div>

                    {/* Right: Newsletter form */}
                    <div className="w-full lg:w-auto lg:min-w-[420px]">
                      <AnimatePresence mode="wait">
                        {subscribed ? (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                          >
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-300">Welcome aboard!</p>
                              <p className="text-xs text-emerald-400/60">You&apos;ll receive our next update soon.</p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubscribe}
                            className="relative"
                          >
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1 relative">
                                <Input
                                  type="email"
                                  placeholder="Enter your email address"
                                  className={`w-full bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/30 rounded-xl h-12 pl-4 pr-10 text-sm focus-visible:ring-amber-500/40 focus-visible:border-amber-500/30 transition-all ${
                                    emailError ? 'border-red-500/50 focus-visible:ring-red-500/40' : ''
                                  }`}
                                  value={email}
                                  onChange={(e) => handleEmailChange(e.target.value)}
                                  disabled={subscribing}
                                />
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              </div>
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-xl h-12 px-7 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 shrink-0"
                                disabled={subscribing}
                              >
                                {subscribing ? (
                                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                  <>
                                    Subscribe
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                  </>
                                )}
                              </Button>
                            </div>
                            {emailError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-400 mt-2 ml-1"
                              >
                                {emailError}
                              </motion.p>
                            )}
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== STATS COUNTER ===== */}
          <div className="pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-5 text-center backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
                    <stat.icon className="w-5 h-5 text-amber-400/70 mx-auto mb-2 group-hover:text-amber-400 transition-colors" />
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                    <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ===== TRUST INDICATORS ===== */}
          <div className="pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {trustBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="group relative rounded-lg bg-white/[0.03] border border-white/[0.06] px-4 py-3.5 text-center backdrop-blur-sm hover:bg-white/[0.06] hover:border-amber-500/20 transition-all duration-300 cursor-default"
                >
                  <div className="flex items-center justify-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-orange-500/20 transition-all duration-300">
                      <badge.icon className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{badge.label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{badge.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ===== LINKS GRID ===== */}
          <div className="py-10 border-t border-white/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
              {/* Brand Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-4"
              >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative">
                    <img
                      src="/beautyqueenlogo.png"
                      alt="BeautyVote Logo"
                      className="w-12 h-12 object-contain rounded-xl shadow-lg shadow-amber-500/10"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👑</text></svg>";
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-white">Beauty Queen</span>
                    <p className="text-[10px] text-amber-400/80 font-medium -mt-0.5">Nigeria&apos;s #1 Beauty Queen Platform</p>
                  </div>
                </div>

                <p className="text-sm text-white/45 mb-6 max-w-xs leading-relaxed">
                  The premier online beauty queen platform where your voice matters. Vote for your favorite contestants and help them win the crown!
                </p>

                {/* Social Links */}
                <div className="flex gap-2.5 mb-6">
                  {socialLinks.map((social, i) => (
                    <motion.button
                      key={social.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center transition-all duration-300 text-white/50 hover:text-white ${social.hoverColor}`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => handleNavClick('tournament')}
                    className="group relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-xl h-11 px-5 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Join Now
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Link Columns */}
              {Object.entries(footerLinks).map(([title, links], colIdx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: colIdx * 0.1 + 0.1 }}
                  className="lg:col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-white/80">
                      {title}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {links.map((link, linkIdx) => (
                      <motion.li
                        key={link.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: colIdx * 0.1 + linkIdx * 0.03 + 0.15 }}
                      >
                        <button
                          onClick={() => handleNavClick(link.page)}
                          className="group text-sm text-white/40 hover:text-amber-400 transition-all duration-200 flex items-center gap-2"
                        >
                          <span className="w-0 h-px bg-amber-400 group-hover:w-3 transition-all duration-300" />
                          <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.label}</span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              {/* Contact Info Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 sm:col-span-1"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-pink-400 to-purple-500" />
                  <h4 className="font-bold text-xs uppercase tracking-widest text-white/80">
                    Contact
                  </h4>
                </div>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="mailto:info@beautyvote.com"
                      className="group flex items-start gap-3 text-sm text-white/40 hover:text-amber-400 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all duration-300 mt-0.5">
                        <Mail className="w-3.5 h-3.5 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">info@beautyvote.com</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+2348001234567"
                      className="group flex items-start gap-3 text-sm text-white/40 hover:text-amber-400 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all duration-300 mt-0.5">
                        <Phone className="w-3.5 h-3.5 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">+234 800 123 4567</span>
                    </a>
                  </li>
                  <li>
                    <div className="group flex items-start gap-3 text-sm text-white/40">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <span>Victoria Island, Lagos, Nigeria</span>
                    </div>
                  </li>
                </ul>

                {/* Download App mini-CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => handleNavClick('home')}
                    className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 w-full"
                  >
                    <Download className="w-4 h-4 text-pink-400" />
                    <div className="text-left">
                      <p className="text-[10px] text-white/30 leading-none">Coming Soon</p>
                      <p className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">Get the App</p>
                    </div>
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* ===== BOTTOM BAR ===== */}
          <div className="border-t border-white/[0.06]">
            <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <p className="text-xs text-white/30">
                  &copy; {currentYear} Beauty Queen. All rights reserved.
                </p>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-white/10">&middot;</span>
                  <button
                    onClick={() => handleNavClick('privacy')}
                    className="text-xs text-white/30 hover:text-amber-400 transition-colors duration-200"
                  >
                    Privacy Policy
                  </button>
                  <span className="text-white/10">&middot;</span>
                  <button
                    onClick={() => handleNavClick('terms')}
                    className="text-xs text-white/30 hover:text-amber-400 transition-colors duration-200"
                  >
                    Terms of Service
                  </button>
                </div>
              </div>

              {/* Right side: Made with love + social icons on mobile */}
              <div className="flex items-center gap-4">
                {/* Social icons for mobile */}
                <div className="flex sm:hidden items-center gap-2">
                  {socialLinks.slice(0, 4).map((social) => (
                    <button
                      key={social.label}
                      className={`w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center transition-all duration-300 text-white/40 hover:text-white ${social.hoverColor}`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-3 h-3" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/30">Made with</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  </motion.span>
                  <span className="text-xs text-white/30">in Nigeria</span>
                </div>
              </div>
            </div>

            {/* Mobile legal links (shown below main bottom bar) */}
            <div className="sm:hidden pb-6 flex justify-center items-center gap-4">
              <button
                onClick={() => handleNavClick('privacy')}
                className="text-xs text-white/30 hover:text-amber-400 transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <span className="text-white/10">&middot;</span>
              <button
                onClick={() => handleNavClick('terms')}
                className="text-xs text-white/30 hover:text-amber-400 transition-colors duration-200"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
