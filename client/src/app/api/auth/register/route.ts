import { NextRequest, NextResponse } from 'next/server';
const BASE = process.env.BACKEND_URL!;
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'content-type':'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  const resp = NextResponse.json({ user: data.user });
  resp.cookies.set('token', data.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return resp;
}
