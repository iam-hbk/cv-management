import { db } from "../db";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { comparePasswords } from "../utils/password";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
	adapter: DrizzleAdapter(db),
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const { email, password } = credentials;
				if (!email || !password) return null;
				const user = await db.query.users.findFirst({
					where: eq(users.email, email as string),
				});

				if (!user || !user.hashedPassword) return null;

				const isValid = await comparePasswords(password as string, user.hashedPassword);

				if (!isValid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
});

export const getUser = async () => {
	const session = await auth();
	return session?.user;
};
