import { Ingredient } from './types';

export function exportToGoogleSheets(
  ingredients: Ingredient[],
  totalCost: number,
  servings: number,
  batchMultiplier: number,
  recipeName?: string
) {
  // Create CSV data
  const rows: string[][] = [];
  
  // Title row
  rows.push([recipeName || 'Recipe Cost Breakdown']);
  rows.push([]); // Empty row
  
  // Header row
  rows.push([
    'Ingredient Name',
    'Quantity Used',
    'Unit',
    'Package Cost',
    'Package Size',
    'Package Unit',
    'Cost for Recipe'
  ]);
  
  // Ingredient rows
  ingredients.forEach((ing) => {
    rows.push([
      ing.name,
      ing.usedQuantity.toString(),
      ing.usedUnit,
      `$${ing.packageCost.toFixed(2)}`,
      ing.packageSize.toString(),
      ing.packageUnit,
      `$${ing.calculatedCost.toFixed(2)}`
    ]);
  });
  
  // Empty row
  rows.push([]);
  
  // Summary rows
  rows.push(['Total Cost', `$${totalCost.toFixed(2)}`]);
  rows.push(['Servings Per Recipe', servings.toString()]);
  rows.push(['Batches to Make', batchMultiplier.toString()]);
  rows.push(['Total Servings', (servings * batchMultiplier).toString()]);
  rows.push(['Total Cost (All Batches)', `$${(totalCost * batchMultiplier).toFixed(2)}`]);
  rows.push(['Cost Per Serving', `$${((totalCost * batchMultiplier) / (servings * batchMultiplier)).toFixed(2)}`]);
  
  // Convert to CSV
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(recipeName || 'recipe').replace(/[^a-z0-9]/gi, '_')}_cost_breakdown.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  // Open Google Sheets import page with instructions
  setTimeout(() => {
    // Open Google Sheets with the import dialog
    window.open('https://docs.google.com/spreadsheets/create', '_blank');
  }, 500);
  
  return true;
}
