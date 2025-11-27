import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

import { BEAR_STORES } from "@/utils/constants";
import { locations, users } from "./schema";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL is not set in the environment");
}

const sql = postgres(connectionString);
const db = drizzle(sql, { schema: { locations, users } });

const SEED_USER_ID = "seed-bear-locations";

const ensureSeedUser = async () => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, SEED_USER_ID),
  });

  if (existingUser) {
    return existingUser.id;
  }

  await db
    .insert(users)
    .values({
      id: SEED_USER_ID,
      name: "Bear Location Seeder",
      email: "bear.seeder@storiesofus.local",
      avatar: "",
      role: "admin",
    })
    .onConflictDoNothing();

  return SEED_USER_ID;
};

const buildSeedPayload = (createdBy: string) =>
  BEAR_STORES.map((store) => ({
    name: store.name,
    address: store.address,
    description: store.notes,
    lat: store.latitude,
    lng: store.longitude,
    images: store.images ?? [],
    details: JSON.stringify({
      openingHours: store.openingHours,
      rating: store.rating,
      tags: store.tags,
      price: store.price,
      amenities: store.amenities,
      popularity: store.popularity,
    }),
    status: "approved" as const,
    createdBy,
  }));

const main = async () => {
  const createdBy = await ensureSeedUser();

  const existingLocations = await db.query.locations.findMany({
    columns: { name: true, address: true },
  });

  const existingKeys = new Set(
    existingLocations.map(
      (location) => `${location.name}::${location.address}`
    )
  );

  const seedLocations = buildSeedPayload(createdBy).filter(
    (location) => !existingKeys.has(`${location.name}::${location.address}`)
  );

  if (!seedLocations.length) {
    console.log("No new locations to seed. Database is already in sync.");
    return;
  }

  const inserted = await db
    .insert(locations)
    .values(seedLocations)
    .returning({ id: locations.id, name: locations.name });

  console.log(`Inserted ${inserted.length} locations`);
};

main()
  .catch((error) => {
    console.error("Failed to seed locations", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
