"use client";

import * as React from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	RowSelectionState,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	Search,
	Trash2,
	CheckCircle,
	XCircle,
	Star,
	Award,
	FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import {
	applicationColumns,
	ApplicationStatusBadge,
	ApplicationWithDetails,
	ApplicationStatus,
} from "./applications-columns";
import { useApplicationFilters } from "@/hooks/use-application-filters";

interface ApplicationsTableProps {
	applications: ApplicationWithDetails[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
	const {
		status: filterStatus,
		setStatus: setFilterStatus,
		search,
		setSearch,
	} = useApplicationFilters();

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

	const updateStatus = useMutation(api.applications.updateApplicationStatus);
	const bulkUpdateStatus = useMutation(api.applications.bulkUpdateApplicationStatus);
	const deleteApplication = useMutation(api.applications.deleteApplication);
	const sendStatusEmail = useAction(api.applicationsActions.sendApplicationStatusEmail);
	const sendBulkStatusEmails = useAction(api.applicationsActions.sendBulkApplicationStatusEmails);

	const [isLoading, setIsLoading] = React.useState(false);

	const filteredData = React.useMemo(() => {
		let filtered = applications;

		// Filter by status
		if (filterStatus !== "all") {
			filtered = filtered.filter((app) => app.status === filterStatus);
		}

		// Filter by search
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(app) =>
					app.jobSeeker?.firstName?.toLowerCase().includes(searchLower) ||
					app.jobSeeker?.lastName?.toLowerCase().includes(searchLower) ||
					app.jobSeeker?.email?.toLowerCase().includes(searchLower) ||
					app.vacancy?.jobTitle?.toLowerCase().includes(searchLower) ||
					app.vacancy?.companyName?.toLowerCase().includes(searchLower)
			);
		}

		return filtered;
	}, [applications, filterStatus, search]);

	// Handler callbacks must be defined before they're used in useMemo
	const handleStatusChange = React.useCallback(
		async (id: Id<"applications">, status: ApplicationStatus) => {
			setIsLoading(true);
			try {
				await updateStatus({ id, status, performedBy: "admin" });
				await sendStatusEmail({ applicationId: id, status });
				toast.success(`Application marked as ${status}`);
			} catch (error) {
				toast.error(`Failed to update status`);
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		},
		[updateStatus, sendStatusEmail]
	);

	const handleDelete = React.useCallback(
		async (id: Id<"applications">) => {
			setIsLoading(true);
			try {
				await deleteApplication({ id, performedBy: "admin" });
				toast.success("Application deleted");
			} catch (error) {
				toast.error("Failed to delete application");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		},
		[deleteApplication]
	);

	const columns = React.useMemo(
		() =>
			applicationColumns({
				onStatusChange: handleStatusChange,
				onDelete: handleDelete,
				isLoading,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[handleStatusChange, handleDelete, isLoading]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const hasSelection = selectedRows.length > 0;

	const handleBulkStatusChange = React.useCallback(
		async (status: Exclude<ApplicationStatus, "pending">) => {
			if (!hasSelection) return;

			setIsLoading(true);
			try {
				const ids = selectedRows.map((row) => row.original._id);
				await bulkUpdateStatus({ ids, status, performedBy: "admin" });
				await sendBulkStatusEmails({ applicationIds: ids, status });
				toast.success(`${selectedRows.length} applications marked as ${status}`);
				setRowSelection({});
			} catch (error) {
				toast.error(`Failed to update applications`);
				console.error(error);
			} finally {
				setIsLoading(false);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[hasSelection, selectedRows, bulkUpdateStatus, sendBulkStatusEmails]
	);

	const statusCounts = React.useMemo(() => {
		const counts = {
			all: applications.length,
			pending: applications.filter((a) => a.status === "pending").length,
			reviewed: applications.filter((a) => a.status === "reviewed").length,
			shortlisted: applications.filter((a) => a.status === "shortlisted").length,
			rejected: applications.filter((a) => a.status === "rejected").length,
			hired: applications.filter((a) => a.status === "hired").length,
		};
		return counts;
	}, [applications]);

	return (
		<div className="space-y-4">
			{/* Status Tabs */}
			<Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as ApplicationStatus)}>
				<TabsList className="flex-wrap h-auto">
					<TabsTrigger value="all">
						All
						<Badge variant="secondary" className="ml-2">
							{statusCounts.all}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="pending">
						Pending
						<Badge variant="secondary" className="ml-2">
							{statusCounts.pending}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="reviewed">
						Reviewed
						<Badge variant="secondary" className="ml-2">
							{statusCounts.reviewed}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="shortlisted">
						Shortlisted
						<Badge variant="secondary" className="ml-2">
							{statusCounts.shortlisted}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="rejected">
						Rejected
						<Badge variant="secondary" className="ml-2">
							{statusCounts.rejected}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="hired">
						Hired
						<Badge variant="secondary" className="ml-2">
							{statusCounts.hired}
						</Badge>
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Toolbar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 flex-1">
					<div className="relative max-w-sm flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by applicant or position..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Bulk Actions */}
					{hasSelection && (
						<div className="flex items-center gap-2 mr-4">
							<span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										Bulk Actions
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Change Status</DropdownMenuLabel>
									<DropdownMenuItem onClick={() => handleBulkStatusChange("reviewed")}>
										<CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
										Mark as Reviewed
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleBulkStatusChange("shortlisted")}>
										<Star className="mr-2 h-4 w-4 text-purple-500" />
										Mark as Shortlisted
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleBulkStatusChange("hired")}>
										<Award className="mr-2 h-4 w-4 text-green-500" />
										Mark as Hired
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleBulkStatusChange("rejected")}
										className="text-destructive"
									>
										<XCircle className="mr-2 h-4 w-4" />
										Mark as Rejected
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}

					{/* Column Visibility */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="ml-auto">
								Columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No applications found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
