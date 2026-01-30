"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlobCVs, type BlobCV } from "@/hooks/use-blob-cvs";

function buildBlobPath(pathname: string): string {
	const pathSegments = pathname.split("/").filter(Boolean);
	return `/dashboard/curriculum-vitae/blob/${pathSegments.join("/")}`;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
	{ value: "recent", label: "Newest first" },
	{ value: "oldest", label: "Oldest first" },
	{ value: "name-az", label: "Name A-Z" },
	{ value: "name-za", label: "Name Z-A" },
	{ value: "size-asc", label: "Size (smallest)" },
	{ value: "size-desc", label: "Size (largest)" },
];

export function BlobCVsTable() {
	const { data, isLoading, error } = useBlobCVs();
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState("recent");
	const [page, setPage] = useState(1);

	const list = data?.data ?? [];

	const filtered = useMemo(() => {
		let arr = list;
		if (search.trim()) {
			const q = search.toLowerCase();
			arr = arr.filter((c) => c.filename.toLowerCase().includes(q));
		}
		if (sort === "recent") {
			arr = [...arr].sort(
				(a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
			);
		} else if (sort === "oldest") {
			arr = [...arr].sort(
				(a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
			);
		} else if (sort === "name-az") {
			arr = [...arr].sort((a, b) => a.filename.localeCompare(b.filename));
		} else if (sort === "name-za") {
			arr = [...arr].sort((a, b) => b.filename.localeCompare(a.filename));
		} else if (sort === "size-asc") {
			arr = [...arr].sort((a, b) => a.size - b.size);
		} else if (sort === "size-desc") {
			arr = [...arr].sort((a, b) => b.size - a.size);
		}
		return arr;
	}, [list, search, sort]);

	const paginated = useMemo(
		() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
		[filtered, page]
	);

	const columns: DataTableColumn<BlobCV>[] = useMemo(
		() => [
			{
				id: "filename",
				header: "Filename",
				accessor: (r) => r.filename,
			},
			{
				id: "size",
				header: "Size",
				accessor: (r) => formatFileSize(r.size),
			},
			{
				id: "uploadedAt",
				header: "Uploaded",
				accessor: (r) => format(new Date(r.uploadedAt), "MMM d, yyyy"),
			},
			{
				id: "actions",
				header: "Actions",
				className: "text-right",
				accessor: (r) => (
					<div className="flex items-center justify-end gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link href={buildBlobPath(r.pathname)}>
								<Eye className="h-4 w-4" />
							</Link>
						</Button>
						<Button variant="ghost" size="sm" asChild>
							<Link
								href={`/dashboard/curriculum-vitae/new/ai-extract?blobUrl=${encodeURIComponent(r.url)}`}
							>
								<Sparkles className="h-4 w-4" />
								Extract
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
				{error instanceof Error ? error.message : "Failed to load uploaded files"}
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<DataTableToolbar
				searchPlaceholder="Search by filename..."
				searchValue={search}
				onSearchChange={(v) => {
					setSearch(v);
					setPage(1);
				}}
				sortOptions={SORT_OPTIONS}
				sortValue={sort}
				onSortChange={setSort}
				extra={
					<Button asChild>
						<Link href="/dashboard/curriculum-vitae/new/ai-extract">Upload & Extract</Link>
					</Button>
				}
			/>
			<DataTable
				columns={columns}
				data={paginated}
				keyExtractor={(r) => r.pathname}
				emptyMessage="No uploaded files. Upload via AI Extract."
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
