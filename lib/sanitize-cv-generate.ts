const DEFAULT_EXECUTIVE_SUMMARY =
  "Experienced professional with a strong background and proven track record. Skilled in delivering high-quality results and contributing to team success. Committed to continuous learning and professional development.";

function ensureNonEmptyString(
  val: unknown,
  fallback = "Not specified"
): string {
  if (typeof val === "string" && val.trim() !== "") return val;
  return fallback;
}

/**
 * Sanitize request body for the external CV generation API: replace empty or
 * whitespace-only strings with "Not specified" (or the executive-summary
 * default) so the API's minLength 1 validation does not 422.
 */
export function sanitizeForCvGenerate(body: unknown): unknown {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return body ?? {};
  }
  const out = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;

  out.executiveSummary = ensureNonEmptyString(
    out.executiveSummary,
    DEFAULT_EXECUTIVE_SUMMARY
  );

  const pi = out.personalInfo as Record<string, unknown> | undefined;
  if (pi && typeof pi === "object" && !Array.isArray(pi)) {
    pi.nationality = ensureNonEmptyString(pi.nationality);
    pi.idNumber = ensureNonEmptyString(pi.idNumber);
    pi.availability = ensureNonEmptyString(pi.availability);
  }

  const experiences = (out.workHistory as { experiences?: unknown[] })?.experiences;
  if (Array.isArray(experiences)) {
    for (const e of experiences) {
      if (e && typeof e === "object" && !Array.isArray(e)) {
        const exp = e as Record<string, unknown>;
        exp.reasonForLeaving = ensureNonEmptyString(exp.reasonForLeaving);
        exp.startDate = ensureNonEmptyString(exp.startDate);
        exp.company = ensureNonEmptyString(exp.company);
        exp.position = ensureNonEmptyString(exp.position);
      }
    }
  }

  const educations = (out.education as { educations?: unknown[] })?.educations;
  if (Array.isArray(educations)) {
    for (const e of educations) {
      if (e && typeof e === "object" && !Array.isArray(e)) {
        const edu = e as Record<string, unknown>;
        edu.institution = ensureNonEmptyString(edu.institution);
        edu.qualification = ensureNonEmptyString(edu.qualification);
      }
    }
  }

  const matrix = (out.skills as { skillsMatrix?: unknown[] })?.skillsMatrix;
  if (Array.isArray(matrix)) {
    for (const e of matrix) {
      if (e && typeof e === "object" && !Array.isArray(e)) {
        const s = e as Record<string, unknown>;
        s.skill = ensureNonEmptyString(s.skill);
      }
    }
  }

  return out;
}
