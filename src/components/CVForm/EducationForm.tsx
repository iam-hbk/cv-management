// src/components/CVForm/EducationForm.tsx
"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema, EducationSchema } from "@/schemas/cv.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import FormErrors from "./FormErrors";

interface EducationFormProps {
  onSubmit: (data: EducationSchema["educations"]) => void;
  initialData: EducationSchema["educations"];
  onSaveDraft: () => void;
}

export function EducationForm({
  onSubmit,
  initialData,
  onSaveDraft,
}: EducationFormProps) {
  const form = useForm<EducationSchema>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educations:
        initialData.length > 0
          ? initialData
          : [
              {
                institution: "",
                qualification: "",
                completionDate: new Date().getFullYear(),
                completed: false,
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data) => {
            console.log("Form data:", data);
            onSubmit(data.educations);
          },
          (errors) => {
            console.log("Form errors:", errors);
            toast.error("Please fill in all required fields", {
              description: <FormErrors errors={errors} />,
            });
          },
        )}
      >
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`educations.${index}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.qualification`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.completionDate`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Completion Year</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                {
                                  length:
                                    new Date().getFullYear() + 10 - 1950 + 1,
                                },
                                (_, i) => {
                                  const year =
                                    new Date().getFullYear() + 10 - i;
                                  return (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  );
                                },
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.completed`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Completed</FormLabel>
                        </div>
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
                    Remove Education
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
                institution: "",
                qualification: "",
                completionDate: new Date().getFullYear(),
                completed: false,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Qualification
          </Button>
          <div className="col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (form.formState.isValid) {
                  onSubmit(form.getValues().educations);
                  onSaveDraft();
                }
              }}
            >
              Save Draft
            </Button>
            <Button type="submit">Save & Continue</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
