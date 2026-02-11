"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import { resetPassword } from "../../../lib/auth-client";

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: ResetPasswordFormData) {
		if (!token) {
			toast.error("Invalid reset link. Please request a new one.");
			return;
		}

		setIsLoading(true);
		try {
			const { data, error } = await resetPassword(values.password, token);

			if (error) {
				toast.error(error.message || "Something went wrong");
				return;
			}

			setIsSuccess(true);
			toast.success("Password reset successfully!");

			// Redirect to login after a short delay
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	// No token provided
	if (!token) {
		return (
			<div className="flex flex-col items-center gap-4 py-4">
				<p className="text-center text-sm text-muted-foreground">
					Invalid or missing reset token. Please request a new password reset link.
				</p>
				<Button asChild variant="outline">
					<Link href="/forgot-password">Request New Link</Link>
				</Button>
			</div>
		);
	}

	// Success state
	if (isSuccess) {
		return (
			<div className="flex flex-col items-center gap-4 py-4">
				<div className="rounded-full bg-green-100 p-4">
					<CheckCircle className="h-8 w-8 text-green-600" />
				</div>
				<p className="text-center text-sm text-muted-foreground">
					Your password has been reset successfully. Redirecting to login...
				</p>
			</div>
		);
	}

	// Form state
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="Enter new password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="Confirm new password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Resetting...
						</>
					) : (
						"Reset Password"
					)}
				</Button>
			</form>
		</Form>
	);
}

function LoadingFallback() {
	return (
		<div className="flex items-center justify-center py-8">
			<Loader className="h-6 w-6 animate-spin text-muted-foreground" />
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="container m-auto flex h-screen w-screen flex-row items-center justify-center">
			<Image
				priority
				src="/logo.png"
				alt="Logo"
				width={200}
				height={200}
				className="h-auto w-auto duration-500 animate-in slide-in-from-left"
			/>
			<Separator orientation="vertical" className="mx-4 h-[50vh]" />
			<Card className="w-[380px] shadow-none duration-500 animate-in slide-in-from-right">
				<CardHeader className="flex flex-row items-start justify-between gap-2">
					<div className="flex w-full flex-row justify-between gap-2">
						<div className="flex flex-col gap-2">
							<CardTitle>Reset Password</CardTitle>
							<CardDescription>Enter your new password</CardDescription>
						</div>
						<Link
							href="/login"
							className="flex flex-row text-nowrap text-center text-sm text-primary hover:underline"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Login
						</Link>
					</div>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<LoadingFallback />}>
						<ResetPasswordForm />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
