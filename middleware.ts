import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication
const publicPaths = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  
  // Check if the path is an API path
  const isApiPath = pathname.startsWith('/api');
  
  // Check if path is a static file
  const isStaticFile = /\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2)$/i.test(pathname);
  
  // If it's a static file or API path, skip middleware
  if (isStaticFile || isApiPath) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If user is not authenticated and is trying to accessx a protected route
  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If user is authenticated and is trying to access login/register
  if (token && isPublicPath && (pathname === '/login' || pathname === '/register')) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
