// =====================
// Navigation types
// =====================
export type PageRoute =
  | 'home'
  | 'about'
  | 'leaderboard'
  | 'tournament'
  | 'prize'
  | 'instruction'
  | 'faq'
  | 'contact'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'vote'
  | 'dashboard'
  | 'dashboard-profile'
  | 'dashboard-votes'
  | 'dashboard-purchases'
  | 'dashboard-referrals'
  | 'dashboard-settings'
  | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  referralCode: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

export interface Contestant {
  id: string;
  name: string;
  bio?: string;
  imageUrl: string;
  category: string;
  categoryId?: string;
  status: 'active' | 'eliminated' | 'winner';
  totalVotes: number;
  stageId?: string;
  createdAt: string;
}

export type VoteType = 'free' | 'paid' | 'referral';

export interface VotePayload {
  contestantId: string;
  voteType: VoteType;
}

export interface VoteStats {
  totalVotes: number;
  freeVotes: number;
  paidVotes: number;
  referralVotes: number;
  todayVotes: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  contestantCount?: number;
}

export interface VotePackage {
  id: string;
  name: string;
  votes: number;
  price: number;
  bonusVotes: number;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

export type PaymentMethod = 'flutterwave' | 'paystack' | 'offline' | 'mock';

export type PaymentStatus = 'pending' | 'awaiting_review' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  reference?: string;
  gatewayRef?: string;
  proofImageUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  depositorName?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  package?: VotePackage;
  user?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string } | null;
}

export interface PurchasedVote {
  id: string;
  userId: string;
  packageId: string;
  votesAmount: number;
  votesUsed: number;
  createdAt: string;
  package?: VotePackage;
}

export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export interface TournamentStage {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  order: number;
  maxContestants?: number;
  contestantCount?: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  bonusVotes: number;
  createdAt: string;
  referred?: { name: string; email: string; createdAt: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  contestant: Contestant;
  votes: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalVotes: number;
  purchasedVotes: number;
  availableVotes: number;
  referralCount: number;
  referralBonusVotes: number;
}

export interface AdminStats {
  totalUsers: number;
  totalContestants: number;
  totalVotes: number;
  totalRevenue: number;
  activeStage: TournamentStage | null;
}
