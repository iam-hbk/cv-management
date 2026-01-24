import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { clientEnv } from "../../../../config/client-env";
import { parseContentDispositionFilename } from "../../../../lib/content-disposition";
import { sanitizeForCvGenerate } from "../../../../lib/sanitize-cv-generate";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body and sanitize for external API (minLength 1, etc.)
    const body = await request.json();
    const bodyToSend = sanitizeForCvGenerate(body) as Record<string, unknown>;

    // Forward the request to the external API
    const apiUrl = `${clientEnv.NEXT_PUBLIC_CV_GENERATION_API_URL}/api/generate-cv`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyToSend),
    });

    if (!response.ok) {
      // Try to parse error response as JSON first
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          // Format validation errors nicely
          if (Array.isArray(errorData.detail)) {
            errorMessage = `Validation errors:\n${errorData.detail
              .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
              .join("\n")}`;
          } else {
            errorMessage = JSON.stringify(errorData.detail, null, 2);
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      } catch {
        // If not JSON, try text
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      
      console.error("API validation error:", errorMessage);
      console.error("Request body (sanitized):", JSON.stringify(bodyToSend, null, 2));

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    // Get the file blob
    const blob = await response.blob();

    // Prefer filename from request body; fallback to Content-Disposition; default CV.docx
    let filename: string;
    const pi = bodyToSend?.personalInfo as Record<string, unknown> | undefined;
    const first = pi?.firstName;
    const last = pi?.lastName;
    if (typeof first === "string" && typeof last === "string" && first && last) {
      filename = `CV_${first}_${last}.docx`;
    } else {
      const fromHeader = parseContentDispositionFilename(
        response.headers.get("content-disposition")
      );
      filename = fromHeader || "CV.docx";
    }
    filename = filename.replace(/["\\]/g, "_").replace(/\s+/g, " ").trim();
    if (!filename) filename = "CV.docx";

    // Return the file with proper headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate CV document",
      },
      { status: 500 },
    );
  }
}

