ALTER TABLE "cvs" ADD COLUMN "source_job_seeker_id" text;--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "updated_by" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cvs" ADD CONSTRAINT "cvs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
