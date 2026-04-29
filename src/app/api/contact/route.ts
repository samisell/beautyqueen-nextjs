import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, rateLimit, isValidEmail, getClientIp } from '@/lib/api-helpers';

const VALID_CATEGORIES = [
  'general',
  'feedback',
  'complaint',
  'partnership',
  'payment',
  'contestant',
  'technical',
  'other',
];

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const { name, email, phone, subject, category, message, honeypot } = body;

    // Honeypot spam check
    if (honeypot) {
      // Silently succeed for bots
      return success({
        message: 'Your message has been sent successfully!',
      });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return error('Please provide a valid name (at least 2 characters).');
    }
    if (!email || !isValidEmail(email)) {
      return error('Please provide a valid email address.');
    }
    if (phone && typeof phone === 'string') {
      const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
      if (cleaned.length < 7 || cleaned.length > 15) {
        return error('Please provide a valid phone number.');
      }
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return error('Message must be at least 10 characters long.');
    }

    const sanitizedCategory = category?.trim();
    if (sanitizedCategory && !VALID_CATEGORIES.includes(sanitizedCategory)) {
      return error('Please select a valid category.');
    }

    const sanitizedSubject = subject?.trim() || 'general';
    const sanitizedPhone = phone?.trim() || null;

    const contactMessage = await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: sanitizedPhone,
        category: sanitizedCategory || null,
        subject: sanitizedSubject,
        message: message.trim(),
      },
    });

    return success(
      {
        id: contactMessage.id,
        message: 'Your message has been sent successfully! We will get back to you within 24 hours.',
      },
      201
    );
  } catch (err: unknown) {
    console.error('Contact form error:', err);
    return error('Something went wrong. Please try again later.', 500);
  }
}
