CREATE TABLE IF NOT EXISTS "stories-of-us_location_edit" (
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
  "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamptz
);

ALTER TABLE "stories-of-us_location_edit"
  ADD CONSTRAINT "location_edit_location_id_location_id_fk"
  FOREIGN KEY ("location_id") REFERENCES "stories-of-us_location"("id");

ALTER TABLE "stories-of-us_location_edit"
  ADD CONSTRAINT "location_edit_duplicate_of_location_id_fk"
  FOREIGN KEY ("duplicate_of") REFERENCES "stories-of-us_location"("id");

ALTER TABLE "stories-of-us_location_edit"
  ADD CONSTRAINT "location_edit_created_by_user_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "stories-of-us_user"("id");

ALTER TABLE "stories-of-us_location_edit"
  ADD CONSTRAINT "location_edit_decision_by_user_id_fk"
  FOREIGN KEY ("decision_by") REFERENCES "stories-of-us_user"("id");
