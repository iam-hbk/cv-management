import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await auth();

  // Paths that require authentication
  const authRequiredPaths = [
    "/dashboard",
    "/manual-entry",
    "/upload",
    "/review",
    "/preview",
    "/download",
  ];

  const isAuthRequired = authRequiredPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!session && isAuthRequired) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
