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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const schema = z.object({
  postedBy: z.string().min(1, "Posted by is required"),
  companyName: z.string().min(1, "Company name is required"),
  postedByEmail: z.email("Invalid email"),
  postedByMobile: z.string().min(1, "Contact number is required"),
  postedBySource: z.string().min(1, "Source is required"),
  jobNiche: z.string().min(1, "Niche is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Description is required"),
  jobRegion: z.string().min(1, "Region is required"),
  workingModel: z.enum(["hybrid", "on-site", "remote"]),
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

export function AddVacancyDialog() {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const submitVacancyFromAdmin = useAction(
    api.vacanciesActions.submitVacancyFromAdmin
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      postedBy: "",
      companyName: "",
      postedByEmail: "",
      postedByMobile: "",
      postedBySource: "Admin",
      jobNiche: "",
      jobTitle: "",
      jobDescription: "",
      jobRegion: "",
      workingModel: "on-site",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!file) {
      toast.error("Please upload a vacancy document");
      return;
    }
    try {
      const { base64, fileName, contentType } = await fileToBase64(file);
      await submitVacancyFromAdmin({
        postedBy: values.postedBy,
        companyName: values.companyName,
        postedByEmail: values.postedByEmail,
        postedByMobile: values.postedByMobile,
        postedBySource: values.postedBySource,
        jobNiche: values.jobNiche,
        jobTitle: values.jobTitle,
        jobDescription: values.jobDescription,
        jobRegion: values.jobRegion,
        workingModel: values.workingModel,
        fileBase64: base64,
        fileName,
        contentType,
      });
      toast.success("Vacancy added and approved");
      setOpen(false);
      form.reset({
        ...form.formState.defaultValues,
        postedBySource: "Admin",
        workingModel: "on-site",
      });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add vacancy");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Vacancy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vacancy</DialogTitle>
          <DialogDescription>
            Add a vacancy. It will be created as approved. Upload a document
            (PDF, DOC, etc.).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Software Engineer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Company (Pty) Ltd" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobNiche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niche</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Technology" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Job description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Gauteng" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="on-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="postedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posted by</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contact name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postedByEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="email@company.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="postedByMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+27 12 345 6789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postedBySource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Admin, Website" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Vacancy document (PDF, DOC, etc.)</Label>
              <Input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-xs text-muted-foreground">{file.name}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding..." : "Add Vacancy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
