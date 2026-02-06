const DEFAULT_EXECUTIVE_SUMMARY =
	"Experienced professional with a strong background and proven track record. Skilled in delivering high-quality results and contributing to team success. Committed to continuous learning and professional development.";

const VALID_AVAILABILITY_VALUES = [
	"Immediate",
	"1 Week",
	"2 Weeks",
	"1 Month",
	"2 Months",
	"3 Months",
	"Negotiable",
] as const;

const VALID_GENDER_VALUES = ["male", "female", "other"] as const;

function ensureNonEmptyString(val: unknown, fallback = "Not specified"): string {
	if (typeof val === "string" && val.trim() !== "") return val;
	return fallback;
}

function ensureValidAvailability(val: unknown): (typeof VALID_AVAILABILITY_VALUES)[number] {
	if (
		typeof val === "string" &&
		VALID_AVAILABILITY_VALUES.includes(val as (typeof VALID_AVAILABILITY_VALUES)[number])
	) {
		return val as (typeof VALID_AVAILABILITY_VALUES)[number];
	}
	return "Negotiable";
}

function ensureValidGender(val: unknown): (typeof VALID_GENDER_VALUES)[number] {
	if (
		typeof val === "string" &&
		VALID_GENDER_VALUES.includes(val.toLowerCase() as (typeof VALID_GENDER_VALUES)[number])
	) {
		return val.toLowerCase() as (typeof VALID_GENDER_VALUES)[number];
	}
	return "other";
}

function ensureNumber(val: unknown, fallback = 0): number {
	if (typeof val === "number" && !Number.isNaN(val)) return val;
	if (typeof val === "string") {
		const parsed = Number.parseFloat(val);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return fallback;
}

function ensureBoolean(val: unknown, fallback = false): boolean {
	if (typeof val === "boolean") return val;
	if (val === "true" || val === 1) return true;
	if (val === "false" || val === 0) return false;
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

	out.executiveSummary = ensureNonEmptyString(out.executiveSummary, DEFAULT_EXECUTIVE_SUMMARY);

	const pi = out.personalInfo as Record<string, unknown> | undefined;
	if (pi && typeof pi === "object" && !Array.isArray(pi)) {
		// Required string fields with minLength: 1
		pi.firstName = ensureNonEmptyString(pi.firstName);
		pi.lastName = ensureNonEmptyString(pi.lastName);
		pi.phone = ensureNonEmptyString(pi.phone);
		pi.profession = ensureNonEmptyString(pi.profession);
		pi.location = ensureNonEmptyString(pi.location);
		pi.nationality = ensureNonEmptyString(pi.nationality);
		pi.idNumber = ensureNonEmptyString(pi.idNumber);

		// Email - ensure valid format or use placeholder
		if (typeof pi.email !== "string" || !pi.email.includes("@")) {
			pi.email = "not.specified@example.com";
		}

		// Enum fields
		pi.availability = ensureValidAvailability(pi.availability);
		pi.gender = ensureValidGender(pi.gender);

		// Number fields (required, min: 0)
		pi.currentSalary = ensureNumber(pi.currentSalary);
		pi.expectedSalary = ensureNumber(pi.expectedSalary);

		// Boolean fields
		pi.driversLicense = ensureBoolean(pi.driversLicense);
	}

	const experiences = (out.workHistory as { experiences?: unknown[] })?.experiences;
	if (Array.isArray(experiences)) {
		for (const e of experiences) {
			if (e && typeof e === "object" && !Array.isArray(e)) {
				const exp = e as Record<string, unknown>;
				exp.company = ensureNonEmptyString(exp.company);
				exp.position = ensureNonEmptyString(exp.position);
				exp.startDate = ensureNonEmptyString(exp.startDate);
				exp.reasonForLeaving = ensureNonEmptyString(exp.reasonForLeaving);
				exp.current = ensureBoolean(exp.current);
				// Ensure duties is an array
				if (!Array.isArray(exp.duties)) {
					exp.duties = [];
				}
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
				edu.completionDate = ensureNumber(edu.completionDate, new Date().getFullYear());
				edu.completed = ensureBoolean(edu.completed, true);
			}
		}
	}

	const matrix = (out.skills as { skillsMatrix?: unknown[] })?.skillsMatrix;
	if (Array.isArray(matrix)) {
		for (const e of matrix) {
			if (e && typeof e === "object" && !Array.isArray(e)) {
				const s = e as Record<string, unknown>;
				s.skill = ensureNonEmptyString(s.skill);
				s.yearsExperience = ensureNumber(s.yearsExperience, 1);
			}
		}
	}

	return out;
}
