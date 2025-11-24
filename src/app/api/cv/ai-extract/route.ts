
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { cvSchema } from "@/schemas/cv.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file" },
        { status: 400 }
      );
    }

    // Convert the file's arrayBuffer to a Base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const charArray = Array.from(uint8Array, (byte) => String.fromCharCode(byte));
    const binaryString = charArray.join("");
    const base64Data = btoa(binaryString);
    const fileDataUrl = `data:application/pdf;base64,${base64Data}`;

    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following CV/Resume and extract all the details. 
              Return the data in the following structure:
              - executiveSummary: A brief professional summary (at least 50 characters)
              - jobTitle: The person's current or target job title (max 21 characters)
              - personalInfo: firstName, lastName, email, phone, profession, location, gender, availability, nationality, currentSalary, expectedSalary, driversLicense, idNumber
              - workHistory: Array of experiences with company, position, startDate, endDate, current, duties array, reasonForLeaving
              - education: Array of educations with institution, qualification, completionDate (as number/year), completed (boolean)
              - skills: computerSkills array, otherSkills array, skillsMatrix array with skill, yearsExperience, proficiency, lastUsed
              
              For dates, use string format. For salary and numeric fields, use numbers.
              If information is not available, use reasonable defaults or empty arrays.`,
            },
            {
              type: "file",
              data: fileDataUrl,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
      schema: cvSchema,
    });

    console.log("result\n\n", result);

    return NextResponse.json({
      success: true,
      data: result.object,
    });
  } catch (error) {
    console.error("Error processing CV:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process CV",
      },
      { status: 500 }
    );
  }
}
