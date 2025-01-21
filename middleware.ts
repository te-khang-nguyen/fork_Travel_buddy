import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import isAuthenticated from './libs/services/authorization';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // If path includes '/api' and not include '/auth, trigger API authorization logic
  if (url.pathname.includes('/api') && !url.pathname.includes('/auth')) {
    // Get the stored JWT in the request headers
    const jwt = req.headers.get('authorization')?.split(' ')[1];
    
    return isAuthenticated(jwt).then((result) => {
      // Check the validity of the JWT, if invalid, deny access to API
      if (!result) {
        return Response.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      }
    })
  }

  return NextResponse.next(); // Allow access for other cases
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};
