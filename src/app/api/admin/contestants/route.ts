import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, bio, imageUrl, category, categoryId, status, stageId } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return error('Name is required and must not be empty', 400);
    }
    if (!imageUrl || typeof imageUrl !== 'string') {
      return error('Image URL is required', 400);
    }

    // Validate status if provided
    if (status !== undefined && !['active', 'eliminated', 'winner'].includes(status)) {
      return error('Invalid status. Must be one of: active, eliminated, winner', 400);
    }

    // Validate stageId if provided
    if (stageId) {
      const stageExists = await db.tournamentStage.findUnique({ where: { id: stageId } });
      if (!stageExists) {
        return error('Tournament stage not found', 400);
      }
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return error('Category not found', 400);
      }
    }

    const contestant = await db.contestant.create({
      data: {
        name: name.trim(),
        bio: typeof bio === 'string' ? bio.trim() : null,
        imageUrl,
        category: typeof category === 'string' ? category : 'general',
        categoryId: categoryId || null,
        status: status || 'active',
        stageId: stageId || null,
      },
      include: {
        categoryRel: true,
        stage: true,
      },
    });

    return success(contestant, 201, { message: 'Contestant created successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('A contestant with this data already exists', 409);
    }
    console.error('Create contestant error:', err);
    return error('Failed to create contestant', 500);
  }
}
