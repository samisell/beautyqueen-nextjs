import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, rateLimit, isValidEmail, getClientIp } from '@/lib/api-helpers';
import { verifyAccessToken } from '@/lib/auth';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const VALID_CATEGORIES = [
  'account',
  'payment',
  'voting',
  'technical',
  'contestant',
  'other',
];

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function generateTicketId(): string {
  const chars = '0123456789';
  let num = '';
  for (let i = 0; i < 4; i++) num += chars[Math.floor(Math.random() * chars.length)];
  return `BV-${num}`;
}

// Ensure the uploads directory exists
async function ensureUploadDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tickets');
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

/**
 * Saves a base64-encoded attachment to disk and returns the public URL path.
 */
async function saveAttachment(
  base64Data: string,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const uploadDir = await ensureUploadDir();

  // Sanitize file name — keep extension, replace unsafe chars
  const ext = mimeType.split('/')[1]?.replace('+xml', '') || 'bin';
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
  const uniqueName = `ticket-${Date.now()}-${safeName}.${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Strip data URL prefix if present
  const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(rawBase64, 'base64');

  await writeFile(filePath, buffer);

  return `/uploads/tickets/${uniqueName}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { category, priority, subject, description, attachment } = body;

    // Validation
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return error('Please select a valid category.');
    }
    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      return error('Please select a valid priority level.');
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
      return error('Subject must be at least 5 characters long.');
    }
    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      return error('Description must be at least 20 characters long.');
    }

    // Validate attachment if provided — save to filesystem instead of storing base64
    let attachmentUrl: string | undefined;
    if (attachment) {
      if (!attachment.data || !attachment.name || !attachment.type) {
        return error('Invalid attachment data.');
      }
      // Max 5MB base64 (roughly 3.5MB file)
      if (attachment.data.length > 5 * 1024 * 1024) {
        return error('Attachment must be smaller than 5MB.');
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(attachment.type)) {
        return error('Only PNG, JPG, WEBP, and PDF files are allowed.');
      }
      // Save file to disk and store only the URL path
      attachmentUrl = await saveAttachment(attachment.data, attachment.name, attachment.type);
    }

    // Check if user is authenticated (optional — allows guest tickets)
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyAccessToken(authHeader.split(' ')[1]);
      if (payload) {
        userId = payload.userId;
      }
    }

    // Check for existing open tickets (rate limit by user if authenticated)
    if (userId) {
      const recentTickets = await db.supportTicket.count({
        where: {
          userId,
          status: 'open',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
          },
        },
      });
      if (recentTickets >= 3) {
        return error(
          'You have too many open tickets. Please wait for a response before creating more.',
          429
        );
      }
    }

    let ticketId = generateTicketId();
    // Ensure unique ticket ID
    while (await db.supportTicket.findUnique({ where: { ticketId } })) {
      ticketId = generateTicketId();
    }

    const ticket = await db.supportTicket.create({
      data: {
        ticketId,
        userId,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        attachmentUrl,
      },
    });

    return success(
      {
        id: ticket.id,
        ticketId: ticket.ticketId,
        message: `Support ticket ${ticket.ticketId} created successfully! We will respond within 24 hours.`,
      },
      201
    );
  } catch (err: unknown) {
    console.error('Support ticket creation error:', err);
    return error('Something went wrong. Please try again later.', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth required for viewing tickets
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return error('Authentication required', 401);
    }

    const payload = verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload) {
      return error('Invalid or expired token', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { userId: payload.id };
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      where.status = status;
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          ticketId: true,
          category: true,
          priority: true,
          subject: true,
          description: true,
          status: true,
          adminReply: true,
          repliedAt: true,
          isReadByUser: true,
          attachmentUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.supportTicket.count({ where }),
    ]);

    // Mark unread tickets as read
    if (tickets.some((t) => !t.isReadByUser)) {
      await db.supportTicket.updateMany({
        where: { userId: payload.id, isReadByUser: false },
        data: { isReadByUser: true },
      });
    }

    return success(tickets, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error('Support tickets fetch error:', err);
    return error('Something went wrong.', 500);
  }
}
