import { ENV } from './server/_core/env';
import { createConnection } from 'mysql2/promise';

async function main() {
  const conn = await createConnection(ENV.databaseUrl);

  // Get onboarding events breakdown
  const [onboarding] = await conn.execute(`
    SELECT 
      eventType,
      COUNT(*) as count,
      COUNT(DISTINCT sessionId) as unique_sessions
    FROM events
    WHERE eventType IN ('onboarding_skipped', 'onboarding_complete', 'journey_step', 'journey_abandon', 'first_ingredient_added', 'cost_calculated', 'recipe_save_as', 'recipe_save')
    AND createdAt >= '2026-02-16 18:00:00'
    GROUP BY eventType
    ORDER BY count DESC
  `);
  console.log("=== ONBOARDING & CONVERSION EVENTS ===");
  console.table(onboarding);

  // Total sessions since deployment
  const [sessions] = await conn.execute(`
    SELECT COUNT(DISTINCT sessionId) as total_sessions
    FROM events
    WHERE createdAt >= '2026-02-16 18:00:00'
  `);
  console.log("\n=== TOTAL SESSIONS SINCE DEPLOYMENT ===");
  console.table(sessions);

  // Check if any events have ab_group in eventData
  const [withGroup] = await conn.execute(`
    SELECT eventType, eventData
    FROM events
    WHERE eventData LIKE '%"ab_group"%'
    LIMIT 10
  `);
  console.log("\n=== EVENTS WITH ab_group FIELD ===");
  console.log("Count:", (withGroup as any[]).length);
  for (const row of (withGroup as any[])) {
    console.log(row.eventType + ': ' + row.eventData);
  }

  // Check onboarding_complete events to see if group is tracked
  const [completeEvents] = await conn.execute(`
    SELECT eventType, eventData, createdAt
    FROM events
    WHERE eventType IN ('onboarding_complete', 'onboarding_skipped')
    ORDER BY createdAt DESC
    LIMIT 10
  `);
  console.log("\n=== ONBOARDING COMPLETE/SKIPPED EVENTS ===");
  for (const row of (completeEvents as any[])) {
    console.log('[' + row.createdAt + '] ' + row.eventType + ': ' + row.eventData);
  }

  // Conversion funnel since deployment
  const [funnel] = await conn.execute(`
    SELECT 
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType = 'session_start' AND createdAt >= '2026-02-16 18:00:00') as total_sessions,
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType = 'first_ingredient_added' AND createdAt >= '2026-02-16 18:00:00') as added_ingredient,
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType = 'cost_calculated' AND createdAt >= '2026-02-16 18:00:00') as calculated_cost,
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType IN ('recipe_save', 'recipe_save_as') AND createdAt >= '2026-02-16 18:00:00') as saved_recipe,
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType = 'onboarding_complete' AND createdAt >= '2026-02-16 18:00:00') as completed_tutorial,
      (SELECT COUNT(DISTINCT sessionId) FROM events WHERE eventType = 'onboarding_skipped' AND createdAt >= '2026-02-16 18:00:00') as skipped_tutorial
  `);
  console.log("\n=== CONVERSION FUNNEL SINCE DEPLOYMENT ===");
  console.table(funnel);

  await conn.end();
}

main().catch(console.error);
