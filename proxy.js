import { NextResponse } from 'next/server';

export function proxy(req) {
  const session = req.cookies.get('session');
  const { pathname } = req.nextUrl;
  if (session && pathname == '/testloginv') {
    return NextResponse.redirect(new URL('/resultv', req.url));
  }else if(!session && pathname != '/testloginv'){
    return NextResponse.redirect(new URL('/testloginv', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/testloginv'],
};