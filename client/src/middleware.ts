import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname, search } = req.nextUrl;

  const requiresAuth =
    pathname.startsWith('/todos') || pathname.startsWith('/profile');

  if (requiresAuth && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/todos';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/todos/:path*', '/profile/:path*', '/login', '/register'],
};
