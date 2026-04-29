'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Users,
  Crown,
  Heart,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  BarChart3,
  Search,
  Plus,
  Pencil,
  Trash2,
  Play,
  Calendar,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Zap,
  UserCheck,
  Trophy,
  X,
  CreditCard,
  Building2,
  Check,
  Clock,
  Image as ImageIcon,
  Ban,
  Settings2,
  ArrowLeft,
  Save,
  Undo2,
  Skull,
  ChevronDown,
  RotateCcw,
  Swords,
  PlusCircle,
  ClipboardCheck,
  Eye,
  Landmark,
  Medal,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AdminStatsData {
  totalUsers: number;
  totalContestants: number;
  totalVotes: number;
  totalRevenue: number;
  votesToday: number;
  newUsersToday: number;
  activeStage: {
    id: string;
    name: string;
    status: string;
    contestantCount: number;
  } | null;
  topContestants: {
    id: string;
    name: string;
    totalVotes: number;
    category: string;
    status: string;
    imageUrl: string;
  }[];
  recentActivity: {
    id: string;
    userId: string;
    contestantId: string;
    voteType: string;
    createdAt: string;
    user: { name: string };
    contestant: { name: string; imageUrl: string };
  }[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  referralCode: string;
  createdAt: string;
  _count: { votes: number; sentReferrals: number };
}

interface ContestantItem {
  id: string;
  name: string;
  bio?: string;
  imageUrl: string;
  category?: string;
  categoryId?: string;
  status: string;
  totalVotes: number;
  stageId?: string;
  eliminationReason?: string;
  eliminatedAt?: string;
}

interface TournamentItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  stageCount: number;
  stages: StageItem[];
  createdAt: string;
  updatedAt: string;
}

interface StageItem {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  order: number;
  minVotes: number;
  maxContestants?: number;
  contestantCount?: number;
}

interface PackageItem {
  id: string;
  name: string;
  votes: number;
  price: number;
  bonusVotes: number;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

interface PaymentItem {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  reference?: string;
  proofImageUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  depositorName?: string;
  adminNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  package: { id: string; name: string; votes: number; bonusVotes: number };
  reviewer: { id: string; name: string } | null;
}

interface PlatformSettingsData {
  votePrice: string;
  currency: string;
  platformName: string;
  offlineBankName: string;
  offlineAccountName: string;
  offlineAccountNumber: string;
  offlineBankBranch: string;
  prize1st: string;
  prize2nd: string;
  prize3rd: string;
  prizeCurrency: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ──────────────────────────────────────────────
// Animation Variants
// ──────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// ──────────────────────────────────────────────
// Currency symbol map
// ──────────────────────────────────────────────

const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
};

// ──────────────────────────────────────────────
// Status Helpers
// ──────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, { variant: string; label: string }> = {
    active: { variant: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20', label: 'Active' },
    eliminated: { variant: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20', label: 'Eliminated' },
    upcoming: { variant: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20', label: 'Upcoming' },
    completed: { variant: 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20', label: 'Completed' },
    winner: { variant: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20', label: 'Winner' },
    draft: { variant: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20', label: 'Draft' },
  };
  const item = map[status] || { variant: 'bg-muted text-muted-foreground', label: status };
  return (
    <Badge variant="outline" className={item.variant}>
      {item.label}
    </Badge>
  );
}

function roleBadge(role: string) {
  if (role === 'admin') {
    return (
      <Badge className="bg-primary/15 text-primary border-primary/20">
        <Shield className="w-3 h-3 mr-1" />Admin
      </Badge>
    );
  }
  return <Badge variant="secondary">User</Badge>;
}

function voteTypeBadge(type: string) {
  const map: Record<string, { cls: string; icon: typeof Heart }> = {
    free: { cls: 'bg-green-500/15 text-green-700 dark:text-green-400', icon: Heart },
    paid: { cls: 'bg-blue-500/15 text-blue-700 dark:text-blue-400', icon: Zap },
    referral: { cls: 'bg-purple-500/15 text-purple-700 dark:text-purple-400', icon: Users },
  };
  const item = map[type] || { cls: 'bg-muted text-muted-foreground', icon: Activity };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${item.cls}`}>
      <item.icon className="w-3 h-3" />
      {type}
    </span>
  );
}

function formatCurrency(amount: number, currency?: string) {
  const cur = currency || 'USD';
  const symbol = currencySymbols[cur] || '$';
  if (cur === 'NGN') {
    return `${symbol}${amount.toLocaleString('en-NG')}`;
  }
  return amount.toLocaleString('en-US', { style: 'currency', currency: cur });
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - parseISO(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export default function AdminDashboard() {
  const { navigate } = useNavigationStore();
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Settings states
  const [settings, setSettings] = useState<PlatformSettingsData>({
    votePrice: '200',
    currency: 'NGN',
    platformName: 'Beauty Vote',
    offlineBankName: 'BeautyVote Holdings',
    offlineAccountName: 'BeautyVote Platform',
    offlineAccountNumber: '1234567890',
    offlineBankBranch: 'Main Branch',
    prize1st: '5000000',
    prize2nd: '3000000',
    prize3rd: '1500000',
    prizeCurrency: 'NGN',
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PlatformSettingsData>({
    votePrice: '200',
    currency: 'NGN',
    platformName: 'Beauty Vote',
    offlineBankName: 'BeautyVote Holdings',
    offlineAccountName: 'BeautyVote Platform',
    offlineAccountNumber: '1234567890',
    offlineBankBranch: 'Main Branch',
    prize1st: '5000000',
    prize2nd: '3000000',
    prize3rd: '1500000',
    prizeCurrency: 'NGN',
  });

  // Contestants states
  const [contestants, setContestants] = useState<ContestantItem[]>([]);
  const [contestantsLoading, setContestantsLoading] = useState(true);
  const [contestantsSearch, setContestantsSearch] = useState('');
  const [contestantsPagination, setContestantsPagination] = useState<Pagination | null>(null);
  const [contestantsPage, setContestantsPage] = useState(1);
  const [contestantDialogOpen, setContestantDialogOpen] = useState(false);
  const [editingContestant, setEditingContestant] = useState<ContestantItem | null>(null);
  const [contestantForm, setContestantForm] = useState({ name: '', imageUrl: '', bio: '', category: '', status: 'active' });
  const [contestantSubmitting, setContestantSubmitting] = useState(false);
  const [deleteContestantId, setDeleteContestantId] = useState<string | null>(null);
  const [deleteContestantLoading, setDeleteContestantLoading] = useState(false);
  // Eliminate states
  const [eliminateDialogOpen, setEliminateDialogOpen] = useState(false);
  const [eliminateContestantId, setEliminateContestantId] = useState<string | null>(null);
  const [eliminateReason, setEliminateReason] = useState('');
  const [eliminateSubmitting, setEliminateSubmitting] = useState(false);
  const [undoEliminateId, setUndoEliminateId] = useState<string | null>(null);
  const [undoEliminateLoading, setUndoEliminateLoading] = useState(false);

  // Users states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersPagination, setUsersPagination] = useState<Pagination | null>(null);
  const [usersPage, setUsersPage] = useState(1);

  // Tournament states
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<TournamentItem | null>(null);

  // Tournament CRUD
  const [tournamentDialogOpen, setTournamentDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentItem | null>(null);
  const [tournamentForm, setTournamentForm] = useState({ name: '', description: '', status: 'draft' });
  const [tournamentSubmitting, setTournamentSubmitting] = useState(false);
  const [deleteTournamentId, setDeleteTournamentId] = useState<string | null>(null);
  const [deleteTournamentLoading, setDeleteTournamentLoading] = useState(false);

  // Stage CRUD within tournament
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<StageItem | null>(null);
  const [stageForm, setStageForm] = useState({
    tournamentId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    order: 1,
    minVotes: '',
    maxContestants: '',
  });
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [activatingStage, setActivatingStage] = useState<string | null>(null);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [deleteStageLoading, setDeleteStageLoading] = useState(false);
  const [progressingStage, setProgressingStage] = useState<string | null>(null);

  // Packages states
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    votes: '',
    price: '',
    bonusVotes: '',
    isPopular: false,
    isActive: true,
    order: 1,
  });
  const [packageSubmitting, setPackageSubmitting] = useState(false);
  const [togglingPackageId, setTogglingPackageId] = useState<string | null>(null);

  // Payments states
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState('all');
  const [paymentsMethodFilter, setPaymentsMethodFilter] = useState('all');
  const [paymentsPagination, setPaymentsPagination] = useState<Pagination | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectAsFraud, setRejectAsFraud] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [paymentSummary, setPaymentSummary] = useState({ pendingCount: 0, reviewCount: 0, completedCount: 0, offlinePendingCount: 0 });

  // Bonus votes states
  const [bonusContestants, setBonusContestants] = useState<Array<{id: string, name: string, totalVotes: number}>>([]);
  const [bonusContestantId, setBonusContestantId] = useState('');
  const [bonusVotes, setBonusVotes] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [bonusSubmitting, setBonusSubmitting] = useState(false);
  const [bonusHistory, setBonusHistory] = useState<Array<{
    id: string;
    contestantId: string;
    votesAdded: number;
    reason: string | null;
    createdAt: string;
    contestant: { id: string; name: string; imageUrl: string };
    addedBy: { id: string; name: string };
  }>>([]);
  const [bonusHistoryLoading, setBonusHistoryLoading] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Task states
  const [tasks, setTasks] = useState<Array<{
    id: string; stageId: string; title: string; description: string | null;
    instructions: string | null; dueDate: string | null; status: string;
    maxBonusVotes: number; createdAt: string; updatedAt: string;
    stage: { id: string; name: string; tournament: { id: string; name: string } };
    _count: { submissions: number };
  }>>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({
    stageId: '', title: '', description: '', instructions: '', dueDate: '', maxBonusVotes: '10'
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskSubmissions, setTaskSubmissions] = useState<Array<{
    id: string; taskId: string; contestantId: string; submissionUrl: string;
    caption: string | null; status: string; beautyRating: number | null;
    feedback: string | null; bonusVotesAwarded: number; createdAt: string;
    contestant: { id: string; name: string; imageUrl: string };
  }>>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    submissionId: '', beautyRating: '5', feedback: '', bonusVotes: ''
  });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Expanded contestants rows
  const [expandedContestants, setExpandedContestants] = useState<Set<string>>(new Set());

  const toggleContestantExpand = (id: string) => {
    setExpandedContestants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  // ──────────────────────────────────────────────
  // Fetch Functions
  // ──────────────────────────────────────────────

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: headers(), signal });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  }, [headers]);

  const fetchSettings = useCallback(async (signal?: AbortSignal) => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { headers: headers(), signal });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setSettingsForm(data.data);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  }, [headers]);

  const fetchContestants = useCallback(async (page = 1, search = '', signal?: AbortSignal) => {
    setContestantsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', search });
      const res = await fetch(`/api/contestants?${params}`, { headers: headers(), signal });
      const data = await res.json();
      if (data.success) {
        setContestants(data.data || []);
        setContestantsPagination(data.pagination || null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load contestants');
    } finally {
      setContestantsLoading(false);
    }
  }, [headers]);

  const fetchUsers = useCallback(async (page = 1, search = '', signal?: AbortSignal) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', search });
      const res = await fetch(`/api/admin/users?${params}`, { headers: headers(), signal });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setUsersPagination(data.pagination || null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [headers]);

  const fetchTournaments = useCallback(async (signal?: AbortSignal) => {
    setTournamentsLoading(true);
    try {
      const res = await fetch('/api/admin/tournaments', { headers: headers(), signal });
      const data = await res.json();
      if (data.success) setTournaments(data.data || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load tournaments');
    } finally {
      setTournamentsLoading(false);
    }
  }, [headers]);

  const fetchPackages = useCallback(async (signal?: AbortSignal) => {
    setPackagesLoading(true);
    try {
      const res = await fetch('/api/admin/packages', { headers: headers(), signal });
      const data = await res.json();
      if (data.success) setPackages(data.data || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load vote packages');
    } finally {
      setPackagesLoading(false);
    }
  }, [headers]);

  const fetchPayments = useCallback(async (page = 1, statusFilter = 'all', methodFilter = 'all', signal?: AbortSignal) => {
    setPaymentsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15', status: statusFilter, method: methodFilter });
      const res = await fetch(`/api/admin/payments?${params}`, { headers: headers(), signal });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
        setPaymentsPagination(data.pagination || null);
        if (data.meta) {
          setPaymentSummary({
            pendingCount: data.meta.pendingCount || 0,
            reviewCount: data.meta.reviewCount || 0,
            completedCount: data.meta.completedCount || 0,
            offlinePendingCount: data.meta.offlinePendingCount || 0,
          });
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  }, [headers]);

  const fetchBonusContestants = useCallback(async () => {
    try {
      const res = await fetch('/api/contestants?limit=50&status=active', { headers: headers() });
      const data = await res.json();
      if (data.success) setBonusContestants(data.data || []);
    } catch {
      // silent
    }
  }, [headers]);

  const fetchBonusHistory = useCallback(async () => {
    setBonusHistoryLoading(true);
    try {
      const res = await fetch('/api/admin/bonus-votes', { headers: headers() });
      const data = await res.json();
      if (data.success) setBonusHistory(data.data || []);
    } catch {
      // silent
    } finally { setBonusHistoryLoading(false); }
  }, [headers]);

  const fetchVotingStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/toggle-voting', { headers: headers() });
      const data = await res.json();
      if (data.success) setVotingEnabled(data.data.votingEnabled);
    } catch {
      // silent
    }
  }, [headers]);

  const fetchTasks = useCallback(async (signal?: AbortSignal) => {
    setTasksLoading(true);
    try {
      const res = await fetch('/api/admin/tasks', { headers: headers(), signal });
      const data = await res.json();
      if (data.success) setTasks(data.data || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [headers]);

  // ──────────────────────────────────────────────
  // Data Fetching by Tab
  // ──────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === 'overview') { fetchStats(controller.signal); fetchVotingStatus(); }
    else if (activeTab === 'settings') fetchSettings(controller.signal);
    else if (activeTab === 'contestants') fetchContestants(contestantsPage, contestantsSearch, controller.signal);
    else if (activeTab === 'users') fetchUsers(usersPage, usersSearch, controller.signal);
    else if (activeTab === 'tournament') fetchTournaments(controller.signal);
    else if (activeTab === 'packages') fetchPackages(controller.signal);
    else if (activeTab === 'payments') fetchPayments(paymentsPage, paymentsStatusFilter, paymentsMethodFilter, controller.signal);
    else if (activeTab === 'bonus') { fetchBonusContestants(); fetchBonusHistory(); }
    else if (activeTab === 'tasks') fetchTasks(controller.signal);
    return () => controller.abort();
  }, [activeTab, fetchStats, fetchSettings, fetchContestants, fetchUsers, fetchTournaments, fetchPackages, fetchPayments, fetchBonusContestants, fetchBonusHistory, fetchTasks]);

  // Search debounced fetches
  useEffect(() => {
    if (activeTab !== 'contestants') return;
    const t = setTimeout(() => {
      const controller = new AbortController();
      fetchContestants(1, contestantsSearch, controller.signal);
      setContestantsPage(1);
      return () => controller.abort();
    }, 400);
    return () => clearTimeout(t);
  }, [contestantsSearch, activeTab, fetchContestants]);

  useEffect(() => {
    if (activeTab !== 'users') return;
    const t = setTimeout(() => {
      const controller = new AbortController();
      fetchUsers(1, usersSearch, controller.signal);
      setUsersPage(1);
      return () => controller.abort();
    }, 400);
    return () => clearTimeout(t);
  }, [usersSearch, activeTab, fetchUsers]);

  // ──────────────────────────────────────────────
  // Settings CRUD
  // ──────────────────────────────────────────────

  async function saveSettings() {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          votePrice: Number(settingsForm.votePrice),
          currency: settingsForm.currency,
          platformName: settingsForm.platformName,
          offlineBankName: settingsForm.offlineBankName,
          offlineAccountName: settingsForm.offlineAccountName,
          offlineAccountNumber: settingsForm.offlineAccountNumber,
          offlineBankBranch: settingsForm.offlineBankBranch,
          prize1st: Number(settingsForm.prize1st),
          prize2nd: Number(settingsForm.prize2nd),
          prize3rd: Number(settingsForm.prize3rd),
          prizeCurrency: settingsForm.prizeCurrency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings saved successfully');
        setSettings({ ...settingsForm });
      } else {
        toast.error(data.message || data.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSettingsSaving(false);
    }
  }

  // ──────────────────────────────────────────────
  // Contestant CRUD
  // ──────────────────────────────────────────────

  function openAddContestantDialog() {
    setEditingContestant(null);
    setContestantForm({ name: '', imageUrl: '', bio: '', category: '', status: 'active' });
    setContestantDialogOpen(true);
  }

  function openEditContestantDialog(c: ContestantItem) {
    setEditingContestant(c);
    setContestantForm({
      name: c.name,
      imageUrl: c.imageUrl,
      bio: c.bio || '',
      category: c.category || '',
      status: c.status,
    });
    setContestantDialogOpen(true);
  }

  async function submitContestant() {
    if (!contestantForm.name.trim()) { toast.error('Name is required'); return; }
    setContestantSubmitting(true);
    try {
      const url = editingContestant ? `/api/contestants/${editingContestant.id}` : '/api/admin/contestants';
      const method = editingContestant ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(contestantForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingContestant ? 'Contestant updated' : 'Contestant created');
        setContestantDialogOpen(false);
        fetchContestants(contestantsPage, contestantsSearch);
        if (activeTab === 'overview') fetchStats();
      } else {
        toast.error(data.message || data.error || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setContestantSubmitting(false);
    }
  }

  async function deleteContestant(id: string) {
    setDeleteContestantLoading(true);
    try {
      const res = await fetch(`/api/contestants/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contestant deleted');
        setDeleteContestantId(null);
        fetchContestants(contestantsPage, contestantsSearch);
      } else {
        toast.error(data.message || data.error || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleteContestantLoading(false);
    }
  }

  // Eliminate contestant
  function openEliminateDialog(contestantId: string) {
    setEliminateContestantId(contestantId);
    setEliminateReason('');
    setEliminateDialogOpen(true);
  }

  async function confirmEliminate() {
    if (!eliminateContestantId) return;
    setEliminateSubmitting(true);
    try {
      const res = await fetch('/api/admin/contestants/eliminate', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ contestantId: eliminateContestantId, reason: eliminateReason || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contestant eliminated');
        setEliminateDialogOpen(false);
        setEliminateContestantId(null);
        fetchContestants(contestantsPage, contestantsSearch);
      } else {
        toast.error(data.message || data.error || 'Failed to eliminate contestant');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setEliminateSubmitting(false);
    }
  }

  // Undo elimination
  async function undoElimination(contestantId: string) {
    setUndoEliminateLoading(true);
    setUndoEliminateId(contestantId);
    try {
      const res = await fetch('/api/admin/contestants/eliminate', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ contestantId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Elimination undone');
        fetchContestants(contestantsPage, contestantsSearch);
      } else {
        toast.error(data.message || data.error || 'Failed to undo elimination');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUndoEliminateLoading(false);
      setUndoEliminateId(null);
    }
  }

  // ──────────────────────────────────────────────
  // Tournament CRUD
  // ──────────────────────────────────────────────

  function openAddTournamentDialog() {
    setEditingTournament(null);
    setTournamentForm({ name: '', description: '', status: 'draft' });
    setTournamentDialogOpen(true);
  }

  function openEditTournamentDialog(t: TournamentItem) {
    setEditingTournament(t);
    setTournamentForm({ name: t.name, description: t.description || '', status: t.status });
    setTournamentDialogOpen(true);
  }

  async function submitTournament() {
    if (!tournamentForm.name.trim()) { toast.error('Tournament name is required'); return; }
    setTournamentSubmitting(true);
    try {
      const url = '/api/admin/tournaments';
      const method = editingTournament ? 'PUT' : 'POST';
      const body = editingTournament
        ? { tournamentId: editingTournament.id, name: tournamentForm.name, description: tournamentForm.description || undefined, status: tournamentForm.status }
        : { name: tournamentForm.name, description: tournamentForm.description || undefined, status: tournamentForm.status };
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingTournament ? 'Tournament updated' : 'Tournament created');
        setTournamentDialogOpen(false);
        fetchTournaments();
      } else {
        toast.error(data.message || data.error || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setTournamentSubmitting(false);
    }
  }

  async function deleteTournament(id: string) {
    setDeleteTournamentLoading(true);
    try {
      const res = await fetch(`/api/admin/tournaments?id=${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Tournament deleted');
        setDeleteTournamentId(null);
        if (selectedTournament?.id === id) setSelectedTournament(null);
        fetchTournaments();
      } else {
        toast.error(data.message || data.error || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleteTournamentLoading(false);
    }
  }

  // ──────────────────────────────────────────────
  // Stage CRUD (within tournament)
  // ──────────────────────────────────────────────

  function openAddStageDialog(tournamentId: string) {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    setEditingStage(null);
    setStageForm({
      tournamentId,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      order: (tournament?.stages?.length || 0) + 1,
      minVotes: '0',
      maxContestants: '',
    });
    setStageDialogOpen(true);
  }

  function openEditStageDialog(s: StageItem, tournamentId: string) {
    setEditingStage(s);
    setStageForm({
      tournamentId,
      name: s.name,
      description: s.description || '',
      startDate: s.startDate ? s.startDate.split('T')[0] : '',
      endDate: s.endDate ? s.endDate.split('T')[0] : '',
      status: s.status,
      order: s.order,
      minVotes: String(s.minVotes || 0),
      maxContestants: s.maxContestants ? String(s.maxContestants) : '',
    });
    setStageDialogOpen(true);
  }

  async function submitStage() {
    if (!stageForm.name.trim()) { toast.error('Stage name is required'); return; }
    setStageSubmitting(true);
    try {
      const url = '/api/admin/stages';
      const method = editingStage ? 'PUT' : 'POST';
      const body = editingStage
        ? {
            stageId: editingStage.id,
            name: stageForm.name,
            description: stageForm.description || undefined,
            startDate: stageForm.startDate,
            endDate: stageForm.endDate,
            status: stageForm.status,
            order: stageForm.order,
            minVotes: Number(stageForm.minVotes) || 0,
            maxContestants: stageForm.maxContestants ? Number(stageForm.maxContestants) : undefined,
          }
        : {
            tournamentId: stageForm.tournamentId,
            name: stageForm.name,
            description: stageForm.description || undefined,
            startDate: stageForm.startDate,
            endDate: stageForm.endDate,
            status: stageForm.status,
            order: stageForm.order,
            minVotes: Number(stageForm.minVotes) || 0,
            maxContestants: stageForm.maxContestants ? Number(stageForm.maxContestants) : undefined,
          };
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingStage ? 'Stage updated' : 'Stage created');
        setStageDialogOpen(false);
        fetchTournaments();
      } else {
        toast.error(data.message || data.error || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setStageSubmitting(false);
    }
  }

  async function deleteStage(id: string) {
    setDeleteStageLoading(true);
    try {
      const res = await fetch(`/api/admin/stages?id=${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Stage deleted');
        setDeleteStageId(null);
        fetchTournaments();
      } else {
        toast.error(data.message || data.error || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleteStageLoading(false);
    }
  }

  async function activateStage(id: string) {
    setActivatingStage(id);
    try {
      const res = await fetch('/api/admin/stages', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ stageId: id, status: 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Stage activated');
        fetchTournaments();
        if (activeTab === 'overview') fetchStats();
      } else {
        toast.error(data.message || data.error || 'Failed to activate stage');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActivatingStage(null);
    }
  }

  async function processStageProgression(stageId: string) {
    setProgressingStage(stageId);
    try {
      const res = await fetch('/api/admin/tournament/progress', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ stageId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Stage progression processed successfully');
        fetchTournaments();
      } else {
        toast.error(data.message || data.error || 'Failed to process progression');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setProgressingStage(null);
    }
  }

  // ──────────────────────────────────────────────
  // Package CRUD
  // ──────────────────────────────────────────────

  function openAddPackageDialog() {
    setPackageForm({ name: '', votes: '', price: '', bonusVotes: '', isPopular: false, isActive: true, order: packages.length + 1 });
    setPackageDialogOpen(true);
  }

  async function submitPackage() {
    if (!packageForm.name.trim() || !packageForm.votes || !packageForm.price) {
      toast.error('Name, votes, and price are required');
      return;
    }
    setPackageSubmitting(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: packageForm.name,
          votes: Number(packageForm.votes),
          price: Number(packageForm.price),
          bonusVotes: Number(packageForm.bonusVotes) || 0,
          isPopular: packageForm.isPopular,
          isActive: packageForm.isActive,
          order: packageForm.order,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Package created');
        setPackageDialogOpen(false);
        fetchPackages();
      } else {
        toast.error(data.message || data.error || 'Failed to create package');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setPackageSubmitting(false);
    }
  }

  async function togglePackageActive(id: string, isActive: boolean) {
    setTogglingPackageId(id);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Package ${!isActive ? 'activated' : 'deactivated'}`);
        fetchPackages();
      } else {
        toast.error(data.message || data.error || 'Failed to toggle package');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setTogglingPackageId(null);
    }
  }

  // ──────────────────────────────────────────────
  // Payment Approve / Reject
  // ──────────────────────────────────────────────

  async function approvePayment(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ paymentId: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment approved! Votes credited.');
        fetchPayments(paymentsPage, paymentsStatusFilter, paymentsMethodFilter);
        if (activeTab === 'overview') fetchStats();
      } else {
        toast.error(data.message || 'Failed to approve payment');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setApprovingId(null);
    }
  }

  function openRejectDialog(id: string, asFraud = false) {
    setSelectedPaymentId(id);
    setRejectReason('');
    setRejectAsFraud(asFraud);
    setRejectDialogOpen(true);
  }

  async function confirmReject() {
    if (!selectedPaymentId || !rejectReason.trim()) return;
    setRejectingId(selectedPaymentId);
    try {
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ paymentId: selectedPaymentId, reason: rejectReason, isFraud: rejectAsFraud }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?.isFraud) {
          toast.success(`Fraud payment rejected! ${data.data.votesRemoved} votes removed.`);
        } else {
          toast.success('Payment rejected');
        }
        setRejectDialogOpen(false);
        fetchPayments(paymentsPage, paymentsStatusFilter, paymentsMethodFilter);
        if (activeTab === 'overview') fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject payment');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRejectingId(null);
    }
  }

  // ──────────────────────────────────────────────
  // Bonus Votes & Voting Toggle
  // ──────────────────────────────────────────────

  async function submitBonusVotes() {
    if (!bonusContestantId) { toast.error('Select a contestant'); return; }
    if (!bonusVotes || Number(bonusVotes) < 1) { toast.error('Enter valid number of votes'); return; }
    setBonusSubmitting(true);
    try {
      const res = await fetch('/api/admin/bonus-votes', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ contestantId: bonusContestantId, votes: Number(bonusVotes), reason: bonusReason || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Added ${bonusVotes} bonus votes`);
        setBonusContestantId('');
        setBonusVotes('');
        setBonusReason('');
        fetchBonusHistory();
        fetchStats();
      } else { toast.error(data.message || 'Failed to add bonus votes'); }
    } catch { toast.error('Network error'); }
    finally { setBonusSubmitting(false); }
  }

  async function toggleVoting() {
    try {
      const res = await fetch('/api/admin/toggle-voting', { method: 'POST', headers: headers() });
      const data = await res.json();
      if (data.success) {
        setVotingEnabled(data.data.votingEnabled);
        toast.success(data.message);
      } else { toast.error(data.message || 'Failed to toggle'); }
    } catch { toast.error('Network error'); }
  }

  // ──────────────────────────────────────────────
  // Task CRUD
  // ──────────────────────────────────────────────

  async function createTask() {
    if (!taskForm.stageId) { toast.error('Please select a stage'); return; }
    if (!taskForm.title.trim()) { toast.error('Title is required'); return; }
    setTaskSubmitting(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          stageId: taskForm.stageId,
          title: taskForm.title.trim(),
          description: taskForm.description || undefined,
          instructions: taskForm.instructions || undefined,
          dueDate: taskForm.dueDate || undefined,
          maxBonusVotes: Number(taskForm.maxBonusVotes) || 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task created successfully');
        setTaskForm({ stageId: '', title: '', description: '', instructions: '', dueDate: '', maxBonusVotes: '10' });
        fetchTasks();
      } else {
        toast.error(data.message || data.error || 'Failed to create task');
      }
    } catch { toast.error('Network error'); }
    finally { setTaskSubmitting(false); }
  }

  async function deleteTask(id: string) {
    try {
      const res = await fetch(`/api/admin/tasks?id=${id}`, { method: 'DELETE', headers: headers() });
      const data = await res.json();
      if (data.success) { toast.success('Task deleted'); fetchTasks(); }
      else toast.error(data.message || 'Failed to delete task');
    } catch { toast.error('Network error'); }
  }

  async function fetchTaskSubmissions(taskId: string, taskTitle: string) {
    setSelectedTaskTitle(taskTitle);
    setSubmissionsLoading(true);
    setSubmissionsDialogOpen(true);
    try {
      const res = await fetch(`/api/admin/tasks?taskId=${taskId}`, { headers: headers() });
      const data = await res.json();
      if (data.success) setTaskSubmissions(data.data?.submissions || []);
    } catch { toast.error('Failed to load submissions'); }
    finally { setSubmissionsLoading(false); }
  }

  function openRatingDialog(sub: typeof taskSubmissions[0], maxBonus: number) {
    const autoVotes = Math.round((Number(ratingForm.beautyRating) || 5) * maxBonus / 10);
    setRatingForm({
      submissionId: sub.id,
      beautyRating: sub.beautyRating?.toString() || '5',
      feedback: sub.feedback || '',
      bonusVotes: sub.bonusVotesAwarded?.toString() || autoVotes.toString(),
    });
    setRatingDialogOpen(true);
  }

  async function submitRating(maxBonus: number) {
    if (!ratingForm.submissionId) return;
    setRatingSubmitting(true);
    try {
      const bonusVal = ratingForm.bonusVotes ? Number(ratingForm.bonusVotes) : Math.round(Number(ratingForm.beautyRating) * maxBonus / 10);
      const res = await fetch('/api/admin/tasks/submissions', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          submissionId: ratingForm.submissionId,
          beautyRating: Number(ratingForm.beautyRating) || 5,
          feedback: ratingForm.feedback || undefined,
          bonusVotesAwarded: bonusVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Submission rated successfully');
        setRatingDialogOpen(false);
        fetchTasks();
      } else {
        toast.error(data.message || data.error || 'Failed to rate submission');
      }
    } catch { toast.error('Network error'); }
    finally { setRatingSubmitting(false); }
  }

  // ──────────────────────────────────────────────
  // Mock weekly chart data from real stats
  // ──────────────────────────────────────────────

  const weeklyChartData = (() => {
    const totalVotes = stats?.totalVotes || 12340;
    const votesToday = stats?.votesToday || 156;
    const seed = [0.08, 0.12, 0.1, 0.14, 0.18, 0.22, 0.16];
    const base = Math.floor((totalVotes / 30 / 7) * (1 + Math.random() * 0.3));
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      votes: Math.round(base * (seed[i] + 0.5) + (i === 6 ? votesToday * 0.3 : 0)),
    }));
  })();

  const chartConfig = {
    votes: { label: 'Votes', color: 'var(--chart-1, #f97316)' },
  };

  // ──────────────────────────────────────────────
  // Stat Card Definitions
  // ──────────────────────────────────────────────

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Total Contestants', value: stats?.totalContestants ?? 0, icon: Crown, bg: 'bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Votes', value: stats?.totalVotes ?? 0, icon: Heart, bg: 'bg-rose-500/10', iconColor: 'text-rose-600 dark:text-rose-400' },
    { label: 'Revenue', value: formatCurrency(stats?.totalRevenue ?? 0, settings.currency), icon: DollarSign, bg: 'bg-green-500/10', iconColor: 'text-green-600 dark:text-green-400' },
    { label: 'Votes Today', value: stats?.votesToday ?? 0, icon: TrendingUp, bg: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'New Users Today', value: stats?.newUsersToday ?? 0, icon: UserCheck, bg: 'bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' },
  ];

  // ──────────────────────────────────────────────
  // Access Denied
  // ──────────────────────────────────────────────

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have admin privileges</p>
          <Button onClick={() => navigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Pagination Component
  // ──────────────────────────────────────────────

  function PaginationControls({ pagination, onPageChange }: { pagination: Pagination | null; onPageChange: (p: number) => void }) {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1}&ndash;{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">Page {pagination.page} / {pagination.totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <DashboardSidebar />
            <div className="flex-1 min-w-0 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      <span className="gradient-text">Admin</span> Dashboard
                    </h1>
                    <Badge className="bg-primary text-primary-foreground">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">Platform management and analytics</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const controller = new AbortController();
                    if (activeTab === 'overview') { fetchStats(controller.signal); fetchVotingStatus(); }
                    else if (activeTab === 'settings') fetchSettings(controller.signal);
                    else if (activeTab === 'contestants') fetchContestants(contestantsPage, contestantsSearch, controller.signal);
                    else if (activeTab === 'users') fetchUsers(usersPage, usersSearch, controller.signal);
                    else if (activeTab === 'tournament') fetchTournaments(controller.signal);
                    else if (activeTab === 'packages') fetchPackages(controller.signal);
                    else if (activeTab === 'payments') fetchPayments(paymentsPage, paymentsStatusFilter, paymentsMethodFilter, controller.signal);
                    else if (activeTab === 'bonus') { fetchBonusContestants(); fetchBonusHistory(); }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </motion.div>

              {/* Main Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== 'tournament') setSelectedTournament(null); }} className="space-y-6">
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="overview" className="gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="contestants" className="gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span className="hidden sm:inline">Contestants</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-1.5">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Users</span>
                  </TabsTrigger>
                  <TabsTrigger value="tournament" className="gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">Tournament</span>
                  </TabsTrigger>
                  <TabsTrigger value="packages" className="gap-1.5">
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Packages</span>
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:inline">Payments</span>
                    {paymentSummary.reviewCount > 0 && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1 min-w-4 h-4 flex items-center justify-center">
                        {paymentSummary.reviewCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="bonus" className="gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Bonus Votes</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-1.5">
                    <ClipboardCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-1.5">
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>

                {/* ════════════════════════════════════════ */}
                {/* TAB: OVERVIEW                           */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="overview">
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {statsLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                          ))
                        : statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                              <motion.div key={stat.label} custom={i} variants={fadeInUp}>
                                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                                      </div>
                                    </div>
                                    <p className="text-xl font-bold">
                                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                    </div>

                    {/* Voting Toggle */}
                    <motion.div custom={6} variants={fadeInUp}>
                      <Card className={votingEnabled ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}>
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${votingEnabled ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center shrink-0`}>
                            <Activity className={`w-6 h-6 ${votingEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${votingEnabled ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                              Voting is {votingEnabled ? 'ENABLED' : 'DISABLED'}
                            </p>
                            <p className="text-sm text-muted-foreground">Toggle voting on/off across the entire platform</p>
                          </div>
                          <Switch
                            checked={votingEnabled}
                            onCheckedChange={toggleVoting}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Active Stage */}
                    {stats?.activeStage && (
                      <motion.div custom={6} variants={fadeInUp}>
                        <Card className="border-primary/20 bg-primary/5">
                          <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground">Active Tournament Stage</p>
                              <p className="text-lg font-semibold">{stats.activeStage.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">Live</Badge>
                              <p className="text-sm text-muted-foreground mt-1">{stats.activeStage.contestantCount} contestants</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div custom={7} variants={fadeInUp}>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              Votes This Week
                            </CardTitle>
                            <CardDescription>Daily vote distribution across the week</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer config={chartConfig} className="h-[240px] w-full">
                              <BarChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="votes" fill="var(--color-votes)" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Top 5 Contestants */}
                      <motion.div custom={8} variants={fadeInUp}>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Star className="w-4 h-4 text-primary" />
                              Top 5 Contestants
                            </CardTitle>
                            <CardDescription>Leading contestants by total votes</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {statsLoading ? (
                              <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                              </div>
                            ) : stats?.topContestants?.length ? (
                              <ScrollArea className="max-h-[220px]">
                                <div className="space-y-2 pr-2">
                                  {stats.topContestants.map((c, i) => (
                                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                        {i + 1}
                                      </span>
                                      <img
                                        src={c.imageUrl}
                                        alt={c.name}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/f97316/fff?text=' + c.name.charAt(0); }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">{c.category}</p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-sm font-bold">{c.totalVotes.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground">votes</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Crown className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No contestant data yet</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div custom={9} variants={fadeInUp}>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Recent Activity
                          </CardTitle>
                          <CardDescription>Last 10 voting activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {statsLoading ? (
                            <div className="space-y-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                              ))}
                            </div>
                          ) : stats?.recentActivity?.length ? (
                            <ScrollArea className="max-h-[400px]">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Voter</TableHead>
                                      <TableHead>Contestant</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {stats.recentActivity.map((a) => (
                                      <TableRow key={a.id}>
                                        <TableCell className="font-medium text-sm">{a.user?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={a.contestant?.imageUrl}
                                              alt={a.contestant?.name}
                                              className="w-6 h-6 rounded-full object-cover"
                                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/f97316/fff?text=' + (a.contestant?.name || '?').charAt(0); }}
                                            />
                                            <span className="text-sm">{a.contestant?.name || 'Unknown'}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>{voteTypeBadge(a.voteType)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground text-right whitespace-nowrap">
                                          {timeAgo(a.createdAt)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                              <Activity className="w-10 h-10 mb-2 opacity-30" />
                              <p className="text-sm">No recent activity</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: CONTESTANTS (with eliminate)        */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="contestants">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Search + Add */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search contestants by name..."
                          className="pl-9"
                          value={contestantsSearch}
                          onChange={(e) => setContestantsSearch(e.target.value)}
                        />
                      </div>
                      <Button onClick={openAddContestantDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contestant
                      </Button>
                    </div>

                    {/* Table */}
                    <Card>
                      <CardContent className="p-0">
                        {contestantsLoading ? (
                          <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : contestants.length > 0 ? (
                          <>
                            <ScrollArea>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Votes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contestants.map((c, i) => (
                                    <>
                                      <TableRow key={c.id}>
                                        <TableCell className="text-muted-foreground text-sm">{(contestantsPage - 1) * 10 + i + 1}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={c.imageUrl}
                                              alt={c.name}
                                              className="w-8 h-8 rounded-full object-cover shrink-0"
                                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/f97316/fff?text=' + c.name.charAt(0); }}
                                            />
                                            <span className="font-medium text-sm">{c.name}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{c.category || '—'}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1.5">
                                            {statusBadge(c.status)}
                                            {c.status === 'eliminated' && (
                                              <button
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => toggleContestantExpand(c.id)}
                                              >
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedContestants.has(c.id) ? 'rotate-180' : ''}`} />
                                              </button>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-sm">{(c.totalVotes || 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            {c.status === 'active' && (
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => openEliminateDialog(c.id)}>
                                                    <Skull className="w-3.5 h-3.5" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Eliminate contestant</TooltipContent>
                                              </Tooltip>
                                            )}
                                            {c.status === 'eliminated' && (
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                    disabled={undoEliminateId === c.id}
                                                    onClick={() => undoElimination(c.id)}
                                                  >
                                                    {undoEliminateId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Undo elimination</TooltipContent>
                                              </Tooltip>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditContestantDialog(c)}>
                                              <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setDeleteContestantId(c.id)}>
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {/* Expanded elimination details */}
                                      {c.status === 'eliminated' && expandedContestants.has(c.id) && (
                                        <TableRow key={`${c.id}-details`}>
                                          <TableCell colSpan={6} className="bg-red-500/5 px-8 py-3">
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                                              {c.eliminationReason && (
                                                <div className="flex items-start gap-2">
                                                  <span className="text-muted-foreground font-medium shrink-0">Reason:</span>
                                                  <span className="text-red-700 dark:text-red-400">{c.eliminationReason}</span>
                                                </div>
                                              )}
                                              {c.eliminatedAt && (
                                                <div className="flex items-center gap-2">
                                                  <span className="text-muted-foreground font-medium shrink-0">Eliminated at:</span>
                                                  <span>{formatDateTime(c.eliminatedAt)}</span>
                                                </div>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                            <div className="p-4">
                              <PaginationControls
                                pagination={contestantsPagination}
                                onPageChange={(p) => {
                                  setContestantsPage(p);
                                  fetchContestants(p, contestantsSearch);
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Crown className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">No contestants found</p>
                            <p className="text-sm mt-1">
                              {contestantsSearch ? 'Try adjusting your search' : 'Add your first contestant to get started'}
                            </p>
                            {!contestantsSearch && (
                              <Button variant="outline" size="sm" className="mt-4" onClick={openAddContestantDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Contestant
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: USERS                              */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="users">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Search */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name or email..."
                        className="pl-9"
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                      />
                    </div>

                    {/* Table */}
                    <Card>
                      <CardContent className="p-0">
                        {usersLoading ? (
                          <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : users.length > 0 ? (
                          <>
                            <ScrollArea>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Votes</TableHead>
                                    <TableHead className="text-right">Referrals</TableHead>
                                    <TableHead className="text-right">Joined</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {users.map((u) => (
                                    <TableRow key={u.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="font-medium text-sm">{u.name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                                      <TableCell>{roleBadge(u.role)}</TableCell>
                                      <TableCell className="text-right text-sm font-medium">{u._count?.votes ?? 0}</TableCell>
                                      <TableCell className="text-right text-sm font-medium">{u._count?.sentReferrals ?? 0}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                                        {formatDate(u.createdAt)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                            <div className="p-4">
                              <PaginationControls
                                pagination={usersPagination}
                                onPageChange={(p) => {
                                  setUsersPage(p);
                                  fetchUsers(p, usersSearch);
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">No users found</p>
                            <p className="text-sm mt-1">
                              {usersSearch ? 'Try adjusting your search' : 'No users have registered yet'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: TOURNAMENT (completely rewritten)   */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="tournament">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Tournament List View */}
                    {!selectedTournament ? (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold">Tournaments</h2>
                            <p className="text-sm text-muted-foreground">Manage competitions and their stages</p>
                          </div>
                          <Button onClick={openAddTournamentDialog}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Tournament
                          </Button>
                        </div>

                        {/* Tournament List */}
                        {tournamentsLoading ? (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))}
                          </div>
                        ) : tournaments.length > 0 ? (
                          <div className="space-y-3">
                            {tournaments.map((tournament, i) => (
                              <motion.div
                                key={tournament.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                              >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedTournament(tournament)}>
                                  <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                      {/* Icon */}
                                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Trophy className="w-6 h-6 text-primary" />
                                      </div>

                                      {/* Tournament info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h3 className="font-semibold text-lg">{tournament.name}</h3>
                                          {statusBadge(tournament.status)}
                                        </div>
                                        {tournament.description && (
                                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{tournament.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                          <span className="flex items-center gap-1">
                                            <Swords className="w-3 h-3" />
                                            {tournament.stageCount} stage{tournament.stageCount !== 1 ? 's' : ''}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Created {formatDate(tournament.createdAt)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedTournament(tournament)}>
                                          View Stages
                                          <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTournamentDialog(tournament)}>
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setDeleteTournamentId(tournament.id)}>
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                              <Trophy className="w-12 h-12 mb-3 opacity-20" />
                              <p className="font-medium">No tournaments created</p>
                              <p className="text-sm mt-1">Create your first tournament to get started</p>
                              <Button variant="outline" size="sm" className="mt-4" onClick={openAddTournamentDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Tournament
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Tournament Detail / Stages View */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTournament(null)}>
                              <ArrowLeft className="w-4 h-4 mr-1" />
                              Back
                            </Button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">{selectedTournament.name}</h2>
                                {statusBadge(selectedTournament.status)}
                              </div>
                              {selectedTournament.description && (
                                <p className="text-sm text-muted-foreground">{selectedTournament.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditTournamentDialog(selectedTournament)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => openAddStageDialog(selectedTournament.id)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Stage
                            </Button>
                          </div>
                        </div>

                        {/* Stages */}
                        {selectedTournament.stages && selectedTournament.stages.length > 0 ? (
                          <div className="space-y-3">
                            {selectedTournament.stages
                              .sort((a, b) => a.order - b.order)
                              .map((stage, i) => (
                                <motion.div
                                  key={stage.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                >
                                  <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Order indicator */}
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                                          {stage.order}
                                        </div>

                                        {/* Stage info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold">{stage.name}</h3>
                                            {statusBadge(stage.status)}
                                          </div>
                                          {stage.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{stage.description}</p>
                                          )}
                                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              {stage.startDate ? formatDate(stage.startDate) : 'TBD'}
                                            </span>
                                            <span>→</span>
                                            <span>
                                              {stage.endDate ? formatDate(stage.endDate) : 'TBD'}
                                            </span>
                                            {stage.contestantCount !== undefined && (
                                              <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {stage.contestantCount} contestants
                                              </span>
                                            )}
                                            {stage.maxContestants && (
                                              <span>Max: {stage.maxContestants}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                              <Heart className="w-3 h-3" />
                                              Min votes: {stage.minVotes ?? 0}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                          {stage.status === 'active' && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => processStageProgression(stage.id)}
                                                  disabled={progressingStage === stage.id}
                                                  className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-950"
                                                >
                                                  {progressingStage === stage.id ? (
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                  ) : (
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                  )}
                                                  Progress
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Process stage elimination check</TooltipContent>
                                            </Tooltip>
                                          )}
                                          {stage.status !== 'active' && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => activateStage(stage.id)}
                                              disabled={activatingStage === stage.id}
                                            >
                                              {activatingStage === stage.id ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                              ) : (
                                                <Play className="w-4 h-4 mr-1" />
                                              )}
                                              Activate
                                            </Button>
                                          )}
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditStageDialog(stage, selectedTournament.id)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setDeleteStageId(stage.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                          </div>
                        ) : (
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                              <Swords className="w-12 h-12 mb-3 opacity-20" />
                              <p className="font-medium">No stages in this tournament</p>
                              <p className="text-sm mt-1">Add stages to define competition phases</p>
                              <Button variant="outline" size="sm" className="mt-4" onClick={() => openAddStageDialog(selectedTournament.id)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Stage
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: VOTE PACKAGES                      */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="packages">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Vote Packages</h2>
                        <p className="text-sm text-muted-foreground">Manage available vote purchase options</p>
                      </div>
                      <Button onClick={openAddPackageDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Package
                      </Button>
                    </div>

                    {/* Grid */}
                    {packagesLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                      </div>
                    ) : packages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {packages.map((pkg, i) => (
                          <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                          >
                            <Card className={`relative overflow-hidden ${pkg.isPopular ? 'border-primary shadow-lg shadow-primary/10' : ''} ${!pkg.isActive ? 'opacity-60' : ''}`}>
                              {pkg.isPopular && (
                                <div className="absolute top-0 right-0">
                                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    <Star className="w-3 h-3 inline mr-1" />
                                    Popular
                                  </div>
                                </div>
                              )}
                              <CardContent className="p-5">
                                <div className="mb-3">
                                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                                </div>
                                <div className="space-y-2 mb-4">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{pkg.votes}</span>
                                    <span className="text-sm text-muted-foreground">votes</span>
                                  </div>
                                  {pkg.bonusVotes > 0 && (
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                      + {pkg.bonusVotes} bonus votes
                                    </p>
                                  )}
                                  <Separator />
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-primary">{formatCurrency(pkg.price, settings.currency)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pkg.isActive ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-red-500/15 text-red-700 dark:text-red-400'}`}>
                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={pkg.isActive}
                                      disabled={togglingPackageId === pkg.id}
                                      onCheckedChange={() => togglePackageActive(pkg.id, pkg.isActive)}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Package className="w-12 h-12 mb-3 opacity-20" />
                          <p className="font-medium">No packages created</p>
                          <p className="text-sm mt-1">Create vote packages for users to purchase</p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={openAddPackageDialog}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Package
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: PAYMENTS                           */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="payments">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Awaiting Review', value: paymentSummary.reviewCount, icon: Clock, bg: 'bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Pending', value: paymentSummary.pendingCount, icon: Activity, bg: 'bg-yellow-500/10', iconColor: 'text-yellow-600 dark:text-yellow-400' },
                      { label: 'Completed', value: paymentSummary.completedCount, icon: Check, bg: 'bg-green-500/10', iconColor: 'text-green-600 dark:text-green-400' },
                      { label: 'Offline Pending', value: paymentSummary.offlinePendingCount, icon: Building2, bg: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <Card key={s.label} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                              <Icon className={`w-4 h-4 ${s.iconColor}`} />
                            </div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={paymentsStatusFilter} onValueChange={(v) => { setPaymentsStatusFilter(v); setPaymentsPage(1); }}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={paymentsMethodFilter} onValueChange={(v) => { setPaymentsMethodFilter(v); setPaymentsPage(1); }}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="paystack">Paystack</SelectItem>
                        <SelectItem value="flutterwave">Flutterwave</SelectItem>
                        <SelectItem value="offline">Bank Transfer</SelectItem>
                        <SelectItem value="mock">Mock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payments Table */}
                  <Card>
                    <CardContent className="p-0">
                      {paymentsLoading ? (
                        <div className="space-y-3 p-6">
                          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                        </div>
                      ) : payments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Proof</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((p) => {
                                const isReviewable = p.status === 'awaiting_review' || p.status === 'pending';
                                const isCompleted = p.status === 'completed';
                                const methodIcon = p.paymentMethod === 'paystack' ? <CreditCard className="w-3.5 h-3.5" /> : p.paymentMethod === 'flutterwave' ? <Zap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />;
                                return (
                                  <TableRow key={p.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                          {p.user.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium truncate">{p.user.name}</p>
                                          <p className="text-[11px] text-muted-foreground truncate">{p.user.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <p className="text-sm font-medium">{p.package.name}</p>
                                      <p className="text-[11px] text-muted-foreground">{p.package.votes + p.package.bonusVotes} votes</p>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1.5">
                                        {methodIcon}
                                        <span className="text-xs capitalize">{p.paymentMethod}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-sm">{formatCurrency(p.amount, settings.currency)}</TableCell>
                                    <TableCell>
                                      {p.status === 'completed' && (
                                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20 text-xs">Completed</Badge>
                                      )}
                                      {p.status === 'awaiting_review' && (
                                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">Awaiting Review</Badge>
                                      )}
                                      {p.status === 'pending' && (
                                        <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 text-xs">Pending</Badge>
                                      )}
                                      {p.status === 'failed' && (
                                        <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">Failed</Badge>
                                      )}
                                      {p.status === 'rejected' && (
                                        <Badge className="bg-red-600/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">⚠️ Rejected</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {p.proofImageUrl ? (
                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setProofImageUrl(p.proofImageUrl); setProofDialogOpen(true); }}>
                                          <ImageIcon className="w-3.5 h-3.5 mr-1" />View
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                      {isReviewable && (
                                        <div className="flex items-center justify-end gap-1">
                                          <Button
                                            size="sm"
                                            className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white"
                                            disabled={approvingId === p.id}
                                            onClick={() => approvePayment(p.id)}
                                          >
                                            {approvingId === p.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                                            Approve
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50"
                                            disabled={rejectingId === p.id}
                                            onClick={() => openRejectDialog(p.id, false)}
                                          >
                                            {rejectingId === p.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Ban className="w-3 h-3 mr-1" />}
                                            Reject
                                          </Button>
                                        </div>
                                      )}
                                      {isCompleted && (
                                        <div className="flex items-center justify-end gap-1">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs text-red-700 border-red-400 bg-red-50 hover:bg-red-100"
                                                disabled={rejectingId === p.id}
                                                onClick={() => openRejectDialog(p.id, true)}
                                              >
                                                {rejectingId === p.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                                Flag Fraud
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Reject this payment as fraudulent and remove all associated votes</TooltipContent>
                                          </Tooltip>
                                        </div>
                                      )}
                                      {p.adminNote && (
                                        <p className="text-[10px] text-red-500 mt-1 truncate max-w-[120px]" title={p.adminNote}>Reason: {p.adminNote}</p>
                                      )}
                                      {p.reviewer && (
                                        <p className="text-[10px] text-muted-foreground mt-1">By {p.reviewer.name}</p>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                          <h3 className="font-semibold mb-1">No payments found</h3>
                          <p className="text-sm text-muted-foreground">No payments match the selected filters</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <PaginationControls
                    pagination={paymentsPagination}
                    onPageChange={(p) => setPaymentsPage(p)}
                  />
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: BONUS VOTES                        */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="bonus">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Add Bonus Vote Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-primary" />
                          Add Bonus Votes
                        </CardTitle>
                        <CardDescription>Manually add votes to a contestant</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="bonus-contestant">Contestant</Label>
                            <Select value={bonusContestantId} onValueChange={setBonusContestantId}>
                              <SelectTrigger id="bonus-contestant">
                                <SelectValue placeholder="Select contestant..." />
                              </SelectTrigger>
                              <SelectContent>
                                {bonusContestants.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name} ({c.totalVotes.toLocaleString()} votes)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bonus-votes">Number of Votes</Label>
                            <Input
                              id="bonus-votes"
                              type="number"
                              min="1"
                              placeholder="e.g. 100"
                              value={bonusVotes}
                              onChange={(e) => setBonusVotes(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bonus-reason">Reason (optional)</Label>
                            <Input
                              id="bonus-reason"
                              placeholder="e.g. Referral bonus"
                              value={bonusReason}
                              onChange={(e) => setBonusReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button onClick={submitBonusVotes} disabled={bonusSubmitting}>
                            {bonusSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Bonus Votes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bonus Vote History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Bonus Vote History
                        </CardTitle>
                        <CardDescription>All bonus votes that have been added</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {bonusHistoryLoading ? (
                          <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : bonusHistory.length > 0 ? (
                          <ScrollArea>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Contestant Name</TableHead>
                                  <TableHead className="text-right">Votes Added</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Added By</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bonusHistory.map((b) => (
                                  <TableRow key={b.id}>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                      {formatDateTime(b.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={b.contestant.imageUrl}
                                          alt={b.contestant.name}
                                          className="w-6 h-6 rounded-full object-cover shrink-0"
                                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/f97316/fff?text=' + b.contestant.name.charAt(0); }}
                                        />
                                        <span className="text-sm font-medium">{b.contestant.name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">
                                        +{b.votesAdded.toLocaleString()}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {b.reason || '—'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                      {b.addedBy.name}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <PlusCircle className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">No bonus votes added yet</p>
                            <p className="text-sm mt-1">Use the form above to add bonus votes to contestants</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: SETTINGS (new)                      */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="settings">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Platform Settings</h2>
                      <p className="text-sm text-muted-foreground">Configure platform-wide preferences</p>
                    </div>

                    {settingsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-40 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* ── General Settings ── */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Settings2 className="w-4 h-4 text-primary" />
                              General Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Platform Name */}
                            <div className="space-y-2">
                              <Label htmlFor="setting-name" className="text-sm font-medium">
                                Platform Name
                              </Label>
                              <Input
                                id="setting-name"
                                placeholder="Beauty Vote"
                                value={settingsForm.platformName}
                                onChange={(e) => setSettingsForm((f) => ({ ...f, platformName: e.target.value }))}
                              />
                              <p className="text-xs text-muted-foreground">The name displayed across the platform (Navbar, Footer, pages)</p>
                            </div>

                            <Separator />

                            {/* Vote Price & Currency */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="setting-price" className="text-sm font-medium">
                                  Vote Price (per vote)
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbols[settingsForm.currency] || '$'}
                                  </span>
                                  <Input
                                    id="setting-price"
                                    type="number"
                                    className="pl-8"
                                    placeholder="200"
                                    value={settingsForm.votePrice}
                                    onChange={(e) => setSettingsForm((f) => ({ ...f, votePrice: e.target.value }))}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">Cost of a single vote</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="setting-currency" className="text-sm font-medium">
                                  Currency
                                </Label>
                                <Select value={settingsForm.currency} onValueChange={(v) => setSettingsForm((f) => ({ ...f, currency: v }))}>
                                  <SelectTrigger id="setting-currency">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NGN">NGN — Nigerian Naira (₦)</SelectItem>
                                    <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                                    <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                                    <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                                    <SelectItem value="GHS">GHS — Ghanaian Cedi (₵)</SelectItem>
                                    <SelectItem value="KES">KES — Kenyan Shilling (KSh)</SelectItem>
                                    <SelectItem value="ZAR">ZAR — South African Rand (R)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Primary currency for the platform</p>
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="rounded-lg bg-muted/50 border p-4">
                              <p className="text-xs text-muted-foreground mb-2">Preview</p>
                              <p className="text-sm">
                                One vote costs{' '}
                                <span className="font-bold text-primary">
                                  {formatCurrency(Number(settingsForm.votePrice) || 0, settingsForm.currency)}
                                </span>{' '}
                                on <span className="font-bold">{settingsForm.platformName || 'Beauty Vote'}</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* ── Offline Payment Bank Details ── */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-primary" />
                              Offline Payment Bank Details
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              These bank details are shown to users who choose the offline payment method for buying votes
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <Label htmlFor="bank-name" className="text-sm font-medium">Bank Name</Label>
                                <Input
                                  id="bank-name"
                                  placeholder="e.g. Access Bank, GTBank"
                                  value={settingsForm.offlineBankName}
                                  onChange={(e) => setSettingsForm((f) => ({ ...f, offlineBankName: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bank-branch" className="text-sm font-medium">Branch</Label>
                                <Input
                                  id="bank-branch"
                                  placeholder="e.g. Victoria Island Branch"
                                  value={settingsForm.offlineBankBranch}
                                  onChange={(e) => setSettingsForm((f) => ({ ...f, offlineBankBranch: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <Label htmlFor="account-name" className="text-sm font-medium">Account Name</Label>
                                <Input
                                  id="account-name"
                                  placeholder="Account name for deposits"
                                  value={settingsForm.offlineAccountName}
                                  onChange={(e) => setSettingsForm((f) => ({ ...f, offlineAccountName: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="account-number" className="text-sm font-medium">Account Number</Label>
                                <Input
                                  id="account-number"
                                  placeholder="10-digit account number"
                                  value={settingsForm.offlineAccountNumber}
                                  onChange={(e) => setSettingsForm((f) => ({ ...f, offlineAccountNumber: e.target.value }))}
                                />
                              </div>
                            </div>

                            {/* Bank Details Preview */}
                            <div className="rounded-lg bg-muted/50 border p-4">
                              <p className="text-xs text-muted-foreground mb-3">Preview (as seen by users)</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bank:</span>
                                  <span className="font-medium">{settingsForm.offlineBankName || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Account Name:</span>
                                  <span className="font-medium">{settingsForm.offlineAccountName || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Account Number:</span>
                                  <span className="font-bold font-mono tracking-wider">{settingsForm.offlineAccountNumber || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Branch:</span>
                                  <span className="font-medium">{settingsForm.offlineBankBranch || '—'}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* ── Prize Settings ── */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-primary" />
                              Prize Configuration
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Set the cash prize amounts for each winning position. These will be displayed on the public Prize page.
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Prize Currency */}
                            <div className="space-y-2">
                              <Label htmlFor="prize-currency" className="text-sm font-medium">Prize Currency</Label>
                              <Select value={settingsForm.prizeCurrency} onValueChange={(v) => setSettingsForm((f) => ({ ...f, prizeCurrency: v }))}>
                                <SelectTrigger id="prize-currency" className="max-w-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NGN">NGN — Nigerian Naira (₦)</SelectItem>
                                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                                  <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                                  <SelectItem value="GHS">GHS — Ghanaian Cedi (₵)</SelectItem>
                                  <SelectItem value="KES">KES — Kenyan Shilling (KSh)</SelectItem>
                                  <SelectItem value="ZAR">ZAR — South African Rand (R)</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Currency used to display prize amounts publicly</p>
                            </div>

                            <Separator />

                            {/* Prize Tiers */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                              {/* 1st Place */}
                              <div className="space-y-2 rounded-xl border-2 border-yellow-400/30 bg-yellow-50/50 dark:bg-yellow-950/10 p-4">
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  <Label className="text-sm font-bold text-yellow-700 dark:text-yellow-400">1st Place Prize</Label>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbols[settingsForm.prizeCurrency] || '₦'}
                                  </span>
                                  <Input
                                    type="number"
                                    className="pl-8"
                                    placeholder="5,000,000"
                                    value={settingsForm.prize1st}
                                    onChange={(e) => setSettingsForm((f) => ({ ...f, prize1st: e.target.value }))}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  = {formatCurrency(Number(settingsForm.prize1st) || 0, settingsForm.prizeCurrency)}
                                </p>
                              </div>

                              {/* 2nd Place */}
                              <div className="space-y-2 rounded-xl border-2 border-gray-300/30 bg-gray-50/50 dark:bg-gray-900/30 p-4">
                                <div className="flex items-center gap-2">
                                  <Medal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <Label className="text-sm font-bold text-gray-600 dark:text-gray-400">2nd Place Prize</Label>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbols[settingsForm.prizeCurrency] || '₦'}
                                  </span>
                                  <Input
                                    type="number"
                                    className="pl-8"
                                    placeholder="3,000,000"
                                    value={settingsForm.prize2nd}
                                    onChange={(e) => setSettingsForm((f) => ({ ...f, prize2nd: e.target.value }))}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  = {formatCurrency(Number(settingsForm.prize2nd) || 0, settingsForm.prizeCurrency)}
                                </p>
                              </div>

                              {/* 3rd Place */}
                              <div className="space-y-2 rounded-xl border-2 border-orange-400/30 bg-orange-50/50 dark:bg-orange-950/10 p-4">
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  <Label className="text-sm font-bold text-orange-700 dark:text-orange-400">3rd Place Prize</Label>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbols[settingsForm.prizeCurrency] || '₦'}
                                  </span>
                                  <Input
                                    type="number"
                                    className="pl-8"
                                    placeholder="1,500,000"
                                    value={settingsForm.prize3rd}
                                    onChange={(e) => setSettingsForm((f) => ({ ...f, prize3rd: e.target.value }))}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  = {formatCurrency(Number(settingsForm.prize3rd) || 0, settingsForm.prizeCurrency)}
                                </p>
                              </div>
                            </div>

                            {/* Total Prize Pool */}
                            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Prize Pool</span>
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(
                                    (Number(settingsForm.prize1st) || 0) +
                                    (Number(settingsForm.prize2nd) || 0) +
                                    (Number(settingsForm.prize3rd) || 0),
                                    settingsForm.prizeCurrency
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                          <Button onClick={saveSettings} disabled={settingsSaving}>
                            {settingsSaving ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save All Settings
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </TabsContent>

                {/* ════════════════════════════════════════ */}
                {/* TAB: TASKS                               */}
                {/* ════════════════════════════════════════ */}
                <TabsContent value="tasks">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-primary" />
                        Task Management
                      </h2>
                      <p className="text-sm text-muted-foreground">Create and manage tasks for contestants with bonus vote rewards</p>
                    </div>

                    {/* Create Task Form */}
                    <Card className="rounded-xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Create New Task</CardTitle>
                        <CardDescription>Assign a task to a stage with bonus vote rewards</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Stage *</Label>
                            <Select value={taskForm.stageId} onValueChange={(v) => setTaskForm((f) => ({ ...f, stageId: v }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {tournaments.map((t) =>
                                  t.stages?.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {t.name} &middot; {s.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={taskForm.dueDate}
                              onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            placeholder="e.g. Best Photo Challenge"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Brief description of the task..."
                            value={taskForm.description}
                            onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Instructions for Contestants</Label>
                          <Textarea
                            placeholder="Detailed instructions for contestants on how to complete the task..."
                            value={taskForm.instructions}
                            onChange={(e) => setTaskForm((f) => ({ ...f, instructions: e.target.value }))}
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Bonus Votes</Label>
                            <Input
                              type="number"
                              min="1"
                              value={taskForm.maxBonusVotes}
                              onChange={(e) => setTaskForm((f) => ({ ...f, maxBonusVotes: e.target.value }))}
                            />
                            <p className="text-[11px] text-muted-foreground">Maximum bonus votes a contestant can earn</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={createTask} disabled={taskSubmitting} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                            {taskSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tasks List */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">All Tasks</h3>
                      {tasksLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                          ))}
                        </div>
                      ) : tasks.length === 0 ? (
                        <Card className="rounded-xl">
                          <CardContent className="py-12 text-center">
                            <ClipboardCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No tasks created yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Create your first task using the form above</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tasks.map((task) => {
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'active';
                            return (
                              <Card key={task.id} className="rounded-xl overflow-hidden">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">{task.stage?.tournament?.name} &middot; {task.stage?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {task.status === 'active' ? (
                                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">Active</Badge>
                                      ) : task.status === 'closed' ? (
                                        <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20">Closed</Badge>
                                      ) : (
                                        <Badge className="bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20">{task.status}</Badge>
                                      )}
                                    </div>
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                  )}
                                  {task.instructions && (
                                    <div className="p-2 bg-muted/50 rounded-lg text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-2">{task.instructions}</div>
                                  )}

                                  <div className="flex items-center gap-3 flex-wrap">
                                    {task.dueDate && (
                                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(task.dueDate)}
                                        {isOverdue && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] ml-1">Overdue</Badge>}
                                      </span>
                                    )}
                                    <Badge variant="secondary" className="text-[10px]">
                                      <Star className="w-3 h-3 mr-1 text-amber-500" />
                                      Max {task.maxBonusVotes} bonus
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {task._count?.submissions || 0} submissions
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1">
                                    <Button size="sm" variant="outline" className="text-xs rounded-lg" onClick={() => fetchTaskSubmissions(task.id, task.title)}>
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Submissions
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => deleteTask(task.id)}>
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* DIALOGS                                   */}
      {/* ════════════════════════════════════════ */}

      {/* Task Submissions Dialog */}
      <Dialog open={submissionsDialogOpen} onOpenChange={(open) => { setSubmissionsDialogOpen(open); if (!open) setTaskSubmissions([]); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Submissions — {selectedTaskTitle}
            </DialogTitle>
            <DialogDescription>Review and rate contestant submissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {submissionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : taskSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No submissions yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-3 pr-4">
                  {taskSubmissions.map((sub) => (
                    <Card key={sub.id} className="rounded-lg border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                            {sub.contestant?.imageUrl ? (
                              <img src={sub.contestant.imageUrl} alt={sub.contestant.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">{sub.contestant?.name?.charAt(0) || '?'}</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate">{sub.contestant?.name || 'Unknown'}</h4>
                              {sub.status === 'pending' ? (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] border-0">Pending</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px] border-0">Rated</Badge>
                              )}
                            </div>
                            {sub.submissionUrl && (
                              <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                                {sub.submissionUrl}
                              </a>
                            )}
                            {sub.caption && (
                              <p className="text-xs text-muted-foreground">{sub.caption}</p>
                            )}
                            {sub.status === 'rated' && (
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  {sub.beautyRating}/10
                                </span>
                                <span className="text-green-600 dark:text-green-400 font-medium">+{sub.bonusVotesAwarded} votes</span>
                                {sub.feedback && <span className="text-muted-foreground truncate">"{sub.feedback}"</span>}
                              </div>
                            )}
                            {sub.status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-xs rounded-lg mt-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 hover:from-orange-600 hover:to-amber-600" onClick={() => {
                                const task = tasks.find(t => t.title === selectedTaskTitle);
                                openRatingDialog(sub, task?.maxBonusVotes || 10);
                              }}>
                                <Star className="w-3 h-3 mr-1" />
                                Rate
                              </Button>
                            )}
                            <p className="text-[10px] text-muted-foreground">{timeAgo(sub.createdAt)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Rate Submission
            </DialogTitle>
            <DialogDescription>Rate this contestant's submission and award bonus votes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(() => {
              const sub = taskSubmissions.find(s => s.id === ratingForm.submissionId);
              return sub ? (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                    {sub.contestant?.imageUrl ? (
                      <img src={sub.contestant.imageUrl} alt={sub.contestant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">{sub.contestant?.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{sub.contestant?.name}</p>
                    {sub.submissionUrl && (
                      <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline truncate block">View Submission</a>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            <div className="space-y-2">
              <Label>Beauty Rating: {ratingForm.beautyRating}/10</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ratingForm.beautyRating}
                  onChange={(e) => {
                    const val = e.target.value;
                    const task = tasks.find(t => t.submissions?.some);
                    setRatingForm((f) => ({ ...f, beautyRating: val, bonusVotes: Math.round(Number(val) * (tasks.find(t => t.id)?.maxBonusVotes || 10) / 10).toString() }));
                  }}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-bold text-primary w-6 text-center">{ratingForm.beautyRating}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRatingForm((f) => ({ ...f, beautyRating: n.toString(), bonusVotes: Math.round(n * (tasks.find(t => t.id)?.maxBonusVotes || 10) / 10).toString() }))}
                    className={`w-6 h-6 rounded text-xs transition-colors ${Number(ratingForm.beautyRating) >= n ? 'text-amber-500' : 'text-muted-foreground/30 hover:text-amber-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                placeholder="Give feedback to the contestant..."
                value={ratingForm.feedback}
                onChange={(e) => setRatingForm((f) => ({ ...f, feedback: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Bonus Votes to Award</Label>
              <Input
                type="number"
                min="0"
                value={ratingForm.bonusVotes}
                onChange={(e) => setRatingForm((f) => ({ ...f, bonusVotes: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground">Auto-calculated from rating. Override as needed.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const task = tasks.find(t => t.id);
              submitRating(task?.maxBonusVotes || 10);
            }} disabled={ratingSubmitting} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              {ratingSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Contestant Dialog */}
      <Dialog open={contestantDialogOpen} onOpenChange={setContestantDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingContestant ? 'Edit Contestant' : 'Add Contestant'}</DialogTitle>
            <DialogDescription>
              {editingContestant ? 'Update contestant details' : 'Add a new contestant to the platform'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input
                id="c-name"
                placeholder="Contestant name"
                value={contestantForm.name}
                onChange={(e) => setContestantForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-image">Image URL</Label>
              <Input
                id="c-image"
                placeholder="https://example.com/photo.jpg"
                value={contestantForm.imageUrl}
                onChange={(e) => setContestantForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-bio">Bio</Label>
              <Textarea
                id="c-bio"
                placeholder="Brief description of the contestant..."
                rows={3}
                value={contestantForm.bio}
                onChange={(e) => setContestantForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-category">Category</Label>
              <Input
                id="c-category"
                placeholder="e.g. Miss Talent"
                value={contestantForm.category}
                onChange={(e) => setContestantForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-status">Status</Label>
              <Select value={contestantForm.status} onValueChange={(v) => setContestantForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="eliminated">Eliminated</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContestantDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitContestant} disabled={contestantSubmitting}>
              {contestantSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingContestant ? 'Save Changes' : 'Create Contestant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contestant Confirmation */}
      <AlertDialog open={!!deleteContestantId} onOpenChange={() => setDeleteContestantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Contestant
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The contestant and all their associated votes will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContestantLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteContestantId && deleteContestant(deleteContestantId)}
              disabled={deleteContestantLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteContestantLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Eliminate Contestant Dialog */}
      <Dialog open={eliminateDialogOpen} onOpenChange={setEliminateDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500" />
              Eliminate Contestant
            </DialogTitle>
            <DialogDescription>
              This contestant will be marked as eliminated and removed from the active competition.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="eliminate-reason">Reason (optional)</Label>
              <Textarea
                id="eliminate-reason"
                placeholder="Provide a reason for elimination..."
                value={eliminateReason}
                onChange={(e) => setEliminateReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEliminateDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={eliminateSubmitting}
              onClick={confirmEliminate}
            >
              {eliminateSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Skull className="w-4 h-4 mr-2" />}
              Eliminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Tournament Dialog */}
      <Dialog open={tournamentDialogOpen} onOpenChange={setTournamentDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingTournament ? 'Edit Tournament' : 'Create Tournament'}</DialogTitle>
            <DialogDescription>
              {editingTournament ? 'Update tournament details' : 'Add a new tournament'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Tournament Name *</Label>
              <Input
                id="t-name"
                placeholder="e.g. Beauty Pageant 2025"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea
                id="t-desc"
                placeholder="Describe this tournament..."
                rows={3}
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-status">Status</Label>
              <Select value={tournamentForm.status} onValueChange={(v) => setTournamentForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTournamentDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitTournament} disabled={tournamentSubmitting}>
              {tournamentSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTournament ? 'Save Changes' : 'Create Tournament'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tournament Confirmation */}
      <AlertDialog open={!!deleteTournamentId} onOpenChange={() => setDeleteTournamentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Tournament
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The tournament and all its stages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTournamentLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTournamentId && deleteTournament(deleteTournamentId)}
              disabled={deleteTournamentLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTournamentLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Tournament
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Stage Dialog (within tournament) */}
      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingStage ? 'Edit Stage' : 'Create Stage'}</DialogTitle>
            <DialogDescription>
              {editingStage ? 'Update tournament stage details' : 'Add a new stage to the tournament'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Stage Name *</Label>
              <Input
                id="s-name"
                placeholder="e.g. Semi-Finals"
                value={stageForm.name}
                onChange={(e) => setStageForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-desc">Description</Label>
              <Textarea
                id="s-desc"
                placeholder="Description of this stage..."
                rows={2}
                value={stageForm.description}
                onChange={(e) => setStageForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-start">Start Date</Label>
                <Input
                  id="s-start"
                  type="date"
                  value={stageForm.startDate}
                  onChange={(e) => setStageForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-end">End Date</Label>
                <Input
                  id="s-end"
                  type="date"
                  value={stageForm.endDate}
                  onChange={(e) => setStageForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-status">Status</Label>
                <Select value={stageForm.status} onValueChange={(v) => setStageForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-order">Order</Label>
                <Input
                  id="s-order"
                  type="number"
                  min={1}
                  value={stageForm.order}
                  onChange={(e) => setStageForm((f) => ({ ...f, order: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-minvotes">Min Votes</Label>
                <Input
                  id="s-minvotes"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={stageForm.minVotes}
                  onChange={(e) => setStageForm((f) => ({ ...f, minVotes: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Minimum votes to avoid elimination</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-max">Max Contestants</Label>
                <Input
                  id="s-max"
                  type="number"
                  placeholder="Unlimited"
                  value={stageForm.maxContestants}
                  onChange={(e) => setStageForm((f) => ({ ...f, maxContestants: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitStage} disabled={stageSubmitting}>
              {stageSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStage ? 'Save Changes' : 'Create Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirmation */}
      <AlertDialog open={!!deleteStageId} onOpenChange={() => setDeleteStageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Stage
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The stage and its configuration will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStageLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStageId && deleteStage(deleteStageId)}
              disabled={deleteStageLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteStageLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Stage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
            <DialogDescription>Add a new vote package for users to purchase</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Package Name *</Label>
              <Input
                id="p-name"
                placeholder="e.g. Premium Pack"
                value={packageForm.name}
                onChange={(e) => setPackageForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-votes">Votes *</Label>
                <Input
                  id="p-votes"
                  type="number"
                  placeholder="50"
                  value={packageForm.votes}
                  onChange={(e) => setPackageForm((f) => ({ ...f, votes: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-bonus">Bonus Votes</Label>
                <Input
                  id="p-bonus"
                  type="number"
                  placeholder="0"
                  value={packageForm.bonusVotes}
                  onChange={(e) => setPackageForm((f) => ({ ...f, bonusVotes: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-price">Price ({settings.currency}) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {currencySymbols[settings.currency] || '$'}
                </span>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  className="pl-8"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-order">Display Order</Label>
                <Input
                  id="p-order"
                  type="number"
                  min={1}
                  value={packageForm.order}
                  onChange={(e) => setPackageForm((f) => ({ ...f, order: Number(e.target.value) || 1 }))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={packageForm.isPopular}
                  onCheckedChange={(checked) => setPackageForm((f) => ({ ...f, isPopular: checked }))}
                />
                <Label>Mark as Popular</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitPackage} disabled={packageSubmitting}>
              {packageSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {rejectAsFraud ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600">Flag as Fraudulent</span>
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5 text-red-500" />
                  Reject Payment
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {rejectAsFraud
                ? 'This will remove all votes and send a fraud warning email to the user.'
                : 'This action cannot be undone. The user will be notified of the rejection.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {rejectAsFraud && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Skull className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Fraud Rejection Consequences</p>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                      <li>All votes from this payment will be <strong>permanently removed</strong></li>
                      <li>Contestant vote totals will be <strong>decremented</strong></li>
                      <li>A <strong>fraud warning email</strong> with disqualification notice will be sent</li>
                      <li>The user will receive an <strong>urgent notification</strong> in their dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="reject-reason">{rejectAsFraud ? 'Fraud Details *' : 'Rejection Reason *'}</Label>
              <Textarea
                id="reject-reason"
                placeholder={rejectAsFraud ? 'Describe the fraudulent activity detected...' : 'Explain why this payment is being rejected...'}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{rejectReason.length}/5 minimum characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={rejectReason.trim().length < 5 || !!rejectingId}
              onClick={confirmReject}
            >
              {rejectingId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : rejectAsFraud ? <AlertTriangle className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              {rejectAsFraud ? 'Flag Fraud & Remove Votes' : 'Reject Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Image Dialog */}
      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>Uploaded proof screenshot</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg overflow-hidden bg-muted">
            <img src={proofImageUrl} alt="Payment proof" className="w-full max-h-[70vh] object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
