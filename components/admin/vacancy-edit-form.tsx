"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface VacancyEditFormProps {
  vacancy: Doc<"vacancies">;
}

export function VacancyEditForm({ vacancy }: VacancyEditFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: vacancy.jobTitle,
    companyName: vacancy.companyName,
    jobNiche: vacancy.jobNiche,
    jobDescription: vacancy.jobDescription,
    jobRegion: vacancy.jobRegion,
    workingModel: vacancy.workingModel,
    postedBy: vacancy.postedBy,
    postedByEmail: vacancy.postedByEmail,
    postedByMobile: vacancy.postedByMobile,
  });

  const updateVacancy = useMutation(api.vacancies.updateVacancy);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateVacancy({
        id: vacancy._id,
        ...formData,
      });
      toast.success("Vacancy updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update vacancy");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Vacancy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Vacancy</DialogTitle>
          <DialogDescription>
            Make changes to the vacancy details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobNiche">Job Niche</Label>
              <Input
                id="jobNiche"
                value={formData.jobNiche}
                onChange={(e) =>
                  setFormData({ ...formData, jobNiche: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobRegion">Region</Label>
              <Input
                id="jobRegion"
                value={formData.jobRegion}
                onChange={(e) =>
                  setFormData({ ...formData, jobRegion: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingModel">Working Model</Label>
              <Select
                value={formData.workingModel}
                onValueChange={(value: "hybrid" | "on-site" | "remote") =>
                  setFormData({ ...formData, workingModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="on-site">On-Site</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postedBy">Posted By</Label>
              <Input
                id="postedBy"
                value={formData.postedBy}
                onChange={(e) =>
                  setFormData({ ...formData, postedBy: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postedByEmail">Contact Email</Label>
              <Input
                id="postedByEmail"
                type="email"
                value={formData.postedByEmail}
                onChange={(e) =>
                  setFormData({ ...formData, postedByEmail: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postedByMobile">Contact Mobile</Label>
              <Input
                id="postedByMobile"
                value={formData.postedByMobile}
                onChange={(e) =>
                  setFormData({ ...formData, postedByMobile: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              rows={5}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
