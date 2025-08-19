import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE = (process.env.BACKEND_URL ?? '').replace(/\/+$/, '');

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return `Bearer ${token}`;
}

async function passthrough(res: Response) {
  const ct = res.headers.get('content-type') || 'application/json';
  // Some backends return 204/empty
  const text = res.status === 204 ? '' : await res.text().catch(() => '');
  return new NextResponse(text, { status: res.status, headers: { 'content-type': ct } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${BASE}/todos/${params.id}`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    return await passthrough(res);
  } catch (e) {
    return NextResponse.json({ message: 'Upstream error' }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BASE}/todos/${params.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    return await passthrough(res);
  } catch {
    return NextResponse.json({ message: 'Upstream error' }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${BASE}/todos/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });
    return await passthrough(res);
  } catch {
    return NextResponse.json({ message: 'Upstream error' }, { status: 502 });
  }
}

