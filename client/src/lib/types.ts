import { Unit } from './unitConversions';

export interface Ingredient {
  id: string;
  name: string;
  usedQuantity: number;
  usedUnit: Unit;
  packageCost: number;
  packageSize: number;
  packageUnit: Unit;
  calculatedCost: number;
  packageSizeManuallySet?: boolean;
}

export interface Recipe {
  ingredients: Ingredient[];
  totalCost: number;
  servings: number;
  costPerServing: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  servings: number;
  batchMultiplier: number;
  savedAt: string;
}
