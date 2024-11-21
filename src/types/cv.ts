import { type CVFormData } from "@/schemas/cv.schema";

export type CV = CVFormData & {
  id: string;
  title: string;
  createdAt: Date;
  createdBy: {
    name: string;
    email: string;
  };
  isAiAssisted: boolean;
  status: 'draft' | 'completed';
} 