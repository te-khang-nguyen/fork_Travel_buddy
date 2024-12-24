import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Retrieve the role from cookies
  const role = req.cookies.get('role')?.value;
  

  const url = req.nextUrl.clone();

  // If the role is 'user' and the path contains 'business', deny access
  if (role && role === 'user' && url.pathname.includes('business')) {
    url.pathname = '/no-access'; // Redirect to a no-access page
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow access for other cases
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};
