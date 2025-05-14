// schema.ts
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  PgColumn,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations } from "drizzle-orm";

const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"),
  image: text("image"),
  role: text("role").$type<"admin" | "consultant">().default("consultant"),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey(account.provider, account.providerAccountId)]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey(vt.identifier, vt.token)]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (auth) => [primaryKey(auth.userId, auth.credentialID)]
);

export const clientAccounts = pgTable("clientAccount", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parent_account_id: uuid("parent_account_id").references(
    (): PgColumn => clientAccounts.id,
    {
      onDelete: "cascade",
    }
  ),
  industry: text("industry").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contactStatusEnum = pgEnum("contact_status", [
  "active",
  "inactive",
  "pending",
]);

export const contacts = pgTable("contact", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => clientAccounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  position: text("position"),
  status: contactStatusEnum("status").default("active"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userAccounts = pgTable("userAccount", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => clientAccounts.id, {
    onDelete: "cascade",
  }),
});

// schema.ts
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "canceled",
]);

export const appointments = pgTable("appointment", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .references(() => contacts.id, { onDelete: "cascade" })
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  startTime: timestamp("start_time", { mode: "date" }).notNull(),
  endTime: timestamp("end_time", { mode: "date" }).notNull(),
  purpose: text("purpose").notNull(),
  notes: text("notes"),
  status: appointmentStatusEnum("status").default("scheduled"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Survey Table
export const surveys = pgTable("survey", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .notNull(),
  contactId: uuid("contact_id")
    .references(() => contacts.id, { onDelete: "cascade" })
    .notNull(),
  overallRating: integer("overall_rating").notNull(),
  serviceQuality: integer("service_quality").notNull(),
  suggestions: text("suggestions"),
  completedAt: timestamp("completed_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});
// users.ts
// userAccounts relations (CORRECT)
export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    relationName: "user_to_account", // Unique name for user side
    fields: [userAccounts.userId],
    references: [users.id],
  }),
  clientAccount: one(clientAccounts, {
    relationName: "account_to_user", // Unique name for account side
    fields: [userAccounts.accountId],
    references: [clientAccounts.id],
  }),
}));

// users relations
export const usersRelations = relations(users, ({ many }) => ({
  clientAccounts: many(userAccounts, {
    relationName: "user_to_account", // Match user side
  }),
}));

// clientAccounts relations
export const clientAccountsRelations = relations(
  clientAccounts,
  ({ many }) => ({
    users: many(userAccounts, {
      relationName: "account_to_user", // Match account side
    }),
  })
);
