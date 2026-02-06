"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { authClient } from "./lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}

const convex = new ConvexReactClient(convexUrl);

export default function Providers({
	children,
	initialToken,
}: { children: React.ReactNode; initialToken?: string | null }) {
	const [queryClient] = useState(() => new QueryClient());
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<NuqsAdapter>
			<ConvexBetterAuthProvider client={convex} authClient={authClient} initialToken={initialToken}>
				<QueryClientProvider client={queryClient}>
					<div className="min-h-screen">
						{mounted ? (
							<div className="bg-background text-foreground">
								{children}
								<Toaster richColors position="top-right" />
							</div>
						) : (
							<div className="bg-white dark:bg-gray-900">{children}</div>
						)}
					</div>
				</QueryClientProvider>
			</ConvexBetterAuthProvider>
		</NuqsAdapter>
	);
}
