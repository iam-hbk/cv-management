"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { type LoginFormData, loginSchema } from "../../schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

export function LoginForm() {
	const router = useRouter();
	const mutation = useMutation({
		mutationFn: async (values: LoginFormData) => {
			const result = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});

			if (result.error) {
				throw new Error(result.error.message || "Invalid credentials");
			}

			return result;
		},
	});
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginFormData) {
		mutation.mutate(values, {
			onSuccess: () => {
				toast.success("Signed in successfully");
				form.reset();
				router.push("/dashboard");
			},
			onError: (error: Error) => {
				toast.error(error.message || "Something went wrong");
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
				<Button
					type="submit"
					className="w-full"
					disabled={form.formState.isSubmitting || mutation.isPending}
				>
					{mutation.isPending ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</Button>
			</form>
		</Form>
	);
}
