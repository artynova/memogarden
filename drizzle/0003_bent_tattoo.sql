ALTER TABLE "review_log" DROP CONSTRAINT "review_log_card_id_card_id_fk";--> statement-breakpoint
ALTER TABLE "card" DROP CONSTRAINT "card_deck_id_deck_id_fk";--> statement-breakpoint
ALTER TABLE "deck" DROP CONSTRAINT "deck_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "user_credentials" DROP CONSTRAINT "user_credentials_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "user_facebook" DROP CONSTRAINT "user_facebook_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "user_google" DROP CONSTRAINT "user_google_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::text::uuid;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "deck_id" SET DATA TYPE uuid USING "deck_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "review_log" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "review_log" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::text::uuid;--> statement-breakpoint
ALTER TABLE "review_log" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "review_log" ALTER COLUMN "card_id" SET DATA TYPE uuid USING "card_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "deck" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "deck" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::text::uuid;--> statement-breakpoint
ALTER TABLE "deck" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "deck" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::text::uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_credentials" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "user_facebook" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "user_google" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::text::uuid;--> statement-breakpoint
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id");--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id");--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "user_facebook" ADD CONSTRAINT "user_facebook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "user_google" ADD CONSTRAINT "user_google_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
DROP SEQUENCE "public"."review_log_id_seq";--> statement-breakpoint
DROP SEQUENCE "public"."card_id_seq";--> statement-breakpoint
DROP SEQUENCE "public"."deck_id_seq";--> statement-breakpoint
DROP SEQUENCE "public"."user_id_seq";
