import { NextRequest, NextResponse } from "next/server";
import { getCVById } from "@/lib/cv";
type Params = Promise<{ id: string }>;
export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;
    const cv = await getCVById(id);
    console.log("\n\ncv", cv);
    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
