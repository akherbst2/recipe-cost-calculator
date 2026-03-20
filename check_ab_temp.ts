import { ENV } from './server/_core/env';
import { createConnection } from 'mysql2/promise';

async function main() {
  const conn = await createConnection(ENV.databaseUrl);

  const [allTypes] = await conn.execute(`
    SELECT eventType, COUNT(*) as count, MAX(createdAt) as latest
    FROM events
    GROUP BY eventType
    ORDER BY count DESC
  `);
  console.log("=== ALL EVENT TYPES ===");
  console.table(allTypes);

  const [summary] = await conn.execute(`
    SELECT COUNT(*) as total, MIN(createdAt) as first, MAX(createdAt) as last
    FROM events
  `);
  console.log("\n=== SUMMARY ===");
  console.table(summary);

  const [recent] = await conn.execute(`
    SELECT eventType, sessionId, eventData, createdAt
    FROM events
    ORDER BY createdAt DESC
    LIMIT 20
  `);
  console.log("\n=== RECENT 20 EVENTS ===");
  for (const row of (recent as any[])) {
    console.log('[' + row.createdAt + '] ' + row.eventType + ' | data: ' + row.eventData);
  }

  const [abData] = await conn.execute(`
    SELECT eventType, eventData, createdAt
    FROM events
    WHERE eventData LIKE '%ab_group%' OR eventData LIKE '%"group"%' OR eventType LIKE '%ab%'
    ORDER BY createdAt DESC
    LIMIT 20
  `);
  console.log("\n=== A/B TEST RELATED EVENTS (count: " + (abData as any[]).length + ") ===");
  for (const row of (abData as any[])) {
    console.log('[' + row.createdAt + '] ' + row.eventType + ': ' + row.eventData);
  }

  const [postDeploy] = await conn.execute(`
    SELECT eventType, COUNT(*) as count
    FROM events
    WHERE createdAt >= '2026-02-16 18:00:00'
    GROUP BY eventType
    ORDER BY count DESC
  `);
  console.log("\n=== EVENTS AFTER A/B TEST DEPLOYMENT (Feb 16 6pm) ===");
  console.table(postDeploy);

  await conn.end();
}

main().catch(console.error);
