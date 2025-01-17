import { relations } from "drizzle-orm/relations";
import { users, session, cvs, authenticator, account } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(session),
	cvs: many(cvs),
	authenticators: many(authenticator),
	accounts: many(account),
}));

export const cvsRelations = relations(cvs, ({one}) => ({
	user: one(users, {
		fields: [cvs.userId],
		references: [users.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(users, {
		fields: [authenticator.userId],
		references: [users.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(users, {
		fields: [account.userId],
		references: [users.id]
	}),
}));