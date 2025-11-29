ALTER TABLE "stories-of-us_location"
  ALTER COLUMN "details" SET DATA TYPE jsonb USING "details"::jsonb;
