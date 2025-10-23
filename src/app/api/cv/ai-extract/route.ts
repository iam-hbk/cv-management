import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { CVFormData } from "@/schemas/cv.schema";
import { CV_EXTRACTION_PROMPT } from "@/lib/utils";

// AI response schema based on CVFormData
const aiResponseSchema = z.object({
  isValidCV: z.boolean().describe("Whether this is a valid CV"),
  validationMessage: z.string().describe("Reason if CV is invalid"),
  status: z.enum(["draft", "completed"]).describe("CV status"),
  jobTitle: z.string().describe("Main job title from the CV"),
  formData: z.custom<CVFormData>(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const session = await auth();
    const file = formData.get("cv") as File;

    const userId = session?.user?.id;

    console.log("userId", userId);
    console.log("file", file);


    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "A CV file is required" },
        { status: 400 },
      );
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, DOCX, and TXT files are supported" },
        { status: 400 },
      );
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    // Extract CV data with AI using structured output
    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: aiResponseSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: CV_EXTRACTION_PROMPT,
            },
            {
              type: "file",
              data: await file.arrayBuffer(),
              mediaType: file.type,
            },
          ],
        },
      ],
      maxRetries: 2,
    });
    console.log("PROMPT", CV_EXTRACTION_PROMPT);

    const parsedData = result.object;

    // Check if CV is valid
    if (!parsedData.isValidCV) {
      return NextResponse.json(
        {
          error: "Invalid CV",
          reason: parsedData.validationMessage,
        },
        { status: 400 },
      );
    }

    // Create CV record in database
    const cvData = {
      userId,
      status: parsedData.status,
      jobTitle: parsedData.jobTitle,
      formData: parsedData.formData,
      isAiAssisted: true,
    };

    const [cv] = await db.insert(cvs).values(cvData).returning();

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      extractedData: parsedData,
    });
  } catch (error: unknown) {
    console.error("Error processing CV:", error);

    let errorMessage = "Failed to process CV";
    const statusCode = 500;

    if (error instanceof Error && error.message?.includes("API key")) {
      errorMessage = "AI service configuration error";
    } else if (error instanceof Error && error.message?.includes("timeout")) {
      errorMessage = "Processing timeout";
    } else if (error instanceof Error && error.message?.includes("schema")) {
      errorMessage = "Data extraction error";
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
