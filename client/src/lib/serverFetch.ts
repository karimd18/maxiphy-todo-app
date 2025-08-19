import 'server-only';
import { cookies } from 'next/headers';

const BASE = process.env.BACKEND_URL!;

export async function backendFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get('token')?.value;
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');

  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: 'no-store' });
  if (!res.ok) {
    let msg = '';
    try { msg = JSON.stringify(await res.json()); } catch { msg = await res.text(); }
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
