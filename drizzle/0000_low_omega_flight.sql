CREATE TABLE IF NOT EXISTS "stories-of-us_story" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"cover_image" varchar(255) NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
