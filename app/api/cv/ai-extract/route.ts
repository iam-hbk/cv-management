import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { cvSchemaLenient } from "../../../../schemas/cv.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("pdf") as File | null;
		const blobUrl = formData.get("blobUrl") as string | null;

		let fileDataUrl: string;
		let mediaType = "application/pdf";

		// Handle blob URL if provided
		if (blobUrl) {
			try {
				const response = await fetch(blobUrl);
				if (!response.ok) {
					return NextResponse.json(
						{ error: "Failed to fetch file from blob URL" },
						{ status: 400 }
					);
				}
				const arrayBuffer = await response.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				const charArray = Array.from(uint8Array, (byte) => String.fromCharCode(byte));
				const binaryString = charArray.join("");
				const base64Data = btoa(binaryString);

				// Determine media type from response headers or default to PDF
				const contentType = response.headers.get("content-type") || "application/pdf";
				mediaType = contentType;
				fileDataUrl = `data:${contentType};base64,${base64Data}`;
			} catch (error) {
				console.error("Error processing blob URL:", error);
				return NextResponse.json({ error: "Failed to process blob URL" }, { status: 400 });
			}
		} else if (file) {
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
			fileDataUrl = `data:${file.type};base64,${base64Data}`;
			mediaType = file.type;
		} else {
			return NextResponse.json({ error: "No file or blob URL provided" }, { status: 400 });
		}

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
              
              For dates:
              - startDate and endDate must be valid ISO date strings (YYYY-MM-DD format) or empty strings if not available
              - NEVER use "N/A", "null", or any placeholder text for dates - use empty strings instead
              - If only a year is available, use January 1st of that year (e.g., "2015-01-01")
              - If no date information is available, use an empty string ""
              
              For other fields:
              - availability: Use "Not specified" if not available, never use empty string or "N/A"
              - reasonForLeaving: Use empty string "" if not available, never use "N/A"
              - duties: Use empty array [] if no duties are listed
              - For salary and numeric fields, use numbers (0 if not available)
              - If information is not available, use reasonable defaults or empty arrays/strings.`,
						},
						{
							type: "file",
							data: fileDataUrl,
							mediaType: mediaType,
						},
					],
				},
			],
			schema: cvSchemaLenient,
		});

		console.dir(result, { depth: null });

		return NextResponse.json({
			success: true,
			data: result.object,
		});
	} catch (error) {
		console.error("Error processing CV:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to process CV",
			},
			{ status: 500 }
		);
	}
}
