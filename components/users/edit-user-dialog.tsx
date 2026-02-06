"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useUpdateUser } from "../../queries/users";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const editUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: {
		_id: string;
		name: string;
		email: string;
	};
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
	const updateUser = useUpdateUser();

	const form = useForm<EditUserFormValues>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			name: user.name,
			email: user.email,
		},
	});

	// Reset form when user changes
	useEffect(() => {
		form.reset({
			name: user.name,
			email: user.email,
		});
	}, [user, form]);

	async function onSubmit(values: EditUserFormValues) {
		try {
			await updateUser({
				id: user._id,
				name: values.name,
				email: values.email,
			});
			toast.success("User updated successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update user");
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>
						Update user details. Email changes will take effect immediately.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="john@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="gap-2 sm:gap-0">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
