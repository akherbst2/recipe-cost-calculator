/** Enhanced Ingredient Card with smart validation and inline help */

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
import { Copy, Trash2, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useEnhancedEventLogger } from '@/hooks/useEnhancedEventLogger';

interface EnhancedIngredientCardProps {
  ingredient: Ingredient;
  onUpdate: (id: string, updates: Partial<Ingredient>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  index: number;
}

interface FieldValidation {
  isValid: boolean;
  errorMessage?: string;
  helpText?: string;
}

export default function EnhancedIngredientCard({
  ingredient,
  onUpdate,
  onDelete,
  onDuplicate,
  index,
}: EnhancedIngredientCardProps) {
  const { t } = useTranslation();
  const logger = useEnhancedEventLogger();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});

  // Validate fields
  useEffect(() => {
    const validations: Record<string, FieldValidation> = {};

    // Name validation
    if (!ingredient.name.trim()) {
      validations.name = {
        isValid: false,
        errorMessage: t('validation.nameRequired', 'Ingredient name is required'),
        helpText: t('validation.nameHelp', 'e.g., "Butter", "All-Purpose Flour", "Eggs"'),
      };
    } else {
      validations.name = {
        isValid: true,
        helpText: t('validation.nameHelp', 'e.g., "Butter", "All-Purpose Flour", "Eggs"'),
      };
    }

    // Used quantity validation
    if (ingredient.usedQuantity <= 0) {
      validations.usedQuantity = {
        isValid: false,
        errorMessage: t('validation.quantityRequired', 'Quantity used is required'),
        helpText: t('validation.quantityHelp', 'How much you\'re using in your recipe (e.g., 2, 0.5, 1.25)'),
      };
    } else {
      validations.usedQuantity = {
        isValid: true,
        helpText: t('validation.quantityHelp', 'How much you\'re using in your recipe'),
      };
    }

    // Package cost validation
    if (ingredient.packageCost <= 0) {
      validations.packageCost = {
        isValid: false,
        errorMessage: t('validation.packageCostRequired', 'Package cost is required'),
        helpText: t('validation.packageCostHelp', 'What you paid for the package (e.g., $3.99, $12.50)'),
      };
    } else {
      validations.packageCost = {
        isValid: true,
        helpText: t('validation.packageCostHelp', 'What you paid for the package'),
      };
    }

    // Package size validation
    if (ingredient.packageSize <= 0) {
      validations.packageSize = {
        isValid: false,
        errorMessage: t('validation.packageSizeRequired', 'Package size is required'),
        helpText: t('validation.packageSizeHelp', 'Size of the package you bought (e.g., 16, 2.5, 1)'),
      };
    } else {
      validations.packageSize = {
        isValid: true,
        helpText: t('validation.packageSizeHelp', 'Size of the package you bought'),
      };
    }

    setFieldValidations(validations);
  }, [ingredient, t]);

  const handleChange = (field: keyof Ingredient, value: string | number) => {
    const updates: Partial<Ingredient> = { [field]: value };
    
    // Log field completion
    if (value && value !== 0 && value !== '') {
      logger.logFieldComplete(field, value, ingredient.id);
    }
    
    // Mark package size as manually set when user changes it (but not package unit)
    if (field === 'packageSize') {
      updates.packageSizeManuallySet = true;
    }
    
    // When user changes quantity used unit, check for category switch
    if (field === 'usedUnit') {
      const oldCategory = getUnitCategory(ingredient.usedUnit);
      const newCategory = getUnitCategory(value as Unit);
      
      logger.logUnitConversionAttempted(ingredient.usedUnit, value as string, ingredient.name);
      
      if (oldCategory !== newCategory) {
        // Category switch detected - reset package unit and size
        const defaultPackageUnit = newCategory === 'volume' ? 'cup' : newCategory === 'weight' ? 'lb' : 'unit';
        updates.packageUnit = defaultPackageUnit as Unit;
        updates.packageSize = 0;
        updates.packageSizeManuallySet = false;
        
        // Show toast notification
        const categoryName = t(`units.category${newCategory.charAt(0).toUpperCase() + newCategory.slice(1)}`);
        toast.info(t('toasts.unitCategorySwitched', { category: categoryName }));
        
        logger.logUnitConversionSuccess(ingredient.usedUnit, value as string);
      } else {
        // Same category - just update package unit to match
        updates.packageUnit = value as Unit;
        updates.packageSizeManuallySet = false;
        logger.logUnitConversionSuccess(ingredient.usedUnit, value as string);
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
        logger.logUnitConversionError(ingredient.usedUnit, value as string, 'Incompatible unit categories');
      } else {
        updates.packageSizeManuallySet = true;
      }
    }
    
    onUpdate(ingredient.id, updates);
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    logger.logFieldFocus(fieldName, ingredient.id);
  };

  const handleFieldBlur = (fieldName: string, value: any) => {
    setFocusedField(null);
    const hasValue = value !== '' && value !== 0 && value !== null && value !== undefined;
    logger.logFieldBlur(fieldName, hasValue, ingredient.id);
    
    // Log validation errors
    const validation = fieldValidations[fieldName];
    if (validation && !validation.isValid && hasValue) {
      logger.logFieldError(fieldName, 'validation_error', validation.errorMessage || '', ingredient.id);
    }
  };

  const allFieldsComplete = Object.values(fieldValidations).every(v => v.isValid);
  const completionPercentage = (Object.values(fieldValidations).filter(v => v.isValid).length / Object.values(fieldValidations).length) * 100;

  return (
    <div
      className="bg-card rounded-[1.25rem] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 ease-out border border-border/50 ingredient-card"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards',
      }}
    >
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium">
            {allFieldsComplete ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                {t('validation.complete', 'Complete')}
              </span>
            ) : (
              <span>{Math.round(completionPercentage)}% {t('validation.complete', 'complete')}</span>
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(ingredient.id)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(ingredient.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${allFieldsComplete ? 'bg-green-600' : 'bg-primary'}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingredient Name */}
        <div className="md:col-span-2">
          <Label htmlFor={`name-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block flex items-center gap-2">
            {t('ingredients.ingredientName')}
            {!fieldValidations.name?.isValid && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </Label>
          <Input
            id={`name-${ingredient.id}`}
            value={ingredient.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onFocus={() => handleFieldFocus('name')}
            onBlur={() => handleFieldBlur('name', ingredient.name)}
            placeholder={t('ingredients.namePlaceholder', 'e.g., Butter, Flour, Sugar')}
            className={`${!fieldValidations.name?.isValid && ingredient.name === '' ? 'border-destructive' : ''}`}
          />
          {focusedField === 'name' && fieldValidations.name?.helpText && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {fieldValidations.name.helpText}
            </p>
          )}
          {!fieldValidations.name?.isValid && ingredient.name === '' && focusedField !== 'name' && fieldValidations.name?.errorMessage && (
            <p className="text-xs text-destructive mt-1">{fieldValidations.name.errorMessage}</p>
          )}
        </div>

        {/* Quantity Used */}
        <div>
          <Label htmlFor={`usedQuantity-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block flex items-center gap-2">
            {t('ingredients.quantityUsed')}
            {!fieldValidations.usedQuantity?.isValid && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </Label>
          <Input
            id={`usedQuantity-${ingredient.id}`}
            type="number"
            value={ingredient.usedQuantity || ''}
            onChange={(e) => handleChange('usedQuantity', parseFloat(e.target.value) || 0)}
            onFocus={() => handleFieldFocus('usedQuantity')}
            onBlur={() => handleFieldBlur('usedQuantity', ingredient.usedQuantity)}
            placeholder="2.5"
            step="0.01"
            min="0"
            className={`${!fieldValidations.usedQuantity?.isValid && ingredient.usedQuantity === 0 ? 'border-destructive' : ''}`}
          />
          {focusedField === 'usedQuantity' && fieldValidations.usedQuantity?.helpText && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {fieldValidations.usedQuantity.helpText}
            </p>
          )}
        </div>

        {/* Used Unit */}
        <div>
          <Label htmlFor={`usedUnit-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block">
            {t('ingredients.unit')}
          </Label>
          <Select
            value={ingredient.usedUnit}
            onValueChange={(value) => handleChange('usedUnit', value)}
          >
            <SelectTrigger id={`usedUnit-${ingredient.id}`} className="unit-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitCategories.map((category) => (
                <div key={category.type}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t(`units.category${category.type.charAt(0).toUpperCase() + category.type.slice(1)}`)}
                  </div>
                  {category.units.map((unit: Unit) => (
                    <SelectItem key={unit} value={unit}>
                      {formatUnit(unit, t)}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Package Cost */}
        <div>
          <Label htmlFor={`packageCost-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block flex items-center gap-2">
            {t('ingredients.packageCost')}
            {!fieldValidations.packageCost?.isValid && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </Label>
          <Input
            id={`packageCost-${ingredient.id}`}
            type="number"
            value={ingredient.packageCost || ''}
            onChange={(e) => handleChange('packageCost', parseFloat(e.target.value) || 0)}
            onFocus={() => handleFieldFocus('packageCost')}
            onBlur={() => handleFieldBlur('packageCost', ingredient.packageCost)}
            placeholder="$3.99"
            step="0.01"
            min="0"
            className={`${!fieldValidations.packageCost?.isValid && ingredient.packageCost === 0 ? 'border-destructive' : ''}`}
          />
          {focusedField === 'packageCost' && fieldValidations.packageCost?.helpText && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {fieldValidations.packageCost.helpText}
            </p>
          )}
        </div>

        {/* Package Size */}
        <div>
          <Label htmlFor={`packageSize-${ingredient.id}`} className="text-sm font-semibold text-foreground/80 mb-2 block flex items-center gap-2">
            {t('ingredients.packageSize')}
            {!fieldValidations.packageSize?.isValid && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`packageSize-${ingredient.id}`}
              type="number"
              value={ingredient.packageSize || ''}
              onChange={(e) => handleChange('packageSize', parseFloat(e.target.value) || 0)}
              onFocus={() => handleFieldFocus('packageSize')}
              onBlur={() => handleFieldBlur('packageSize', ingredient.packageSize)}
              placeholder="16"
              step="0.01"
              min="0"
              className={`flex-1 ${!fieldValidations.packageSize?.isValid && ingredient.packageSize === 0 ? 'border-destructive' : ''}`}
            />
            <Select
              value={ingredient.packageUnit}
              onValueChange={(value) => handleChange('packageUnit', value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitCategories.find(cat => cat.type === getUnitCategory(ingredient.usedUnit))?.units.map((unit: Unit) => (
                  <SelectItem key={unit} value={unit}>
                    {formatUnit(unit, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {focusedField === 'packageSize' && fieldValidations.packageSize?.helpText && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {fieldValidations.packageSize.helpText}
            </p>
          )}
        </div>
      </div>

      {/* Cost Display */}
      {ingredient.calculatedCost > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('ingredients.ingredientCost')}</span>
            <span className="text-lg font-semibold text-primary">
              ${ingredient.calculatedCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
