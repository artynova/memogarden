ALTER TABLE "user" ADD COLUMN "accept_tokens_after" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "card" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "deck" DROP COLUMN IF EXISTS "updated_at";