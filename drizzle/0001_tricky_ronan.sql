ALTER TABLE "stories-of-us_story" ADD COLUMN "sort" integer;--> statement-breakpoint
ALTER TABLE "stories-of-us_story" ADD CONSTRAINT "stories-of-us_story_sort_unique" UNIQUE("sort");