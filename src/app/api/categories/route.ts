import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

export async function GET(_request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    const categoriesWithCount = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      contestantCount: cat._count.contestants,
    }));

    return success(categoriesWithCount);
  } catch (err) {
    console.error('List categories error:', err);
    return error('Failed to load categories', 500);
  }
}
