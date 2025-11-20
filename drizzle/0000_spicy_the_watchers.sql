CREATE TABLE "stories-of-us_account" (
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "stories-of-us_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "stories-of-us_comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"story_id" integer NOT NULL,
	"content" text NOT NULL,
	"reactions" text,
	"replies" integer[] DEFAULT '{}'::integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories-of-us_heart" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories-of-us_story" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"cover_image" varchar(255) NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"sort" real,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"location" varchar(256),
	"location_lat" real,
	"location_lng" real,
	"feeling" varchar(100),
	"activity" varchar(100),
	"privacy" varchar(50) DEFAULT 'public' NOT NULL,
	"background_style" text,
	"mentioned_users" text[] DEFAULT '{}'::text[],
	"scheduled_publish_time" timestamp with time zone,
	"post_format" varchar(50) DEFAULT 'standard' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories-of-us_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"avatar" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "stories-of-us_account" ADD CONSTRAINT "stories-of-us_account_user_id_stories-of-us_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_comment" ADD CONSTRAINT "stories-of-us_comment_user_id_stories-of-us_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_comment" ADD CONSTRAINT "stories-of-us_comment_story_id_stories-of-us_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories-of-us_story"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_heart" ADD CONSTRAINT "stories-of-us_heart_story_id_stories-of-us_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories-of-us_story"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories-of-us_heart" ADD CONSTRAINT "stories-of-us_heart_user_id_stories-of-us_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "stories-of-us_account" USING btree ("user_id");