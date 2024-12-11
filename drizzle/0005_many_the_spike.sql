CREATE TABLE IF NOT EXISTS "stories-of-us_heart" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stories-of-us_heart" ADD CONSTRAINT "stories-of-us_heart_story_id_stories-of-us_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories-of-us_story"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stories-of-us_heart" ADD CONSTRAINT "stories-of-us_heart_user_id_stories-of-us_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
