import { pgTable, unique, text, timestamp, varchar, foreignKey, jsonb, boolean, primaryKey, integer } from "drizzle-orm/pg-core"
// import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	password: varchar({ length: 255 }).notNull(),
	resetToken: text("reset_token"),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => {
	return {
		usersEmailUnique: unique("users_email_unique").on(table.email),
	}
});

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => {
	return {
		sessionUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_userId_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const cvs = pgTable("cvs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	status: varchar({ length: 50 }).notNull(),
	formData: jsonb("form_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	title: text().notNull(),
	isAiAssisted: boolean("is_ai_assisted").default(false).notNull(),
}, (table) => {
	return {
		cvsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cvs_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => {
	return {
		verificationTokenIdentifierTokenPk: primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
	}
});

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => {
	return {
		authenticatorUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "authenticator_userId_users_id_fk"
		}).onDelete("cascade"),
		authenticatorUserIdCredentialIdPk: primaryKey({ columns: [table.credentialId, table.userId], name: "authenticator_userId_credentialID_pk"}),
		authenticatorCredentialIdUnique: unique("authenticator_credentialID_unique").on(table.credentialId),
	}
});

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => {
	return {
		accountUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_userId_users_id_fk"
		}).onDelete("cascade"),
		accountProviderProviderAccountIdPk: primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
	}
});
