import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Notification Helper
// Creates a dashboard notification for a user, optionally storing the HTML
// content of the originating email so the user can re-read it in-app.
// ---------------------------------------------------------------------------

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  emailContent?: string;
}

/**
 * Create a notification record in the database.
 * Designed to be called fire-and-forget alongside email sends:
 *   createNotification(...).catch(() => {});
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  emailContent,
}: CreateNotificationParams) {
  if (!userId || typeof userId !== 'string' || !title || typeof title !== 'string' || !message || typeof message !== 'string') {
    console.error('[Notify] Invalid notification payload:', { userId, title, message, type, emailContent });
    return;
  }

  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        ...(emailContent ? { emailContent } : {}),
      },
    });
  } catch (err) {
    console.error('[Notify] Failed to create notification:', err);
  }
}
