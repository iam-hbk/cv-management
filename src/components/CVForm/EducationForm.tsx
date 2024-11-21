// src/components/CVForm/EducationForm.tsx
"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EducationSchema, educationSchema } from "@/schemas/cv.schema";
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
import { z } from "zod";

export function EducationForm({
  onSubmit,
}: {
  onSubmit: (data: EducationSchema[]) => void;
}) {
  const form = useForm<{ qualifications: EducationSchema[] }>({
    resolver: zodResolver(
      z.object({
        qualifications: educationSchema.array(),
      }),
    ),
    defaultValues: {
      qualifications: [
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
    name: "qualifications",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log("--------->>>>>>>>>", data);
          onSubmit(data.qualifications);
        })}
      >
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`qualifications.${index}.institution`}
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
                    name={`qualifications.${index}.qualification`}
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
                    name={`qualifications.${index}.completionDate`}
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
                    name={`qualifications.${index}.completed`}
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

          <Button
            onClick={() => {
              if (!form.formState.isValid) {
                console.log(
                  "--------->>>>>>>>>",
                  form.getValues().qualifications,
                );
                console.log(form.formState.errors);
                toast.error("Please fill in all required fields", {
                  description: <FormErrors errors={form.formState.errors} />,
                });
              }
            }}
            type="submit"
            className="w-full"
          >
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
