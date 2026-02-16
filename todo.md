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

## Database Cleanup & Try Example Feature
- [x] Delete all owner events from database (deleted 10,462 events)
- [x] Add "Try Example" button to home page
- [x] Pre-fill sample ingredient data when clicked (Butter, 2 tbsp, $3.99, etc.)
- [x] Test Try Example functionality (verified: loads 3 ingredients with calculated costs)

## Social Sharing Feature
- [x] Create database table for shared recipes
- [x] Add backend API endpoints for creating and retrieving shared recipes
- [x] Add "Share Recipe" button to UI
- [x] Generate shareable link with unique ID
- [x] Create shared recipe view page
- [x] Add Open Graph meta tags for social media previews
- [x] Add copy-to-clipboard functionality for share link (implemented in ShareRecipeDialog)
- [x] Test sharing functionality end-to-end (all 19 tests passing, browser test confirmed)

## About Us and Contact Us Pages
- [x] Create About Us page with personal introduction (Alyssa, software engineer)
- [x] Create Contact Us page with email link to alyssaherbst@gmail.com
- [x] Add navigation links to footer or header
- [x] Add translations for About and Contact pages (English, Spanish, French)
- [x] Test both pages and navigation (all tests passing)

## Advanced SEO Improvements
- [x] Create sitemap.xml file with all pages
- [x] Enhance robots.txt with sitemap reference
- [x] Add comprehensive meta tags to all pages (title, description, keywords)
- [x] Implement JSON-LD structured data for WebApplication
- [x] Add canonical URLs to prevent duplicate content
- [x] Optimize meta descriptions for each page
- [x] Test SEO improvements with validation tools (all tests passing)

## Google Search Console Verification
- [x] Add Google Site Verification meta tag to index.html
- [x] Test verification tag is present in page source (verified)

## Data-Driven UX Improvements (Based on Analytics)

### Enhanced Logging System
- [x] Implement field-level interaction tracking (focus, blur, complete, error)
- [x] Add user journey path tracking (step progression, abandonment points)
- [x] Implement feature discovery tracking (which features users find/use)
- [x] Add unit conversion analytics (attempted, success, error patterns)
- [x] Implement time-on-task tracking (hesitation, time to first action)
- [x] Add error & frustration signal detection (rapid clicks, form resets)
- [x] Implement device-specific behavior tracking (mobile vs desktop)

### Improvement 1: Interactive Onboarding Tutorial
- [x] Create onboarding overlay component with step-by-step guidance
- [x] Add tooltip hints on each field explaining what to enter
- [x] Implement progress indicator (Step X of Y)
- [x] Add "Skip Tutorial" option for returning users
- [x] Store tutorial completion state in localStorage

### Improvement 2: Smart Field Validation & Inline Help
- [x] Add real-time validation with friendly error messages
- [x] Implement field-level help text that appears on focus
- [x] Add visual progress indicators for field completion
- [x] Create smart defaults for unit selection
- [x] Add example values in placeholders

### Improvement 3: Enhanced Try Example Feature
- [x] Improve Try Example to fill complete 7-ingredient chocolate chip cookie recipe
- [x] Make example editable with real-time cost updates
- [x] Add "Clear All" button prominently displayed
- [x] Track Try Example → Cost Calculation conversion

### Improvement 4: Recipe Templates & Quick Start
- [ ] Create recipe templates for common dishes (5-10 recipes)
- [ ] Add "Quick Start" section with pre-populated recipes
- [ ] Implement "Duplicate Recipe" functionality
- [ ] Add auto-save drafts feature

### Improvement 5: Progressive Disclosure
- [ ] Implement progressive disclosure for ingredient fields
- [ ] Add collapsible sections for advanced features
- [ ] Create contextual help that appears when relevant
- [ ] Reduce initial cognitive load

### Testing & Validation
- [ ] Test all new logging events are firing correctly
- [ ] Test onboarding tutorial flow for new users
- [ ] Test field validation and help text
- [ ] Test Try Example feature improvements
- [ ] Test recipe templates and quick start
- [ ] Test progressive disclosure UX
- [ ] Verify all improvements work on mobile and desktop

## Onboarding Tutorial Bug Fix
- [x] Fix querySelector syntax error in OnboardingTutorial component (line 65)
- [x] Replace invalid Playwright selectors with valid DOM selectors
- [x] Test complete onboarding flow (all 7 steps) - verified working
