# Usage Analytics Guide

## Overview

Your Recipe Cost Calculator tracks **all users worldwide** without requiring authentication. The event logging system captures anonymous visitors through session-based tracking, allowing you to analyze usage patterns, popular ingredients, and user behavior.

## How Anonymous Tracking Works

### Session-Based Identification
- Each visitor gets a unique session ID stored in their browser (`sessionStorage`)
- Session IDs persist across page reloads within the same browser session
- Format: `session_1769358872804_2o81rm9iu65`

### Event Logging
- **Anonymous users**: `userId = null`, tracked by `sessionId`
- **Authenticated users**: Both `userId` and `sessionId` are recorded
- **No authentication required**: All visitors are tracked automatically

### Data Captured
Every event includes:
- Event type (ingredient_add, ingredient_edit, recipe_save, etc.)
- Complete ingredient details (name, quantities, units, costs)
- Language preference (en, es, fr)
- Timestamp
- Session ID (for anonymous users) or User ID (for authenticated users)

## Database Schema

```sql
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventType VARCHAR(255) NOT NULL,
  userId INT NULL,  -- NULL for anonymous users
  sessionId VARCHAR(255) NULL,
  eventData JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Pattern Analysis Queries

### 1. Most Popular Ingredients

```sql
SELECT 
  JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.ingredientName')) as ingredient,
  COUNT(*) as usage_count
FROM events 
WHERE eventType = 'ingredient_add'
  AND JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.ingredientName')) != ''
GROUP BY ingredient 
ORDER BY usage_count DESC 
LIMIT 20;
```

### 2. Language Distribution

```sql
SELECT 
  JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.language')) as language,
  COUNT(DISTINCT sessionId) as unique_users,
  COUNT(*) as total_events
FROM events 
GROUP BY language 
ORDER BY unique_users DESC;
```

### 3. Anonymous vs Authenticated Users

```sql
SELECT 
  CASE 
    WHEN userId IS NULL THEN 'Anonymous' 
    ELSE 'Authenticated' 
  END as user_type,
  COUNT(DISTINCT sessionId) as unique_sessions,
  COUNT(*) as total_events
FROM events 
GROUP BY user_type;
```

### 4. Most Active Sessions

```sql
SELECT 
  sessionId,
  userId,
  COUNT(*) as event_count,
  MIN(createdAt) as first_activity,
  MAX(createdAt) as last_activity,
  TIMESTAMPDIFF(MINUTE, MIN(createdAt), MAX(createdAt)) as session_duration_minutes
FROM events 
GROUP BY sessionId, userId 
ORDER BY event_count DESC 
LIMIT 20;
```

### 5. Popular Units Used

```sql
SELECT 
  JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.usedUnit')) as unit,
  COUNT(*) as usage_count
FROM events 
WHERE eventType IN ('ingredient_add', 'ingredient_edit')
  AND JSON_EXTRACT(eventData, '$.usedUnit') IS NOT NULL
GROUP BY unit 
ORDER BY usage_count DESC;
```

### 6. Average Ingredient Cost

```sql
SELECT 
  AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.calculatedCost')) AS DECIMAL(10,2))) as avg_cost,
  MIN(CAST(JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.calculatedCost')) AS DECIMAL(10,2))) as min_cost,
  MAX(CAST(JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.calculatedCost')) AS DECIMAL(10,2))) as max_cost
FROM events 
WHERE eventType = 'ingredient_edit'
  AND CAST(JSON_UNQUOTE(JSON_EXTRACT(eventData, '$.calculatedCost')) AS DECIMAL(10,2)) > 0;
```

### 7. Daily Active Users (DAU)

```sql
SELECT 
  DATE(createdAt) as date,
  COUNT(DISTINCT sessionId) as daily_active_users,
  COUNT(*) as total_events
FROM events 
GROUP BY DATE(createdAt) 
ORDER BY date DESC 
LIMIT 30;
```

### 8. Feature Usage Distribution

```sql
SELECT 
  eventType,
  COUNT(*) as event_count,
  COUNT(DISTINCT sessionId) as unique_users,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events 
GROUP BY eventType 
ORDER BY event_count DESC;
```

### 9. Recipe Save Rate

```sql
SELECT 
  COUNT(DISTINCT CASE WHEN eventType = 'recipe_save' THEN sessionId END) as users_who_saved,
  COUNT(DISTINCT sessionId) as total_users,
  ROUND(
    COUNT(DISTINCT CASE WHEN eventType = 'recipe_save' THEN sessionId END) * 100.0 / 
    COUNT(DISTINCT sessionId), 
    2
  ) as save_rate_percentage
FROM events;
```

### 10. Time-Based Usage Patterns

```sql
SELECT 
  HOUR(createdAt) as hour_of_day,
  COUNT(*) as event_count,
  COUNT(DISTINCT sessionId) as unique_users
FROM events 
GROUP BY HOUR(createdAt) 
ORDER BY hour_of_day;
```

## Accessing the Database

### Via Management UI
1. Open Management UI (icon in top-right of chatbox)
2. Navigate to "Database" panel
3. Use the CRUD interface to view events table
4. Run custom SQL queries in the query editor

### Via Node.js Script

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Your query here
  const [rows] = await conn.query('SELECT * FROM events LIMIT 10');
  console.log(rows);
  
  await conn.end();
})();
```

## Privacy Considerations

- Session IDs are randomly generated and not personally identifiable
- No personal information is collected without user consent
- Anonymous tracking complies with GDPR as no PII is stored
- Users can clear their browser storage to reset their session ID

## Suggested Analytics Dashboard Features

1. **Real-time metrics**: Active users, events per minute, popular features
2. **Ingredient trends**: Most-used ingredients, average costs, unit preferences
3. **User engagement**: Session duration, events per session, return rate
4. **Geographic insights**: Language distribution as proxy for location
5. **Conversion funnel**: Visitor → Ingredient add → Recipe save → Export

## Next Steps

1. **Create Admin Dashboard**: Build a protected page with charts visualizing these metrics
2. **Export Analytics**: Add functionality to export event data as CSV for external analysis
3. **Set up Alerts**: Notify when certain thresholds are reached (e.g., 1000 daily users)
4. **A/B Testing**: Use event data to test feature variations and measure impact
