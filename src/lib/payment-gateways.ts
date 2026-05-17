/**
 * Payment Gateway Utilities
 * Supports: Flutterwave, Paystack, Offline (bank transfer with proof upload)
 *
 * In production, set these env vars:
 * - FLUTTERWAVE_SECRET_KEY
 * - FLUTTERWAVE_PUBLIC_KEY
 * - PAYSTACK_SECRET_KEY
 * - PAYSTACK_PUBLIC_KEY
 * - ENABLE_FLUTTERWAVE (true/false, default: true)
 * - ENABLE_PAYSTACK (true/false, default: true)
 *
 * For development/demo, these fallback to test keys or mock mode.
 * Set ENABLE_* to false to temporarily disable a gateway during downtime.
 */

import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';

export const paymentConfig = {
  flutterwave: {
    publicKey: FLUTTERWAVE_PUBLIC_KEY,
    secretKey: FLUTTERWAVE_SECRET_KEY,
    baseUrl: 'https://api.flutterwave.com/v3',
    isConfigured: !!FLUTTERWAVE_PUBLIC_KEY && !!FLUTTERWAVE_SECRET_KEY && process.env.ENABLE_FLUTTERWAVE !== 'false',
  },
  paystack: {
    publicKey: PAYSTACK_PUBLIC_KEY,
    secretKey: PAYSTACK_SECRET_KEY,
    baseUrl: 'https://api.paystack.co',
    isConfigured: !!PAYSTACK_SECRET_KEY && !!PAYSTACK_PUBLIC_KEY && process.env.ENABLE_PAYSTACK !== 'false',
  },
  offline: {
    bankName: process.env.OFFLINE_BANK_NAME || 'BeautyVote Holdings',
    accountName: process.env.OFFLINE_ACCOUNT_NAME || 'BeautyVote Platform',
    accountNumber: process.env.OFFLINE_ACCOUNT_NUMBER || '1234567890',
    bankBranch: process.env.OFFLINE_BANK_BRANCH || 'Main Branch',
    sortCode: process.env.OFFLINE_SORT_CODE || '',
  },
};

// ---------------------------------------------------------------------------
// Offline bank details from DB (admin-manageable, overrides env vars)
// ---------------------------------------------------------------------------

const offlineBankCache = { data: null as Record<string, string> | null, fetchedAt: 0 };

export async function getOfflineBankDetails(): Promise<typeof paymentConfig.offline> {
  // Cache for 5 minutes
  const now = Date.now();
  if (offlineBankCache.data && now - offlineBankCache.fetchedAt < 5 * 60 * 1000) {
    return {
      bankName: offlineBankCache.data.offlineBankName || paymentConfig.offline.bankName,
      accountName: offlineBankCache.data.offlineAccountName || paymentConfig.offline.accountName,
      accountNumber: offlineBankCache.data.offlineAccountNumber || paymentConfig.offline.accountNumber,
      bankBranch: offlineBankCache.data.offlineBankBranch || paymentConfig.offline.bankBranch,
      sortCode: '',
    };
  }

  try {
    const settings = await db.platformSetting.findMany({
      where: { key: { in: ['offlineBankName', 'offlineAccountName', 'offlineAccountNumber', 'offlineBankBranch'] } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    offlineBankCache.data = map;
    offlineBankCache.fetchedAt = now;
    return {
      bankName: map.offlineBankName || paymentConfig.offline.bankName,
      accountName: map.offlineAccountName || paymentConfig.offline.accountName,
      accountNumber: map.offlineAccountNumber || paymentConfig.offline.accountNumber,
      bankBranch: map.offlineBankBranch || paymentConfig.offline.bankBranch,
      sortCode: '',
    };
  } catch {
    // Fallback to env defaults if DB is unavailable
    return paymentConfig.offline;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentMethod = 'flutterwave' | 'paystack' | 'offline' | 'mock';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  packageId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  packageName: string;
}

export interface InitializePaymentResult {
  success: boolean;
  paymentUrl?: string;
  reference: string;
  transactionId: string;
  message?: string;
}

export interface VerifyPaymentParams {
  reference: string;
  paymentMethod: 'flutterwave' | 'paystack';
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  gatewayTransactionId?: string;
  message?: string;
}

export interface OfflinePaymentParams {
  proofImageUrl: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  depositorName?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BV-${timestamp}-${random}`;
}

function generateTransactionId(): string {
  return `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Flutterwave
// ---------------------------------------------------------------------------

export async function initializeFlutterwavePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResult> {
  const { email, amount, paymentMethod } = params;

  // Demo mode: return mock payment URL
  if (!paymentConfig.flutterwave.isConfigured) {
    const reference = generateReference();
    const transactionId = generateTransactionId();
    return {
      success: true,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment/verify?reference=${reference}&method=flutterwave&demo=1`,
      reference,
      transactionId,
      message: 'Flutterwave is in demo mode — payment will be auto-completed.',
    };
  }

  try {
    const response = await fetch(`${paymentConfig.flutterwave.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: generateReference(),
        amount,
        currency: 'NGN',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment/callback/flutterwave`,
        payment_options: 'card,bank_transfer,ussd,mobile_money',
        customer: { email, name: email.split('@')[0] },
        customizations: {
          title: 'BeautyVote - Vote Package',
          description: `Purchase ${params.packageName}`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/logo.svg`,
        },
        meta: {
          packageId: params.packageId,
          userId: params.userId,
          paymentMethod,
        },
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        paymentUrl: data.data.link,
        reference: data.data.tx_ref,
        transactionId: generateTransactionId(),
      };
    }

    return {
      success: false,
      reference: '',
      transactionId: generateTransactionId(),
      message: data.message || 'Failed to initialize Flutterwave payment',
    };
  } catch (err) {
    console.error('Flutterwave init error:', err);
    return {
      success: false,
      reference: '',
      transactionId: generateTransactionId(),
      message: 'Flutterwave service unavailable. Please try again.',
    };
  }
}

export async function verifyFlutterwavePayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  // Demo mode: auto-complete
  if (!paymentConfig.flutterwave.isConfigured) {
    return {
      success: true,
      status: 'completed',
      amount: 0, // caller will use the stored amount
      message: 'Demo mode: Payment verified automatically.',
    };
  }

  try {
    const response = await fetch(
      `${paymentConfig.flutterwave.baseUrl}/transactions/${params.reference}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'successful') {
      return {
        success: true,
        status: 'completed',
        amount: data.data.amount,
        gatewayTransactionId: data.data.id?.toString(),
      };
    }

    if (data.data.status === 'pending') {
      return {
        success: false,
        status: 'pending',
        amount: data.data.amount || 0,
        message: 'Payment is still pending. Please check back shortly.',
      };
    }

    return {
      success: false,
      status: 'failed',
      amount: data.data.amount || 0,
      message: data.message || 'Payment verification failed.',
    };
  } catch (err) {
    console.error('Flutterwave verify error:', err);
    return {
      success: false,
      status: 'failed',
      amount: 0,
      message: 'Flutterwave verification service unavailable.',
    };
  }
}

// ---------------------------------------------------------------------------
// Paystack
// ---------------------------------------------------------------------------

export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResult> {
  const { email, amount } = params;

  // Demo mode: return mock payment URL
  if (!paymentConfig.paystack.isConfigured) {
    const reference = generateReference();
    const transactionId = generateTransactionId();
    return {
      success: true,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment/verify?reference=${reference}&method=paystack&demo=1`,
      reference,
      transactionId,
      message: 'Paystack is in demo mode — payment will be auto-completed.',
    };
  }

  try {
    const response = await fetch(`${paymentConfig.paystack.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack uses kobo
        currency: 'NGN',
        reference: generateReference(),
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment/callback/paystack`,
        metadata: {
          packageId: params.packageId,
          userId: params.userId,
          paymentMethod: params.paymentMethod,
          packageName: params.packageName,
        },
      }),
    });

    const data = await response.json();

    if (data.status) {
      return {
        success: true,
        paymentUrl: data.data.authorization_url,
        reference: data.data.reference,
        transactionId: generateTransactionId(),
      };
    }

    return {
      success: false,
      reference: '',
      transactionId: generateTransactionId(),
      message: data.message || 'Failed to initialize Paystack payment',
    };
  } catch (err) {
    console.error('Paystack init error:', err);
    return {
      success: false,
      reference: '',
      transactionId: generateTransactionId(),
      message: 'Paystack service unavailable. Please try again.',
    };
  }
}

export async function verifyPaystackPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  // Demo mode: auto-complete
  if (!paymentConfig.paystack.isConfigured) {
    return {
      success: true,
      status: 'completed',
      amount: 0,
      message: 'Demo mode: Payment verified automatically.',
    };
  }

  try {
    const response = await fetch(
      `${paymentConfig.paystack.baseUrl}/transaction/verify/${params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      return {
        success: true,
        status: 'completed',
        amount: data.data.amount / 100, // Convert from kobo to Naira
        gatewayTransactionId: data.data.id?.toString(),
      };
    }

    return {
      success: false,
      status: data.data.status || 'failed',
      amount: data.data.amount ? data.data.amount / 100 : 0,
      message: data.message || 'Payment verification failed.',
    };
  } catch (err) {
    console.error('Paystack verify error:', err);
    return {
      success: false,
      status: 'failed',
      amount: 0,
      message: 'Paystack verification service unavailable.',
    };
  }
}

// ---------------------------------------------------------------------------
// Unified Initializer
// ---------------------------------------------------------------------------

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResult> {
  switch (params.paymentMethod) {
    case 'flutterwave':
      return initializeFlutterwavePayment(params);
    case 'paystack':
      return initializePaystackPayment(params);
    default:
      return {
        success: false,
        reference: '',
        transactionId: generateTransactionId(),
        message: `Unsupported payment method: ${params.paymentMethod}`,
      };
  }
}

export async function verifyPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  switch (params.paymentMethod) {
    case 'flutterwave':
      return verifyFlutterwavePayment(params);
    case 'paystack':
      return verifyPaystackPayment(params);
    default:
      return {
        success: false,
        status: 'failed',
        amount: 0,
        message: `Unsupported payment method: ${params.paymentMethod}`,
      };
  }
}

export { generateReference, generateTransactionId };
