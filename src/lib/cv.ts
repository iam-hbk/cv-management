import { db } from "@/db";
import { cvs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { type CV } from "@/types/cv";

export async function getCVs() {
  const dbCVs = await db.query.cvs.findMany({
    orderBy: [desc(cvs.createdAt)],
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  return dbCVs.map((cv): CV => {
    if (!cv.formData) {
      throw new Error(`CV ${cv.id} has no form data`);
    }

    return {
      id: cv.id,
      title: cv.formData.executiveSummary.split('\n')[0].slice(0, 50) + '...', // Use first line of summary as title
      createdAt: cv.createdAt ?? new Date(),
      createdBy: {
        name: cv.user?.name ?? "Unknown",
        email: cv.user?.email ?? "unknown@example.com",
      },
      isAiAssisted: Boolean(cv.aiExtractedData), // If we have AI data, it was AI assisted
      status: cv.status,
      // Spread the form data which contains all our CV fields
      ...cv.formData,
    };
  });
} 