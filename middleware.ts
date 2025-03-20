import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import isAuthenticated from './libs/services/authorization';
import { apiRoutingCRUD } from './libs/services/utils';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const res = NextResponse.next();
  res.headers.append('Access-Control-Allow-Origin', '*');
  res.headers.append('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
  res.headers.append('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (url.pathname.includes('/api')
      && (req.method === 'OPTIONS' 
      || url.pathname.includes('/docs'))) {
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
