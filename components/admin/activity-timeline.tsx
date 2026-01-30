"use client";

import { format } from "date-fns";
import {
	Clock,
	CheckCircle,
	XCircle,
	Star,
	Award,
	FileText,
	Mail,
	User,
	AlertCircle,
	Trash2,
} from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityTimelineProps {
	activityLogs: Doc<"activityLogs">[];
}

const actionIcons: Record<string, React.ReactNode> = {
	created: <FileText className="h-4 w-4 text-blue-500" />,
	status_changed: <CheckCircle className="h-4 w-4 text-green-500" />,
	email_sent: <Mail className="h-4 w-4 text-purple-500" />,
	deleted: <Trash2 className="h-4 w-4 text-red-500" />,
};

const actionLabels: Record<string, string> = {
	created: "Application Created",
	status_changed: "Status Updated",
	email_sent: "Email Notification Sent",
	deleted: "Application Deleted",
};

export function ActivityTimeline({ activityLogs }: ActivityTimelineProps) {
	if (activityLogs.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Clock className="h-5 w-5" />
						Activity Timeline
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">No activity recorded yet.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Clock className="h-5 w-5" />
					Activity Timeline
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] pr-4">
					<div className="space-y-4">
						{activityLogs.map((log, index) => (
							<div key={`${log._id}-${index}`} className="flex gap-3">
								<div className="flex flex-col items-center">
									<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
										{actionIcons[log.action] || <AlertCircle className="h-4 w-4" />}
									</div>
									{index < activityLogs.length - 1 && (
										<div className="w-px h-full bg-border mt-2" />
									)}
								</div>
								<div className="flex-1 pb-4">
									<div className="flex items-center justify-between">
										<p className="font-medium text-sm">{actionLabels[log.action] || log.action}</p>
										<span className="text-xs text-muted-foreground">
											{format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
										</span>
									</div>
									{log.details && (
										<p className="text-sm text-muted-foreground mt-1">{log.details}</p>
									)}
									{log.performedBy && log.performedBy !== "system" && (
										<p className="text-xs text-muted-foreground mt-1">by {log.performedBy}</p>
									)}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
