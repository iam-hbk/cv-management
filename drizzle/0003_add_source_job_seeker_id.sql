-- Add source_job_seeker_id to link structured CVs to Convex job seekers
ALTER TABLE "cvs" ADD COLUMN IF NOT EXISTS "source_job_seeker_id" text;
