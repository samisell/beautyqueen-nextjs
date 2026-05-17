import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { success, error, parsePagination, getUserFromRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const isReadFilter = searchParams.get('isRead');

    // Validate isRead filter
    const where: Record<string, unknown> = { userId: user.userId };
    if (isReadFilter !== null && isReadFilter !== '') {
      if (isReadFilter !== 'true' && isReadFilter !== 'false') {
        return error('Invalid isRead filter. Must be "true" or "false"', 400);
      }
      where.isRead = isReadFilter === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId: user.userId, isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return error('Failed to load notifications', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    // Mark all as read
    if (markAllRead === true || markAllRead === 'true') {
      const result = await db.notification.updateMany({
        where: { userId: user.userId, isRead: false },
        data: { isRead: true },
      });

      return success({
        message: 'All notifications marked as read',
        updatedCount: result.count,
      });
    }

    // Mark single notification as read
    if (!notificationId || typeof notificationId !== 'string') {
      return error('Notification ID is required', 400);
    }

    const notification = await db.notification.findFirst({
      where: { id: notificationId, userId: user.userId },
    });

    if (!notification) {
      return error('Notification not found', 404);
    }

    if (notification.isRead) {
      return success({ message: 'Notification already read' });
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return success({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Update notification error:', err);
    return error('Failed to update notification', 500);
  }
}
