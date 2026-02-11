import { Button } from "@/components/ui/button";
import { Compass, Home, LogIn } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/25 via-background to-accent/60" />
			<div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

			<div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border/70 bg-card/85 p-8 text-center shadow-lg backdrop-blur-sm md:p-10">
				<p className="font-mono text-sm tracking-wide text-primary">Error 404</p>
				<h1 className="mt-2 text-4xl font-semibold text-foreground md:text-5xl">
					This page did not make the final cut
				</h1>
				<p className="mt-4 text-base text-muted-foreground md:text-lg">
					The page you are trying to open does not exist or has been moved.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button asChild>
						<Link href="/dashboard">
							<Compass className="mr-2 h-4 w-4" />
							Back to dashboard
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/login">
							<LogIn className="mr-2 h-4 w-4" />
							Go to login
						</Link>
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
