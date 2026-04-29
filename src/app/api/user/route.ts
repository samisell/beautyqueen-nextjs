import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, isValidPassword } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const userData = await db.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return error('User not found', 404);
    }

    return success(userData);
  } catch (err) {
    console.error('Get user profile error:', err);
    return error('Failed to load profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, avatar, currentPassword, newPassword } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return error('Name must be between 2 and 100 characters', 400);
      }
      updateData.name = name.trim();
    }

    // Validate avatar if provided
    if (avatar !== undefined) {
      if (avatar !== null && typeof avatar !== 'string') {
        return error('Invalid avatar value', 400);
      }
      updateData.avatar = avatar;
    }

    // Password change flow
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return error('Current password is required to set a new password', 400);
      }

      // Verify current password
      const existingUser = await db.user.findUnique({
        where: { id: user.userId },
        select: { password: true },
      });
      if (!existingUser) {
        return error('User not found', 404);
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isCurrentValid) {
        return error('Current password is incorrect', 401);
      }

      // Validate new password
      const passwordCheck = isValidPassword(newPassword);
      if (!passwordCheck.valid) {
        return error(passwordCheck.errors[0], 400);
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return error('No fields provided for update', 400);
    }

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(updatedUser, 200, { message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update user profile error:', err);
    return error('Failed to update profile', 500);
  }
}
