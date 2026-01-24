"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandaloneCVs } from "@/queries/cv";

interface StandaloneCVRow {
  id: string;
  jobTitle: string;
  status: string;
  createdAt: Date;
  createdBy: { name: string; email: string };
}

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "recent", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-az", label: "Title A-Z" },
  { value: "title-za", label: "Title Z-A" },
];

export function StandaloneCVsTable() {
  const { data, isLoading, error } = useStandaloneCVs();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const rows: StandaloneCVRow[] = useMemo(
    () =>
      (data ?? []).map(
        (cv: {
          id: string;
          jobTitle: string;
          status: string;
          createdAt: Date | string;
          createdBy?: { name?: string; email?: string };
        }) => ({
          id: cv.id,
          jobTitle: cv.jobTitle,
          status: cv.status ?? "draft",
          createdAt:
            cv.createdAt instanceof Date
              ? cv.createdAt
              : new Date(cv.createdAt),
          createdBy: cv.createdBy ?? { name: "-", email: "" },
        })
      ),
    [data]
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.jobTitle.toLowerCase().includes(q) ||
          r.createdBy.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (sort === "recent") {
      list = [...list].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } else if (sort === "oldest") {
      list = [...list].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
    } else if (sort === "title-az") {
      list = [...list].sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
    } else if (sort === "title-za") {
      list = [...list].sort((a, b) => b.jobTitle.localeCompare(a.jobTitle));
    }
    return list;
  }, [rows, search, statusFilter, sort]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const columns: DataTableColumn<StandaloneCVRow>[] = useMemo(
    () => [
      {
        id: "jobTitle",
        header: "Job Title",
        accessor: (r) => r.jobTitle || "-",
      },
      {
        id: "createdBy",
        header: "Created By",
        accessor: (r) => r.createdBy.name,
      },
      {
        id: "status",
        header: "Status",
        accessor: (r) => (
          <Badge variant={r.status === "completed" ? "default" : "secondary"}>
            {r.status}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: "Created",
        accessor: (r) => format(r.createdAt, "MMM d, yyyy"),
      },
      {
        id: "actions",
        header: "Actions",
        className: "text-right",
        accessor: (r) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/curriculum-vitae/view/${r.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/curriculum-vitae/edit/${r.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load CVs"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchPlaceholder="Search by title or creator..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filterOptions={[
          { value: "draft", label: "Draft" },
          { value: "completed", label: "Completed" },
        ]}
        filterValue={statusFilter}
        onFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />
      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(r) => r.id}
        emptyMessage="No standalone CVs found. Create one from scratch or via AI Extract without linking to a job seeker."
      />
      <DataTablePagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
