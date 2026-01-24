"use client";

import { Button } from "../ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface StatusActionsProps {
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
  currentStatus?: "pending" | "approved" | "rejected";
}

export function StatusActions({
  onApprove,
  onReject,
  isLoading = false,
  currentStatus,
}: StatusActionsProps) {
  if (currentStatus !== "pending") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onApprove}
        disabled={isLoading}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReject}
        disabled={isLoading}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        Reject
      </Button>
    </div>
  );
}
