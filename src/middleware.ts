import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("gp_session");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/students/:path*",
    "/reports/:path*",
    "/platform/:path*",
  ],
};
