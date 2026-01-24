import { SavedRecipe } from './types';

const STORAGE_KEY = 'recipe-cost-calculator-recipes';

export function getSavedRecipes(): SavedRecipe[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading recipes from localStorage:', error);
    return [];
  }
}

export function saveRecipe(recipe: SavedRecipe): void {
  try {
    const recipes = getSavedRecipes();
    const existingIndex = recipes.findIndex((r) => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.push(recipe);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Error saving recipe to localStorage:', error);
    throw error;
  }
}

export function deleteRecipe(id: string): void {
  try {
    const recipes = getSavedRecipes();
    const filtered = recipes.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting recipe from localStorage:', error);
    throw error;
  }
}

export function getRecipeById(id: string): SavedRecipe | undefined {
  const recipes = getSavedRecipes();
  return recipes.find((r) => r.id === id);
}
