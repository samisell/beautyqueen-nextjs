import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * PUT /api/contestant/profile
 *
 * Updates the authenticated user's contestant profile fields.
 * Accepts JSON body with any combination of updatable fields.
 * Also accepts FormData for profile image upload.
 */
export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const ip = getClientIp(request);
    if (!rateLimit(ip, 20)) {
      return error('Too many requests. Please try again later.', 429);
    }

    // Verify the user has a contestant profile
    const contestant = await db.contestant.findUnique({
      where: { userId: user.userId },
    });

    if (!contestant) {
      return error('Contestant profile not found. Please join a tournament first.', 404);
    }

    const contentType = request.headers.get('content-type') || '';
    let updateData: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload (profile image)
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;

      if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
          return error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
        }

        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return error('File too large. Maximum size is 5MB.');
        }

        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `contestant-${contestant.id}-${randomUUID().slice(0, 8)}.${fileExt}`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contestants');

        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, fileName);
        const bytes = await imageFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        updateData.imageUrl = `/uploads/contestants/${fileName}`;
      }

      // Also handle any JSON fields from formData
      const textFields = [
        'name', 'username', 'bio', 'phone', 'address', 'country', 'state',
        'bankName', 'bankAccountName', 'bankAccountNumber', 'bankSortCode',
      ];

      for (const field of textFields) {
        const val = formData.get(field) as string | null;
        if (val !== null) {
          updateData[field] = val || null;
        }
      }

      // Handle social links from formData
      const socialJson = formData.get('socialLinks') as string | null;
      if (socialJson !== null) {
        try {
          const parsed = JSON.parse(socialJson);
          const allowed = ['instagram', 'twitter', 'facebook', 'tiktok', 'youtube', 'website'];
          const cleaned: Record<string, string> = {};
          for (const key of allowed) {
            if (parsed[key] && typeof parsed[key] === 'string' && parsed[key].trim()) {
              cleaned[key] = parsed[key].trim();
            }
          }
          updateData.socialLinks = JSON.stringify(cleaned);
        } catch {
          // ignore
        }
      }
    } else {
      // Handle JSON body
      const body = await request.json();

      const {
        name, username, bio, phone, address, country, state,
        bankName, bankAccountName, bankAccountNumber, bankSortCode,
        socialLinks, gallery, addGalleryUrl, removeGalleryUrl, imageUrl,
      } = body;

      // Validate name
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
          return error('Name must be between 2 and 100 characters', 400);
        }
        updateData.name = name.trim();
      }

      // Validate username
      if (username !== undefined) {
        if (username !== null && username !== '') {
          const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
          if (cleanUsername.length < 3 || cleanUsername.length > 30) {
            return error('Username must be between 3 and 30 characters (letters, numbers, dots, hyphens, underscores)', 400);
          }
          const existing = await db.contestant.findFirst({
            where: { username: cleanUsername, id: { not: contestant.id } },
          });
          if (existing) {
            return error('This username is already taken', 409);
          }
          updateData.username = cleanUsername;
        } else {
          updateData.username = null;
        }
      }

      // Validate bio
      if (bio !== undefined) {
        if (bio !== null && typeof bio === 'string') {
          if (bio.length > 500) {
            return error('Bio must be at most 500 characters', 400);
          }
          updateData.bio = bio.trim();
        } else {
          updateData.bio = null;
        }
      }

      // Validate phone
      if (phone !== undefined) {
        if (phone !== null && phone !== '') {
          const cleanPhone = String(phone).replace(/[^+\d]/g, '');
          if (cleanPhone.length < 7 || cleanPhone.length > 20) {
            return error('Please enter a valid phone number', 400);
          }
          updateData.phone = cleanPhone;
        } else {
          updateData.phone = null;
        }
      }

      // Address fields
      if (address !== undefined) updateData.address = (address && String(address).trim()) || null;
      if (country !== undefined) updateData.country = (country && String(country).trim()) || null;
      if (state !== undefined) updateData.state = (state && String(state).trim()) || null;

      // Bank details
      if (bankName !== undefined) updateData.bankName = (bankName && String(bankName).trim()) || null;
      if (bankAccountName !== undefined) updateData.bankAccountName = (bankAccountName && String(bankAccountName).trim()) || null;
      if (bankAccountNumber !== undefined) {
        if (bankAccountNumber !== null && bankAccountNumber !== '') {
          const clean = String(bankAccountNumber).replace(/\s/g, '');
          if (clean.length < 5 || clean.length > 20) {
            return error('Please enter a valid account number', 400);
          }
          updateData.bankAccountNumber = clean;
        } else {
          updateData.bankAccountNumber = null;
        }
      }
      if (bankSortCode !== undefined) updateData.bankSortCode = (bankSortCode && String(bankSortCode).trim()) || null;

      // Social links (JSON string)
      if (socialLinks !== undefined) {
        if (socialLinks !== null) {
          try {
            const parsed = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
            const allowed = ['instagram', 'twitter', 'facebook', 'tiktok', 'youtube', 'website'];
            const cleaned: Record<string, string> = {};
            for (const key of allowed) {
              if (parsed[key] && typeof parsed[key] === 'string' && parsed[key].trim()) {
                cleaned[key] = parsed[key].trim();
              }
            }
            updateData.socialLinks = JSON.stringify(cleaned);
          } catch {
            return error('Invalid social links format', 400);
          }
        } else {
          updateData.socialLinks = null;
        }
      }

      // Gallery management
      if (addGalleryUrl !== undefined && addGalleryUrl) {
        try {
          const currentGallery = contestant.gallery ? JSON.parse(contestant.gallery) : [];
          if (currentGallery.length >= 10) {
            return error('Maximum 10 gallery photos allowed', 400);
          }
          if (!currentGallery.includes(addGalleryUrl)) {
            currentGallery.push(addGalleryUrl);
          }
          updateData.gallery = JSON.stringify(currentGallery);
        } catch {
          updateData.gallery = JSON.stringify([addGalleryUrl]);
        }
      }

      if (removeGalleryUrl !== undefined && removeGalleryUrl) {
        try {
          const currentGallery = contestant.gallery ? JSON.parse(contestant.gallery) : [];
          const filtered = currentGallery.filter((url: string) => url !== removeGalleryUrl);
          updateData.gallery = JSON.stringify(filtered);
        } catch {
          // ignore
        }
      }

      if (gallery !== undefined) {
        if (Array.isArray(gallery)) {
          if (gallery.length > 10) {
            return error('Maximum 10 gallery photos allowed', 400);
          }
          updateData.gallery = JSON.stringify(gallery);
        } else if (typeof gallery === 'string') {
          try {
            const parsed = JSON.parse(gallery);
            if (Array.isArray(parsed) && parsed.length <= 10) {
              updateData.gallery = gallery;
            }
          } catch {
            // ignore
          }
        }
      }

      // Image URL update
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl || contestant.imageUrl;
      }
    }

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return error('No fields provided for update', 400);
    }

    // Update contestant
    const updated = await db.contestant.update({
      where: { id: contestant.id },
      data: updateData,
    });

    // Parse gallery and socialLinks for response
    let parsedGallery: string[] = [];
    let parsedSocialLinks: Record<string, string> = {};
    try {
      parsedGallery = updated.gallery ? JSON.parse(updated.gallery) : [];
    } catch { /* ignore */ }
    try {
      parsedSocialLinks = updated.socialLinks ? JSON.parse(updated.socialLinks) : {};
    } catch { /* ignore */ }

    // Create notification
    await db.notification.create({
      data: {
        userId: user.userId,
        title: 'Profile Updated',
        message: 'Your contestant profile has been updated successfully.',
        type: 'success',
      },
    });

    return success({
      ...updated,
      gallery: parsedGallery,
      socialLinks: parsedSocialLinks,
    }, 200, { message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update contestant profile error:', err);
    return error('Failed to update profile', 500);
  }
}
