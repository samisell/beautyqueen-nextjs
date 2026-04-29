import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contestant = await db.contestant.findUnique({
      where: { id },
      include: {
        categoryRel: true,
        stage: true,
      },
    });

    if (!contestant) {
      return NextResponse.json(
        { success: false, message: 'Contestant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contestant,
    });
  } catch (error) {
    console.error('Get contestant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUserFromRequest(request);
    if (error) return error;
    if (user!.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const contestant = await db.contestant.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.stageId !== undefined && { stageId: body.stageId }),
      },
      include: { categoryRel: true, stage: true },
    });

    return NextResponse.json({
      success: true,
      data: contestant,
      message: 'Contestant updated successfully',
    });
  } catch (error) {
    console.error('Update contestant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUserFromRequest(request);
    if (error) return error;
    if (user!.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await db.contestant.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Contestant deleted successfully',
    });
  } catch (error) {
    console.error('Delete contestant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
