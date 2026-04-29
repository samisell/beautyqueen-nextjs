import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

export async function GET(_request: NextRequest) {
  try {
    const packages = await db.votePackage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    });

    const packagesWithStats = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      votes: pkg.votes,
      price: pkg.price,
      bonusVotes: pkg.bonusVotes,
      totalVotes: pkg.votes + pkg.bonusVotes,
      isPopular: pkg.isPopular,
      order: pkg.order,
      purchaseCount: pkg._count.purchases,
    }));

    return success(packagesWithStats);
  } catch (err) {
    console.error('List packages error:', err);
    return error('Failed to load packages', 500);
  }
}
