"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VacancyDetail } from "@/components/admin/vacancy-detail";
import { VacancyEditForm } from "@/components/admin/vacancy-edit-form";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";

export default function VacancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<"vacancies">;

  const vacancy = useQuery(api.vacancies.getVacancyById, { id });
  const deleteVacancy = useMutation(api.vacancies.deleteVacancy);

  const isLoading = vacancy === undefined;

  const handleDelete = async () => {
    try {
      await deleteVacancy({ id });
      toast.success("Vacancy deleted successfully");
      router.push("/dashboard/vacancies");
    } catch (error) {
      toast.error("Failed to delete vacancy");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (vacancy === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Vacancy Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The vacancy you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/dashboard/vacancies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vacancies
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/vacancies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{vacancy.jobTitle}</h1>
            <p className="text-muted-foreground">{vacancy.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VacancyEditForm vacancy={vacancy} />
          <DeleteConfirmation
            title="Delete Vacancy"
            description={`Are you sure you want to delete "${vacancy.jobTitle}" at ${vacancy.companyName}? This action cannot be undone.`}
            onConfirm={handleDelete}
            trigger={
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            }
          />
        </div>
      </div>

      <VacancyDetail vacancy={vacancy} />
    </div>
  );
}
