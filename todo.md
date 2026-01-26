# Recipe Cost Calculator TODO

## Event Logging System
- [x] Design events database schema with tables for ingredient_events and recipe_events
- [x] Create database migration for events tables
- [x] Implement backend API endpoints for logging events
- [x] Integrate event logging into ingredient add/edit actions
- [x] Integrate event logging into recipe save actions
- [x] Test event logging functionality

## Event Logging Enhancement
- [x] Update ingredient_add event to include complete ingredient details
- [x] Update ingredient_edit event to track field changes with before/after values
- [x] Test and verify ingredient data is fully readable in database

## Fix Over-Logging Issue
- [x] Investigate why multiple events are logged for single actions
- [x] Fix the over-logging (moved logging from inside setState to useEffect)
- [x] Test and verify only one event per action

## Comprehensive Stress Testing
- [x] Test ingredient add/edit/delete/duplicate with logging verification
- [x] Test all language translations (English/Spanish/French)
- [x] Test recipe save/load/delete flows
- [x] Test unit conversions and edge cases
- [x] Test export functionality (CSV/Excel)
- [x] Identify any confusing UI elements or flows
- [x] Create comprehensive stress test report

## UX Improvements from Stress Test
- [x] Fix language code in event logging to capture actual codes (en, es, fr)
- [x] Add empty cost explanation when total is $0.00
- [x] Test both fixes to verify improvements

## SEO Improvements
- [x] Add meta keywords tag
- [x] Update page title to 30-60 characters (now 52 chars)
- [x] Add meta description (50-160 characters, now 152 chars)
- [x] Test SEO improvements

## AdSense Setup
- [x] Create ads.txt file with Google AdSense publisher ID
- [x] Test ads.txt file accessibility at root URL

## SEO - Robots.txt
- [x] Create robots.txt file with proper directives
- [x] Test robots.txt file accessibility at root URL

## Anonymous User Tracking Enhancement
- [x] Review current event logging for anonymous users
- [x] Verify session tracking works for unauthenticated visitors
- [x] Test anonymous user event logging
- [x] Confirm usage patterns can be analyzed from event data

## Event Log Analysis & Enhancement
- [x] Analyze existing anonymous user events (28 sessions, all shallow engagement)
- [x] Identify logging gaps (page views, session start/end, errors, etc.)
- [x] Design new event types (20+ events documented)
- [x] Implement high-priority event types (session_start, page_view, cost_calculated, session_end, first_ingredient_added, button_click)
- [x] Test enhanced logging capabilities

## Admin Analytics Dashboard
- [x] Create backend tRPC procedures for analytics data (traffic, engagement, conversion, ingredients)
- [x] Build admin dashboard page with charts and metrics
- [x] Add admin route protection (analytics link only visible when authenticated)
- [x] Add navigation link to admin dashboard
- [x] Test dashboard with real event data (all 8 tests passing)

## Owner-Only Analytics Access
- [x] Add owner-only protection to analytics backend endpoint
- [x] Update frontend to handle unauthorized access gracefully
- [x] Hide Analytics button from non-owner users
- [x] Add VITE_OWNER_OPEN_ID environment variable
- [x] Test owner-only access restriction (verified: Analytics button hidden from non-owners, dashboard accessible to owner)

## Analytics Dashboard - Exclude Owner/Test Traffic
- [x] Update analytics queries to exclude owner sessions (by userId/openId)
- [x] Exclude Manus test traffic (referrer contains manus.im)
- [x] Test filtered analytics to verify only real user data is shown (31 sessions, filtered out 18 owner/test sessions)
