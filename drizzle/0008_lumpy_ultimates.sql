CREATE TABLE IF NOT EXISTS "avatar" (
	"id" smallint PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar_id" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_avatar_id_avatar_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
