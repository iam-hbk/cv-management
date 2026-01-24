import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { cvs } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import type { CVFormData } from "../../../../schemas/cv.schema";

interface SubmitCVRequest extends CVFormData {
  isAiAssisted?: boolean;
  sourceJobSeekerId?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = (await request.json()) as SubmitCVRequest;
    const { isAiAssisted = false, sourceJobSeekerId = null, ...formData } = data;

    // Extract job title from personalInfo if available
    const jobTitle =
      (formData as CVFormData).personalInfo?.profession ?? "";

    const cv = await db
      .insert(cvs)
      .values({
        jobTitle: jobTitle || "",
        isAiAssisted,
        sourceJobSeekerId: sourceJobSeekerId ?? null,
        userId: session.user.id,
        updatedBy: session.user.id,
        status: "completed",
        formData: formData as CVFormData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(cv[0]);
  } catch (error) {
    console.error("Error submitting CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
