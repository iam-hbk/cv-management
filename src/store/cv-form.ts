// src/store/cv-form.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  PersonalInfoSchema,
  WorkExperienceSchema,
  EducationSchema,
  SkillsSchema,
} from "@/schemas/cv.schema";

interface CVFormState {
  currentStep: number;
  personalInfo: PersonalInfoSchema;
  workExperience: WorkExperienceSchema[];
  education: EducationSchema[];
  skills: SkillsSchema;
}

const initialState: CVFormState = {
  currentStep: 0,
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    location: "",
    gender: "other",
    availability: "",
    nationality: "",
    currentSalary: 0,
    expectedSalary: 0,
    driversLicense: false,
    idNumber: "",
  },
  workExperience: [],
  education: [],
  skills: {
    computerSkills: [],
    otherSkills: [],
    skillsMatrix: [],
  },
};

// Main atom with persistence
export const cvFormAtom = atomWithStorage<CVFormState>('cv-form-storage', initialState);

// Derived atoms for specific sections
export const currentStepAtom = atom(
  (get) => get(cvFormAtom).currentStep,
  (get, set, newStep: number) => {
    set(cvFormAtom, { ...get(cvFormAtom), currentStep: newStep });
  }
);

export const personalInfoAtom = atom(
  (get) => get(cvFormAtom).personalInfo,
  (get, set, newInfo: Partial<PersonalInfoSchema>) => {
    set(cvFormAtom, {
      ...get(cvFormAtom),
      personalInfo: { ...get(cvFormAtom).personalInfo, ...newInfo }
    });
  }
);

export const workExperienceAtom = atom(
  (get) => get(cvFormAtom).workExperience,
  (get, set, action: { type: 'add' | 'update' | 'remove'; data?: WorkExperienceSchema[]; index?: number }) => {
    const current = get(cvFormAtom).workExperience;
    let newWorkExperience: WorkExperienceSchema[];
    
    switch (action.type) {
      case 'add':
        newWorkExperience = [...current, ...action.data!];
        break;
      case 'update':
        newWorkExperience = current.map((exp, i) => 
          i === action.index ? action.data![0] : exp
        );
        break;
      case 'remove':
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
  (get, set, action: { type: 'add' | 'update' | 'remove'; data?: EducationSchema[]; index?: number }) => {
    const current = get(cvFormAtom).education;
    let newEducation: EducationSchema[];
    
    switch (action.type) {
      case 'add':
        newEducation = [...current, ...action.data!];
        break;
      case 'update':
        newEducation = current.map((edu, i) => 
          i === action.index ? action.data![0] : edu
        );
        break;
      case 'remove':
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
  (get, set, action: { type: 'add' | 'update' | 'remove'; data?: SkillsSchema; index?: number }) => {
    const current = get(cvFormAtom).skills;
    let newSkills: SkillsSchema;
    
    switch (action.type) {
      case 'add':
        newSkills = { ...current, ...action.data! };
        break;
      case 'update':
        newSkills = { ...current, ...action.data! };
        break;
      case 'remove':
        newSkills = { ...current, ...action.data! };
        break;
      default:
        return;
    }
    
    set(cvFormAtom, { ...get(cvFormAtom), skills: newSkills });
  }
);

export const resetFormAtom = atom(
  null,
  (get, set) => {
    set(cvFormAtom, initialState);
  }
);