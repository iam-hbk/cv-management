"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillsSchema, SkillsSchema } from "@/schemas/cv.schema";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const proficiencyLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

const currentYear = new Date().getFullYear();

interface SkillsFormProps {
  onSubmit: (data: SkillsSchema) => void;
  initialData: SkillsSchema;
}

export function SkillsForm({ onSubmit, initialData }: SkillsFormProps) {
  const form = useForm<SkillsSchema>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      computerSkills: initialData.computerSkills,
      otherSkills: initialData.otherSkills,
      skillsMatrix:
        initialData.skillsMatrix.length > 0
          ? initialData.skillsMatrix
          : undefined,
    },
  });

  const {
    fields: computerSkillsFields,
    append: appendComputerSkill,
    remove: removeComputerSkill,
  } = {
    fields: form
      .watch("computerSkills")
      .map((value, index) => ({ id: index, value })),
    append: (value: string) => {
      const currentSkills = form.getValues("computerSkills");
      form.setValue("computerSkills", [...currentSkills, value]);
    },
    remove: (index: number) => {
      const currentSkills = form.getValues("computerSkills");
      form.setValue(
        "computerSkills",
        currentSkills.filter((_, i) => i !== index),
      );
    },
  };

  const {
    fields: otherSkillsFields,
    append: appendOtherSkill,
    remove: removeOtherSkill,
  } = {
    fields: form
      .watch("otherSkills")
      .map((value, index) => ({ id: index, value })),
    append: (value: string) => {
      const currentSkills = form.getValues("otherSkills");
      form.setValue("otherSkills", [...currentSkills, value]);
    },
    remove: (index: number) => {
      const currentSkills = form.getValues("otherSkills");
      form.setValue(
        "otherSkills",
        currentSkills.filter((_, i) => i !== index),
      );
    },
  };

  const skillsMatrix = useFieldArray({
    control: form.control,
    name: "skillsMatrix",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Computer Skills Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Computer Skills</h3>
          {computerSkillsFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`computerSkills.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Enter computer skill" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {computerSkillsFields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeComputerSkill(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendComputerSkill("")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Computer Skill
          </Button>
        </div>

        {/* Other Skills Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Other Skills</h3>
          {otherSkillsFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`otherSkills.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Enter other skill" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {otherSkillsFields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeOtherSkill(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendOtherSkill("")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Other Skill
          </Button>
        </div>

        {/* Skills Matrix Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Skills Matrix</h3>
          {skillsMatrix.fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`skillsMatrix.${index}.skill`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., JavaScript, Project Management"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skillsMatrix.${index}.yearsExperience`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skillsMatrix.${index}.proficiency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skillsMatrix.${index}.lastUsed`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Used (Year)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1900}
                            max={currentYear}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {skillsMatrix.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                    onClick={() => skillsMatrix.remove(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Skill
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              skillsMatrix.append({
                skill: "",
                yearsExperience: 0,
                proficiency: "Beginner",
                lastUsed: currentYear,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Skill Matrix Entry
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Save & Continue
        </Button>
      </form>
    </Form>
  );
}
