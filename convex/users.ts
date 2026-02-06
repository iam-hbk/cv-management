import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Type for user data returned from Better Auth
export interface UserData {
	_id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: number;
	updatedAt: number;
	twoFactorEnabled: boolean | null;
	isAnonymous: boolean | null;
	username: string | null;
	displayUsername: string | null;
	phoneNumber: string | null;
	phoneNumberVerified: boolean | null;
}

// Get all users
export const getUsers = query({
	args: {},
	handler: async (ctx) => {
		// Verify the requester is authenticated
		const currentUser = await authComponent.getAuthUser(ctx);
		if (!currentUser) {
			throw new Error("Unauthorized");
		}

		// Query all users from Better Auth's user table
		const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
			model: "user",
			limit: 1000,
			paginationOpts: {
				cursor: null,
				numItems: 1000,
			},
			sortBy: { field: "createdAt", direction: "desc" },
		});

		return result?.page ?? [];
	},
});

// Get a single user by ID
export const getUserById = query({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		// Verify the requester is authenticated
		const currentUser = await authComponent.getAuthUser(ctx);
		if (!currentUser) {
			throw new Error("Unauthorized");
		}

		// Query the user by ID
		const result = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "_id", value: id }],
		});

		if (!result) {
			return null;
		}

		// Also get the account info to check if they have a password set
		const account = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "account",
			where: [
				{ field: "userId", value: id },
				{ field: "providerId", value: "credential", connector: "AND" },
			],
		});

		return {
			...result,
			hasPassword: !!account?.password,
		};
	},
});

// Internal mutation to create user via Better Auth adapter
export const createUserInternal = internalMutation({
	args: {
		name: v.string(),
		email: v.string(),
		hashedPassword: v.string(),
	},
	handler: async (ctx, { name, email, hashedPassword }) => {
		const now = Date.now();

		// Create the user
		const user = await ctx.runMutation(components.betterAuth.adapter.create, {
			input: {
				model: "user",
				data: {
					name,
					email,
					emailVerified: false,
					createdAt: now,
					updatedAt: now,
				},
			},
		});

		if (!user) {
			throw new Error("Failed to create user");
		}

		// Create the credential account with hashed password
		await ctx.runMutation(components.betterAuth.adapter.create, {
			input: {
				model: "account",
				data: {
					userId: user._id,
					accountId: user._id,
					providerId: "credential",
					password: hashedPassword,
					createdAt: now,
					updatedAt: now,
				},
			},
		});

		return user;
	},
});

// Action to create a new user (uses internal mutation)
export const createUser = action({
	args: {
		name: v.string(),
		email: v.string(),
		password: v.string(),
	},
	handler: async (
		ctx,
		{ name, email, password }
	): Promise<{ _id: string; name: string; email: string }> => {
		// Check if email already exists
		const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "email", value: email }],
		});

		if (existing) {
			throw new Error("A user with this email already exists");
		}

		// Hash the password using bcryptjs
		const bcrypt = await import("bcryptjs");
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user via internal mutation
		const user = await ctx.runMutation(internal.users.createUserInternal, {
			name,
			email,
			hashedPassword,
		});

		return user;
	},
});

// Update user details
export const updateUser = mutation({
	args: {
		id: v.string(),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
	},
	handler: async (ctx, { id, name, email }) => {
		// Verify the requester is authenticated
		const currentUser = await authComponent.getAuthUser(ctx);
		if (!currentUser) {
			throw new Error("Unauthorized");
		}

		// Build update data
		const updateData: {
			updatedAt: number;
			name?: string;
			email?: string;
		} = {
			updatedAt: Date.now(),
		};

		if (name !== undefined) {
			updateData.name = name;
		}

		if (email !== undefined) {
			// Check if email is already taken by another user
			const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
				model: "user",
				where: [{ field: "email", value: email }],
			});

			if (existing && existing._id !== id) {
				throw new Error("A user with this email already exists");
			}

			updateData.email = email;
		}

		// Update the user
		const result = await ctx.runMutation(components.betterAuth.adapter.updateOne, {
			input: {
				model: "user",
				where: [{ field: "_id", value: id }],
				update: updateData,
			},
		});

		return result;
	},
});

// Internal mutation to update password
export const updatePasswordInternal = internalMutation({
	args: {
		userId: v.string(),
		hashedPassword: v.string(),
	},
	handler: async (ctx, { userId, hashedPassword }) => {
		// Update the account password
		const result = await ctx.runMutation(components.betterAuth.adapter.updateOne, {
			input: {
				model: "account",
				where: [
					{ field: "userId", value: userId },
					{ field: "providerId", value: "credential", connector: "AND" },
				],
				update: {
					password: hashedPassword,
					updatedAt: Date.now(),
				},
			},
		});

		return result;
	},
});

// Action to update user password
export const updateUserPassword = action({
	args: {
		id: v.string(),
		newPassword: v.string(),
	},
	handler: async (ctx, { id, newPassword }) => {
		// Hash the new password
		const bcrypt = await import("bcryptjs");
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update via internal mutation
		await ctx.runMutation(internal.users.updatePasswordInternal, {
			userId: id,
			hashedPassword,
		});

		return { success: true };
	},
});

// Seed admin response types
type SeedAdminError = {
	success: false;
	message: string;
	existingUserCount?: number;
};

type SeedAdminSuccess = {
	success: true;
	message: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	credentials: {
		email: string;
		password: string;
	};
	nextSteps: string[];
};

type SeedAdminResult = SeedAdminError | SeedAdminSuccess;

// Seed the first admin user (run via: npx convex run users:seedAdmin)
export const seedAdmin = action({
	args: {
		email: v.optional(v.string()),
		password: v.optional(v.string()),
		name: v.optional(v.string()),
	},
	handler: async (ctx, args): Promise<SeedAdminResult> => {
		// Default credentials - CHANGE AFTER FIRST LOGIN
		const email = args.email ?? "admin@intobeing.com";
		const password = args.password ?? "AdminTemp123!";
		const name = args.name ?? "Admin";

		// Check if any users already exist
		const existingUsers = await ctx.runQuery(components.betterAuth.adapter.findMany, {
			model: "user",
			limit: 1,
			paginationOpts: {
				cursor: null,
				numItems: 1,
			},
		});

		if (existingUsers?.page && existingUsers.page.length > 0) {
			return {
				success: false,
				message: "Admin user already exists. No action taken.",
				existingUserCount: existingUsers.page.length,
			};
		}

		// Check if email is already taken (edge case)
		const existingEmail = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "email", value: email }],
		});

		if (existingEmail) {
			return {
				success: false,
				message: `User with email ${email} already exists.`,
			};
		}

		// Hash the password
		const bcrypt = await import("bcryptjs");
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the admin user via internal mutation
		const createdUser: { _id: string; name: string; email: string } = await ctx.runMutation(
			internal.users.createUserInternal,
			{
				name,
				email,
				hashedPassword,
			}
		);

		return {
			success: true,
			message: "Admin user created successfully!",
			user: {
				id: createdUser._id,
				name: createdUser.name,
				email: createdUser.email,
			},
			credentials: {
				email,
				password: "********", // Don't log the actual password
			},
			nextSteps: [
				"1. Go to your app login page",
				`2. Sign in with email: ${email}`,
				"3. Use the password you provided (or default: AdminTemp123!)",
				"4. IMPORTANT: Change your password immediately after login!",
			],
		};
	},
});

// Delete a user
export const deleteUser = mutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		// Verify the requester is authenticated
		const currentUser = await authComponent.getAuthUser(ctx);
		if (!currentUser) {
			throw new Error("Unauthorized");
		}

		// Don't allow deleting yourself
		if (currentUser.userId === id) {
			throw new Error("You cannot delete your own account");
		}

		// Delete all sessions for this user
		await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
			input: {
				model: "session",
				where: [{ field: "userId", value: id }],
			},
			paginationOpts: {
				cursor: null,
				numItems: 1000,
			},
		});

		// Delete all accounts for this user
		await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
			input: {
				model: "account",
				where: [{ field: "userId", value: id }],
			},
			paginationOpts: {
				cursor: null,
				numItems: 1000,
			},
		});

		// Delete the user
		await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
			input: {
				model: "user",
				where: [{ field: "_id", value: id }],
			},
		});

		return { success: true };
	},
});
