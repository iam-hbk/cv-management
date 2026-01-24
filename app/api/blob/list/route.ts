import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: "CVs/",
    });

    // Transform blobs to include filename extracted from pathname
    const cvBlobs = blobs.map((blob) => {
      const pathnameParts = blob.pathname.split("/");
      const filename = pathnameParts[pathnameParts.length - 1] || blob.pathname;

      return {
        url: blob.url,
        pathname: blob.pathname,
        filename,
        uploadedAt: blob.uploadedAt,
        size: blob.size,
      };
    });

    return NextResponse.json({
      success: true,
      data: cvBlobs,
    });
  } catch (error) {
    console.error("Error listing CVs from blob storage:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list CVs",
      },
      { status: 500 }
    );
  }
}

