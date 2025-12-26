import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { LocationDetails, LocationInputPayload } from "@/types/map.types";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `stories-of-us_${name}`);

const privacyValues = ["public", "friends", "onlyme"] as const;
const postFormatValues = ["standard", "background", "poll"] as const;

export const stories = createTable("story", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 255 }).notNull(),
  images: text("images")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sort: real("sort"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
  location: varchar("location", { length: 256 }),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  feeling: varchar("feeling", { length: 100 }),
  activity: varchar("activity", { length: 100 }),
  privacy: varchar("privacy", { length: 50, enum: privacyValues })
    .default("public")
    .notNull(),
  backgroundStyle: text("background_style"),
  mentionedUsers: text("mentioned_users")
    .array()
    .default(sql`'{}'::text[]`),
  scheduledPublishTime: timestamp("scheduled_publish_time", {
    withTimezone: true,
  }),
  postFormat: varchar("post_format", { length: 50, enum: postFormatValues })
    .default("standard")
    .notNull(),
  status: varchar("status", { length: 20, enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
});

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, { fields: [stories.userId], references: [users.id] }),
  hearts: many(hearts),
  comments: many(comments),
}));

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  avatar: varchar("avatar", { length: 255 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  stories: many(stories),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    // type: varchar("type", { length: 255 })
    //   .$type<AdapterAccount["type"]>()
    //   .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// export const sessions = createTable(
//   "session",
//   {
//     sessionToken: varchar("session_token", { length: 255 })
//       .notNull()
//       .primaryKey(),
//     userId: varchar("user_id", { length: 255 })
//       .notNull()
//       .references(() => users.id),
//     expires: timestamp("expires", {
//       mode: "date",
//       withTimezone: true,
//     }).notNull(),
//   },
//   (session) => ({
//     userIdIdx: index("session_user_id_idx").on(session.userId),
//   }),
// );

// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   user: one(users, { fields: [sessions.userId], references: [users.id] }),
// }));

// export const verificationTokens = createTable(
//   "verification_token",
//   {
//     identifier: varchar("identifier", { length: 255 }).notNull(),
//     token: varchar("token", { length: 255 }).notNull(),
//     expires: timestamp("expires", {
//       mode: "date",
//       withTimezone: true,
//     }).notNull(),
//   },
//   (vt) => ({
//     compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
//   }),
// );

export const hearts = createTable("heart", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id")
    .notNull()
    .references(() => stories.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const heartsRelations = relations(hearts, ({ one }) => ({
  story: one(stories, { fields: [hearts.storyId], references: [stories.id] }),
  user: one(users, { fields: [hearts.userId], references: [users.id] }),
}));

export const comments = createTable("comment", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }) // Changed from integer to varchar to match users.id type
    .notNull()
    .references(() => users.id),
  storyId: integer("story_id")
    .notNull()
    .references(() => stories.id),
  content: text("content").notNull(),
  reactions: text("reactions").$type<Record<string, string[]>>(),
  replies: integer("replies")
    .array()
    .default(sql`'{}'::integer[]`)
    .notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  story: one(stories, { fields: [comments.storyId], references: [stories.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const pushSubscriptions = createTable("push_subscription", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
);

export const locations = createTable("location", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  address: varchar("address", { length: 256 }).notNull(),
  description: text("description"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  images: text("images")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  details: jsonb("details").$type<LocationDetails | null>(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdBy: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const locationsRelations = relations(locations, ({ one }) => ({
  creator: one(users, {
    fields: [locations.createdBy],
    references: [users.id],
  }),
}));

const locationSubmissionTypes = ["new", "edit"] as const;
const locationSubmissionStatus = ["pending", "approved", "rejected"] as const;

export const locationEdits = createTable("location_edit", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  type: varchar("type", { length: 20, enum: locationSubmissionTypes }).notNull(),
  payload: jsonb("payload").$type<LocationInputPayload>().notNull(),
  status: varchar("status", { length: 20, enum: locationSubmissionStatus })
    .default("pending")
    .notNull(),
  reason: text("reason"),
  duplicateOf: integer("duplicate_of").references(() => locations.id),
  createdBy: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  decisionBy: varchar("decision_by", { length: 255 }).references(() => users.id),
  decisionNote: text("decision_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const locationEditsRelations = relations(locationEdits, ({ one }) => ({
  location: one(locations, {
    fields: [locationEdits.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [locationEdits.createdBy],
    references: [users.id],
  }),
  decisionMaker: one(users, {
    fields: [locationEdits.decisionBy],
    references: [users.id],
  }),
}));
