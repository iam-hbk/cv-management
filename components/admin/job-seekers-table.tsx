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
import { ArrowUpDown, ChevronDown, Download, Eye, Search, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
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
import { DeleteConfirmation } from "./delete-confirmation";
import { useJobSeekerFilters } from "@/hooks/use-job-seeker-filters";

interface JobSeekersTableProps {
	jobSeekers: Doc<"jobSeekers">[];
}

export function JobSeekersTable({ jobSeekers }: JobSeekersTableProps) {
	const { search, setSearch } = useJobSeekerFilters();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [deletingId, setDeletingId] = React.useState<Id<"jobSeekers"> | null>(null);

	const deleteJobSeeker = useMutation(api.jobSeekers.deleteJobSeeker);

	const filteredData = React.useMemo(() => {
		if (!search) return jobSeekers;

		const searchLower = search.toLowerCase();
		return jobSeekers.filter(
			(js) =>
				js.firstName.toLowerCase().includes(searchLower) ||
				js.lastName.toLowerCase().includes(searchLower) ||
				js.email.toLowerCase().includes(searchLower) ||
				js.ethnicity.toLowerCase().includes(searchLower)
		);
	}, [jobSeekers, search]);

	const handleDelete = async (id: Id<"jobSeekers">) => {
		setDeletingId(id);
		try {
			await deleteJobSeeker({ id });
			toast.success("Job seeker deleted successfully");
		} catch (error) {
			toast.error("Failed to delete job seeker");
			console.error(error);
		} finally {
			setDeletingId(null);
		}
	};

	const columns: ColumnDef<Doc<"jobSeekers">>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
						<User className="h-4 w-4 text-primary" />
					</div>
					<span className="font-medium">
						{row.original.firstName} {row.original.lastName}
					</span>
				</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "ethnicity",
			header: "Ethnicity",
		},
		{
			accessorKey: "currentSalaryRange",
			header: "Salary Range",
		},
		{
			accessorKey: "_creationTime",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Submission Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => format(new Date(row.getValue("_creationTime")), "MMM d, yyyy"),
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const jobSeeker = row.original;
				return (
					<div className="flex items-center justify-end gap-2">
						{jobSeeker.cvUploadPath && (
							<Button variant="ghost" size="icon" asChild>
								<a
									href={jobSeeker.cvUploadPath}
									target="_blank"
									rel="noopener noreferrer"
									title="Download CV"
								>
									<Download className="h-4 w-4" />
								</a>
							</Button>
						)}
						<Button variant="ghost" size="icon" asChild>
							<Link href={`/dashboard/job-seekers/${jobSeeker._id}`}>
								<Eye className="h-4 w-4" />
							</Link>
						</Button>
						<DeleteConfirmation
							title="Delete Job Seeker"
							description={`Are you sure you want to delete ${jobSeeker.firstName} ${jobSeeker.lastName}? This action cannot be undone.`}
							onConfirm={() => handleDelete(jobSeeker._id)}
							isLoading={deletingId === jobSeeker._id}
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

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 flex-1">
					<div className="relative max-w-sm flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by name, email, ethnicity..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<span className="text-sm text-muted-foreground">
						{filteredData.length} of {jobSeekers.length} job seekers
					</span>
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
									No job seekers found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} of {jobSeekers.length} job seekers
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
