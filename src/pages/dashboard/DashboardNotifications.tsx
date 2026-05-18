'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// ────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────
interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  emailContent?: string | null;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getNotifIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
    default:
      return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'success':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px] border-0 px-1.5 py-0">Success</Badge>;
    case 'warning':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] border-0 px-1.5 py-0">Warning</Badge>;
    case 'error':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-[10px] border-0 px-1.5 py-0">Error</Badge>;
    default:
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] border-0 px-1.5 py-0">Info</Badge>;
  }
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export default function DashboardNotifications() {
  const { navigate } = useNavigationStore();
  const { token } = useAuthStore();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedNotifs, setExpandedNotifs] = useState<Set<string>>(new Set());

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // ────────────────────────────────────────────
  // Data fetchers
  // ────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      const res = await fetch(`/api/user/notifications?page=${pageNum}&limit=15`, { headers });
      const data = await res.json();
      if (data.success) {
        const items = data.data || [];
        setNotifications((prev) => (append ? [...prev, ...items] : items));
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch {
      // Ignore
    }
  }, [token]);

  // ────────────────────────────────────────────
  // Initial load
  // ────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchNotifications(1);
      setLoading(false);
    }
    loadData();
  }, [fetchNotifications]);

  // ────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ markAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      } else {
        toast.error(data.message || 'Failed to mark notifications');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ notificationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    setLoadingMore(true);
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
    setLoadingMore(false);
  };

  const toggleNotifExpand = (id: string) => {
    setExpandedNotifs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />
          <div className="flex-1 min-w-0 space-y-6">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        You have <span className="text-primary font-semibold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={handleMarkAllRead}
                    disabled={markingAllRead}
                  >
                    {markingAllRead ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-4 h-4 mr-1.5" />
                    )}
                    Mark All as Read
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Notifications List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-2"
              >
                {notifications.map((notif, index) => {
                  const isExpanded = expandedNotifs.has(notif.id);
                  const hasEmail = !!notif.emailContent;

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          !notif.isRead
                            ? 'border-primary/20 bg-primary/[0.02]'
                            : ''
                        }`}
                        onClick={() => {
                          if (!notif.isRead) handleMarkRead(notif.id);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getNotifIcon(notif.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                                  {notif.title}
                                </h3>
                                {getTypeBadge(notif.type)}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(notif.createdAt)}
                                </div>
                                {hasEmail && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNotifExpand(notif.id);
                                    }}
                                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="w-3 h-3" />
                                        Hide email
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3" />
                                        View email
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {/* Unread indicator */}
                            <div className="flex items-center gap-2 shrink-0 mt-1">
                              {!notif.isRead && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>

                          {/* Expandable email content */}
                          <AnimatePresence>
                            {isExpanded && hasEmail && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <div
                                    className="max-h-[200px] overflow-y-auto rounded-lg bg-muted/80 border border-border/50 p-4 text-xs leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_table]:w-full [&_table]:text-[11px] [&_th]:text-left [&_th]:p-1.5 [&_th]:border-b [&_th]:font-medium [&_td]:p-1.5 [&_td]:border-b [&_img]:max-w-full [&_img]:rounded"
                                    dangerouslySetInnerHTML={{ __html: notif.emailContent || '' }}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Load More */}
                {page < totalPages && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Notifications'
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No Notifications</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You&apos;re all caught up! Notifications about your votes, payments, and account activity will appear here.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-xl"
                      onClick={() => navigate('dashboard')}
                    >
                      Back to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
