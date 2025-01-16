ALTER TABLE "card" ALTER COLUMN "stability" SET DEFAULT 0.1;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "retrievability" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "retrievability" SET NOT NULL;