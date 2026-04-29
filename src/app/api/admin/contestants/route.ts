import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const { name, bio, imageUrl, category, categoryId, status, stageId } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Name and imageUrl are required' },
        { status: 400 }
      );
    }

    const contestant = await db.contestant.create({
      data: {
        name,
        bio: bio || null,
        imageUrl,
        category: category || 'general',
        categoryId: categoryId || null,
        status: status || 'active',
        stageId: stageId || null,
      },
      include: {
        categoryRel: true,
        stage: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: contestant,
        message: 'Contestant created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contestant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
