"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export type ApplicationStatus =
	| "all"
	| "pending"
	| "reviewed"
	| "shortlisted"
	| "rejected"
	| "hired";

export function useApplicationFilters() {
	const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));
	const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
	const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("createdAt"));
	const [order, setOrder] = useQueryState("order", parseAsString.withDefault("desc"));
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

	return {
		status: status as ApplicationStatus,
		setStatus,
		search,
		setSearch,
		sort,
		setSort,
		order: order as "asc" | "desc",
		setOrder,
		page,
		setPage,
	};
}
