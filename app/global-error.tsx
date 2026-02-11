"use client";

import { Button } from "@/components/ui/button";
import { AlertOctagon, LogIn, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
					<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/20 via-background to-accent/40" />
					<div className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-16 left-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

					<div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border/70 bg-card/90 p-8 text-center shadow-lg backdrop-blur-sm md:p-10">
						<Image
							priority
							src="/logo.png"
							alt="CV Builder"
							width={56}
							height={56}
							className="mx-auto h-14 w-14"
						/>
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
							<AlertOctagon className="h-6 w-6" />
						</div>
						<h1 className="mt-4 text-3xl font-semibold md:text-4xl">Application error</h1>
						<p className="mt-3 text-base text-muted-foreground md:text-lg">
							A critical error occurred. We could not render the page safely.
						</p>
						<p className="mt-4 rounded-md border border-border/70 bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
							Error ID: {error.digest ?? "unavailable"}
						</p>

						<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
							<Button onClick={reset}>
								<RefreshCcw className="mr-2 h-4 w-4" />
								Try reload
							</Button>
							<Button asChild variant="outline">
								<Link href="/login">
									<LogIn className="mr-2 h-4 w-4" />
									Go to login
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
