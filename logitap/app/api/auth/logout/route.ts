import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
