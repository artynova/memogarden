ALTER TABLE "card" DROP CONSTRAINT "card_state_id_review_rating_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card" ADD CONSTRAINT "card_state_id_card_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."card_state"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
