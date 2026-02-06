// src/store/cv-form.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type {
	EducationSchema,
	ExecutiveSummarySchema,
	PersonalInfoSchema,
	SkillsSchema,
	WorkExperienceSchema,
} from "../schemas/cv.schema";

// Define the step type
export type Step = {
	id: "executiveSummary" | "personal" | "work" | "education" | "skills" | "preview";
	title: string;
	isCompleted: boolean;
};

// Initial state for the steps
const initialSteps: Step[] = [
	{ id: "executiveSummary", title: "Executive Summary", isCompleted: false },
	{ id: "personal", title: "Personal Information", isCompleted: false },
	{ id: "work", title: "Work Experience", isCompleted: false },
	{ id: "education", title: "Education", isCompleted: false },
	{ id: "skills", title: "Skills & Competencies", isCompleted: false },
	{ id: "preview", title: "Preview & Export", isCompleted: false },
];

const defaultExecutiveSummary: ExecutiveSummarySchema = {
	executiveSummary: "*Must be removed* A long executive summary to be written here...",
	jobTitle: "",
};

// Default values for form reset
const defaultPersonalInfo: PersonalInfoSchema = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	profession: "",
	location: "",
	gender: "other",
	availability: "Negotiable",
	nationality: "",
	currentSalary: 0,
	expectedSalary: 0,
	driversLicense: false,
	idNumber: "",
};

const defaultSkills: SkillsSchema = {
	computerSkills: [],
	otherSkills: [],
	skillsMatrix: [],
};

interface CVFormState {
	currentStep: number;
	personalInfo: PersonalInfoSchema;
	workExperience: WorkExperienceSchema["experiences"];
	education: EducationSchema["educations"];
	skills: SkillsSchema;
	executiveSummary: ExecutiveSummarySchema;
}

const initialState: CVFormState = {
	currentStep: 0,
	personalInfo: defaultPersonalInfo,
	workExperience: [],
	education: [],
	skills: defaultSkills,
	executiveSummary: defaultExecutiveSummary,
};

// Main atom with persistence
export const cvFormAtom = atomWithStorage<CVFormState>("cv-form-storage", initialState);

// Derived atoms for specific sections
export const currentStepAtom = atom(
	(get) => get(cvFormAtom).currentStep,
	(get, set, newStep: number) => {
		set(cvFormAtom, { ...get(cvFormAtom), currentStep: newStep });
	}
);

export const executiveSummaryAtom = atom(
	(get) => get(cvFormAtom).executiveSummary,
	(get, set, newSummary: Partial<ExecutiveSummarySchema>) => {
		const currentSummary = get(cvFormAtom).executiveSummary;
		set(cvFormAtom, {
			...get(cvFormAtom),
			executiveSummary: {
				...defaultExecutiveSummary,
				...currentSummary,
				...newSummary,
			},
		});
	}
);

export const personalInfoAtom = atom(
	(get) => get(cvFormAtom).personalInfo,
	(get, set, newInfo: Partial<PersonalInfoSchema>) => {
		set(cvFormAtom, {
			...get(cvFormAtom),
			personalInfo: { ...get(cvFormAtom).personalInfo, ...newInfo },
		});
	}
);

export const workExperienceAtom = atom(
	(get) => get(cvFormAtom).workExperience,
	(
		get,
		set,
		action: {
			type: "add" | "update" | "remove" | "set";
			data?: WorkExperienceSchema["experiences"];
			index?: number;
		}
	) => {
		const current = get(cvFormAtom).workExperience;
		let newWorkExperience: WorkExperienceSchema["experiences"];

		switch (action.type) {
			case "add":
				newWorkExperience = [...current, ...action.data!];
				break;
			case "set":
				// Replace entirely and dedupe by company+position+startDate
				const seen = new Set<string>();
				newWorkExperience = (action.data || []).filter((exp) => {
					const key = `${exp.company}|${exp.position}|${exp.startDate}`;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				});
				break;
			case "update":
				newWorkExperience = current.map((exp, i) => (i === action.index ? action.data![0] : exp));
				break;
			case "remove":
				newWorkExperience = current.filter((_, i) => i !== action.index);
				break;
			default:
				return;
		}

		set(cvFormAtom, { ...get(cvFormAtom), workExperience: newWorkExperience });
	}
);

export const educationAtom = atom(
	(get) => get(cvFormAtom).education,
	(
		get,
		set,
		action: {
			type: "add" | "update" | "remove" | "set";
			data?: EducationSchema["educations"];
			index?: number;
		}
	) => {
		const current = get(cvFormAtom).education;
		let newEducation: EducationSchema["educations"];

		switch (action.type) {
			case "add":
				newEducation = [...current, ...action.data!];
				break;
			case "set":
				// Replace entirely and dedupe by institution+qualification+completionDate
				const seen = new Set<string>();
				newEducation = (action.data || []).filter((edu) => {
					const key = `${edu.institution}|${edu.qualification}|${edu.completionDate}`;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				});
				break;
			case "update":
				newEducation = current.map((edu, i) => (i === action.index ? action.data![0] : edu));
				break;
			case "remove":
				newEducation = current.filter((_, i) => i !== action.index);
				break;
			default:
				return;
		}

		set(cvFormAtom, { ...get(cvFormAtom), education: newEducation });
	}
);

export const skillsAtom = atom(
	(get) => get(cvFormAtom).skills,
	(
		get,
		set,
		action: {
			type: "add" | "update" | "remove" | "set";
			data?: SkillsSchema;
			index?: number;
		}
	) => {
		const current = get(cvFormAtom).skills;
		let newSkills: SkillsSchema;

		switch (action.type) {
			case "add":
				newSkills = { ...current, ...action.data! };
				break;
			case "set":
				// Replace entirely
				newSkills = action.data || current;
				break;
			case "update":
				newSkills = { ...current, ...action.data! };
				break;
			case "remove":
				newSkills = { ...current, ...action.data! };
				break;
			default:
				return;
		}

		set(cvFormAtom, { ...get(cvFormAtom), skills: newSkills });
	}
);

export const resetFormAtom = atom(null, (get, set) => {
	set(cvFormAtom, {
		...initialState,
		personalInfo: defaultPersonalInfo,
		skills: defaultSkills,
	});
	set(stepsAtom, initialSteps);
	set(currentStepAtom, 0);
});

export const stepsAtom = atomWithStorage<Step[]>("cv-steps", initialSteps);

// Helper atom to update step completion
export const updateStepCompletionAtom = atom(null, (get, set, stepId: Step["id"]) => {
	const currentSteps = get(stepsAtom);
	const updatedSteps = currentSteps.map((step) =>
		step.id === stepId ? { ...step, isCompleted: true } : step
	);
	set(stepsAtom, updatedSteps);
});
