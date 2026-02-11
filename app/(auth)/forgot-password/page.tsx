"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
import { requestPasswordReset } from "../../../lib/auth-client";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: ForgotPasswordFormData) {
		setIsLoading(true);
		try {
			const redirectTo = `${window.location.origin}/reset-password`;
			const { data, error } = await requestPasswordReset(values.email, redirectTo);

			if (error) {
				toast.error(error.message || "Something went wrong");
				return;
			}

			setIsSubmitted(true);
			toast.success(data?.message || "Password reset email sent!");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

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
							<CardTitle>Forgot Password</CardTitle>
							<CardDescription>
								{isSubmitted
									? "Check your email for reset instructions"
									: "Enter your email to reset your password"}
							</CardDescription>
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
					{isSubmitted ? (
						<div className="flex flex-col items-center gap-4 py-4">
							<div className="rounded-full bg-primary/10 p-4">
								<Mail className="h-8 w-8 text-primary" />
							</div>
							<p className="text-center text-sm text-muted-foreground">
								We&apos;ve sent a password reset link to your email address. Please check your inbox
								and follow the instructions.
							</p>
							<Button
								variant="outline"
								className="mt-2"
								onClick={() => {
									setIsSubmitted(false);
									form.reset();
								}}
							>
								Send again
							</Button>
						</div>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="Enter your email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										"Send Reset Link"
									)}
								</Button>
							</form>
						</Form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
