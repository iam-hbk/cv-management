import { db } from "@/db";
import { cvs } from "@/db/schema";
import { desc } from "drizzle-orm";

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
  console.log("dbCVs\n\n", dbCVs);

  return dbCVs.map((cv) => {
    if (!cv.formData) {
      throw new Error(`CV ${cv.id} has no form data`);
    }

    return {
      id: cv.id,
      jobTitle: cv.jobTitle,
      createdAt: cv.createdAt ?? new Date(),
      createdBy: {
        name: cv.user?.name ?? cv.user?.email ?? "unknown",
        email: cv.user?.email ?? "unknown@example.com",
      },
      isAiAssisted: cv.isAiAssisted, // If we have AI data, it was AI assisted
      status: cv.status,
      formData: cv.formData,
    };
  });
}
