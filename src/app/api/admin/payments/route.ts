import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, requireAdmin, error } from '@/lib/api-helpers';

/**
 * GET /api/admin/payments?page=1&limit=20&status=pending&method=offline
 *
 * Returns all payments for admin review.
 * Supports filtering by status and payment method.
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const statusFilter = searchParams.get('status');
    const methodFilter = searchParams.get('method');

    const where: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }
    if (methodFilter && methodFilter !== 'all') {
      where.paymentMethod = methodFilter;
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          package: {
            select: { id: true, name: true, votes: true, bonusVotes: true },
          },
          reviewer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    const formatted = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      reference: p.reference,
      gatewayRef: p.gatewayRef,
      proofImageUrl: p.proofImageUrl,
      bankName: p.bankName,
      accountName: p.accountName,
      accountNumber: p.accountNumber,
      depositorName: p.depositorName,
      adminNote: p.adminNote,
      reviewedBy: p.reviewedBy,
      reviewedAt: p.reviewedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: p.user,
      package: p.package,
      reviewer: p.reviewer ? { id: p.reviewer.id, name: p.reviewer.name } : null,
    }));

    // Include summary counts
    const [pendingCount, reviewCount, completedCount, offlinePendingCount] = await Promise.all([
      db.payment.count({ where: { status: 'pending' } }),
      db.payment.count({ where: { status: 'awaiting_review' } }),
      db.payment.count({ where: { status: 'completed' } }),
      db.payment.count({ where: { paymentMethod: 'offline', status: 'awaiting_review' } }),
    ]);

    const response = paginated(formatted, { page, limit, total });

    // Add summary meta
    const responseBody = await response.json();
    responseBody.meta = {
      ...responseBody.meta,
      pendingCount,
      reviewCount,
      completedCount,
      offlinePendingCount,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Get admin payments error:', err);
    return error('Failed to load payments', 500);
  }
}
