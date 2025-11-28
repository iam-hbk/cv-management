-- Add updated_by column to track last updater
ALTER TABLE "cvs" ADD COLUMN IF NOT EXISTS "updated_by" text;

-- Add foreign key constraint to users.id, set null on delete
DO $$ BEGIN
  ALTER TABLE "cvs"
    ADD CONSTRAINT "cvs_updated_by_users_id_fk"
    FOREIGN KEY ("updated_by") REFERENCES "users"("id")
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;



