import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs, DraftCV } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = (await request.json()) as DraftCV;

    const cv = await db
      .insert(cvs)
      .values({
        ...data,
        userId: session.user.id,
        status: "draft",
        jobTitle: data.jobTitle,
      })
      .returning();

    return NextResponse.json(cv[0]);
  } catch (error) {
    console.error("Error saving CV draft:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
