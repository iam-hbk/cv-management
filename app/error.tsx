"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/20 via-background to-accent/50" />
			<div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
			<div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

			<div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border/70 bg-card/85 p-8 text-center shadow-lg backdrop-blur-sm md:p-10">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
					<AlertTriangle className="h-6 w-6" />
				</div>
				<h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
					Something went wrong
				</h1>
				<p className="mt-3 text-base text-muted-foreground md:text-lg">
					An unexpected error occurred while loading this page.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button onClick={reset}>
						<RefreshCcw className="mr-2 h-4 w-4" />
						Try again
					</Button>
					<Button asChild variant="outline">
						<Link href="/dashboard">Open dashboard</Link>
					</Button>
					<Button asChild variant="ghost">
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
