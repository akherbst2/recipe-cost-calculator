import * as XLSX from 'xlsx';
import { Ingredient } from './types';

export function exportToCSV(
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
}

export function exportToExcel(
  ingredients: Ingredient[],
  totalCost: number,
  servings: number,
  batchMultiplier: number,
  recipeName?: string
) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create data array
  const data: any[][] = [];
  
  // Title row
  data.push([recipeName || 'Recipe Cost Breakdown']);
  data.push([]); // Empty row
  
  // Header row
  data.push([
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
    data.push([
      ing.name,
      ing.usedQuantity,
      ing.usedUnit,
      ing.packageCost,
      ing.packageSize,
      ing.packageUnit,
      ing.calculatedCost
    ]);
  });
  
  // Empty row
  data.push([]);
  
  // Summary rows
  data.push(['Total Cost', totalCost]);
  data.push(['Servings Per Recipe', servings]);
  data.push(['Batches to Make', batchMultiplier]);
  data.push(['Total Servings', servings * batchMultiplier]);
  data.push(['Total Cost (All Batches)', totalCost * batchMultiplier]);
  data.push(['Cost Per Serving', (totalCost * batchMultiplier) / (servings * batchMultiplier)]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Ingredient Name
    { wch: 12 }, // Quantity Used
    { wch: 8 },  // Unit
    { wch: 12 }, // Package Cost
    { wch: 12 }, // Package Size
    { wch: 12 }, // Package Unit
    { wch: 15 }  // Cost for Recipe
  ];
  
  // Format currency cells
  const currencyFormat = '$#,##0.00';
  const startRow = 3; // After title and header
  const endRow = startRow + ingredients.length;
  
  // Format ingredient costs (column D and G)
  for (let i = startRow; i < endRow; i++) {
    const costCell = XLSX.utils.encode_cell({ r: i, c: 3 }); // Package Cost
    const recipeCostCell = XLSX.utils.encode_cell({ r: i, c: 6 }); // Cost for Recipe
    if (ws[costCell]) ws[costCell].z = currencyFormat;
    if (ws[recipeCostCell]) ws[recipeCostCell].z = currencyFormat;
  }
  
  // Format summary costs
  const summaryStartRow = endRow + 1;
  for (let i = 0; i < 6; i++) {
    const cell = XLSX.utils.encode_cell({ r: summaryStartRow + i, c: 1 });
    if (ws[cell] && typeof ws[cell].v === 'number') {
      ws[cell].z = currencyFormat;
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Recipe Cost');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${(recipeName || 'recipe').replace(/[^a-z0-9]/gi, '_')}_cost_breakdown.xlsx`);
}
