ALTER TABLE "card" ALTER COLUMN "due" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "stability" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "difficulty" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "elapsed_days" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "scheduled_days" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "reps" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "lapses" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "state_id" SET DEFAULT 0;