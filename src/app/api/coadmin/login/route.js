import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let response;
    try {
      response = await fetch(`${apiUrl}/coadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch (fetchError) {
      return NextResponse.json(
        { error: `Backend server not running at ${apiUrl}. Ensure your NestJS server is started.` },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorMsg = 'Login failed';
      try {
        const payload = await response.json();
        errorMsg = payload?.message || payload?.error || 'Invalid credentials';
      } catch {
        errorMsg = 'Invalid credentials';
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
    }

    const data = await response.json();
    const nextResponse = NextResponse.json({ success: true, access_token: data.access_token });
    nextResponse.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
