import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(redirectTo = '/auth/login') {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    redirect(redirectTo);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect(redirectTo);
  }

  return await response.json();
}
