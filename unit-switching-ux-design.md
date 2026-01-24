# UX Flow Design: Cross-Category Unit Switching

## Problem
User starts entering ingredient with volume units (e.g., cup), then realizes they need weight units (e.g., lb) because their package is measured in weight. Current behavior: units are incompatible, calculation fails silently or shows $0.00.

## User Scenarios

### Scenario 1: Switch before entering quantities
- User selects "cup" for quantity used
- Realizes package is in "lb"
- Wants to switch to weight units
- **Solution**: Allow switching, no data loss

### Scenario 2: Switch after entering quantity used
- User enters "2 cups" for quantity used
- Starts entering package info, realizes package is "5 lb"
- Wants to switch quantity used to weight
- **Solution**: Show warning, offer to clear quantity or keep incompatible

### Scenario 3: Switch after entering both quantities
- User enters "2 cups" used, "1 L" package
- Realizes they meant to use weight units
- **Solution**: Show warning, offer to clear all quantities or cancel

## Recommended UX Flow

### Option A: Filter Package Units (Recommended)
**When user selects quantity used unit:**
1. Detect unit category (volume/weight/count)
2. Filter package unit dropdown to only show compatible units
3. If package unit is already set to incompatible unit, auto-reset to default compatible unit
4. Show subtle hint: "Package unit filtered to match quantity used"

**Pros:**
- Prevents incompatible combinations
- No error states to handle
- Clear visual feedback
- Maintains auto-sync behavior

**Cons:**
- User can't easily switch categories mid-entry
- Might feel restrictive

### Option B: Warning Dialog (More Flexible)
**When user selects incompatible unit:**
1. Detect incompatibility
2. Show toast/dialog: "Switching from volume to weight. Package size will be reset to match."
3. Auto-reset package unit to match new category
4. Clear package size value (but keep quantity used)
5. Resume auto-sync with new unit category

**Pros:**
- Allows switching at any time
- Clear communication
- Preserves quantity used value

**Cons:**
- More complex logic
- Requires user to re-enter package info

### Option C: Smart Conversion Suggestion (Advanced)
**When user selects incompatible unit:**
1. Detect incompatibility
2. Show info banner: "Volume and weight units can't be mixed. Would you like to switch both to [weight/volume]?"
3. Offer buttons: "Switch to Weight" | "Switch to Volume" | "Cancel"
4. If user confirms, reset both units to compatible defaults

**Pros:**
- Educational
- Gives user control
- Clear explanation

**Cons:**
- Most complex
- Requires modal/dialog interaction

## Final Recommendation: **Option B (Warning with Auto-Reset)**

### Implementation Details:
1. When user changes quantity used unit to different category:
   - Show toast: "Switched to [volume/weight] units. Package unit updated to match."
   - Auto-reset package unit to default unit in same category
   - Clear package size value
   - Reset packageSizeManuallySet flag
   - Resume auto-sync

2. When user changes package unit to incompatible category:
   - Show toast: "Package unit must match quantity used type. Switching to [compatible unit]."
   - Auto-reset package unit to default compatible unit
   - Keep package size value
   - Set packageSizeManuallySet flag

3. Visual indicators:
   - Subtle badge on unit selector showing category (Volume/Weight/Count)
   - Tooltip explaining unit categories

### Default Units by Category:
- Volume → cup (most common in recipes)
- Weight → lb (most common for package sizes in US)
- Count → unit

## Translation Keys Needed:
- `toast.unitCategorySwitched`: "Switched to {category} units. Package unit updated to match."
- `toast.incompatibleUnit`: "Package unit must match quantity used type."
- `units.categoryVolume`: "Volume"
- `units.categoryWeight`: "Weight"
- `units.categoryCount`: "Count"
