"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkExperienceSchema, workExperienceSchema } from "../../schemas/cv.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { Plus, Trash2 } from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
// import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import FormErrors from "./FormErrors";
import { Checkbox } from "../ui/checkbox";
import React from "react";

interface WorkExperienceFormProps {
	onSubmit: (data: WorkExperienceSchema["experiences"]) => void;
	initialData: WorkExperienceSchema["experiences"];
	onSaveDraft: () => void;
}

export function WorkExperienceForm({ onSubmit, initialData }: WorkExperienceFormProps) {
	// Normalize initial data to handle "N/A" values and invalid dates
	const normalizeInitialData = (data: WorkExperienceSchema["experiences"]) => {
		return data.map((exp) => ({
			...exp,
			startDate:
				exp.startDate && exp.startDate.trim() !== "" && exp.startDate.toLowerCase() !== "n/a"
					? exp.startDate
					: new Date().toISOString().split("T")[0],
			endDate:
				exp.endDate && exp.endDate.trim() !== "" && exp.endDate.toLowerCase() !== "n/a"
					? exp.endDate
					: addDays(new Date(), 365).toISOString().split("T")[0],
			reasonForLeaving:
				exp.reasonForLeaving && exp.reasonForLeaving.toLowerCase() !== "n/a"
					? exp.reasonForLeaving
					: "",
			duties: exp.duties && exp.duties.length > 0 ? exp.duties : [""],
		}));
	};

	const form = useForm<WorkExperienceSchema>({
		resolver: zodResolver(workExperienceSchema),
		defaultValues: {
			experiences:
				initialData.length > 0
					? normalizeInitialData(initialData)
					: [
							{
								company: "",
								position: "",
								startDate: new Date().toISOString().split("T")[0],
								endDate: addDays(new Date(), 365).toISOString().split("T")[0],
								current: false,
								duties: [""],
								reasonForLeaving: "",
							},
						],
		},
	});

	// Reset form when initialData changes to avoid duplication and stay in sync
	React.useEffect(() => {
		const defaultRow = {
			company: "",
			position: "",
			startDate: new Date().toISOString().split("T")[0],
			endDate: addDays(new Date(), 365).toISOString().split("T")[0],
			current: false,
			duties: [""],
			reasonForLeaving: "",
		};
		form.reset({
			experiences: initialData.length > 0 ? normalizeInitialData(initialData) : [defaultRow],
		});
	}, [initialData, form]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "experiences",
	});

	// Helper to convert string date to Date object for calendar
	const parseDate = (dateStr: string | undefined): Date | undefined => {
		if (!dateStr || dateStr.trim() === "" || dateStr.toLowerCase() === "n/a") {
			return undefined;
		}
		const date = new Date(dateStr);
		// Check if date is valid
		if (isNaN(date.getTime())) {
			return undefined;
		}
		return date;
	};

	// Helper to format Date to ISO string
	const formatDateToISO = (date: Date): string => {
		return date.toISOString().split("T")[0];
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(
					(data) => {
						console.log("Form data:", data);
						onSubmit(data.experiences);
					},
					(errors) => {
						console.log("Form errors:", errors);
						toast.error("Please fill in all required fields", {
							description: <FormErrors errors={errors} />,
						});
					}
				)}
			>
				<div className="space-y-4">
					{fields.map((field, index) => (
						<Card key={field.id}>
							<CardContent className="pt-6">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name={`experiences.${index}.company`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Company Name</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`experiences.${index}.position`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Position</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`experiences.${index}.startDate`}
										render={({ field: startDateField }) => (
											<FormField
												control={form.control}
												name={`experiences.${index}.endDate`}
												render={({ field: endDateField }) => (
													<FormItem className="col-span-2 space-y-4">
														<FormLabel>Employment Period</FormLabel>
														<div className="grid grid-cols-3">
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			variant="outline"
																			className="w-full justify-start text-left font-normal"
																		>
																			<CalendarIcon className="mr-2 h-4 w-4" />
																			{startDateField.value ? (
																				<>
																					{format(
																						parseDate(startDateField.value) || new Date(),
																						"LLL yyyy"
																					)}
																					{endDateField.value &&
																						!form.watch(`experiences.${index}.current`) && (
																							<>
																								{" "}
																								-{" "}
																								{format(
																									parseDate(endDateField.value) || new Date(),
																									"LLL yyyy"
																								)}
																							</>
																						)}
																					{form.watch(`experiences.${index}.current`) &&
																						" - Present"}
																				</>
																			) : (
																				<span>Select employment period</span>
																			)}
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-0" align="start">
																	<div className="border-b p-3">
																		<div className="space-y-2">
																			<div className="grid gap-2">
																				<div className="flex items-center space-x-2">
																					<FormLabel className="text-xs">Start Date</FormLabel>
																					<select
																						className="h-8 w-[100px] rounded-md border border-input px-2 text-sm"
																						value={
																							parseDate(startDateField.value)?.getFullYear() ||
																							new Date().getFullYear()
																						}
																						onChange={(e) => {
																							const currentDate =
																								parseDate(startDateField.value) || new Date();
																							const newDate = new Date(currentDate);
																							newDate.setFullYear(parseInt(e.target.value));
																							startDateField.onChange(formatDateToISO(newDate));
																						}}
																					>
																						{Array.from({ length: 50 }, (_, i) => (
																							<option key={i} value={new Date().getFullYear() - i}>
																								{new Date().getFullYear() - i}
																							</option>
																						))}
																					</select>
																				</div>
																			</div>
																		</div>
																	</div>
																	<Calendar
																		mode="single"
																		selected={parseDate(startDateField.value)}
																		onSelect={(date) => {
																			if (date) {
																				startDateField.onChange(formatDateToISO(date));
																			}
																		}}
																		initialFocus
																	/>
																</PopoverContent>
															</Popover>

															<FormField
																control={form.control}
																name={`experiences.${index}.current`}
																render={({ field }) => (
																	<div className="flex items-center justify-center space-x-2">
																		<Checkbox
																			checked={field.value}
																			onCheckedChange={field.onChange}
																			id={`current-${index}`}
																		/>
																		<label
																			htmlFor={`current-${index}`}
																			className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																		>
																			Currently work here
																		</label>
																	</div>
																)}
															/>

															{!form.watch(`experiences.${index}.current`) && (
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant="outline"
																				className="w-full justify-start text-left font-normal"
																			>
																				<CalendarIcon className="mr-2 h-4 w-4" />
																				{endDateField.value ? (
																					format(
																						parseDate(endDateField.value) || new Date(),
																						"LLL yyyy"
																					)
																				) : (
																					<span>Select end date</span>
																				)}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<div className="border-b p-3">
																			<div className="space-y-2">
																				<div className="grid gap-2">
																					<div className="flex items-center space-x-2">
																						<FormLabel className="text-xs">End Date</FormLabel>
																						<select
																							className="h-8 w-[100px] rounded-md border border-input px-2 text-sm"
																							value={
																								parseDate(endDateField.value)?.getFullYear() ||
																								new Date().getFullYear()
																							}
																							onChange={(e) => {
																								const currentDate =
																									parseDate(endDateField.value) || new Date();
																								const newDate = new Date(currentDate);
																								newDate.setFullYear(parseInt(e.target.value));
																								endDateField.onChange(formatDateToISO(newDate));
																							}}
																						>
																							{Array.from({ length: 50 }, (_, i) => (
																								<option
																									key={i}
																									value={new Date().getFullYear() - i}
																								>
																									{new Date().getFullYear() - i}
																								</option>
																							))}
																						</select>
																					</div>
																				</div>
																			</div>
																		</div>
																		<Calendar
																			mode="single"
																			selected={parseDate(endDateField.value)}
																			onSelect={(date) => {
																				if (date) {
																					endDateField.onChange(formatDateToISO(date));
																				}
																			}}
																			initialFocus
																		/>
																	</PopoverContent>
																</Popover>
															)}
														</div>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}
									/>

									<div className="col-span-2">
										<FormField
											control={form.control}
											name={`experiences.${index}.duties.0`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Main Duties & Responsibilities</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															placeholder="Enter your main duties and responsibilities..."
															className="h-24"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name={`experiences.${index}.reasonForLeaving`}
										render={({ field }) => (
											<FormItem className="col-span-2">
												<FormLabel>Reason for Leaving</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{fields.length > 1 && (
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="mt-4"
										onClick={() => remove(index)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Remove Experience
									</Button>
								)}
							</CardContent>
						</Card>
					))}

					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() =>
							append({
								company: "",
								position: "",
								startDate: new Date().toISOString().split("T")[0],
								endDate: addDays(new Date(), 365).toISOString().split("T")[0],
								current: false,
								duties: [""],
								reasonForLeaving: "",
							})
						}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Another Experience
					</Button>

					<Button type="submit" className="w-full">
						Save & Continue
					</Button>
				</div>
			</form>
		</Form>
	);
}
