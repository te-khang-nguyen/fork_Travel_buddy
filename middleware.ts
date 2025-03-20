import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import isAuthenticated from './libs/services/authorization';
import { apiRoutingCRUD } from './libs/services/utils';

export const setHeaders = (res: NextResponse) => {
  res.headers.set('Access-Control-Allow-Origin', '*'); // Or specify your allowed origin(s)
  res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, x-requested-with, x-client-id')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Max-Age', '86400');
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname.includes('/api')
    && req.method === 'OPTIONS') {
    const res = new NextResponse("OK", { status: 200 });
    setHeaders(res);
    return res;
  }

  const res = NextResponse.next();

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
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      } else if (result || (!result && url.pathname.includes('/public'))) {

        const newPath = apiRoutingCRUD(req);
        if (!newPath){
          return NextResponse.json(
            { success: false, message: "Method Undefined!" },
            { status: 405 }
          )
        } else {
          return NextResponse.rewrite(new URL(newPath, req.url));
        }
        
      }
    })
  }

  setHeaders(res);
  console.log("Middleware response content:",res)
  return res; // Allow access for other cases
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};
