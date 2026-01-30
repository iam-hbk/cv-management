import { db } from "../../../../db";
import { users } from "../../../../db/schema";
import { registerSchema } from "../../../../schemas/auth.schema";
import { saltAndHashPassword } from "../../../../utils/password";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, password } = registerSchema.parse(body);

		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await saltAndHashPassword(password);

		// Create user
		const user = await db
			.insert(users)
			.values({
				email,
				hashedPassword,
			})
			.returning();

		return NextResponse.json({ user: user[0] });
	} catch (error) {
		return NextResponse.json({ error, message: "Something went wrong" }, { status: 500 });
	}
}
