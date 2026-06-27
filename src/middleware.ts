import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Auth middleware to protect all /admin/* routes.
 *
 * - Unauthenticated users accessing /admin/* (except /admin/login) are redirected to /admin/login.
 * - Authenticated users accessing /admin/login are redirected to /admin/dashboard.
 * - All other /admin/* requests pass through if authenticated.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // If user is NOT authenticated and trying to access any admin route (except login), redirect to login
  if (!isAuthenticated && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
