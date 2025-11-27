CREATE TABLE "stories-of-us_location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"address" varchar(256) NOT NULL,
	"description" text,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "stories-of-us_location" ADD CONSTRAINT "stories-of-us_location_created_by_stories-of-us_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;