CREATE TABLE IF NOT EXISTS "card" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deck_id" bigint NOT NULL,
	"front" varchar(300) NOT NULL,
	"back" varchar(1000) NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" integer NOT NULL,
	"scheduled_days" integer NOT NULL,
	"reps" integer NOT NULL,
	"lapses" integer NOT NULL,
	"state_id" smallint NOT NULL,
	"last_review" timestamp with time zone,
	"retrievability" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_state" (
	"id" smallint PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"card_id" bigint NOT NULL,
	"answer_attempt" varchar(1000) NOT NULL,
	"rating_id" smallint NOT NULL,
	"state_id" smallint NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" integer NOT NULL,
	"last_elapsed_days" integer NOT NULL,
	"scheduled_days" integer NOT NULL,
	"review" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_rating" (
	"id" smallint PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deck" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" bigint NOT NULL,
	"name" varchar(100),
	"retrievability" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"last_health_sync" timestamp with time zone DEFAULT now() NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"retrievability" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_credentials" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" char(60) NOT NULL,
	CONSTRAINT "user_credentials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_facebook" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"sub" varchar NOT NULL,
	CONSTRAINT "user_facebook_sub_unique" UNIQUE("sub")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_google" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"sub" varchar NOT NULL,
	CONSTRAINT "user_google_sub_unique" UNIQUE("sub")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card" ADD CONSTRAINT "card_state_id_review_rating_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."review_rating"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_log" ADD CONSTRAINT "review_log_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_log" ADD CONSTRAINT "review_log_rating_id_review_rating_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."review_rating"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_log" ADD CONSTRAINT "review_log_state_id_card_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."card_state"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_facebook" ADD CONSTRAINT "user_facebook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_google" ADD CONSTRAINT "user_google_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
