import { NextResponse } from "next/server";
import { getCVs } from "../../../../lib/cv";
import { auth } from "../../../../lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvs = await getCVs();

    // Return only recent CVs (limit to 10 most recent)
    const recentCVs = cvs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: recentCVs,
    });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch CVs",
      },
      { status: 500 }
    );
  }
}

