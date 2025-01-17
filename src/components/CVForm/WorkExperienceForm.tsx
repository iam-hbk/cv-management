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
// import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import FormErrors from "./FormErrors";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkExperienceFormProps {
  onSubmit: (data: WorkExperienceSchema["experiences"]) => void;
  initialData: WorkExperienceSchema["experiences"];
  onSaveDraft: () => void;
}

export function WorkExperienceForm({
  onSubmit,
  initialData,
}: WorkExperienceFormProps) {
  const form = useForm<WorkExperienceSchema>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      experiences:
        initialData.length > 0
          ? initialData
          : [
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
                                            startDateField.value,
                                            "LLL yyyy",
                                          )}
                                          {endDateField.value &&
                                            !form.watch(
                                              `experiences.${index}.current`,
                                            ) && (
                                              <>
                                                {" "}
                                                -{" "}
                                                {format(
                                                  endDateField.value,
                                                  "LLL yyyy",
                                                )}
                                              </>
                                            )}
                                          {form.watch(
                                            `experiences.${index}.current`,
                                          ) && " - Present"}
                                        </>
                                      ) : (
                                        <span>Select employment period</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <div className="border-b p-3">
                                    <div className="space-y-2">
                                      <div className="grid gap-2">
                                        <div className="flex items-center space-x-2">
                                          <FormLabel className="text-xs">
                                            Start Date
                                          </FormLabel>
                                          <select
                                            className="h-8 w-[100px] rounded-md border border-input px-2 text-sm"
                                            value={startDateField.value?.getFullYear()}
                                            onChange={(e) => {
                                              const newDate = new Date(
                                                startDateField.value ||
                                                  new Date(),
                                              );
                                              newDate.setFullYear(
                                                parseInt(e.target.value),
                                              );
                                              startDateField.onChange(newDate);
                                            }}
                                          >
                                            {Array.from(
                                              { length: 50 },
                                              (_, i) => (
                                                <option
                                                  key={i}
                                                  value={
                                                    new Date().getFullYear() - i
                                                  }
                                                >
                                                  {new Date().getFullYear() - i}
                                                </option>
                                              ),
                                            )}
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <Calendar
                                    mode="single"
                                    selected={startDateField.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        startDateField.onChange(date);
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
                                          format(endDateField.value, "LLL yyyy")
                                        ) : (
                                          <span>Select end date</span>
                                        )}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <div className="border-b p-3">
                                      <div className="space-y-2">
                                        <div className="grid gap-2">
                                          <div className="flex items-center space-x-2">
                                            <FormLabel className="text-xs">
                                              End Date
                                            </FormLabel>
                                            <select
                                              className="h-8 w-[100px] rounded-md border border-input px-2 text-sm"
                                              value={endDateField.value?.getFullYear()}
                                              onChange={(e) => {
                                                const newDate = new Date(
                                                  endDateField.value ||
                                                    new Date(),
                                                );
                                                newDate.setFullYear(
                                                  parseInt(e.target.value),
                                                );
                                                endDateField.onChange(newDate);
                                              }}
                                            >
                                              {Array.from(
                                                { length: 50 },
                                                (_, i) => (
                                                  <option
                                                    key={i}
                                                    value={
                                                      new Date().getFullYear() -
                                                      i
                                                    }
                                                  >
                                                    {new Date().getFullYear() -
                                                      i}
                                                  </option>
                                                ),
                                              )}
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <Calendar
                                      mode="single"
                                      selected={endDateField.value}
                                      onSelect={(date) => {
                                        if (date) {
                                          endDateField.onChange(date);
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

          <Button type="submit" className="w-full">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
