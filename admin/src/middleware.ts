import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow the login page itself without auth
        if (path === "/admin/login") return true;
        // Protect all other /admin routes
        if (path === "/admin" || path.startsWith("/admin/")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  // Run middleware only on /admin paths and admin api routes
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
