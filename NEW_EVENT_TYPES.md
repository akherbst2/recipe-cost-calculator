# New Event Types to Implement

## Session & Page Events

### `session_start`
**When**: User first lands on the page
**Data**:
- `referrer`: Document referrer URL
- `userAgent`: Browser user agent
- `screenResolution`: Screen width x height
- `language`: Browser language

### `page_view`
**When**: Page loads or route changes
**Data**:
- `path`: Current page path
- `title`: Page title
- `referrer`: Previous page

### `session_heartbeat`
**When**: Every 30 seconds while user is active
**Data**:
- `duration`: Seconds since session start
- `eventsCount`: Number of events in this session

## User Interaction Events

### `button_click`
**When**: User clicks any major button
**Data**:
- `buttonName`: "Add Ingredient", "Save", "Load", "Export", "Clear All"
- `context`: Additional context (e.g., which dropdown option)

### `ingredient_complete`
**When**: User fills all required fields for an ingredient
**Data**:
- `ingredientId`: ID of completed ingredient
- `ingredientName`: Name entered
- `calculatedCost`: Final cost
- `timeToComplete`: Seconds from add to complete

### `cost_calculated`
**When**: Total cost updates to non-zero value
**Data**:
- `totalCost`: Calculated total
- `ingredientCount`: Number of ingredients
- `servings`: Servings per recipe

### `unit_conversion`
**When**: User changes units that trigger conversion
**Data**:
- `fromUnit`: Original unit
- `toUnit`: New unit
- `conversionSuccess`: Boolean

## Feature Usage Events

### `recipe_export`
**When**: User exports recipe (CSV or Excel)
**Data**:
- `format`: "csv" or "excel"
- `ingredientCount`: Number of ingredients exported
- `totalCost`: Recipe total cost

### `recipe_load_attempt`
**When**: User opens load dialog
**Data**:
- `savedRecipesCount`: Number of saved recipes available

### `recipe_loaded`
**When**: User successfully loads a recipe
**Data**:
- `recipeId`: ID of loaded recipe
- `recipeName`: Name of recipe
- `ingredientCount`: Number of ingredients in recipe

### `language_change`
**When**: User switches language
**Data**:
- `fromLanguage`: Previous language
- `toLanguage`: New language

## Engagement & Completion Events

### `first_ingredient_added`
**When**: User adds their very first ingredient (per session)
**Data**:
- `timeFromPageLoad`: Seconds from page load to first add

### `recipe_completed`
**When**: User has at least one ingredient with all fields filled and cost > 0
**Data**:
- `ingredientCount`: Number of completed ingredients
- `totalCost`: Total recipe cost
- `timeToComplete`: Seconds from session start to completion

### `clear_all_clicked`
**When**: User clicks Clear All button
**Data**:
- `ingredientCount`: Number of ingredients cleared
- `hadCalculatedCost`: Boolean - whether there was a calculated cost

## Error & Validation Events

### `validation_error`
**When**: User encounters a validation error
**Data**:
- `errorType`: Type of validation error
- `fieldName`: Which field caused the error
- `errorMessage`: Error message shown

### `unit_conversion_error`
**When**: Unit conversion fails (incompatible units)
**Data**:
- `fromUnit`: Source unit
- `toUnit`: Target unit
- `errorMessage`: Error message

## Exit Intent Events

### `session_end`
**When**: User closes tab/navigates away (beforeunload event)
**Data**:
- `sessionDuration`: Total seconds on site
- `totalEvents`: Number of events in session
- `completedIngredients`: Number of ingredients with all fields filled
- `hadCalculatedCost`: Boolean - whether user calculated any cost

## Priority Implementation Order

1. **High Priority** (Immediate insights):
   - `session_start` - Track total visitors
   - `page_view` - Understand traffic
   - `cost_calculated` - Track successful completions
   - `recipe_completed` - Measure conversion
   - `session_end` - Calculate engagement duration

2. **Medium Priority** (Feature usage):
   - `button_click` - Understand feature discovery
   - `recipe_export` - Track export usage
   - `language_change` - Language preferences
   - `ingredient_complete` - Track completion rate

3. **Low Priority** (Nice to have):
   - `session_heartbeat` - Active time tracking
   - `validation_error` - UX improvements
   - `unit_conversion` - Feature usage details
