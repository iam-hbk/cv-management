"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  WorkExperienceSchema,
  workExperienceSchema,
} from "@/schemas/cv.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import FormErrors from "./FormErrors";
import { z } from "zod";

export function WorkExperienceForm({
  onSubmit,
}: {
  onSubmit: (data: WorkExperienceSchema[]) => void;
}) {
  const form = useForm<{ experiences: WorkExperienceSchema[] }>({
    resolver: zodResolver(
      z.object({
        experiences: workExperienceSchema.array(),
      })
    ),
    defaultValues: {
      experiences: [
        {
          company: "",
          position: "",
          startDate: new Date(),
          endDate: addDays(new Date(), 365),
          current: false,
          duties: [""],
          reasonForLeaving: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const handleDateRangeChange = (
    dateRange: DateRange | undefined,
    index: number,
  ) => {
    if (dateRange?.from) {
      form.setValue(`experiences.${index}.startDate`, dateRange.from);
    }
    if (dateRange?.to) {
      form.setValue(`experiences.${index}.endDate`, dateRange.to);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data.experiences))}>
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
                          <FormItem>
                            <FormLabel>Employment Period</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDateField.value ? (
                                      endDateField.value ? (
                                        <>
                                          {format(
                                            startDateField.value,
                                            "LLL dd, y",
                                          )}{" "}
                                          -{" "}
                                          {format(
                                            endDateField.value,
                                            "LLL dd, y",
                                          )}
                                        </>
                                      ) : (
                                        format(
                                          startDateField.value,
                                          "LLL dd, y",
                                        )
                                      )
                                    ) : (
                                      <span>Pick a date range</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  initialFocus
                                  mode="range"
                                  defaultMonth={startDateField.value}
                                  selected={
                                    startDateField.value
                                      ? {
                                          from: startDateField.value,
                                          to: endDateField.value || undefined,
                                        }
                                      : undefined
                                  }
                                  onSelect={(dateRange) =>
                                    handleDateRangeChange(dateRange, index)
                                  }
                                  numberOfMonths={2}
                                />
                              </PopoverContent>
                            </Popover>
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
                startDate: new Date(),
                endDate: new Date(),
                current: false,
                duties: [""],
                reasonForLeaving: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Experience
          </Button>

          <Button
            onClick={() => {
              if (!form.formState.isValid) {
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
