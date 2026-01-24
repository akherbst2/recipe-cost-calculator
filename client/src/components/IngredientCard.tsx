/* Design: Organic Modernism - Card with soft shadows, rounded corners, warm colors
   Asymmetric layout, tactile depth, gentle interactions */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ingredient } from '@/lib/types';
import { formatUnit, getUnitCategory, Unit, unitCategories } from '@/lib/unitConversions';
import { Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface IngredientCardProps {
  ingredient: Ingredient;
  onUpdate: (id: string, updates: Partial<Ingredient>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  index: number;
}

export default function IngredientCard({
  ingredient,
  onUpdate,
  onDelete,
  onDuplicate,
  index,
}: IngredientCardProps) {
  const { t } = useTranslation();
  const handleChange = (field: keyof Ingredient, value: string | number) => {
    const updates: Partial<Ingredient> = { [field]: value };
    
    // Mark package size as manually set when user changes it (but not package unit)
    if (field === 'packageSize') {
      updates.packageSizeManuallySet = true;
    }
    
    // When user changes quantity used unit, check for category switch
    if (field === 'usedUnit') {
      const oldCategory = getUnitCategory(ingredient.usedUnit);
      const newCategory = getUnitCategory(value as Unit);
      
      if (oldCategory !== newCategory) {
        // Category switch detected - reset package unit and size
        const defaultPackageUnit = newCategory === 'volume' ? 'cup' : newCategory === 'weight' ? 'lb' : 'unit';
        updates.packageUnit = defaultPackageUnit as Unit;
        updates.packageSize = 0;
        updates.packageSizeManuallySet = false;
        
        // Show toast notification
        const categoryName = t(`units.category${newCategory.charAt(0).toUpperCase() + newCategory.slice(1)}`);
        toast.info(t('toasts.unitCategorySwitched', { category: categoryName }));
      } else {
        // Same category - just update package unit to match
        updates.packageUnit = value as Unit;
        updates.packageSizeManuallySet = false;
      }
    }
    
    // Auto-sync package to quantity if not manually set
    if (field === 'usedQuantity' && !ingredient.packageSizeManuallySet) {
      updates.packageSize = value as number;
    }
    
    // When user changes package unit, check for category mismatch
    if (field === 'packageUnit') {
      const usedCategory = getUnitCategory(ingredient.usedUnit);
      const newPackageCategory = getUnitCategory(value as Unit);
      
      if (usedCategory !== newPackageCategory) {
        // Incompatible - reset to compatible unit
        const defaultPackageUnit = usedCategory === 'volume' ? 'cup' : usedCategory === 'weight' ? 'lb' : 'unit';
        updates.packageUnit = defaultPackageUnit as Unit;
        toast.warning(t('toasts.incompatibleUnit'));
      } else {
        updates.packageSizeManuallySet = true;
      }
    }
    
    onUpdate(ingredient.id, updates);
  };

  return (
    <div
      className="bg-card rounded-[1.25rem] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 ease-out border border-border/50"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Label htmlFor={`name-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block">
            {t('ingredients.ingredientName')}
          </Label>
          <Input
            id={`name-${ingredient.id}`}
            value={ingredient.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('ingredients.ingredientPlaceholder')}
            className="text-base font-medium"
          />
        </div>
        <div className="flex gap-1 ml-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDuplicate(ingredient.id)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={t('ingredients.duplicateHint')}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(ingredient.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={t('ingredients.deleteHint')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`used-qty-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block">
            {t('ingredients.quantityUsed')}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`used-qty-${ingredient.id}`}
              type="number"
              step="0.01"
              min="0"
              value={ingredient.usedQuantity || ''}
              onChange={(e) => handleChange('usedQuantity', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="flex-1"
            />
            <Select
              value={ingredient.usedUnit}
              onValueChange={(value) => handleChange('usedUnit', value as Unit)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitCategories.map((category) => (
                  <div key={category.type}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t(`units.${category.type}`)}
                    </div>
                    {category.units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {formatUnit(unit, t)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor={`pkg-cost-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block">
            {t('ingredients.packageCost')}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id={`pkg-cost-${ingredient.id}`}
              type="number"
              step="0.01"
              min="0"
              value={ingredient.packageCost || ''}
              onChange={(e) => handleChange('packageCost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`pkg-size-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block">
            {t('ingredients.packageSize')}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`pkg-size-${ingredient.id}`}
              type="number"
              step="0.01"
              min="0"
              value={ingredient.packageSize || ''}
              onChange={(e) => handleChange('packageSize', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="flex-1"
            />
            <Select
              value={ingredient.packageUnit}
              onValueChange={(value) => handleChange('packageUnit', value as Unit)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitCategories.map((category) => (
                  <div key={category.type}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t(`units.${category.type}`)}
                    </div>
                    {category.units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {formatUnit(unit, t)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end">
          <div className="w-full bg-accent/15 rounded-lg p-3 border border-accent/30">
            <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">
              {t('ingredients.costForRecipe')}
            </div>
            <div className="text-2xl font-display font-bold" style={{ color: '#C86F45' }}>
              ${ingredient.calculatedCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
