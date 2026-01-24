"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Sparkles, Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useJobSeekersWithCVStatus,
  type CVStatus,
  type JobSeekerWithCVStatus,
} from "@/hooks/use-job-seekers-with-cv-status";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "raw", label: "Raw" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-az", label: "Name A-Z" },
  { value: "name-za", label: "Name Z-A" },
];

function StatusBadge({ status }: { status: CVStatus }) {
  const labels: Record<CVStatus, string> = {
    raw: "Raw",
    draft: "Draft",
    completed: "Built",
  };
  const variants: Record<CVStatus, "secondary" | "outline" | "default"> = {
    raw: "outline",
    draft: "secondary",
    completed: "default",
  };
  const icons: Record<CVStatus, React.ReactNode> = {
    raw: <FileText className="mr-1 h-3 w-3" />,
    draft: null,
    completed: null,
  };
  return (
    <Badge variant={variants[status]} className="gap-0.5">
      {icons[status]}
      {labels[status]}
    </Badge>
  );
}

export function JobSeekersCVTable() {
  const { data, isLoading } = useJobSeekersWithCVStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          `${r.jobSeeker.firstName} ${r.jobSeeker.lastName}`
            .toLowerCase()
            .includes(q) || r.jobSeeker.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => r.cvStatus === statusFilter);
    }
    if (sort === "recent") {
      list = [...list];
    } else if (sort === "oldest") {
      list = [...list].reverse();
    } else if (sort === "name-az") {
      list = [...list].sort((a, b) =>
        `${a.jobSeeker.firstName} ${a.jobSeeker.lastName}`.localeCompare(
          `${b.jobSeeker.firstName} ${b.jobSeeker.lastName}`
        )
      );
    } else if (sort === "name-za") {
      list = [...list].sort((a, b) =>
        `${b.jobSeeker.firstName} ${b.jobSeeker.lastName}`.localeCompare(
          `${a.jobSeeker.firstName} ${a.jobSeeker.lastName}`
        )
      );
    }
    return list;
  }, [data, search, statusFilter, sort]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const columns: DataTableColumn<JobSeekerWithCVStatus>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: (r) =>
          `${r.jobSeeker.firstName} ${r.jobSeeker.lastName}`.trim() || "-",
      },
      {
        id: "email",
        header: "Email",
        accessor: (r) => r.jobSeeker.email,
      },
      {
        id: "status",
        header: "CV Status",
        accessor: (r) => <StatusBadge status={r.cvStatus} />,
      },
      {
        id: "actions",
        header: "Actions",
        className: "text-right",
        accessor: (r) => (
          <div className="flex items-center justify-end gap-2">
            {r.cvStatus === "completed" && r.linkedCvId && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/curriculum-vitae/view/${r.linkedCvId}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/curriculum-vitae/edit/${r.linkedCvId}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
            {r.cvStatus === "draft" && r.linkedCvId && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/curriculum-vitae/edit/${r.linkedCvId}`}>
                  <Pencil className="h-4 w-4" />
                  Continue
                </Link>
              </Button>
            )}
            {r.cvStatus === "raw" && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/dashboard/curriculum-vitae/new/ai-extract?source=job-seeker&id=${r.jobSeeker._id}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Extract
                </Link>
              </Button>
            )}
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

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchPlaceholder="Search by name or email..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filterOptions={STATUS_OPTIONS}
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
        keyExtractor={(r) => r.jobSeeker._id}
        emptyMessage="No job seekers found."
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
