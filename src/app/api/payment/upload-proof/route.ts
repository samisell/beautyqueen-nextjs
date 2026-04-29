import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, getClientIp, rateLimit } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/payment/upload-proof
 *
 * Body (multipart/form-data):
 *   - paymentId: string (required)
 *   - proof: File (required - image upload)
 *   - bankName?: string
 *   - accountName?: string
 *   - accountNumber?: string
 *   - depositorName?: string
 *
 * For offline payments, the user uploads their payment proof (screenshot/receipt).
 * The payment status changes to 'awaiting_review' for admin approval.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many upload requests. Please try again later.', 429);
    }

    const formData = await request.formData();
    const paymentId = formData.get('paymentId') as string;
    const proofFile = formData.get('proof') as File | null;
    const bankName = formData.get('bankName') as string | null;
    const accountName = formData.get('accountName') as string | null;
    const accountNumber = formData.get('accountNumber') as string | null;
    const depositorName = formData.get('depositorName') as string | null;

    if (!paymentId) {
      return error('Payment ID is required');
    }

    if (!proofFile) {
      return error('Payment proof image is required');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(proofFile.type)) {
      return error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (proofFile.size > maxSize) {
      return error('File too large. Maximum size is 5MB.');
    }

    // Find the payment
    const payment = await db.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.userId,
        paymentMethod: 'offline',
      },
      include: { package: true },
    });

    if (!payment) {
      return error('Payment not found or not an offline payment', 404);
    }

    if (payment.status !== 'pending') {
      return error(`Cannot upload proof for a payment with status: ${payment.status}`, 400);
    }

    // Save the proof image
    const fileExt = proofFile.name.split('.').pop() || 'jpg';
    const fileName = `proof-${payment.id}-${randomUUID().slice(0, 8)}.${fileExt}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');

    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await proofFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const proofImageUrl = `/uploads/proofs/${fileName}`;

    // Update payment with proof and mark as awaiting review
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        proofImageUrl,
        bankName: bankName || undefined,
        accountName: accountName || undefined,
        accountNumber: accountNumber || undefined,
        depositorName: depositorName || undefined,
        status: 'awaiting_review',
      },
      include: {
        package: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user.userId,
        title: 'Payment Proof Uploaded',
        message: `Your payment proof for ${payment.package.name} has been submitted and is awaiting admin review. You'll be notified once it's approved.`,
        type: 'info',
      },
    });

    return success(
      {
        payment: {
          id: updatedPayment.id,
          amount: updatedPayment.amount,
          status: updatedPayment.status,
          paymentMethod: updatedPayment.paymentMethod,
          proofImageUrl: updatedPayment.proofImageUrl,
          transactionId: updatedPayment.transactionId,
          createdAt: updatedPayment.createdAt,
        },
        message: 'Payment proof uploaded successfully. Your payment is awaiting admin review.',
      },
      200,
      { message: 'Payment proof uploaded successfully' }
    );
  } catch (err) {
    console.error('Upload proof error:', err);
    return error('Failed to upload payment proof. Please try again.', 500);
  }
}
