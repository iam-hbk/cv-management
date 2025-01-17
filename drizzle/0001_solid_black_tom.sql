ALTER TABLE "cvs" RENAME COLUMN "ai_extracted_data" TO "is_ai_assisted";--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "title" text NOT NULL;