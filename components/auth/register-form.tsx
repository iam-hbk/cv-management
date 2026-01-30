"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { type RegisterFormData, registerSchema } from "../../schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export function RegisterForm() {
	const router = useRouter();
	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});
	const mutation = useMutation({
		mutationFn: async (data: RegisterFormData) => {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: data.email,
					password: data.password,
					confirmPassword: data.confirmPassword,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Registration failed");
			}

			return response.json();
		},
	});

	async function onSubmit(values: RegisterFormData) {
		mutation.mutate(values, {
			onSuccess: () => {
				toast.success("Registration successful!", {
					description: "You will be redirected to the login page",
				});
				router.push("/login");
			},
			onError: (error) => {
				toast.error(error instanceof Error ? error.message : "Something went wrong");
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" placeholder="Email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="Password" {...field} />
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
								<Input type="password" placeholder="Confirm Password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full"
					disabled={form.formState.isSubmitting || mutation.isPending}
				>
					{mutation.isPending ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Registering...
						</>
					) : (
						"Register"
					)}
				</Button>
			</form>
		</Form>
	);
}
