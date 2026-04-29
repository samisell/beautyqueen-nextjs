'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Trophy,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';
import { useUIStore } from '@/stores/ui-store';

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Leaderboard', page: 'leaderboard' },
  { label: 'Tournament', page: 'tournament' },
  { label: 'Prizes', page: 'prize' },
  { label: 'FAQ', page: 'faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { currentPage, navigate } = useNavigationStore();
  const { theme, toggleTheme, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: string) => {
    navigate(page as any);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md border-b'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight gradient-text">
                  BeautyVote
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                  Vote for Your Queen
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === link.page
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {/* Dashboard */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleNavClick(
                        user.role === 'admin' ? 'admin' : 'dashboard'
                      )
                    }
                    className="hidden sm:flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs">Dashboard</span>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2"
                      >
                        <Avatar className="h-8 w-8 border-2 border-primary">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-3 h-3 hidden sm:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleNavClick('dashboard')}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleNavClick('dashboard-profile')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleNavClick('dashboard-referrals')}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Referrals
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavClick('login')}
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleNavClick('register')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Register
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-md border-b lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentPage === link.page
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:bg-muted'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleNavClick('login')}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </Button>
                  <Button
                    onClick={() => handleNavClick('register')}
                    className="w-full bg-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
