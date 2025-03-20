import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import isAuthenticated from './libs/services/authorization';
import { apiRoutingCRUD } from './libs/services/utils';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const origin = req.headers.get('origin') ?? '*';

  if (url.pathname.includes('/api')
    && req.method === 'OPTIONS') {
    const res = new NextResponse(null, {
      status: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*', // Or specify your allowed origin(s)
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
    return res;
  }

  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (url.pathname === "/api/docs") {
    return res;
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
      if (!result && !url.pathname.includes('/public')) {
        return Response.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      } else if (result || (!result && url.pathname.includes('/public'))) {

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

  return res; // Allow access for other cases
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};
