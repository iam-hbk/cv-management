import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "./lib/auth-server";

// Paths that require authentication
const authRequiredPaths = [
	"/dashboard",
	"/manual-entry",
	"/upload",
	"/review",
	"/preview",
	"/download",
];

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
	const session = await isAuthenticated();

	const isAuthRequired = authRequiredPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path)
	);

	if (!session && isAuthRequired) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

// Next.js 16 proxy configuration
export const config = {
	matcher: [
		"/dashboard/:path*",
		"/manual-entry/:path*",
		"/upload/:path*",
		"/review/:path*",
		"/preview/:path*",
		"/download/:path*",
	],
};
