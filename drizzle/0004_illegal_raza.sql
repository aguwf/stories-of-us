CREATE TABLE "stories-of-us_location_edit" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer,
	"type" varchar(20) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reason" text,
	"duplicate_of" integer,
	"created_by" varchar(255) NOT NULL,
	"decision_by" varchar(255),
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "stories-of-us_location_edit" ADD CONSTRAINT "stories-of-us_location_edit_location_id_stories-of-us_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stories-of-us_location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_location_edit" ADD CONSTRAINT "stories-of-us_location_edit_duplicate_of_stories-of-us_location_id_fk" FOREIGN KEY ("duplicate_of") REFERENCES "public"."stories-of-us_location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_location_edit" ADD CONSTRAINT "stories-of-us_location_edit_created_by_stories-of-us_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_location_edit" ADD CONSTRAINT "stories-of-us_location_edit_decision_by_stories-of-us_user_id_fk" FOREIGN KEY ("decision_by") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;