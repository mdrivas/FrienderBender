import {
  relations,
  sql,
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `next_postgres_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
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
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ============================================
// FrienderBender Tables
// ============================================

// Extended user profiles for FrienderBender
export const profiles = createTable(
  "profile",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    location: varchar("location", { length: 255 }),
    avatarUrl: text("avatar_url"),
    quizCompleted: boolean("quiz_completed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
);

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  quizResponses: many(quizResponses),
  matchesAsUser1: many(matches, { relationName: "user1Matches" }),
  matchesAsUser2: many(matches, { relationName: "user2Matches" }),
  rideBookings: many(rideBookings),
}));

// Quiz responses
export const quizResponses = createTable(
  "quiz_response",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    interests: jsonb("interests").$type<string[]>().default([]).notNull(),
    socialStyle: varchar("social_style", { length: 50 }), // solo, small_group, big_group, depends
    friendshipValues: jsonb("friendship_values").$type<string[]>().default([]).notNull(),
    communicationStyle: varchar("communication_style", { length: 50 }), // texter, planner, spontaneous, low_maintenance
    hangoutVibe: jsonb("hangout_vibe").$type<string[]>().default([]).notNull(),
    availability: jsonb("availability").$type<{ preset: string; customDays: string[]; customTimes: string[] }>(),
    dealbreakers: jsonb("dealbreakers").$type<string[]>().default([]).notNull(),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("quiz_user_id_idx").on(table.userId),
  }),
);

export type QuizResponse = InferSelectModel<typeof quizResponses>;
export type NewQuizResponse = InferInsertModel<typeof quizResponses>;

export const quizResponsesRelations = relations(quizResponses, ({ one }) => ({
  user: one(users, { fields: [quizResponses.userId], references: [users.id] }),
  profile: one(profiles, { fields: [quizResponses.userId], references: [profiles.id] }),
}));

// Events
export const events = createTable(
  "event",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // creative, food, adventure, nightlife, wellness
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    location: varchar("location", { length: 255 }),
    mysteryHint: text("mystery_hint"),
    vibeTags: jsonb("vibe_tags").$type<string[]>().default([]).notNull(),
    imageUrl: text("image_url"),
    maxParticipants: integer("max_participants").default(20),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    dateIdx: index("event_date_idx").on(table.date),
    categoryIdx: index("event_category_idx").on(table.category),
  }),
);

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export const eventsRelations = relations(events, ({ many }) => ({
  rideBookings: many(rideBookings),
}));

// Matches between users
export const matches = createTable(
  "match",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    user1Id: varchar("user1_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    user2Id: varchar("user2_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    compatibilityScore: integer("compatibility_score").notNull(),
    sharedInterests: jsonb("shared_interests").$type<string[]>().default([]).notNull(),
    vibeMatch: varchar("vibe_match", { length: 50 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, declined
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    user1Idx: index("match_user1_idx").on(table.user1Id),
    user2Idx: index("match_user2_idx").on(table.user2Id),
  }),
);

export type Match = InferSelectModel<typeof matches>;
export type NewMatch = InferInsertModel<typeof matches>;

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, { fields: [matches.user1Id], references: [users.id], relationName: "user1Matches" }),
  user2: one(users, { fields: [matches.user2Id], references: [users.id], relationName: "user2Matches" }),
  rideBookings: many(rideBookings),
}));

// Ride bookings
export const rideBookings = createTable(
  "ride_booking",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: varchar("event_id", { length: 255 })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    matchId: varchar("match_id", { length: 255 })
      .references(() => matches.id, { onDelete: "set null" }),
    pickupTime: timestamp("pickup_time", { withTimezone: true }),
    status: varchar("status", { length: 50 }).default("confirmed").notNull(), // confirmed, cancelled, completed
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("booking_user_id_idx").on(table.userId),
    eventIdIdx: index("booking_event_id_idx").on(table.eventId),
  }),
);

export type RideBooking = InferSelectModel<typeof rideBookings>;
export type NewRideBooking = InferInsertModel<typeof rideBookings>;

export const rideBookingsRelations = relations(rideBookings, ({ one }) => ({
  user: one(users, { fields: [rideBookings.userId], references: [users.id] }),
  event: one(events, { fields: [rideBookings.eventId], references: [events.id] }),
  match: one(matches, { fields: [rideBookings.matchId], references: [matches.id] }),
}));

// Messages for chat between users
export const messages = createTable(
  "message",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: varchar("sender_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: varchar("receiver_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    read: boolean("read").default(false).notNull(),
    // Event invitation fields
    eventId: varchar("event_id", { length: 255 })
      .references(() => events.id, { onDelete: "set null" }),
    inviteStatus: varchar("invite_status", { length: 50 }), // pending, accepted, declined
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    senderIdx: index("message_sender_idx").on(table.senderId),
    receiverIdx: index("message_receiver_idx").on(table.receiverId),
    conversationIdx: index("message_conversation_idx").on(table.senderId, table.receiverId),
  }),
);

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sentMessages" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receivedMessages" }),
  event: one(events, { fields: [messages.eventId], references: [events.id] }),
}));
