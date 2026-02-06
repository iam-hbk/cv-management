import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const CV_EXTRACTION_PROMPT = `You are a precise information-extraction model. You will receive a single PDF file upload containing one candidate's CV/resume. Your job is to read the PDF (including scanned pages via OCR), interpret layout (columns, tables, headers/footers), and return a SINGLE JSON object that validates against the \`cvSchema\` defined below.
Only output JSON. No commentary, no markdown, no code fences.

### File input
- You will be provided a PDF file upload (e.g., \`resume.pdf\`).
- If any pages are image-based, perform OCR.
- Deduplicate repeated contact blocks or section titles.
- Match data from the pdf to the schema. 
### Schemas (must match exactly)
- \`executiveSummary: string (min 50 chars)\`
- \`personalInfo\`:
  - \`firstName: string\`
  - \`lastName: string\`
  - \`email: string (valid email)\`
  - \`phone: string\`
  - \`profession: string\`
  - \`location: string\`
  - \`gender: "male" | "female" | "other"\`
  - \`availability: "Immediate" | "1 Week" | "2 Weeks" | "1 Month" | "2 Months" | "3 Months" | "Negotiable"\`
  - \`nationality: string\`
  - \`currentSalary: number >= 0\`
  - \`expectedSalary: number >= 0\`
  - \`driversLicense: boolean\`
  - \`idNumber: string\`
- \`workHistory.experiences[]\`:
  - \`company: string\`
  - \`position: string\`
  - \`startDate: date\`
  - \`endDate: date\` (optional)
  - \`current: boolean\`
  - \`duties: string[]\`
  - \`reasonForLeaving: string\`
- \`education.educations[]\`:
  - \`institution: string\`
  - \`qualification: string\`
  - \`completionDate: number (4-digit year)\`
  - \`completed: boolean\`
- \`skills\`:
  - \`computerSkills: string[]\`
  - \`otherSkills: string[]\`
  - \`skillsMatrix[]\`:
    - \`skill: string\`
    - \`yearsExperience: number\`
    - \`proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert"\`
    - \`lastUsed: number (4-digit year)\`


### Output shape (JSON only)
Return exactly this object:

{
  "executiveSummary": "<50+ characters summarizing the candidate’s background, domain, seniority, key achievements, notable industries/stacks/leadership, plus a brief note on any major missing fields>",
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "profession": "",
    "location": "",
    "gender": "other",
    "availability": "Negotiable",
    "nationality": "",
    "currentSalary": 0,
    "expectedSalary": 0,
    "driversLicense": false,
    "idNumber": ""
  },
  "workHistory": {
    "experiences": [
      {
        "company": "",
        "position": "",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "current": false,
        "duties": [""],
        "reasonForLeaving": ""
      }
    ]
  },
  "education": {
    "educations": [
      {
        "institution": "",
        "qualification": "",
        "completionDate": 0,
        "completed": true
      }
    ]
  },
  "skills": {
    "computerSkills": [""],
    "otherSkills": [""],
    "skillsMatrix": [
      {
        "skill": "",
        "yearsExperience": 0,
        "proficiency": "Beginner",
        "lastUsed": 0
      }
    ]
  }
}

Only output valid JSON conforming to the above; do not include any explanations or extra keys.
`;
