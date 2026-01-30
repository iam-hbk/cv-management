"use client";

import { useState, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { UserPlus } from "lucide-react";

const schema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email"),
	mobileNumber: z.string().min(1, "Mobile is required"),
	nationality: z.string().min(1, "Nationality is required"),
	idNumber: z.string().min(1, "ID number is required"),
	ethnicity: z.string().min(1, "Ethnicity is required"),
	currentSalary: z.string().min(1, "Salary range is required"),
	currentSalaryRate: z.string().min(1, "Salary rate is required"),
});

type FormValues = z.infer<typeof schema>;

function fileToBase64(
	file: File
): Promise<{ base64: string; fileName: string; contentType: string }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result as string;
			const [header, base64] = dataUrl.split(",");
			const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
			resolve({
				base64: base64 ?? "",
				fileName: file.name,
				contentType: mime,
			});
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export function AddJobSeekerDialog() {
	const [open, setOpen] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const submitCV = useAction(api.jobSeekersActions.submitCV);

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			mobileNumber: "",
			nationality: "",
			idNumber: "",
			ethnicity: "",
			currentSalary: "",
			currentSalaryRate: "",
		},
	});

	async function onSubmit(values: FormValues) {
		if (!file) {
			toast.error("Please upload a CV file (PDF or DOC)");
			return;
		}
		const allow = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (!allow.includes(file.type)) {
			toast.error("CV must be PDF or DOC/DOCX");
			return;
		}
		try {
			const { base64, fileName, contentType } = await fileToBase64(file);
			await submitCV({
				idNumber: values.idNumber,
				firstName: values.firstName,
				lastName: values.lastName,
				mobileNumber: values.mobileNumber,
				email: values.email,
				currentSalary: values.currentSalary,
				currentSalaryRate: values.currentSalaryRate,
				nationality: values.nationality,
				ethnicity: values.ethnicity,
				fileBase64: base64,
				fileName,
				contentType,
			});
			toast.success("Job seeker added successfully");
			setOpen(false);
			form.reset();
			setFile(null);
			if (fileRef.current) fileRef.current.value = "";
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to add job seeker");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserPlus className="h-4 w-4" />
					Add Job Seeker
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Job Seeker</DialogTitle>
					<DialogDescription>
						Add a job seeker with their CV. Emails will be sent to the candidate and admins.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input {...field} placeholder="John" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Doe" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" {...field} placeholder="john@example.com" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="mobileNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mobile number</FormLabel>
									<FormControl>
										<Input {...field} placeholder="+27 12 345 6789" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="nationality"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nationality</FormLabel>
										<FormControl>
											<Input {...field} placeholder="South African" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="idNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ID number</FormLabel>
										<FormControl>
											<Input {...field} placeholder="ID or passport" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="ethnicity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ethnicity</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Optional" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="currentSalary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Salary range</FormLabel>
										<FormControl>
											<Input {...field} placeholder="e.g. 500k-600k" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="currentSalaryRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Salary rate</FormLabel>
										<FormControl>
											<Input {...field} placeholder="e.g. per year" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="space-y-2">
							<Label>CV file (PDF or DOC)</Label>
							<Input
								ref={fileRef}
								type="file"
								accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								onChange={(e) => setFile(e.target.files?.[0] ?? null)}
							/>
							{file && <p className="text-xs text-muted-foreground">{file.name}</p>}
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Adding..." : "Add Job Seeker"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
