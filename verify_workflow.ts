import { createCaller } from "./src/server/api/root";
import { db } from "./src/server/db";
import { users } from "./src/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  // 1. Setup Admin User
  const adminId = "admin-user-id";
  await db
    .insert(users)
    .values({
      id: adminId,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    })
    .onConflictDoNothing();

  // 2. Setup Regular User
  const userId = "regular-user-id";
  await db
    .insert(users)
    .values({
      id: userId,
      name: "Regular User",
      email: "user@example.com",
      role: "user",
    })
    .onConflictDoNothing();

  // 3. Create Caller for Regular User
  const userCaller = createCaller({
    db,
    headers: new Headers(),
    auth: { userId },
  });

  // 4. Create Location
  console.log("Creating location as regular user...");
  await userCaller.location.create({
    name: "Test Location",
    description: "Testing approval workflow",
    address: "123 Test St",
    lat: 10,
    lng: 20,
    images: ["https://example.com/image.jpg"],
  });

  // 5. Verify Pending (Admin should see it)
  const adminCaller = createCaller({
    db,
    headers: new Headers(),
    auth: { userId: adminId },
  });

  console.log("Fetching pending locations as admin...");
  const pending = await adminCaller.location.getPending();
  const myLocation = pending.find((l) => l.name === "Test Location");

  if (!myLocation) {
    console.error("Location not found in pending list!");
    process.exit(1);
  }
  console.log("Location found in pending list:", myLocation.id);

  // 6. Verify Public Feed (Should NOT see it)
  console.log("Fetching public locations...");
  const publicLocations = await userCaller.location.getAll();
  if (publicLocations.some((l) => l.id === myLocation.id)) {
    console.error("Location found in public list before approval!");
    process.exit(1);
  }
  console.log("Location NOT found in public list (correct).");

  // 7. Approve Location
  console.log("Approving location...");
  await adminCaller.location.approve({ id: myLocation.id });

  // 8. Verify Public Feed (Should see it now)
  console.log("Fetching public locations again...");
  const publicLocationsAfter = await userCaller.location.getAll();
  if (!publicLocationsAfter.some((l) => l.id === myLocation.id)) {
    console.error("Location NOT found in public list after approval!");
    process.exit(1);
  }
  console.log("Location found in public list after approval (correct).");

  console.log("✓ Verification successful!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
