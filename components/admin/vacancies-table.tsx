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
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	Download,
	Eye,
	MoreHorizontal,
	Search,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
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
import { StatusBadge } from "./status-badge";
import { StatusActions } from "./status-actions";
import { DeleteConfirmation } from "./delete-confirmation";
import { useVacancyFilters, VacancyStatus } from "@/hooks/use-vacancy-filters";

interface VacanciesTableProps {
	vacancies: Doc<"vacancies">[];
}

export function VacanciesTable({ vacancies }: VacanciesTableProps) {
	const {
		status: filterStatus,
		setStatus: setFilterStatus,
		search,
		setSearch,
	} = useVacancyFilters();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [deletingId, setDeletingId] = React.useState<Id<"vacancies"> | null>(null);
	const [updatingId, setUpdatingId] = React.useState<Id<"vacancies"> | null>(null);

	const updateVacancyStatus = useMutation(api.vacancies.updateVacancyStatus);
	const deleteVacancy = useMutation(api.vacancies.deleteVacancy);
	const sendStatusEmail = useAction(api.vacanciesActions.sendVacancyStatusEmail);

	const filteredData = React.useMemo(() => {
		let filtered = vacancies;

		// Filter by status
		if (filterStatus !== "all") {
			filtered = filtered.filter((v) => v.status === filterStatus);
		}

		// Filter by search
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(v) =>
					v.jobTitle.toLowerCase().includes(searchLower) ||
					v.companyName.toLowerCase().includes(searchLower) ||
					v.jobNiche.toLowerCase().includes(searchLower) ||
					v.jobRegion.toLowerCase().includes(searchLower)
			);
		}

		return filtered;
	}, [vacancies, filterStatus, search]);

	const handleStatusUpdate = async (id: Id<"vacancies">, status: "approved" | "rejected") => {
		setUpdatingId(id);
		try {
			await updateVacancyStatus({ id, status });
			await sendStatusEmail({ vacancyId: id, status });
			toast.success(`Vacancy ${status === "approved" ? "approved" : "rejected"} successfully`);
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

	const columns: ColumnDef<Doc<"vacancies">>[] = [
		{
			accessorKey: "jobTitle",
			header: "Job Title",
			cell: ({ row }) => <span className="font-medium">{row.getValue("jobTitle")}</span>,
		},
		{
			accessorKey: "companyName",
			header: "Company",
		},
		{
			accessorKey: "jobNiche",
			header: "Niche",
		},
		{
			accessorKey: "jobRegion",
			header: "Region",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const vacancy = row.original;
				return (
					<div className="flex items-center justify-end gap-2">
						{vacancy.status === "pending" && (
							<StatusActions
								currentStatus={vacancy.status}
								onApprove={() => handleStatusUpdate(vacancy._id, "approved")}
								onReject={() => handleStatusUpdate(vacancy._id, "rejected")}
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
				);
			},
		},
	];

	const table = useReactTable({
		data: filteredData,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
		},
	});

	const statusCounts = React.useMemo(() => {
		return {
			all: vacancies.length,
			pending: vacancies.filter((v) => v.status === "pending").length,
			approved: vacancies.filter((v) => v.status === "approved").length,
			rejected: vacancies.filter((v) => v.status === "rejected").length,
		};
	}, [vacancies]);

	return (
		<div className="space-y-4">
			{/* Status Tabs */}
			<Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as VacancyStatus)}>
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
					<TabsTrigger value="approved">
						Approved
						<Badge variant="secondary" className="ml-2">
							{statusCounts.approved}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="rejected">
						Rejected
						<Badge variant="secondary" className="ml-2">
							{statusCounts.rejected}
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
							placeholder="Search vacancies..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
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
									No vacancies found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} of {vacancies.length} vacancies
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
