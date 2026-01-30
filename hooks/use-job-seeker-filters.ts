"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useJobSeekerFilters() {
	const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
	const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("createdAt"));
	const [order, setOrder] = useQueryState("order", parseAsString.withDefault("desc"));
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

	return {
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
