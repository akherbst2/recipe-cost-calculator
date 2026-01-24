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
