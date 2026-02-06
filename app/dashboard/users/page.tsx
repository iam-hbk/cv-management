"use client";

import { format } from "date-fns";
import { Eye, Pencil, Search, Trash2, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
} from "../../../components/ui/alert-dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../../components/ui/table";
import { AddUserDialog } from "../../../components/users/add-user-dialog";
import { EditUserDialog } from "../../../components/users/edit-user-dialog";
import { useDeleteUser, useUsers } from "../../../queries/users";

interface UserRow {
	_id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: number;
}

export default function UsersPage() {
	const { data: users, isLoading } = useUsers();
	const deleteUser = useDeleteUser();
	const [search, setSearch] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [userToEdit, setUserToEdit] = useState<UserRow | null>(null);

	const filteredUsers = useMemo(() => {
		if (!search.trim()) return users as UserRow[];
		const q = search.toLowerCase();
		return (users as UserRow[]).filter(
			(user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
		);
	}, [users, search]);

	const handleDeleteClick = (user: UserRow) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!userToDelete) return;
		try {
			await deleteUser({ id: userToDelete._id });
			toast.success("User deleted successfully");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete user");
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const handleEditClick = (user: UserRow) => {
		setUserToEdit(user);
		setEditDialogOpen(true);
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<Skeleton className="h-10 w-80" />
				<div className="space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Users</h1>
					<p className="text-muted-foreground">Manage system users and their access</p>
				</div>
				<AddUserDialog />
			</div>

			{/* Search */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by name or email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Badge variant="secondary" className="text-sm">
					{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
				</Badge>
			</div>

			{/* Users Table */}
			{filteredUsers.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
					<UsersIcon className="mb-3 h-12 w-12 text-muted-foreground" />
					<p className="text-muted-foreground">
						{search ? "No users match your search" : "No users yet"}
					</p>
					{!search && (
						<p className="mt-2 text-sm text-muted-foreground">Add your first user to get started</p>
					)}
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => (
								<TableRow key={user._id}>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge variant={user.emailVerified ? "default" : "secondary"}>
											{user.emailVerified ? "Verified" : "Unverified"}
										</Badge>
									</TableCell>
									<TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											<Button variant="ghost" size="icon" asChild>
												<Link href={`/dashboard/users/${user._id}`}>
													<Eye className="h-4 w-4" />
												</Link>
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)}>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium">{userToDelete?.name}</span>? This action cannot be
							undone. All their sessions will be terminated.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit User Dialog */}
			{userToEdit && (
				<EditUserDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} user={userToEdit} />
			)}
		</div>
	);
}
