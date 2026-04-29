import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { generateReferralCode } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, referralCode } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode },
      });
      if (!referrer) {
        return NextResponse.json(
          { success: false, message: 'Invalid referral code' },
          { status: 400 }
        );
      }
      referredBy = referrer.id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique referral code
    let newReferralCode = generateReferralCode();
    let codeExists = await db.user.findUnique({
      where: { referralCode: newReferralCode },
    });
    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await db.user.findUnique({
        where: { referralCode: newReferralCode },
      });
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        referralCode: newReferralCode,
        referredBy,
      },
    });

    // Create referral record if applicable
    if (referredBy) {
      await db.referral.create({
        data: {
          referrerId: referredBy,
          referredId: user.id,
          bonusVotes: 5,
        },
      });

      // Create notification for referrer
      await db.notification.create({
        data: {
          userId: referredBy,
          title: 'New Referral!',
          message: `${name} signed up using your referral code. You earned 5 bonus votes!`,
          type: 'success',
        },
      });
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set tokens in cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
          },
          token: accessToken,
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
