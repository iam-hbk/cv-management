import type { CVFormData } from "../schemas/cv.schema";

/**
 * API Schema types based on OpenAPI spec
 */
export interface APICVSchema {
	executiveSummary: string;
	personalInfo: APIPersonalInfoSchema;
	workHistory: APIWorkExperienceSchema;
	education: APIEducationSchema;
	skills: APISkillsSchema;
}

export interface APIPersonalInfoSchema {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	profession: string;
	location: string;
	gender: "male" | "female" | "other";
	availability: string;
	nationality: string;
	currentSalary: number;
	expectedSalary: number;
	driversLicense: boolean;
	idNumber: string;
}

export interface APIWorkExperienceSchema {
	experiences: APIWorkExperienceItem[];
}

export interface APIWorkExperienceItem {
	company: string;
	position: string;
	startDate: string;
	endDate: string | null;
	current: boolean;
	duties: string[];
	reasonForLeaving: string;
}

export interface APIEducationSchema {
	educations: APIEducationItem[];
}

export interface APIEducationItem {
	institution: string;
	qualification: string;
	completionDate: number;
	completed: boolean;
}

export interface APISkillsSchema {
	computerSkills: string[];
	otherSkills: string[];
	skillsMatrix: APISkillsMatrixItem[];
}

export interface APISkillsMatrixItem {
	skill: string;
	yearsExperience: number;
	proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
	lastUsed: number;
}

/**
 * Transforms CV form data to match the API's CVSchema format
 */
export function transformCVToAPIFormat(cvData: CVFormData): APICVSchema {
	// Ensure availability is a non-empty string (API requires minLength 1)
	const availability =
		cvData.personalInfo.availability && cvData.personalInfo.availability.trim() !== ""
			? cvData.personalInfo.availability
			: "Not specified";

	// Ensure executiveSummary is not empty (API requires minLength 1)
	const executiveSummary =
		cvData.executiveSummary && cvData.executiveSummary.trim() !== ""
			? cvData.executiveSummary
			: "Experienced professional with a strong background and proven track record. Skilled in delivering high-quality results and contributing to team success. Committed to continuous learning and professional development.";

	return {
		executiveSummary: executiveSummary,
		personalInfo: {
			firstName: cvData.personalInfo.firstName,
			lastName: cvData.personalInfo.lastName,
			email: cvData.personalInfo.email,
			phone: cvData.personalInfo.phone,
			profession: cvData.personalInfo.profession,
			location: cvData.personalInfo.location,
			gender: cvData.personalInfo.gender,
			availability: availability,
			nationality: cvData.personalInfo.nationality?.trim()
				? cvData.personalInfo.nationality
				: "Not specified",
			currentSalary: cvData.personalInfo.currentSalary,
			expectedSalary: cvData.personalInfo.expectedSalary,
			driversLicense: cvData.personalInfo.driversLicense ?? false,
			idNumber: cvData.personalInfo.idNumber?.trim()
				? cvData.personalInfo.idNumber
				: "Not specified",
		},
		workHistory: {
			experiences: cvData.workHistory.experiences.map((exp) => ({
				company: exp.company,
				position: exp.position,
				startDate: exp.startDate?.trim() || "Not specified",
				// Convert empty string to null, especially when current is true
				endDate: exp.current || !exp.endDate || exp.endDate.trim() === "" ? null : exp.endDate,
				current: exp.current,
				duties: exp.duties.filter((duty) => duty.trim() !== ""), // Filter out empty duties
				reasonForLeaving: exp.reasonForLeaving?.trim() || "Not specified",
			})),
		},
		education: {
			educations: cvData.education.educations.map((edu) => ({
				institution: edu.institution?.trim() ? edu.institution : "Not specified",
				qualification: edu.qualification?.trim() ? edu.qualification : "Not specified",
				completionDate: edu.completionDate,
				completed: edu.completed,
			})),
		},
		skills: {
			computerSkills: cvData.skills.computerSkills.filter((skill) => skill.trim() !== ""),
			otherSkills: cvData.skills.otherSkills.filter((skill) => skill.trim() !== ""),
			skillsMatrix: cvData.skills.skillsMatrix.map((skill) => ({
				skill: skill.skill?.trim() || "Not specified",
				yearsExperience: skill.yearsExperience,
				proficiency: skill.proficiency,
				lastUsed: skill.lastUsed,
			})),
		},
	};
}
