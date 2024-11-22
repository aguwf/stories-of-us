CREATE TABLE IF NOT EXISTS "stories-of-us_account" (
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
CREATE TABLE IF NOT EXISTS "stories-of-us_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"avatar" varchar(255)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stories-of-us_account" ADD CONSTRAINT "stories-of-us_account_user_id_stories-of-us_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stories-of-us_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "stories-of-us_account" ("user_id");