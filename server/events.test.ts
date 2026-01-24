import { describe, expect, it, beforeEach } from "vitest";
import { logEvent, getEventsByType, getEventsBySessionId } from "./events";
import { getDb } from "./db";
import { events } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Events Logging", () => {
  const testSessionId = `test_session_${Date.now()}`;
  
  beforeEach(async () => {
    // Clean up test events before each test
    const db = await getDb();
    if (db) {
      await db.delete(events).where(eq(events.sessionId, testSessionId));
    }
  });

  it("should log an event successfully", async () => {
    const result = await logEvent({
      eventType: "test_event",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify({ test: "data" }),
    });

    expect(result).toBeTruthy();
  });

  it("should retrieve events by type", async () => {
    // Log a test event
    await logEvent({
      eventType: "ingredient_add",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify({ ingredientId: "test123" }),
    });

    // Retrieve events
    const retrievedEvents = await getEventsByType("ingredient_add", 10);
    
    expect(retrievedEvents.length).toBeGreaterThan(0);
    const testEvent = retrievedEvents.find(e => e.sessionId === testSessionId);
    expect(testEvent).toBeTruthy();
    expect(testEvent?.eventType).toBe("ingredient_add");
  });

  it("should retrieve events by session ID", async () => {
    // Log multiple events for the same session
    await logEvent({
      eventType: "ingredient_add",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify({ ingredientId: "test1" }),
    });

    await logEvent({
      eventType: "ingredient_delete",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify({ ingredientId: "test1" }),
    });

    // Retrieve events by session
    const sessionEvents = await getEventsBySessionId(testSessionId, 10);
    
    expect(sessionEvents.length).toBe(2);
    expect(sessionEvents[0].sessionId).toBe(testSessionId);
    expect(sessionEvents[1].sessionId).toBe(testSessionId);
  });

  it("should store event data as JSON string", async () => {
    const eventData = {
      recipeName: "Test Recipe",
      ingredientCount: 5,
      totalCost: 12.50,
    };

    await logEvent({
      eventType: "recipe_save",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify(eventData),
    });

    const sessionEvents = await getEventsBySessionId(testSessionId, 1);
    expect(sessionEvents.length).toBe(1);
    
    const storedData = JSON.parse(sessionEvents[0].eventData);
    expect(storedData.recipeName).toBe("Test Recipe");
    expect(storedData.ingredientCount).toBe(5);
    expect(storedData.totalCost).toBe(12.50);
  });

  it("should handle null userId for anonymous users", async () => {
    await logEvent({
      eventType: "ingredient_add",
      userId: null,
      sessionId: testSessionId,
      eventData: JSON.stringify({ test: "anonymous" }),
    });

    const sessionEvents = await getEventsBySessionId(testSessionId, 1);
    expect(sessionEvents.length).toBe(1);
    expect(sessionEvents[0].userId).toBeNull();
  });
});
