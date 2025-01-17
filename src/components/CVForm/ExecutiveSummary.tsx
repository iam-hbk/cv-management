"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExecutiveSummarySchema,
  executiveSummarySchema,
} from "@/schemas/cv.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 p-4"
      >
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
            onClick={() => {
              if (form.formState.isValid) {
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
