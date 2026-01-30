"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export function DataTablePagination({
	page,
	pageSize,
	total,
	onPageChange,
	className,
}: DataTablePaginationProps) {
	const totalPages = Math.ceil(total / pageSize) || 1;
	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, total);

	return (
		<div
			className={cn(
				"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
				className
			)}
		>
			<p className="text-sm text-muted-foreground">
				Showing {total === 0 ? 0 : start}-{end} of {total}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<ChevronLeft className="h-4 w-4" />
					Prev
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
