"use client";

import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type VacancyStatus = "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: VacancyStatus;
  className?: string;
}

const statusConfig: Record<
  VacancyStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
