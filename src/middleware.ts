
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent d'être connecté
const protectedRoutes = ['/tree', '/dashboard'];

// Routes réservées aux non-connectés
const authRoutes = ['/login', '/register'];

// src/middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isJoinRoute = pathname.startsWith('/join'); // ← nouveau

  // /join est toujours accessible — gère sa propre auth
  if (isJoinRoute) return NextResponse.next();

  // Pas connecté → redirige vers login
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté → redirige vers dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};