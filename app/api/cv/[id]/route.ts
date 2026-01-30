import { NextRequest, NextResponse } from "next/server";
import { getCVById } from "../../../../lib/cv";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../db";
import { cvs } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import type { CVFormData } from "../../../../schemas/cv.schema";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: Params }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		// Fetch CV by id (accessible to any authenticated user)
		const cv = await db.query.cvs.findFirst({
			where: eq(cvs.id, id),
			with: {
				user: {
					columns: {
						name: true,
						email: true,
					},
				},
				updatedByUser: {
					columns: {
						name: true,
						email: true,
					},
				},
			},
		});

		console.log("\n\ncv", cv);
		if (!cv) {
			return NextResponse.json({ error: "CV not found" }, { status: 404 });
		}

		if (!cv.formData) {
			return NextResponse.json({ error: "CV has no form data" }, { status: 400 });
		}

		const response = {
			id: cv.id,
			jobTitle: cv.jobTitle,
			createdAt: cv.createdAt ?? new Date(),
			createdBy: {
				name: cv.user?.name ?? cv.user?.email ?? "unknown",
				email: cv.user?.email ?? "unknown@example.com",
			},
			lastUpdatedBy: cv.updatedByUser
				? {
						name: cv.updatedByUser.name ?? cv.updatedByUser.email ?? "unknown",
						email: cv.updatedByUser.email ?? "unknown@example.com",
					}
				: null,
			isAiAssisted: cv.isAiAssisted,
			status: cv.status,
			formData: cv.formData,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error fetching CV:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existingCV = await db.query.cvs.findFirst({
			where: eq(cvs.id, id),
		});

		if (!existingCV) {
			return NextResponse.json({ error: "CV not found" }, { status: 404 });
		}

		const body = (await request.json()) as {
			formData?: CVFormData;
			jobTitle?: string;
			status?: "draft" | "completed";
		};

		const { formData, jobTitle, status } = body;

		// Update the CV; record last updater
		const updated = await db
			.update(cvs)
			.set({
				formData,
				jobTitle,
				status,
				updatedAt: new Date(),
				updatedBy: session.user.id,
			})
			.where(eq(cvs.id, id))
			.returning();

		if (!updated[0]) {
			return NextResponse.json({ error: "Failed to update CV" }, { status: 500 });
		}

		return NextResponse.json(updated[0]);
	} catch (error) {
		console.error("Error updating CV:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
