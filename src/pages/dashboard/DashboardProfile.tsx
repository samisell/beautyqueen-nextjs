'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Loader2,
  Save,
  ImageIcon,
  Plus,
  X,
  Lock,
  Shield,
  MapPin,
  Phone,
  User,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Star,
  Trophy,
  TrendingUp,
  Hash,
  Link2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Gift,
  CreditCard,
  Building2,
  FileText,
  Eye,
  ChevronRight,
  CircleDot,
  BadgeCheck,
  CircleCheck,
  ImagePlus,
  Send,
  CalendarDays,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';
import { toast } from 'sonner';

// =====================
// Types
// =====================
interface ContestantData {
  id: string;
  contestantCode: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  imageUrl: string;
  category: string;
  status: 'active' | 'eliminated' | 'winner';
  totalVotes: number;
  voteCount: number;
  rank: number | null;
  votingEnabled: boolean;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankSortCode?: string | null;
  socialLinks: Record<string, string>;
  gallery: string[];
  stage: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    minVotes: number;
  } | null;
  tournament: {
    id: string;
    name: string;
    status: string;
  } | null;
  platform: {
    name: string;
    votePrice: string;
    currency: string;
  };
}

interface VotePackage {
  id: string;
  name: string;
  votes: number;
  price: number;
  bonusVotes: number;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'rated';
  beautyRating?: number;
  bonusVotes?: number;
}

// =====================
// Countries List (Nigeria first)
// =====================
const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'France',
  'Germany',
  'India',
  'China',
  'Japan',
  'Brazil',
  'Mexico',
  'United Arab Emirates',
  'Saudi Arabia',
  'Egypt',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Cameroon',
  "Ivory Coast",
  'Senegal',
  'Benin',
  'Togo',
  'Niger',
  'Mali',
  'Burkina Faso',
  'Guinea',
  'Sierra Leone',
  'Liberia',
  'Gambia',
  'Congo (DRC)',
  'Congo (Republic)',
  'Angola',
  'Mozambique',
  'Madagascar',
  'Ethiopia',
  'Somalia',
  'Sudan',
  'South Sudan',
  'Chad',
  'Nigeria',
  'Zimbabwe',
  'Zambia',
  'Malawi',
  'Botswana',
  'Namibia',
  'Mauritius',
  'Seychelles',
  'Cape Verde',
  'Equatorial Guinea',
  'Gabon',
  'Eritrea',
  'Djibouti',
  'Comoros',
  'Morocco',
  'Algeria',
  'Tunisia',
  'Libya',
  'Turkey',
  'Iraq',
  'Iran',
  'Israel',
  'Jordan',
  'Lebanon',
  'Syria',
  'Yemen',
  'Oman',
  'Qatar',
  'Bahrain',
  'Kuwait',
  'Pakistan',
  'Afghanistan',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'Myanmar',
  'Thailand',
  'Vietnam',
  'Cambodia',
  'Laos',
  'Malaysia',
  'Indonesia',
  'Philippines',
  'Singapore',
  'South Korea',
  'North Korea',
  'Taiwan',
  'Hong Kong',
  'Mongolia',
  'Kazakhstan',
  'Uzbekistan',
  'Turkmenistan',
  'Kyrgyzstan',
  'Tajikistan',
  'Russia',
  'Ukraine',
  'Poland',
  'Czech Republic',
  'Slovakia',
  'Hungary',
  'Romania',
  'Bulgaria',
  'Serbia',
  'Croatia',
  'Bosnia and Herzegovina',
  'Montenegro',
  'North Macedonia',
  'Albania',
  'Greece',
  'Italy',
  'Spain',
  'Portugal',
  'Netherlands',
  'Belgium',
  'Luxembourg',
  'Switzerland',
  'Austria',
  'Denmark',
  'Norway',
  'Sweden',
  'Finland',
  'Iceland',
  'Ireland',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Belarus',
  'Moldova',
  'Georgia',
  'Armenia',
  'Azerbaijan',
  'Cyprus',
  'Malta',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Venezuela',
  'Ecuador',
  'Bolivia',
  'Paraguay',
  'Uruguay',
  'Guyana',
  'Suriname',
  'French Guiana',
  'Panama',
  'Costa Rica',
  'Nicaragua',
  'Honduras',
  'El Salvador',
  'Guatemala',
  'Belize',
  'Cuba',
  'Jamaica',
  'Haiti',
  'Dominican Republic',
  'Trinidad and Tobago',
  'Barbados',
  'Bahamas',
  'Puerto Rico',
  'New Zealand',
  'Fiji',
  'Papua New Guinea',
  'Solomon Islands',
  'Vanuatu',
  'Samoa',
  'Tonga',
  'Palau',
  'Marshall Islands',
  'Micronesia',
].filter((c, i, arr) => arr.indexOf(c) === i);

// =====================
// Social Media Config
// =====================
const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'tiktok', label: 'TikTok', icon: Star, placeholder: 'https://tiktok.com/@username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
];

// =====================
// Animation Variants
// =====================
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// =====================
// Component
// =====================
export default function DashboardProfile() {
  const { user, token } = useAuthStore();
  const { navigate } = useNavigationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [loading, setLoading] = useState(true);
  const [contestant, setContestant] = useState<ContestantData | null>(null);
  const [activeTab, setActiveTab] = useState('photo');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankSortCode, setBankSortCode] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [gallery, setGallery] = useState<string[]>([]);

  // Loading states
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Dialog states
  const [addGalleryUrl, setAddGalleryUrl] = useState('');
  const [addGalleryOpen, setAddGalleryOpen] = useState(false);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'paystack' | 'offline' | 'mock'>('flutterwave');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofReference, setProofReference] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  // Task states
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskSubmitOpen, setTaskSubmitOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [taskUrl, setTaskUrl] = useState('');
  const [taskCaption, setTaskCaption] = useState('');
  const [taskImageFile, setTaskImageFile] = useState<File | null>(null);
  const [submittingTask, setSubmittingTask] = useState(false);

  // Vote packages
  const [votePackages, setVotePackages] = useState<VotePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [votingSelf, setVotingSelf] = useState(false);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // =====================
  // Fetch contestant data
  // =====================
  const fetchContestant = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/my-contestant', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        const c: ContestantData = data.data;
        setContestant(c);
        setName(c.name || '');
        setUsername(c.username || '');
        setPhone(c.phone || '');
        setBio(c.bio || '');
        setAddress(c.address || '');
        setCountry(c.country || '');
        setState(c.state || '');
        setBankName(c.bankName || '');
        setBankAccountName(c.bankAccountName || '');
        setBankAccountNumber(c.bankAccountNumber || '');
        setBankSortCode(c.bankSortCode || '');
        setSocialLinks(c.socialLinks || {});
        setGallery(c.gallery || []);
      }
    } catch {
      toast.error('Failed to load contestant profile');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  // =====================
  // Fetch vote packages
  // =====================
  const fetchPackages = useCallback(async () => {
    if (!token) return;
    setPackagesLoading(true);
    try {
      const res = await fetch('/api/packages', { headers });
      const data = await res.json();
      if (data.success) {
        setVotePackages(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setPackagesLoading(false);
    }
  }, [token, headers]);

  // =====================
  // Fetch tasks
  // =====================
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setTasksLoading(true);
    try {
      const res = await fetch('/api/contestant/tasks', { headers });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setTasksLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchContestant();
    fetchPackages();
  }, [fetchContestant, fetchPackages]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);

  // =====================
  // Profile completion
  // =====================
  const profileCompletion = useMemo(() => {
    if (!contestant) return 0;
    const fields = [
      contestant.imageUrl && contestant.imageUrl.length > 0,
      contestant.name && contestant.name.trim().length > 0,
      contestant.username && contestant.username.trim().length > 0,
      contestant.phone && contestant.phone.trim().length > 0,
      contestant.bio && contestant.bio.trim().length > 0,
      contestant.address && contestant.address.trim().length > 0,
      contestant.country && contestant.country.trim().length > 0,
      contestant.state && contestant.state.trim().length > 0,
      contestant.bankName && contestant.bankName.trim().length > 0,
      contestant.bankAccountName && contestant.bankAccountName.trim().length > 0,
      contestant.bankAccountNumber && contestant.bankAccountNumber.trim().length > 0,
      Object.values(contestant.socialLinks || {}).some((v) => v && v.trim().length > 0),
      contestant.gallery && contestant.gallery.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [contestant]);

  // =====================
  // Photo upload handler
  // =====================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile photo updated');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to upload photo');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // =====================
  // Save basic info
  // =====================
  const handleSaveBasicInfo = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (username && (username.length < 3 || username.length > 30)) {
      toast.error('Username must be between 3 and 30 characters');
      return;
    }
    if (username && !/^[a-z0-9_]+$/.test(username)) {
      toast.error('Username must be lowercase alphanumeric (underscores allowed)');
      return;
    }
    if (bio.length > 500) {
      toast.error('Bio must be 500 characters or less');
      return;
    }
    setSavingBasicInfo(true);
    try {
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name, username, phone, bio }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Basic info saved');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save basic info');
    } finally {
      setSavingBasicInfo(false);
    }
  };

  // =====================
  // Save address
  // =====================
  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ address, country, state }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Address saved');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // =====================
  // Gallery management
  // =====================
  const handleAddGalleryImage = async () => {
    if (!addGalleryUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    if (gallery.length >= 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }
    setGalleryLoading(true);
    try {
      const updated = [...gallery, addGalleryUrl.trim()];
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ gallery: updated }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Photo added to gallery');
        setGallery(updated);
        setAddGalleryUrl('');
        setAddGalleryOpen(false);
      } else {
        toast.error(data.message || 'Failed to add photo');
      }
    } catch {
      toast.error('Failed to add photo');
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    setGalleryLoading(true);
    try {
      const updated = gallery.filter((_, i) => i !== index);
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ gallery: updated }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Photo removed');
        setGallery(updated);
      } else {
        toast.error(data.message || 'Failed to remove photo');
      }
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setGalleryLoading(false);
    }
  };

  // =====================
  // Save bank details
  // =====================
  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ bankName, bankAccountName, bankAccountNumber, bankSortCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Bank details saved');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to save bank details');
      }
    } catch {
      toast.error('Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  // =====================
  // Save social links
  // =====================
  const handleSaveSocial = async () => {
    setSavingSocial(true);
    try {
      const res = await fetch('/api/contestant/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ socialLinks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Social links saved');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to save social links');
      }
    } catch {
      toast.error('Failed to save social links');
    } finally {
      setSavingSocial(false);
    }
  };

  // =====================
  // Vote for self
  // =====================
  const handleSelfVote = async () => {
    if (!contestant) return;
    setVotingSelf(true);
    try {
      const res = await fetch('/api/contestant/vote-self', {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vote recorded!');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to vote');
      }
    } catch {
      toast.error('Failed to vote');
    } finally {
      setVotingSelf(false);
    }
  };

  // =====================
  // Purchase votes
  // =====================
  const handlePurchaseVotes = async (pkg: VotePackage) => {
    setSelectedPackage(pkg);

    if (paymentMethod === 'mock') {
      try {
        const res = await fetch('/api/contestant/vote-self', {
          method: 'POST',
          headers,
          body: JSON.stringify({ packageId: pkg.id, paymentMethod: 'mock' }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`${pkg.votes + pkg.bonusVotes} votes added!`);
          fetchContestant();
        } else {
          toast.error(data.message || 'Vote purchase failed');
        }
      } catch {
        toast.error('Vote purchase failed');
      }
      return;
    }

    if (paymentMethod === 'offline') {
      setProofDialogOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/contestant/vote-self', {
        method: 'POST',
        headers,
        body: JSON.stringify({ packageId: pkg.id, paymentMethod }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      } else if (data.success) {
        toast.success('Votes added!');
        fetchContestant();
      } else {
        toast.error(data.message || 'Failed to initiate payment');
      }
    } catch {
      toast.error('Failed to initiate payment');
    }
  };

  // =====================
  // Upload payment proof
  // =====================
  const handleUploadProof = async () => {
    if (!selectedPackage) return;
    if (!proofFile && !proofReference.trim()) {
      toast.error('Please upload a proof or enter a reference');
      return;
    }
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('packageId', selectedPackage.id);
      formData.append('paymentMethod', 'offline');
      if (proofFile) formData.append('proof', proofFile);
      if (proofReference.trim()) formData.append('reference', proofReference.trim());

      const res = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment proof submitted. We will review it shortly.');
        setProofDialogOpen(false);
        setProofFile(null);
        setProofReference('');
      } else {
        toast.error(data.message || 'Failed to submit proof');
      }
    } catch {
      toast.error('Failed to submit proof');
    } finally {
      setUploadingProof(false);
    }
  };

  // =====================
  // Submit task
  // =====================
  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    if (!taskUrl.trim() && !taskCaption.trim() && !taskImageFile) {
      toast.error('Please provide at least a URL, caption, or image');
      return;
    }
    setSubmittingTask(true);
    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask.id);
      if (taskUrl.trim()) formData.append('url', taskUrl.trim());
      if (taskCaption.trim()) formData.append('caption', taskCaption.trim());
      if (taskImageFile) formData.append('image', taskImageFile);

      const res = await fetch('/api/contestant/tasks/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task submitted successfully!');
        setTaskSubmitOpen(false);
        setTaskUrl('');
        setTaskCaption('');
        setTaskImageFile(null);
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to submit task');
      }
    } catch {
      toast.error('Failed to submit task');
    } finally {
      setSubmittingTask(false);
    }
  };

  // =====================
  // Loading state
  // =====================
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar />
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-72 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-full max-w-md bg-muted animate-pulse rounded" />
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-48 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // Not a contestant
  // =====================
  if (!contestant) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar />
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 p-8"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                  <Award className="w-10 h-10 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold">You&apos;re Not a Contestant Yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Join an active tournament to become a contestant and unlock your dashboard profile, voting, tasks, and more.
                </p>
                <Button
                  onClick={() => navigate('tournament')}
                  className="rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Tournaments
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // Main render
  // =====================
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <motion.div {...fadeUp}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Contestant <span className="text-primary">Profile</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your profile, gallery, and voting
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {contestant.status === 'active' && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-0">
                      <CircleDot className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {contestant.status === 'eliminated' && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-0">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Eliminated
                    </Badge>
                  )}
                  {contestant.status === 'winner' && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Hash className="w-3 h-3 mr-1" />
                    {contestant.contestantCode}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Profile Completion */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Profile Completion</span>
                    </div>
                    <span className="font-bold text-lg">{profileCompletion}%</span>
                  </div>
                </div>
                <CardContent className="p-4 pt-5">
                  <Progress value={profileCompletion} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {profileCompletion === 100
                      ? 'Your profile is complete! You look great.'
                      : profileCompletion >= 70
                        ? 'Almost there! Complete your profile to stand out.'
                        : profileCompletion >= 40
                          ? 'Keep going! Fill in more details to attract votes.'
                          : 'Get started by filling in your profile details.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <Card className="border-0 shadow-sm rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{contestant.totalVotes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </Card>
              <Card className="border-0 shadow-sm rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">
                  {contestant.rank !== null ? `#${contestant.rank}` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Current Rank</p>
              </Card>
              <Card className="border-0 shadow-sm rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">{gallery.length}/10</p>
                <p className="text-xs text-muted-foreground">Gallery Photos</p>
              </Card>
              <Card className="border-0 shadow-sm rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {contestant.stage?.name || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Current Stage</p>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                  <TabsList className="w-full sm:w-auto h-auto flex flex-nowrap gap-1 bg-transparent p-0">
                    <TabsTrigger
                      value="photo"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Profile</span> Photo
                    </TabsTrigger>
                    <TabsTrigger
                      value="basic"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <User className="w-3.5 h-3.5" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="address"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Address
                    </TabsTrigger>
                    <TabsTrigger
                      value="gallery"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Gallery
                    </TabsTrigger>
                    <TabsTrigger
                      value="bank"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Bank
                    </TabsTrigger>
                    <TabsTrigger
                      value="social"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Social
                    </TabsTrigger>
                    <TabsTrigger
                      value="vote"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Vote
                    </TabsTrigger>
                    <TabsTrigger
                      value="tasks"
                      className="rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tasks
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* ===================== */}
                {/* Tab 1: Profile Photo  */}
                {/* ===================== */}
                <TabsContent value="photo">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Profile Photo
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Upload a great photo that represents you
                      </CardDescription>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative group">
                          <Avatar className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-primary/20 shadow-xl">
                            <AvatarImage src={contestant.imageUrl} alt={contestant.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                              {contestant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                          >
                            {uploadingPhoto ? (
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                              <>
                                <Camera className="w-8 h-8 text-white mb-1" />
                                <span className="text-white text-sm font-medium">Change Photo</span>
                              </>
                            )}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>

                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Your profile photo is what voters see first. Use a clear, high-quality image.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Maximum file size: 5MB &bull; JPG, PNG, or WebP
                          </p>
                        </div>

                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="rounded-xl"
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 2: Basic Info     */}
                {/* ===================== */}
                <TabsContent value="basic">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Your public profile details
                      </CardDescription>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="username (3-30 chars, lowercase)"
                          className="rounded-xl"
                          maxLength={30}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be 3-30 characters, lowercase alphanumeric with underscores only.
                        </p>
                      </div>

                      {/* Email (read-only) */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          readOnly
                          disabled
                          className="rounded-xl bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">Include country code with + prefix</p>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) setBio(e.target.value);
                          }}
                          placeholder="Tell voters about yourself..."
                          className="rounded-xl min-h-[120px] resize-y"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            This is what the public sees. Make it catchy to attract votes!
                          </p>
                          <p className={`text-xs ${bio.length > 450 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {bio.length}/500
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveBasicInfo}
                        disabled={savingBasicInfo}
                        className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                      >
                        {savingBasicInfo ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Basic Info
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 3: Address        */}
                {/* ===================== */}
                <TabsContent value="address">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Address Details
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Where are you located?
                      </CardDescription>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      {/* Full Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          Full Address
                        </Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your full address"
                          className="rounded-xl min-h-[80px] resize-y"
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          Country
                        </Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c === 'Nigeria' ? '🇳🇬 Nigeria' : c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* State */}
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          State / Province
                        </Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Lagos"
                          className="rounded-xl"
                        />
                      </div>

                      <Button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                      >
                        {savingAddress ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Address
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 4: Gallery        */}
                {/* ===================== */}
                <TabsContent value="gallery">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4 flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          Photo Gallery
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          Showcase up to 10 photos
                        </CardDescription>
                      </div>
                      <Dialog open={addGalleryOpen} onOpenChange={setAddGalleryOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0"
                            disabled={gallery.length >= 10 || galleryLoading}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Photo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Gallery Photo</DialogTitle>
                            <DialogDescription>Enter the URL of your photo</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Image URL</Label>
                              <Input
                                value={addGalleryUrl}
                                onChange={(e) => setAddGalleryUrl(e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                                className="rounded-xl"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddGalleryImage();
                                }}
                              />
                            </div>
                            {addGalleryUrl && (
                              <div className="rounded-xl overflow-hidden border bg-muted h-40 flex items-center justify-center">
                                <img
                                  src={addGalleryUrl}
                                  alt="Preview"
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setAddGalleryOpen(false)}
                              className="rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddGalleryImage}
                              disabled={galleryLoading || !addGalleryUrl.trim()}
                              className="rounded-xl"
                            >
                              {galleryLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-2" />
                              )}
                              Add Photo
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardContent className="p-6">
                      {gallery.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ImagePlus className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No Photos Yet</h3>
                          <p className="text-sm text-muted-foreground max-w-sm mb-4">
                            Add photos to your gallery to showcase yourself to voters and increase your chances.
                          </p>
                          <Button
                            onClick={() => setAddGalleryOpen(true)}
                            className="rounded-xl"
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {gallery.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group aspect-square rounded-xl overflow-hidden border bg-muted"
                            >
                              <img
                                src={img}
                                alt={`Gallery photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveGalleryImage(idx)}
                                disabled={galleryLoading}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                              >
                                {galleryLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs">Photo {idx + 1}</p>
                              </div>
                            </div>
                          ))}
                          {gallery.length < 10 && (
                            <button
                              onClick={() => setAddGalleryOpen(true)}
                              disabled={galleryLoading}
                              className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-6 h-6" />
                              <span className="text-xs font-medium">Add Photo</span>
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-4 text-center">
                        {gallery.length}/10 photos &bull; Click the X on hover to remove
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 5: Bank Details   */}
                {/* ===================== */}
                <TabsContent value="bank">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Bank Details
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Your prize money destination
                      </CardDescription>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      {/* Security Notice */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                              Secured
                            </p>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">
                              <Shield className="w-2.5 h-2.5 mr-0.5" />
                              Encrypted
                            </Badge>
                          </div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">
                            These details are used to send prize money if you win. Your information is encrypted and secure.
                          </p>
                        </div>
                      </div>

                      {/* Bank Name */}
                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-sm font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          Bank Name
                        </Label>
                        <Input
                          id="bankName"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Access Bank, GTBank"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Account Name */}
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountName" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Account Name
                        </Label>
                        <Input
                          id="bankAccountName"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="Name on your bank account"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Account Number */}
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber" className="text-sm font-medium flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          Account Number
                        </Label>
                        <Input
                          id="bankAccountNumber"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="e.g. 0123456789"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Sort Code */}
                      <div className="space-y-2">
                        <Label htmlFor="bankSortCode" className="text-sm font-medium flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                          Sort Code <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="bankSortCode"
                          value={bankSortCode}
                          onChange={(e) => setBankSortCode(e.target.value)}
                          placeholder="e.g. 000000"
                          className="rounded-xl"
                        />
                      </div>

                      <Button
                        onClick={handleSaveBank}
                        disabled={savingBank}
                        className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                      >
                        {savingBank ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Bank Details
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 6: Social Media   */}
                {/* ===================== */}
                <TabsContent value="social">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Social Media Links
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Connect your social profiles
                      </CardDescription>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      {SOCIAL_FIELDS.map((field) => {
                        const Icon = field.icon;
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={`social-${field.key}`} className="text-sm font-medium flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              {field.label}
                            </Label>
                            <div className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                              <Input
                                id={`social-${field.key}`}
                                value={socialLinks[field.key] || ''}
                                onChange={(e) =>
                                  setSocialLinks((prev) => ({ ...prev, [field.key]: e.target.value }))
                                }
                                placeholder={field.placeholder}
                                className="rounded-xl pl-10"
                              />
                            </div>
                          </div>
                        );
                      })}

                      <Button
                        onClick={handleSaveSocial}
                        disabled={savingSocial}
                        className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                      >
                        {savingSocial ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Social Links
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 7: Vote for Me    */}
                {/* ===================== */}
                <TabsContent value="vote">
                  <div className="space-y-6">
                    {/* Current Stats */}
                    <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          Your Voting Stats
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          Your current standing in the competition
                        </CardDescription>
                      </div>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-xl bg-primary/5">
                            <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
                            <p className="text-3xl font-bold">{contestant.totalVotes.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Votes</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-orange-500/5">
                            <Star className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                            <p className="text-3xl font-bold">
                              {contestant.rank !== null ? `#${contestant.rank}` : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">Current Rank</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-emerald-500/5">
                            <Zap className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                            <p className="text-3xl font-bold">{contestant.voteCount}</p>
                            <p className="text-sm text-muted-foreground">Vote Transactions</p>
                          </div>
                        </div>

                        {/* Self vote button */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={handleSelfVote}
                            disabled={votingSelf || !contestant.votingEnabled}
                            className="rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                            size="lg"
                          >
                            {votingSelf ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Star className="w-4 h-4 mr-2" />
                            )}
                            {votingSelf ? 'Voting...' : 'Vote for Yourself (Free)'}
                          </Button>
                          {!contestant.votingEnabled && (
                            <p className="text-xs text-amber-500 mt-2">Voting is currently disabled</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vote Packages */}
                    <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Gift className="w-5 h-5" />
                          Get More Votes
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          Purchase vote packages to boost your ranking
                        </CardDescription>
                      </div>
                      <CardContent className="p-6">
                        {/* Payment Method Selector */}
                        <div className="mb-6">
                          <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {([
                              { value: 'flutterwave', label: 'Flutterwave', icon: CreditCard },
                              { value: 'paystack', label: 'Paystack', icon: CreditCard },
                              { value: 'offline', label: 'Bank Transfer', icon: Building2 },
                              { value: 'mock', label: 'Test / Mock', icon: Eye },
                            ] as const).map((pm) => {
                              const Icon = pm.icon;
                              return (
                                <button
                                  key={pm.value}
                                  onClick={() => setPaymentMethod(pm.value)}
                                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                    paymentMethod === pm.value
                                      ? 'border-primary bg-primary/5 text-primary'
                                      : 'border-transparent bg-muted hover:bg-muted/80 text-muted-foreground'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span>{pm.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Packages Grid */}
                        {packagesLoading ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                            ))}
                          </div>
                        ) : votePackages.length === 0 ? (
                          <div className="text-center py-8">
                            <Gift className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground">No vote packages available at this time</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {votePackages
                              .filter((p) => p.isActive)
                              .sort((a, b) => a.order - b.order)
                              .map((pkg) => (
                                <div
                                  key={pkg.id}
                                  className={`relative rounded-xl border-2 p-5 flex flex-col transition-all hover:shadow-md ${
                                    pkg.isPopular
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/30'
                                  }`}
                                >
                                  {pkg.isPopular && (
                                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full text-[10px] px-3">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                  <div className="text-center flex-1">
                                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                                    <div className="my-3">
                                      <span className="text-3xl font-bold text-primary">{pkg.votes}</span>
                                      <span className="text-sm text-muted-foreground ml-1">votes</span>
                                    </div>
                                    {pkg.bonusVotes > 0 && (
                                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0 mb-2">
                                        <Gift className="w-3 h-3 mr-1" />
                                        +{pkg.bonusVotes} Bonus
                                      </Badge>
                                    )}
                                    <p className="text-lg font-bold mt-2">
                                      {contestant.platform?.currency || 'NGN'} {pkg.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => handlePurchaseVotes(pkg)}
                                    className="w-full rounded-xl mt-4 bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90"
                                    disabled={!contestant.votingEnabled}
                                  >
                                    {paymentMethod === 'offline' ? (
                                      <>
                                        <Building2 className="w-4 h-4 mr-1.5" />
                                        Bank Transfer
                                      </>
                                    ) : paymentMethod === 'mock' ? (
                                      <>
                                        <Eye className="w-4 h-4 mr-1.5" />
                                        Test Vote
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="w-4 h-4 mr-1.5" />
                                        Buy Now
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Offline Payment Proof Dialog */}
                    <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Payment Proof</DialogTitle>
                          <DialogDescription>
                            After making the bank transfer, upload your payment receipt
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {selectedPackage && (
                            <div className="p-3 rounded-xl bg-muted text-sm">
                              <p className="font-medium">{selectedPackage.name}</p>
                              <p className="text-muted-foreground">
                                {selectedPackage.votes + selectedPackage.bonusVotes} votes &bull;{' '}
                                {contestant.platform?.currency || 'NGN'}{' '}
                                {selectedPackage.price.toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div className="p-3 rounded-xl border bg-amber-50 dark:bg-amber-950/20">
                            <p className="text-sm font-medium mb-1">Bank Transfer Details</p>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p>Bank: {contestant.platform?.name || 'Platform Account'}</p>
                              <p>Amount: {selectedPackage && (contestant.platform?.currency || 'NGN')} {selectedPackage?.price.toLocaleString()}</p>
                              <p>Reference: Your contestant code ({contestant.contestantCode})</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Payment Reference / Teller Number</Label>
                            <Input
                              value={proofReference}
                              onChange={(e) => setProofReference(e.target.value)}
                              placeholder="Enter your transaction reference"
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Upload Receipt (optional)</Label>
                            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) setProofFile(file);
                                };
                                input.click();
                              }}
                            >
                              {proofFile ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  <span>{proofFile.name}</span>
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  <Upload className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm">Click to upload receipt</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setProofDialogOpen(false)} className="rounded-xl">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUploadProof}
                            disabled={uploadingProof}
                            className="rounded-xl"
                          >
                            {uploadingProof ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Submit Proof
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TabsContent>

                {/* ===================== */}
                {/* Tab 8: My Tasks      */}
                {/* ===================== */}
                <TabsContent value="tasks">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-orange-500 px-6 py-4 flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          My Tasks
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          Complete tasks to earn bonus votes
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={fetchTasks}
                        disabled={tasksLoading}
                      >
                        {tasksLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      {tasksLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                          ))}
                        </div>
                      ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No Tasks Available</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Tasks will appear here when they are assigned. Check back later!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-xl border p-4 sm:p-5 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-base">{task.title}</h3>
                                    {task.status === 'rated' ? (
                                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0">
                                        <BadgeCheck className="w-3 h-3 mr-1" />
                                        Rated
                                      </Badge>
                                    ) : task.status === 'submitted' ? (
                                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending Review
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">
                                        <CircleDot className="w-3 h-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                </div>
                              </div>

                              {/* Instructions */}
                              {task.instructions && (
                                <div className="text-sm bg-muted rounded-lg p-3">
                                  <p className="font-medium mb-1 flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    Instructions
                                  </p>
                                  <p className="text-muted-foreground whitespace-pre-wrap">{task.instructions}</p>
                                </div>
                              )}

                              {/* Due date */}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                              </div>

                              {/* Rated result */}
                              {task.status === 'rated' && (
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    <span className="font-medium">Beauty Rating: {task.beautyRating || 0}/10</span>
                                  </div>
                                  <Separator orientation="vertical" className="h-5" />
                                  <div className="flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-primary" />
                                    <span className="font-medium">+{task.bonusVotes || 0} Bonus Votes</span>
                                  </div>
                                </div>
                              )}

                              {/* Submit button */}
                              {task.status === 'pending' && (
                                <div className="flex justify-end">
                                  <Dialog
                                    open={taskSubmitOpen && selectedTask?.id === task.id}
                                    onOpenChange={(open) => {
                                      setTaskSubmitOpen(open);
                                      if (open) {
                                        setSelectedTask(task);
                                        setTaskUrl('');
                                        setTaskCaption('');
                                        setTaskImageFile(null);
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button className="rounded-xl" size="sm">
                                        <Send className="w-4 h-4 mr-1.5" />
                                        Submit Task
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Submit Task: {task.title}</DialogTitle>
                                        <DialogDescription>
                                          Provide your submission details
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label>URL (optional)</Label>
                                          <Input
                                            value={taskUrl}
                                            onChange={(e) => setTaskUrl(e.target.value)}
                                            placeholder="https://example.com/post"
                                            className="rounded-xl"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Caption (optional)</Label>
                                          <Textarea
                                            value={taskCaption}
                                            onChange={(e) => setTaskCaption(e.target.value)}
                                            placeholder="Add a caption for your submission"
                                            className="rounded-xl min-h-[80px]"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Upload Image (optional)</Label>
                                          <div
                                            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                            onClick={() => {
                                              const input = document.createElement('input');
                                              input.type = 'file';
                                              input.accept = 'image/*';
                                              input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) setTaskImageFile(file);
                                              };
                                              input.click();
                                            }}
                                          >
                                            {taskImageFile ? (
                                              <div className="flex items-center justify-center gap-2 text-sm">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span>{taskImageFile.name}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTaskImageFile(null);
                                                  }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="w-4 h-4" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="text-muted-foreground">
                                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm">Click to upload an image</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setTaskSubmitOpen(false)}
                                          className="rounded-xl"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleSubmitTask}
                                          disabled={submittingTask}
                                          className="rounded-xl"
                                        >
                                          {submittingTask ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          ) : (
                                            <Send className="w-4 h-4 mr-2" />
                                          )}
                                          Submit
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
