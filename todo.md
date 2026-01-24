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
