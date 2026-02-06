"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type ExecutiveSummarySchema, executiveSummarySchema } from "../../schemas/cv.schema";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ExecutiveSummaryFormProps {
	onSubmit: (data: ExecutiveSummarySchema) => void;
	onSaveDraft: () => void;
	initialData: ExecutiveSummarySchema;
}

export function ExecutiveSummaryForm({
	onSubmit,
	onSaveDraft,
	initialData,
}: ExecutiveSummaryFormProps) {
	const defaultValues: ExecutiveSummarySchema = {
		jobTitle: initialData?.jobTitle || "",
		executiveSummary: initialData?.executiveSummary || "",
	};

	const form = useForm<ExecutiveSummarySchema>({
		resolver: zodResolver(executiveSummarySchema),
		defaultValues,
		mode: "onChange",
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 p-4">
				<FormField
					control={form.control}
					name="jobTitle"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>Job Title</FormLabel>
							<FormControl>
								<Input {...field} value={field.value || ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="executiveSummary"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>Executive Summary</FormLabel>
							<FormControl>
								<Textarea {...field} value={field.value || ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="col-span-2 flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={async () => {
							const isValid = await form.trigger();
							if (isValid) {
								onSubmit(form.getValues());
								onSaveDraft();
							}
						}}
					>
						Save Draft
					</Button>
					<Button type="submit">Save & Continue</Button>
				</div>
			</form>
		</Form>
	);
}
