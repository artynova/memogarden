ALTER TABLE "user_facebook" RENAME COLUMN "sub" TO "account_id";--> statement-breakpoint
ALTER TABLE "user_google" RENAME COLUMN "sub" TO "account_id";--> statement-breakpoint
ALTER TABLE "user_facebook" DROP CONSTRAINT "user_facebook_sub_unique";--> statement-breakpoint
ALTER TABLE "user_google" DROP CONSTRAINT "user_google_sub_unique";--> statement-breakpoint
ALTER TABLE "user_facebook" ADD CONSTRAINT "user_facebook_accountId_unique" UNIQUE("account_id");--> statement-breakpoint
ALTER TABLE "user_google" ADD CONSTRAINT "user_google_accountId_unique" UNIQUE("account_id");