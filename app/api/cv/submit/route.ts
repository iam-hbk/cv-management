import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { cvs } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import type { CVFormData } from "../../../../schemas/cv.schema";

interface SubmitCVRequest extends CVFormData {
  isAiAssisted?: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = (await request.json()) as SubmitCVRequest;
    const { isAiAssisted = false } = data;

    const cv = await db
      .insert(cvs)
      .values({
        jobTitle: "", // TODO: Add jobTitle
        isAiAssisted: isAiAssisted,
        userId: session.user.id,
        updatedBy: session.user.id,
        status: "completed",
        formData: data,
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
