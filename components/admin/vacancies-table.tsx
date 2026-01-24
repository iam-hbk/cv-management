"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { format } from "date-fns";
import { Eye, Trash2, Search, Download } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmation } from "./delete-confirmation";
import { StatusBadge } from "./status-badge";
import { StatusActions } from "./status-actions";

interface VacanciesTableProps {
  vacancies: Doc<"vacancies">[];
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function VacanciesTable({ vacancies }: VacanciesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<Id<"vacancies"> | null>(null);
  const [updatingId, setUpdatingId] = useState<Id<"vacancies"> | null>(null);

  const updateVacancyStatus = useMutation(api.vacancies.updateVacancyStatus);
  const deleteVacancy = useMutation(api.vacancies.deleteVacancy);
  const sendStatusEmail = useAction(api.vacanciesActions.sendVacancyStatusEmail);

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      searchQuery === "" ||
      vacancy.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.jobNiche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.jobRegion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vacancy.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (
    id: Id<"vacancies">,
    status: "approved" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      await updateVacancyStatus({ id, status });
      // Send email notification
      await sendStatusEmail({ vacancyId: id, status });
      toast.success(
        `Vacancy ${status === "approved" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      toast.error(`Failed to ${status} vacancy`);
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: Id<"vacancies">) => {
    setDeletingId(id);
    try {
      await deleteVacancy({ id });
      toast.success("Vacancy deleted successfully");
    } catch (error) {
      toast.error("Failed to delete vacancy");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = vacancies.filter((v) => v.status === "pending").length;
  const approvedCount = vacancies.filter((v) => v.status === "approved").length;
  const rejectedCount = vacancies.filter((v) => v.status === "rejected").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All ({vacancies.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vacancies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacancies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No vacancies found.
                </TableCell>
              </TableRow>
            ) : (
              filteredVacancies.map((vacancy) => (
                <TableRow key={vacancy._id}>
                  <TableCell className="font-medium">
                    {vacancy.jobTitle}
                  </TableCell>
                  <TableCell>{vacancy.companyName}</TableCell>
                  <TableCell>{vacancy.jobNiche}</TableCell>
                  <TableCell>{vacancy.jobRegion}</TableCell>
                  <TableCell>
                    <StatusBadge status={vacancy.status} />
                  </TableCell>
                  <TableCell>
                    {format(new Date(vacancy.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {vacancy.status === "pending" && (
                        <StatusActions
                          currentStatus={vacancy.status}
                          onApprove={() =>
                            handleStatusUpdate(vacancy._id, "approved")
                          }
                          onReject={() =>
                            handleStatusUpdate(vacancy._id, "rejected")
                          }
                          isLoading={updatingId === vacancy._id}
                        />
                      )}
                      {vacancy.vacancyFilePath && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={vacancy.vacancyFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/vacancies/${vacancy._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteConfirmation
                        title="Delete Vacancy"
                        description={`Are you sure you want to delete "${vacancy.jobTitle}" at ${vacancy.companyName}? This action cannot be undone.`}
                        onConfirm={() => handleDelete(vacancy._id)}
                        isLoading={deletingId === vacancy._id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
