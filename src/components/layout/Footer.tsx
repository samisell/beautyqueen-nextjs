'use client';

import {
  Crown,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation-store';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', page: 'home' },
    { label: 'Leaderboard', page: 'leaderboard' },
    { label: 'Tournament', page: 'tournament' },
    { label: 'Prizes', page: 'prize' },
  ],
  Information: [
    { label: 'About Us', page: 'about' },
    { label: 'FAQ', page: 'faq' },
    { label: 'Contact', page: 'contact' },
    { label: 'Instructions', page: 'instruction' },
  ],
  Legal: [
    { label: 'Privacy Policy', page: 'home' },
    { label: 'Terms of Service', page: 'home' },
    { label: 'Rules', page: 'instruction' },
  ],
};

export default function Footer() {
  const { navigate } = useNavigationStore();

  const handleNavClick = (page: string) => {
    navigate(page as any);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BeautyVote</span>
            </div>
            <p className="text-sm text-background/70 mb-6 max-w-sm">
              The premier online beauty voting platform where your voice matters.
              Vote for your favorite contestants and help them win the crown!
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-background/10 hover:bg-background/20 text-background hover:text-background"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link.page)}
                      className="text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row gap-4 text-sm text-background/70">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>info@beautyvote.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+234 800 123 4567</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Lagos, Nigeria</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} BeautyVote. All rights reserved.
          </p>
          <p className="text-xs text-background/50 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" />{' '}
            by BeautyVote Team
          </p>
        </div>
      </div>
    </footer>
  );
}
