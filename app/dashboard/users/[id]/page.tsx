"use client";

import { format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	Key,
	Mail,
	Pencil,
	Shield,
	Trash2,
	User as UserIcon,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Skeleton } from "../../../../components/ui/skeleton";
import { ChangePasswordDialog } from "../../../../components/users/change-password-dialog";
import { EditUserDialog } from "../../../../components/users/edit-user-dialog";
import { useDeleteUser, useUser } from "../../../../queries/users";

interface UserDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
	const { id } = use(params);
	const router = useRouter();
	const userResult = useUser(id);
	const deleteUser = useDeleteUser();
	const isLoading = userResult === undefined;
	const user = userResult ?? null;

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

	const handleDeleteConfirm = async () => {
		if (!user) return;
		try {
			await deleteUser({ id: user._id });
			toast.success("User deleted successfully");
			router.push("/dashboard/users");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete user");
		} finally {
			setDeleteDialogOpen(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center">
				<UserIcon className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="text-lg font-semibold">User not found</h2>
				<p className="text-muted-foreground">
					The user you&apos;re looking for doesn&apos;t exist or has been deleted.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/users">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Users
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/dashboard/users">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
							<Badge variant={user.emailVerified ? "default" : "secondary"}>
								{user.emailVerified ? "Verified" : "Unverified"}
							</Badge>
						</div>
						<p className="text-muted-foreground">{user.email}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => setEditDialogOpen(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</Button>
					<Button
						variant="outline"
						className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
						onClick={() => setDeleteDialogOpen(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</Button>
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Info Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							Basic Information
						</CardTitle>
						<CardDescription>User account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Email</span>
							</div>
							<span className="font-medium">{user.email}</span>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								{user.emailVerified ? (
									<CheckCircle className="h-4 w-4 text-green-500" />
								) : (
									<XCircle className="h-4 w-4 text-muted-foreground" />
								)}
								<span className="text-sm text-muted-foreground">Email Status</span>
							</div>
							<span className="font-medium">
								{user.emailVerified ? "Verified" : "Not Verified"}
							</span>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Created</span>
							</div>
							<span className="font-medium">
								{format(new Date(user.createdAt), "MMM d, yyyy 'at' h:mm a")}
							</span>
						</div>
						{user.updatedAt && (
							<>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Last Updated</span>
									</div>
									<span className="font-medium">
										{format(new Date(user.updatedAt), "MMM d, yyyy 'at' h:mm a")}
									</span>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Security Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Security
						</CardTitle>
						<CardDescription>Account security settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Key className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Password</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant={user.hasPassword ? "default" : "secondary"}>
									{user.hasPassword ? "Set" : "Not Set"}
								</Badge>
								<Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
									{user.hasPassword ? "Change" : "Set Password"}
								</Button>
							</div>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Two-Factor Auth</span>
							</div>
							<Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
								{user.twoFactorEnabled ? "Enabled" : "Disabled"}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <span className="font-medium">{user.name}</span>? This
							action cannot be undone. All their sessions will be terminated immediately.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit User Dialog */}
			<EditUserDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} user={user} />

			{/* Change Password Dialog */}
			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
				userId={user._id}
				userName={user.name}
			/>
		</div>
	);
}
