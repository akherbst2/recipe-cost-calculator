# Translation Integration Plan

## Components to Translate

### Home.tsx (Main Page)
- [x] Hero section (title, subtitle)
- [ ] Ingredients section (title, subtitle, buttons)
- [ ] All button labels (Add Ingredient, Save, Load, Export, Clear All)
- [ ] Toast messages
- [ ] Examples section
- [ ] Footer text

### IngredientCard.tsx
- [ ] All labels (Ingredient Name, Quantity Used, Package Cost, Package Size)
- [ ] Placeholders
- [ ] Tooltips (duplicate, delete)
- [ ] "Cost for this recipe" text

### CostSummary.tsx
- [ ] Total Cost label and description
- [ ] Servings Per Recipe label
- [ ] Batches to Make label and description
- [ ] Cost Per Serving label and calculation text
- [ ] Batch multiplier text

### SaveAsDialog.tsx
- [ ] Dialog title and description
- [ ] Input labels and placeholders
- [ ] Button labels

### LoadRecipeDialog.tsx
- [ ] Dialog title and description
- [ ] Empty state messages
- [ ] Ingredient/serving count text

## Strategy
Since there are many components to translate, I'll create a more efficient approach by passing the `t` function as a prop to child components, or using the `useTranslation` hook directly in each component.
