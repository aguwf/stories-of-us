import { describe, expect, it } from "bun:test";

import {
  DUPLICATE_DEFAULT_RADIUS_METERS,
  LocationSubmissionPayload,
  computeBoundingBox,
  normalizeName,
} from "../src/server/api/routers/location";

describe("location router helpers", () => {
  it("normalizes names by trimming and lowercasing", () => {
    expect(normalizeName("  Cafe Rio ")).toBe("cafe rio");
  });

  it("computes a bounding box around coordinates", () => {
    const { minLat, maxLat, minLng, maxLng } = computeBoundingBox(
      40,
      -74,
      DUPLICATE_DEFAULT_RADIUS_METERS
    );

    expect(minLat).toBeLessThan(40);
    expect(maxLat).toBeGreaterThan(40);
    expect(minLng).toBeLessThan(-74);
    expect(maxLng).toBeGreaterThan(-74);
  });

  it("validates and normalizes submission payloads", () => {
    const parsed = LocationSubmissionPayload.parse({
      name: "Test Place",
      address: "123 Main",
      description: null,
      lat: 10,
      lng: 20,
      images: ["a.jpg"],
      details: JSON.stringify({ openingHours: "9-5" }),
    });

    expect(parsed.name).toBe("Test Place");
    expect(parsed.description).toBeNull();
  });

  it("rejects invalid ratings", () => {
    expect(() =>
      LocationSubmissionPayload.parse({
        name: "Bad Rating",
        address: "x",
        lat: 0,
        lng: 0,
        details: { rating: 7 },
      })
    ).toThrow();
  });
});
