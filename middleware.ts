import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import isAuthenticated from './libs/services/authorization';
import { apiRoutingCRUD } from './libs/services/utils';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname == '/api/docs') {
    return NextResponse.next(); // Allow access for other cases
  }

  if (url.pathname.includes('/api/v1/auth')) {
    const newPath = url.pathname.replace('v1/', '');
    const params = Array.from(url.searchParams.entries());
    const paramsString = params.length > 0? 
      '?' + params.map((item: any)=> `${item[0]}=${item[1]}`).join('&') : '';
    return NextResponse.rewrite(new URL(newPath + paramsString, req.url));
  }

  // If path includes '/api' and not include '/auth, trigger API authorization logic
  if (url.pathname.includes('/api') 
      && !url.pathname.includes('/auth') 
      && !url.pathname.includes('/docs')) {
    // Get the stored JWT in the request headers
    const jwt = req.headers.get('authorization')?.split(' ')[1];

    return isAuthenticated(jwt).then((result) => {
      // Check the validity of the JWT, if invalid, deny access to API
      if (!result) {
        return Response.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      } else {
        if(url.pathname.includes('/storage')) {
          const pathSegments = url.pathname.split('/').filter(e => e !== 'v1' && e !== '');
          return NextResponse.rewrite(new URL(`/${pathSegments.join('/')}`, req.url));
        }

        const newPath = apiRoutingCRUD(req);
        if (!newPath){
          return Response.json(
            { success: false, message: "Method Undefined!" },
            { status: 405 }
          )
        } else {
          return NextResponse.rewrite(new URL(newPath, req.url));
        }
      }
    })
  }

  return NextResponse.next(); // Allow access for other cases
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};
