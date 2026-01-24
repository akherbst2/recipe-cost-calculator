import { desc, eq } from "drizzle-orm";
import { events, InsertEvent } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Log an event to the database
 */
export async function logEvent(event: Omit<InsertEvent, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) {
    console.warn("[Events] Cannot log event: database not available");
    return null;
  }

  try {
    const result = await db.insert(events).values(event);
    return result;
  } catch (error) {
    console.error("[Events] Failed to log event:", error);
    return null;
  }
}

/**
 * Get events by type
 */
export async function getEventsByType(eventType: string, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Events] Cannot get events: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.eventType, eventType))
      .orderBy(desc(events.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Events] Failed to get events:", error);
    return [];
  }
}

/**
 * Get events by user ID
 */
export async function getEventsByUserId(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Events] Cannot get events: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Events] Failed to get events:", error);
    return [];
  }
}

/**
 * Get events by session ID
 */
export async function getEventsBySessionId(sessionId: string, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Events] Cannot get events: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.sessionId, sessionId))
      .orderBy(desc(events.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Events] Failed to get events:", error);
    return [];
  }
}
