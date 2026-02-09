import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas (votaciones y postulaciones deben quedar públicas)
  const publicPaths = [
    '/',
    '/login',
    '/voting',
    '/voting/voting',
    '/postulaciones',
    '/postulaciones/nueva',
  ];

  // Rutas que queremos proteger
  const protectedPrefixes = ['/dashboard', '/reports', '/associates'];

  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const tokenCookie = req.cookies.get('tworegi_token')?.value;
  if (!tokenCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/associates/:path*',
  ],
};
