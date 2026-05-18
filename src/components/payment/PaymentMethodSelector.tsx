'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Upload,
  Smartphone,
  ExternalLink,
  Loader2,
  Check,
  X,
  Camera,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PaymentMethod } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage: {
    id: string;
    name: string;
    votes: number;
    bonusVotes: number;
    price: number;
  } | null;
  onPurchaseComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Payment method options
// ---------------------------------------------------------------------------

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: typeof CreditCard;
  color: string;
  badge: string;
}[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Pay with card, bank transfer, or USSD via Paystack',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-600',
    badge: 'Recommended',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Pay with card, bank transfer, mobile money via Flutterwave',
    icon: Smartphone,
    color: 'from-orange-500 to-amber-600',
    badge: 'Popular',
  },
  {
    id: 'offline',
    name: 'Bank Transfer',
    description: 'Transfer to our bank account and upload proof',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Manual',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as any as any },
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaymentMethodSelector({
  open,
  onOpenChange,
  selectedPackage,
  onPurchaseComplete,
}: PaymentMethodSelectorProps) {
  const { token } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('paystack');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentUrl?: string;
    reference?: string;
    paymentId?: string;
    message?: string;
    isDemo?: boolean;
    demoMessage?: string;
    nextStep?: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
  } | null>(null);

  const [offlineForm, setOfflineForm] = useState({
    depositorName: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const totalVotes = selectedPackage
    ? selectedPackage.votes + selectedPackage.bonusVotes
    : 0;

  const priceFormatted = selectedPackage
    ? selectedPackage.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '';

  function resetState() {
    setProcessing(false);
    setPaymentResult(null);
    setProofFile(null);
    setProofPreview(null);
    setOfflineForm({ depositorName: '' });
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(resetState, 200);
  }

  // ──────────────────────────────────────────────
  // Handle online payment (Paystack / Flutterwave)
  // ──────────────────────────────────────────────

  async function handleOnlinePayment() {
    if (!selectedPackage || processing) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          paymentMethod: selectedMethod,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const result = data.data;

        // Demo mode: auto-complete
        if (result.isDemo || result.paymentMethod === 'mock') {
          setPaymentResult({
            success: true,
            paymentId: result.payment?.id,
            reference: result.reference,
            message: result.demoMessage || result.message || 'Demo: Payment completed automatically!',
            isDemo: true,
          });
          onPurchaseComplete?.();
          return;
        }

        // Real payment: redirect to gateway
        if (result.paymentUrl) {
          setPaymentResult({
            success: true,
            paymentUrl: result.paymentUrl,
            reference: result.reference,
            paymentId: result.payment?.id,
            message: 'Redirecting to payment gateway...',
          });

          setTimeout(() => {
            window.location.href = result.paymentUrl;
          }, 1500);
          return;
        }
      }

      setPaymentResult({
        success: false,
        message: data.message || 'Payment initiation failed. Please try again.',
      });
    } catch {
      setPaymentResult({
        success: false,
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  }

  // ──────────────────────────────────────────────
  // Handle offline payment initiation
  // ──────────────────────────────────────────────

  async function handleOfflineInit() {
    if (!selectedPackage || processing) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          paymentMethod: 'offline',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPaymentResult({
          success: true,
          paymentId: data.data.payment?.id,
          reference: data.data.payment?.reference,
          bankDetails: data.data.bankDetails,
          nextStep: 'upload_proof',
          message: data.data.message || 'Upload your payment proof.',
        });
      } else {
        setPaymentResult({
          success: false,
          message: data.message || 'Failed to initiate offline payment.',
        });
      }
    } catch {
      setPaymentResult({
        success: false,
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  }

  // ──────────────────────────────────────────────
  // Handle proof upload
  // ──────────────────────────────────────────────

  function handleProofSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleProofUpload() {
    if (!proofFile || !paymentResult?.paymentId || uploadingProof) return;

    if (!offlineForm.depositorName.trim()) {
      toast.error('Please enter the depositor name');
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('paymentId', paymentResult.paymentId);
      formData.append('proof', proofFile);
      formData.append('depositorName', offlineForm.depositorName);

      const res = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Payment proof uploaded successfully! Awaiting admin review.');
        setPaymentResult({
          ...paymentResult,
          success: true,
          nextStep: 'proof_uploaded',
          message: 'Your payment proof has been submitted. You\'ll be notified once approved.',
        });
        onPurchaseComplete?.();
      } else {
        toast.error(data.message || 'Failed to upload proof.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUploadingProof(false);
    }
  }

  // ──────────────────────────────────────────────
  // Handle payment verification on redirect
  // ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams(window.location.search);
    const verifyRef = params.get('payment_verify');
    const reference = params.get('reference');
    const method = params.get('method');

    if (verifyRef === '1' && reference && method) {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_verify');
      url.searchParams.delete('reference');
      url.searchParams.delete('method');
      window.history.replaceState({}, '', url.pathname);

      // Auto-verify
      async function verifyPayment() {
        setProcessing(true);
        try {
          const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(reference || '')}&method=${encodeURIComponent(method || '')}`);
          const data = await res.json();

          if (data.success) {
            const result = data.data;
            setPaymentResult({
              success: result.status === 'completed',
              reference: reference || undefined,
              message: result.message || (result.status === 'completed' ? 'Payment verified! Votes credited.' : 'Payment is still being processed.'),
              isDemo: true,
            });
            if (result.status === 'completed') {
              onPurchaseComplete?.();
            }
          } else {
            setPaymentResult({
              success: false,
              message: data.message || 'Verification failed.',
            });
          }
        } catch {
          setPaymentResult({
            success: false,
            message: 'Verification failed. Please try again.',
          });
        } finally {
          setProcessing(false);
        }
      }
      verifyPayment();
    }
  }, [open, onPurchaseComplete]);

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {paymentResult ? (
          // ─── RESULT SCREEN ───
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {paymentResult.success ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                )}
                {paymentResult.success ? 'Payment Update' : 'Payment Failed'}
              </DialogTitle>
              <DialogDescription>{paymentResult.message}</DialogDescription>
            </DialogHeader>

            {/* Demo / completed success */}
            {paymentResult.success && paymentResult.isDemo && (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Demo Mode — Votes Credited!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {totalVotes} votes have been added to your account.
                  </p>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  <p>Reference: {paymentResult.reference || paymentResult.paymentId}</p>
                </div>
              </div>
            )}

            {/* Offline: bank details + upload */}
            {paymentResult.success && paymentResult.nextStep === 'upload_proof' && paymentResult.bankDetails && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Bank Transfer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank Name:</span>
                      <span className="font-medium">{paymentResult.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Name:</span>
                      <span className="font-medium">{paymentResult.bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-mono font-bold text-primary">{paymentResult.bankDetails.accountNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-lg">{priceFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Upload form */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Upload Payment Proof</h4>
                  <div>
                    <Label htmlFor="depositorName">Depositor Name *</Label>
                    <Input
                      id="depositorName"
                      placeholder="Name on the bank account used"
                      value={offlineForm.depositorName}
                      onChange={(e) =>
                        setOfflineForm({ ...offlineForm, depositorName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Payment Proof (Screenshot/Receipt) *</Label>
                    <div
                      className="mt-1.5 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById('proof-upload')?.click()}
                    >
                      {proofPreview ? (
                        <div className="relative inline-block">
                          <img src={proofPreview} alt="Proof" className="max-h-40 rounded-lg" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofFile(null);
                              setProofPreview(null);
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                          <p className="text-sm text-muted-foreground">Click to upload screenshot or receipt</p>
                          <p className="text-xs text-muted-foreground/70">JPEG, PNG, WebP, GIF (max 5MB)</p>
                        </div>
                      )}
                      <input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProofSelect}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleProofUpload}
                    disabled={!proofFile || !offlineForm.depositorName.trim() || uploadingProof}
                  >
                    {uploadingProof ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploadingProof ? 'Uploading...' : 'Upload Proof & Submit'}
                  </Button>
                </div>
              </div>
            )}

            {/* Proof uploaded confirmation */}
            {paymentResult.success && paymentResult.nextStep === 'proof_uploaded' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                <Info className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Awaiting Admin Review
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Your payment proof has been submitted. An admin will review it shortly.
                  You&apos;ll be notified once your votes are credited.
                </p>
              </div>
            )}

            {/* Payment redirect */}
            {paymentResult.success && paymentResult.paymentUrl && !paymentResult.isDemo && (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                  <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 animate-spin" />
                  <p className="text-sm font-semibold">Redirecting to payment gateway...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    If not redirected, click the button below:
                  </p>
                </div>
                <Button asChild className="w-full">
                  <a href={paymentResult.paymentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Payment Page
                  </a>
                </Button>
              </div>
            )}

            {/* Failure */}
            {!paymentResult.success && (
              <Button variant="outline" className="w-full" onClick={() => setPaymentResult(null)}>
                Try Again
              </Button>
            )}

            <DialogFooter className="mt-2">
              <Button variant="ghost" onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          // ─── METHOD SELECTION SCREEN ───
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Choose Payment Method
              </DialogTitle>
              <DialogDescription>
                Complete your purchase of{' '}
                <span className="font-semibold text-foreground">{selectedPackage?.name}</span>{' '}
                ({totalVotes} votes) for{' '}
                <span className="font-bold text-primary">{priceFormatted}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {paymentMethods.map((method, i) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <motion.div key={method.id} custom={i} variants={fadeInUp} initial="hidden" animate="visible">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-2 border-primary shadow-sm shadow-primary/10' : 'hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">{method.name}</h4>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{method.badge}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {selectedMethod === 'offline' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1"
              >
                <p className="font-medium text-foreground">How it works:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Click &quot;Initiate Payment&quot; to create your order</li>
                  <li>Transfer the exact amount to the bank details provided</li>
                  <li>Upload your payment screenshot/receipt</li>
                  <li>Wait for admin approval (usually within 24 hours)</li>
                  <li>Your votes will be credited once approved</li>
                </ol>
              </motion.div>
            )}

            {selectedMethod !== 'offline' && (
              <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  You&apos;ll be redirected to {selectedMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}&apos;s secure
                  payment page. Your votes will be credited immediately after successful payment.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={selectedMethod === 'offline' ? handleOfflineInit : handleOnlinePayment}
                disabled={processing}
                className="bg-primary hover:bg-primary/90"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : selectedMethod === 'offline' ? (
                  <Building2 className="w-4 h-4 mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                {selectedMethod === 'offline' ? 'Initiate Payment' : 'Pay Now'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
