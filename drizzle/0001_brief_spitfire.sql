ALTER TABLE "user_facebook" ADD CONSTRAINT "user_facebook_sub_unique" UNIQUE("sub");--> statement-breakpoint
ALTER TABLE "user_google" ADD CONSTRAINT "user_google_sub_unique" UNIQUE("sub");