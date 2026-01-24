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
}

export interface Recipe {
  ingredients: Ingredient[];
  totalCost: number;
  servings: number;
  costPerServing: number;
}
