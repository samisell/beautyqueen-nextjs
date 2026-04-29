import { NextRequest } from 'next/server';
import { success } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const response = success({ message: 'Logged out successfully' });

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return success({ message: 'Logged out' });
  }
}
