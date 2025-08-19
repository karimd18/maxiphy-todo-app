import { NextRequest, NextResponse } from 'next/server';
const BASE = process.env.BACKEND_URL!;

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${BASE}/users/me/password`, {
    method: 'PATCH',
    headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
