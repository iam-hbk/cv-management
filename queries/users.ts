import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Hook to get all users
export function useUsers() {
	const users = useQuery(api.users.getUsers);
	return {
		data: users ?? [],
		isLoading: users === undefined,
	};
}

// Hook to get a single user by ID
export function useUser(id: string | null | undefined) {
	return useQuery(api.users.getUserById, id ? { id } : "skip");
}

// Hook to create a new user
export function useCreateUser() {
	return useAction(api.users.createUser);
}

// Hook to update a user
export function useUpdateUser() {
	return useMutation(api.users.updateUser);
}

// Hook to update user password
export function useUpdateUserPassword() {
	return useAction(api.users.updateUserPassword);
}

// Hook to delete a user
export function useDeleteUser() {
	return useMutation(api.users.deleteUser);
}
