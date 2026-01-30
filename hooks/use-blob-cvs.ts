import { useQuery } from "@tanstack/react-query";

export interface BlobCV {
	url: string;
	pathname: string;
	filename: string;
	uploadedAt: string;
	size: number;
}

export function useBlobCVs() {
	return useQuery<{ success: boolean; data: BlobCV[] }>({
		queryKey: ["blob-cvs"],
		queryFn: async () => {
			const response = await fetch("/api/blob/list");
			if (!response.ok) {
				throw new Error("Failed to fetch CVs");
			}
			return response.json();
		},
	});
}
