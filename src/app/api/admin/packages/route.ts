import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, votes, price, bonusVotes, isPopular, isActive, order } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return error('Package name is required', 400);
    }
    if (votes === undefined || typeof votes !== 'number' || votes < 1) {
      return error('Votes must be a positive number', 400);
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return error('Price must be a non-negative number', 400);
    }
    if (bonusVotes !== undefined && (typeof bonusVotes !== 'number' || bonusVotes < 0)) {
      return error('Bonus votes must be a non-negative number', 400);
    }

    const pkg = await db.votePackage.create({
      data: {
        name: name.trim(),
        votes,
        price,
        bonusVotes: typeof bonusVotes === 'number' ? bonusVotes : 0,
        isPopular: typeof isPopular === 'boolean' ? isPopular : false,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        order: typeof order === 'number' ? order : 0,
      },
    });

    return success(pkg, 201, { message: 'Vote package created successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('A package with this name already exists', 409);
    }
    console.error('Create package error:', err);
    return error('Failed to create vote package', 500);
  }
}
