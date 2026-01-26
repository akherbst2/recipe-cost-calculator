import { eq, desc } from "drizzle-orm";
import { events, InsertEvent, users } from "../drizzle/schema";
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

/**
 * Get analytics data for admin dashboard
 * Excludes owner sessions and Manus test traffic
 */
export async function getAnalyticsData(ownerOpenId?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Events] Cannot get analytics: database not available");
    return null;
  }

  try {
    // Get all events for analysis
    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));

    // Get owner's userId if ownerOpenId is provided
    let ownerUserId: number | null = null;
    if (ownerOpenId) {
      const ownerUser = await db
        .select()
        .from(users)
        .where(eq(users.openId, ownerOpenId))
        .limit(1);
      if (ownerUser.length > 0) {
        ownerUserId = ownerUser[0].id;
      }
    }

    // Filter out owner sessions and Manus test traffic
    const filteredEvents = allEvents.filter(e => {
      // Exclude events from owner
      if (ownerUserId && e.userId === ownerUserId) {
        return false;
      }
      
      // Exclude Manus test traffic (referrer contains manus.im)
      try {
        const data = JSON.parse(e.eventData);
        if (data.referrer && data.referrer.includes('manus.im')) {
          return false;
        }
      } catch {}
      
      return true;
    });

    // Calculate metrics using filtered events
    const totalSessions = new Set(filteredEvents.map(e => e.sessionId).filter(Boolean)).size;
    const anonymousSessions = new Set(
      filteredEvents.filter(e => e.userId === null).map(e => e.sessionId).filter(Boolean)
    ).size;
    
    const sessionStartEvents = filteredEvents.filter(e => e.eventType === 'session_start');
    const costCalculatedEvents = filteredEvents.filter(e => e.eventType === 'cost_calculated');
    const sessionEndEvents = filteredEvents.filter(e => e.eventType === 'session_end');
    
    // Conversion rate: sessions with cost_calculated / total sessions
    const sessionsWithCost = new Set(costCalculatedEvents.map(e => e.sessionId).filter(Boolean)).size;
    const conversionRate = totalSessions > 0 ? (sessionsWithCost / totalSessions) * 100 : 0;
    
    // Average session duration from session_end events
    const sessionDurations = sessionEndEvents
      .map(e => {
        try {
          const data = JSON.parse(e.eventData);
          return data.sessionDuration || 0;
        } catch {
          return 0;
        }
      })
      .filter(d => d > 0);
    const avgSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;
    
    // Traffic sources from session_start events
    const trafficSources: Record<string, number> = {};
    sessionStartEvents.forEach(e => {
      try {
        const data = JSON.parse(e.eventData);
        const source = data.referrer || 'direct';
        trafficSources[source] = (trafficSources[source] || 0) + 1;
      } catch {}
    });
    
    // Popular ingredients from ingredient_edit events
    const ingredientCounts: Record<string, number> = {};
    filteredEvents
      .filter(e => e.eventType === 'ingredient_edit')
      .forEach(e => {
        try {
          const data = JSON.parse(e.eventData);
          const name = data.ingredientName;
          if (name && name.trim()) {
            ingredientCounts[name] = (ingredientCounts[name] || 0) + 1;
          }
        } catch {}
      });
    
    const popularIngredients = Object.entries(ingredientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Language distribution
    const languageCounts: Record<string, number> = {};
    sessionStartEvents.forEach(e => {
      try {
        const data = JSON.parse(e.eventData);
        const lang = data.language || 'unknown';
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      } catch {}
    });
    
    // Daily visitors (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessionStartEvents.filter(e => new Date(e.createdAt) >= sevenDaysAgo);
    
    const dailyVisitors: Record<string, number> = {};
    recentSessions.forEach(e => {
      const date = new Date(e.createdAt).toISOString().split('T')[0];
      dailyVisitors[date] = (dailyVisitors[date] || 0) + 1;
    });
    
    return {
      overview: {
        totalSessions,
        anonymousSessions,
        authenticatedSessions: totalSessions - anonymousSessions,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgSessionDuration: Math.round(avgSessionDuration),
        totalEvents: filteredEvents.length,
      },
      trafficSources: Object.entries(trafficSources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      popularIngredients,
      languages: Object.entries(languageCounts)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count),
      dailyVisitors: Object.entries(dailyVisitors)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error("[Events] Failed to get analytics:", error);
    return null;
  }
}
