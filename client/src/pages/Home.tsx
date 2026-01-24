/** Design: Organic Modernism with Culinary Warmth
   Asymmetric layout, textured backgrounds, warm color palette, gentle animations */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdSenseAd from '@/components/AdSenseAd';
import CostSummary from '@/components/CostSummary';
import LanguageSelector from '@/components/LanguageSelector';
import IngredientCard from '@/components/IngredientCard';
import LoadRecipeDialog from '@/components/LoadRecipeDialog';
import SaveAsDialog from '@/components/SaveAsDialog';
import SaveRecipeDialog from '@/components/SaveRecipeDialog';
import { exportToCSV, exportToExcel } from '@/lib/exportRecipe';
import { deleteRecipe, getSavedRecipes, saveRecipe } from '@/lib/recipeStorage';
import { Ingredient, SavedRecipe } from '@/lib/types';
import { calculateIngredientCost, canConvert } from '@/lib/unitConversions';
import { ChevronDown, Download, FolderOpen, MessageSquare, Plus, Save, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function Home() {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [servings, setServings] = useState<number>(4);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [currentRecipeName, setCurrentRecipeName] = useState<string>('');

  // Calculate total cost whenever ingredients change
  const totalCost = ingredients.reduce((sum, ing) => sum + ing.calculatedCost, 0);

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: nanoid(),
      name: '',
      usedQuantity: 0,
      usedUnit: 'cup',
      packageCost: 0,
      packageSize: 0,
      packageUnit: 'cup',
      calculatedCost: 0,
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        
        const updated = { ...ing, ...updates };
        
        // Recalculate cost if relevant fields changed
        try {
          if (
            updated.usedQuantity > 0 &&
            updated.packageCost > 0 &&
            updated.packageSize > 0
          ) {
            // Check if units are compatible
            if (!canConvert(updated.usedUnit, updated.packageUnit)) {
              toast.error(
                `Cannot convert ${updated.usedUnit} to ${updated.packageUnit}. Please use compatible units.`,
                { duration: 4000 }
              );
              return ing; // Return original if conversion not possible
            }

            updated.calculatedCost = calculateIngredientCost(
              updated.usedQuantity,
              updated.usedUnit,
              updated.packageCost,
              updated.packageSize,
              updated.packageUnit
            );
          } else {
            updated.calculatedCost = 0;
          }
        } catch (error) {
          console.error('Error calculating cost:', error);
          updated.calculatedCost = 0;
        }
        
        return updated;
      })
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    toast.success('Ingredient removed');
  };

  const duplicateIngredient = (id: string) => {
    const ingredient = ingredients.find((ing) => ing.id === id);
    if (ingredient) {
      const duplicated: Ingredient = {
        ...ingredient,
        id: nanoid(),
      };
      setIngredients((prev) => {
        const index = prev.findIndex((ing) => ing.id === id);
        return [...prev.slice(0, index + 1), duplicated, ...prev.slice(index + 1)];
      });
      toast.success('Ingredient duplicated');
    }
  };

  // Load saved recipes on mount
  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
  }, []);

  // Add initial ingredient on mount
  useEffect(() => {
    if (ingredients.length === 0) {
      addIngredient();
    }
  }, []);

  // Handle Save (update existing recipe)
  const handleSave = () => {
    if (!currentRecipeId || !currentRecipeName) {
      // No current recipe, open Save As dialog
      setSaveAsDialogOpen(true);
      return;
    }

    const recipe: SavedRecipe = {
      id: currentRecipeId,
      name: currentRecipeName,
      ingredients,
      servings,
      batchMultiplier,
      savedAt: new Date().toISOString(),
    };
    
    try {
      saveRecipe(recipe);
      setSavedRecipes(getSavedRecipes());
      toast.success(t('toasts.recipeSaved', { name: currentRecipeName }));
    } catch (error) {
      toast.error(t('toasts.saveFailed'));
    }
  };

  // Handle Save As (create new recipe)
  const handleSaveAs = (name: string) => {
    const recipe: SavedRecipe = {
      id: nanoid(),
      name,
      ingredients,
      servings,
      batchMultiplier,
      savedAt: new Date().toISOString(),
    };
    
    try {
      saveRecipe(recipe);
      setSavedRecipes(getSavedRecipes());
      setCurrentRecipeId(recipe.id);
      setCurrentRecipeName(name);
      toast.success(t('toasts.recipeSavedAs', { name }));
    } catch (error) {
      toast.error(t('toasts.saveFailed'));
    }
  };

  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setIngredients(recipe.ingredients);
    setServings(recipe.servings);
    setBatchMultiplier(recipe.batchMultiplier);
    setCurrentRecipeId(recipe.id);
    setCurrentRecipeName(recipe.name);
    toast.success(t('toasts.recipeLoaded', { name: recipe.name }));
  };

  const handleDuplicateRecipe = (recipe: SavedRecipe) => {
    setIngredients(recipe.ingredients);
    setServings(recipe.servings);
    setBatchMultiplier(recipe.batchMultiplier);
    setCurrentRecipeId(null);
    setCurrentRecipeName('');
    setLoadDialogOpen(false);
    setSaveAsDialogOpen(true);
    toast.info(t('toasts.recipeDuplicate', { name: recipe.name }));
  };

  const handleDeleteRecipe = (id: string) => {
    const recipe = savedRecipes.find((r) => r.id === id);
    if (recipe) {
      try {
        deleteRecipe(id);
        setSavedRecipes(getSavedRecipes());
        if (currentRecipeId === id) {
          setCurrentRecipeId(null);
        }
        toast.success(t('toasts.recipeDeleted', { name: recipe.name }));
      } catch (error) {
        toast.error(t('toasts.deleteFailed'));
      }
    }
  };

  const handleClearAll = () => {
    setIngredients([]);
    setServings(4);
    setBatchMultiplier(1);
    setCurrentRecipeId(null);
    setCurrentRecipeName('');
    toast.success(t('toasts.allCleared'));
  };

  const handleExportCSV = () => {
    const currentRecipe = currentRecipeId
      ? savedRecipes.find((r) => r.id === currentRecipeId)
      : null;
    const recipeName = currentRecipe?.name || 'Untitled Recipe';
    
    exportToCSV(
      ingredients,
      totalCost,
      servings,
      batchMultiplier,
      recipeName
    );
    
    toast.success(t('toasts.recipeExportedCSV'));
  };

  const handleExportExcel = () => {
    const currentRecipe = currentRecipeId
      ? savedRecipes.find((r) => r.id === currentRecipeId)
      : null;
    const recipeName = currentRecipe?.name || 'Untitled Recipe';
    
    exportToExcel(
      ingredients,
      totalCost,
      servings,
      batchMultiplier,
      recipeName
    );
    
    toast.success(t('toasts.recipeExportedExcel'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section with Textured Background */}
      <div
        className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border/50 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'soft-light',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
        <div className="container relative z-10 py-16 md:py-24">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground tracking-tight">
              {t('hero.title')}
            </h1>
            <LanguageSelector />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Top Banner Ad */}
      <div className="container py-6">
        <AdSenseAd 
          adSlot="1234567890" 
          adFormat="horizontal"
          className="max-w-4xl mx-auto"
        />
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Section - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-1">
                  {t('ingredients.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('ingredients.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={addIngredient}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('ingredients.addButton')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="shadow-soft"
                      disabled={ingredients.length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t('ingredients.saveButton')}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleSave}>
                      {currentRecipeId ? t('ingredients.saveRecipe', { name: currentRecipeName }) : t('ingredients.saveAs')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)}>
                      {t('ingredients.saveAs')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => setLoadDialogOpen(true)}
                  variant="outline"
                  className="shadow-soft"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {t('ingredients.loadButton')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="shadow-soft"
                      disabled={ingredients.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('ingredients.exportButton')}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      {t('ingredients.exportCSV')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportExcel}>
                      {t('ingredients.exportExcel')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="shadow-soft text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={ingredients.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('ingredients.clearButton')}
                </Button>
              </div>
            </div>

            {ingredients.length === 0 ? (
              <div className="bg-card rounded-[1.25rem] p-12 text-center shadow-soft border border-border/50">
                <div className="max-w-sm mx-auto">
                  <div className="text-4xl mb-4">🥘</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('ingredients.emptyState.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('ingredients.emptyState.description')}
                  </p>
                  <Button
                    onClick={addIngredient}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('ingredients.emptyState.button')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdate={updateIngredient}
                    onDelete={deleteIngredient}
                    onDuplicate={duplicateIngredient}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cost Summary - 1 column on desktop, sticky */}
          <div className="lg:col-span-1">
            <CostSummary
              totalCost={totalCost}
              servings={servings}
              batchMultiplier={batchMultiplier}
              onServingsChange={setServings}
              onBatchMultiplierChange={setBatchMultiplier}
            />
          </div>
        </div>

        {/* Example Use Cases */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            {t('examples.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-3">🍝</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t('examples.pasta.title')}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('examples.pasta.description')}
              </p>
            </div>
            <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-3">🧅</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t('examples.onions.title')}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('examples.onions.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <div className="mt-16 max-w-4xl mx-auto">
          <AdSenseAd 
            adSlot="0987654321" 
            adFormat="horizontal"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 mt-16">
        <div className="container py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('footer.text')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = 'mailto:alyssaherbst@gmail.com?subject=Recipcalc:%20';
            }}
            className="text-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            {t('footer.shareFeedback')}
          </Button>
        </div>
      </div>

      {/* Save As Dialog */}
      <SaveAsDialog
        open={saveAsDialogOpen}
        onOpenChange={setSaveAsDialogOpen}
        onSave={handleSaveAs}
        currentName={currentRecipeName}
      />

      {/* Load Recipe Dialog */}
      <LoadRecipeDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        recipes={savedRecipes}
        onLoad={handleLoadRecipe}
        onDelete={handleDeleteRecipe}
        onDuplicate={handleDuplicateRecipe}
      />

      {/* Keyframe animation for cards */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
