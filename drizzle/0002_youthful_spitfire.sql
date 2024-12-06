ALTER TABLE "user_credentials" ALTER COLUMN "email" SET DATA TYPE varchar(320);--> statement-breakpoint
ALTER TABLE "user_facebook" ALTER COLUMN "sub" SET DATA TYPE varchar(300);--> statement-breakpoint
ALTER TABLE "user_google" ALTER COLUMN "sub" SET DATA TYPE varchar(300);