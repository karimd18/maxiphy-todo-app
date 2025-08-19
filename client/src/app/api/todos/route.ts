import { NextRequest, NextResponse } from 'next/server';
const BASE = process.env.BACKEND_URL!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(`${BASE}/todos`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${BASE}/todos`, {
    method: 'POST',
    headers: { 'content-type':'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
