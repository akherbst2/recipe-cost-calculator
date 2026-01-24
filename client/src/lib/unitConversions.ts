// Unit conversion system for recipe cost calculator
// Converts all units to a common base (grams for weight, ml for volume)

export type Unit = 
  | 'tsp' | 'tbsp' | 'cup' | 'oz' | 'lb' 
  | 'g' | 'kg' | 'ml' | 'L' | 'unit';

export interface UnitCategory {
  type: 'volume' | 'weight' | 'count';
  units: Unit[];
}

export const unitCategories: UnitCategory[] = [
  {
    type: 'volume',
    units: ['tsp', 'tbsp', 'cup', 'ml', 'L']
  },
  {
    type: 'weight',
    units: ['oz', 'lb', 'g', 'kg']
  },
  {
    type: 'count',
    units: ['unit']
  }
];

// Conversion factors to base units (ml for volume, g for weight)
const conversionToBase: Record<Unit, number> = {
  // Volume (to ml)
  'tsp': 4.92892,
  'tbsp': 14.7868,
  'cup': 236.588,
  'ml': 1,
  'L': 1000,
  // Weight (to g)
  'oz': 28.3495,
  'lb': 453.592,
  'g': 1,
  'kg': 1000,
  // Count
  'unit': 1
};

export function getUnitCategory(unit: Unit): 'volume' | 'weight' | 'count' {
  if (['tsp', 'tbsp', 'cup', 'ml', 'L'].includes(unit)) return 'volume';
  if (['oz', 'lb', 'g', 'kg'].includes(unit)) return 'weight';
  return 'count';
}

export function canConvert(fromUnit: Unit, toUnit: Unit): boolean {
  // Can only convert within same category
  return getUnitCategory(fromUnit) === getUnitCategory(toUnit);
}

export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (!canConvert(fromUnit, toUnit)) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit} - different unit types`);
  }
  
  // Convert to base unit, then to target unit
  const baseValue = value * conversionToBase[fromUnit];
  const result = baseValue / conversionToBase[toUnit];
  
  return result;
}

export function calculateCostPerUnit(
  totalCost: number,
  packageSize: number,
  packageUnit: Unit
): number {
  // Returns cost per base unit (per ml or per g or per unit)
  const baseQuantity = packageSize * conversionToBase[packageUnit];
  return totalCost / baseQuantity;
}

export function calculateIngredientCost(
  usedQuantity: number,
  usedUnit: Unit,
  packageCost: number,
  packageSize: number,
  packageUnit: Unit
): number {
  if (!canConvert(usedUnit, packageUnit)) {
    throw new Error(`Cannot calculate cost - incompatible units: ${usedUnit} and ${packageUnit}`);
  }
  
  // Convert used quantity to same unit as package
  const usedInPackageUnits = convertUnit(usedQuantity, usedUnit, packageUnit);
  
  // Calculate cost
  const costPerPackageUnit = packageCost / packageSize;
  const ingredientCost = usedInPackageUnits * costPerPackageUnit;
  
  return ingredientCost;
}

export function formatUnit(unit: Unit): string {
  const labels: Record<Unit, string> = {
    'tsp': 'tsp',
    'tbsp': 'tbsp',
    'cup': 'cup',
    'oz': 'oz',
    'lb': 'lb',
    'g': 'g',
    'kg': 'kg',
    'ml': 'ml',
    'L': 'L',
    'unit': 'unit'
  };
  return labels[unit];
}
