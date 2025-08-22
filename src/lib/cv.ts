import { db } from "@/db";
import { cvs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

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

export async function getCVById(id: string) {
  const dbCV = await db.query.cvs.findFirst({
    where: eq(cvs.id, id),
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!dbCV) {
    return null;
  }

  if (!dbCV.formData) {
    throw new Error(`CV ${dbCV.id} has no form data`);
  }

  return {
    id: dbCV.id,
    jobTitle: dbCV.jobTitle,
    createdAt: dbCV.createdAt ?? new Date(),
    createdBy: {
      name: dbCV.user?.name ?? dbCV.user?.email ?? "unknown",
      email: dbCV.user?.email ?? "unknown@example.com",
    },
    isAiAssisted: dbCV.isAiAssisted, // If we have AI data, it was AI assisted
    status: dbCV.status,
    formData: dbCV.formData,
  };
}
