import { NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/chat',
  '/settings',
  '/api-keys',
  '/billing'
];

// Paths that should be redirected to dashboard if user is already authenticated
const publicOnlyPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // Check if path is public only
  const isPublicOnlyPath = publicOnlyPaths.some(path => 
    pathname.startsWith(path)
  );

  // If path is protected and user is not authenticated
  if (isProtectedPath && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If path is public only and user is authenticated
  if (isPublicOnlyPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Add API key validation for external requests
    const apiKey = request.headers.get('x-api-key');
    if (!token && !apiKey) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          code: 'auth_required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     * 4. /manifest.json (PWA manifest)
     */
    '/((?!_next|static|favicon.ico|robots.txt|manifest.json).*)',
  ],
};