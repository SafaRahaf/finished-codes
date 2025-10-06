import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Define paths that require authentication
  const protectedPaths = [
    "/dashboard",
    "/classes",
    "/parents",
    "/roles",
    "/settings",
    "/students",
    "/teachers",
    "/users",
    "/finance",
    "/hr-management",
    "/subscription",
    "/create-organization",
  ];

  // Check for a token in cookies
  const token = req.cookies.get("access_token");

  let decodedToken = null;
  if (token) {
    try {
      decodedToken = jwtDecode(token.value);
    } catch (e) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Debugging line
  // console.log("Token from cookies:", token);

  if (
    pathname === "/" &&
    token &&
    decodedToken?.org_id !== null &&
    decodedToken?.client_name === "org_admin_panel"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname === "/create-organization" && token) {
    if (
      decodedToken?.org_id !== null &&
      decodedToken?.client_name === "org_admin_panel"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.next();
    }
  }

  // Block access to protected routes when client_name is not org_admin_panel
  if (
    protectedPaths.some((path) => pathname.startsWith(path)) &&
    token &&
    decodedToken?.client_name !== "org_admin_panel"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    protectedPaths.some((path) => pathname.startsWith(path)) &&
    token &&
    decodedToken?.org_id === null
  ) {
    return NextResponse.redirect(new URL("/create-organization", req.url));
  }

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/", req.url));
  }

  // return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/create-organization",
    "/dashboard/:path*",
    "/classes/:path*",
    "/parents/:path*",
    "/roles/:path*",
    "/settings/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/finance/:path*",
    "/subscription/:path*",
    "/hr-management/:path*",
    "/users/:path*",
  ], // Specify paths for middleware
};
