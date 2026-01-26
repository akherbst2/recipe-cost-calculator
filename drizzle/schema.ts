import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Events table for tracking user interactions with ingredients and recipes.
 * Stores all user actions for analytics and debugging.
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  /** Event type: ingredient_add, ingredient_edit, ingredient_delete, recipe_save, recipe_load, etc. */
  eventType: varchar("eventType", { length: 64 }).notNull(),
  /** User ID if authenticated, null for anonymous users */
  userId: int("userId"),
  /** Session ID to track anonymous users */
  sessionId: varchar("sessionId", { length: 64 }),
  /** JSON data containing event-specific fields */
  eventData: text("eventData").notNull(),
  /** Timestamp when the event occurred */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Shared recipes table for social sharing functionality.
 * Stores recipe data with a unique shareable ID.
 */
export const sharedRecipes = mysqlTable("sharedRecipes", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique short ID for the shareable URL (e.g., "abc123") */
  shareId: varchar("shareId", { length: 16 }).notNull().unique(),
  /** Recipe name */
  name: varchar("name", { length: 255 }).notNull(),
  /** JSON data containing ingredients array */
  ingredients: text("ingredients").notNull(),
  /** Number of servings */
  servings: int("servings").notNull(),
  /** Batch multiplier */
  batchMultiplier: int("batchMultiplier").notNull(),
  /** Total cost calculated */
  totalCost: int("totalCost").notNull(), // Store as cents to avoid floating point issues
  /** User ID if authenticated, null for anonymous shares */
  userId: int("userId"),
  /** Timestamp when the recipe was shared */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedRecipe = typeof sharedRecipes.$inferSelect;
export type InsertSharedRecipe = typeof sharedRecipes.$inferInsert;