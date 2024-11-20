import { CVFormData } from '@/schemas/cv.schema';
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const cvs = pgTable('cvs', {
  id: serial('id').primaryKey(),
  status: text('status').notNull(),
  formData: jsonb('form_data').$type<CVFormData>(),
  aiExtractedData: jsonb('ai_extracted_data').$type<CVFormData>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});