/** Design: Organic Modernism with Culinary Warmth
   Asymmetric layout, textured backgrounds, warm color palette, gentle animations */

import { useAuth } from '@/_core/hooks/useAuth';
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
import ShareRecipeDialog from '@/components/ShareRecipeDialog';
import { exportToCSV, exportToExcel } from '@/lib/exportRecipe';
import { deleteRecipe, getSavedRecipes, saveRecipe } from '@/lib/recipeStorage';
import { Ingredient, SavedRecipe } from '@/lib/types';
import { calculateIngredientCost, canConvert } from '@/lib/unitConversions';
import { ChevronDown, Download, FolderOpen, MessageSquare, Plus, Save, Share2, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useEventLogger } from '@/hooks/useEventLogger';
import { trpc } from '@/lib/trpc';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { t } = useTranslation();
  const { logEvent } = useEventLogger();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const prevIngredientsRef = useRef<Ingredient[]>([]);
  const [servings, setServings] = useState<number>(4);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [currentRecipeName, setCurrentRecipeName] = useState<string>('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [hasLoggedFirstIngredient, setHasLoggedFirstIngredient] = useState(false);
  const prevTotalCostRef = useRef<number>(0);
  const hasLoggedSessionStart = useRef(false);

  // Calculate total cost whenever ingredients change
  const totalCost = ingredients.reduce((sum, ing) => sum + ing.calculatedCost, 0);

  const loadExampleRecipe = () => {
    const exampleIngredients: Ingredient[] = [
      {
        id: nanoid(),
        name: 'Butter',
        usedQuantity: 2,
        usedUnit: 'tbsp',
        packageCost: 3.99,
        packageSize: 16,
        packageUnit: 'tbsp',
        calculatedCost: 0,
      },
      {
        id: nanoid(),
        name: 'All-Purpose Flour',
        usedQuantity: 2,
        usedUnit: 'cup',
        packageCost: 4.49,
        packageSize: 10,
        packageUnit: 'cup',
        calculatedCost: 0,
      },
      {
        id: nanoid(),
        name: 'Eggs',
        usedQuantity: 2,
        usedUnit: 'unit',
        packageCost: 5.99,
        packageSize: 12,
        packageUnit: 'unit',
        calculatedCost: 0,
      },
    ];

    // Calculate costs for each ingredient
    const ingredientsWithCosts = exampleIngredients.map(ing => {
      const cost = calculateIngredientCost(
        ing.usedQuantity,
        ing.usedUnit,
        ing.packageCost,
        ing.packageSize,
        ing.packageUnit
      );
      return { ...ing, calculatedCost: cost };
    });

    setIngredients(ingredientsWithCosts);
    setCurrentRecipeId(null);
    setCurrentRecipeName('');
    
    logEvent('button_click', {
      button: 'try_example',
      ingredientCount: ingredientsWithCosts.length,
    });
    
    toast.success(t('toasts.exampleLoaded') || 'Example recipe loaded!');
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: nanoid(),
      name: '',
      usedQuantity: 0,
      usedUnit: 'unit',
      packageCost: 0,
      packageSize: 0,
      packageUnit: 'unit',
      calculatedCost: 0,
    };
    setIngredients([...ingredients, newIngredient]);
    
    // Log first ingredient added
    if (!hasLoggedFirstIngredient) {
      const timeFromPageLoad = (Date.now() - sessionStartTime) / 1000;
      logEvent('first_ingredient_added', {
        timeFromPageLoad,
      });
      setHasLoggedFirstIngredient(true);
    }
    
    // Log event with complete ingredient details
    logEvent('ingredient_add', {
      ingredientId: newIngredient.id,
      ingredientName: newIngredient.name,
      usedQuantity: newIngredient.usedQuantity,
      usedUnit: newIngredient.usedUnit,
      packageCost: newIngredient.packageCost,
      packageSize: newIngredient.packageSize,
      packageUnit: newIngredient.packageUnit,
      calculatedCost: newIngredient.calculatedCost,
    });
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
    const ingredient = ingredients.find((ing) => ing.id === id);
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    toast.success('Ingredient removed');
    
    // Log event
    if (ingredient) {
      logEvent('ingredient_delete', {
        ingredientId: id,
        ingredientName: ingredient.name,
        language: t('language'),
      });
    }
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
      
      // Log event with complete ingredient details
      logEvent('ingredient_duplicate', {
        originalId: id,
        duplicatedId: duplicated.id,
        ingredientName: duplicated.name,
        usedQuantity: duplicated.usedQuantity,
        usedUnit: duplicated.usedUnit,
        packageCost: duplicated.packageCost,
        packageSize: duplicated.packageSize,
        packageUnit: duplicated.packageUnit,
        calculatedCost: duplicated.calculatedCost,
        language: t('language'),
      });
    }
  };

  // Log session start and page view on mount (only once)
  useEffect(() => {
    if (hasLoggedSessionStart.current) return;
    hasLoggedSessionStart.current = true;
    
    logEvent('session_start', {
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    });
    
    logEvent('page_view', {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'direct',
    });
  }, [logEvent]);

  // Log session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000;
      const completedIngredients = ingredients.filter(
        ing => ing.name && ing.usedQuantity > 0 && ing.packageCost > 0 && ing.packageSize > 0
      );
      
      logEvent('session_end', {
        sessionDuration,
        completedIngredients: completedIngredients.length,
        totalIngredients: ingredients.length,
        hadCalculatedCost: totalCost > 0,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [logEvent, sessionStartTime, ingredients, totalCost]);

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

  // Log when cost is calculated (changes from 0 to non-zero)
  useEffect(() => {
    if (prevTotalCostRef.current === 0 && totalCost > 0) {
      const completedIngredients = ingredients.filter(
        ing => ing.name && ing.usedQuantity > 0 && ing.packageCost > 0 && ing.packageSize > 0
      );
      
      logEvent('cost_calculated', {
        totalCost,
        ingredientCount: ingredients.length,
        completedIngredientCount: completedIngredients.length,
        servings,
        costPerServing: totalCost / servings,
      });
    }
    prevTotalCostRef.current = totalCost;
  }, [totalCost, ingredients, servings, logEvent]);

  // Log ingredient edits with debouncing to avoid logging every keystroke
  useEffect(() => {
    if (prevIngredientsRef.current.length === 0) {
      // First render, just store current ingredients
      prevIngredientsRef.current = ingredients;
      return;
    }

    // Check if this is an edit (same length, different values)
    if (prevIngredientsRef.current.length === ingredients.length) {
      // Debounce: wait 1 second before logging to batch rapid changes
      const timeoutId = setTimeout(() => {
        ingredients.forEach((ing, index) => {
          const prevIng = prevIngredientsRef.current[index];
          if (prevIng && prevIng.id === ing.id) {
            // Check if any field changed
            const hasChanges = 
              prevIng.name !== ing.name ||
              prevIng.usedQuantity !== ing.usedQuantity ||
              prevIng.usedUnit !== ing.usedUnit ||
              prevIng.packageCost !== ing.packageCost ||
              prevIng.packageSize !== ing.packageSize ||
              prevIng.packageUnit !== ing.packageUnit;

            if (hasChanges) {
              // Log the edit event
              logEvent('ingredient_edit', {
                ingredientId: ing.id,
                ingredientName: ing.name,
                usedQuantity: ing.usedQuantity,
                usedUnit: ing.usedUnit,
                packageCost: ing.packageCost,
                packageSize: ing.packageSize,
                packageUnit: ing.packageUnit,
                calculatedCost: ing.calculatedCost,
                language: t('language'),
              });
            }
          }
        });
        
        // Update ref after logging
        prevIngredientsRef.current = ingredients;
      }, 1000); // Wait 1 second of inactivity

      return () => clearTimeout(timeoutId);
    } else {
      // Length changed (add/delete), just update ref
      prevIngredientsRef.current = ingredients;
    }
  }, [ingredients, logEvent, t]);

  // Validate recipe data before saving
  const validateRecipe = (): boolean => {
    // Check if there are any ingredients
    if (ingredients.length === 0) {
      toast.error(t('toasts.noIngredients'));
      return false;
    }

    // Check each ingredient for validation issues
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      const ingredientLabel = ing.name.trim() || `${t('ingredient')} ${i + 1}`;
      
      // Check for empty ingredient name
      if (!ing.name.trim()) {
        toast.error(t('toasts.emptyIngredientNameSpecific', { ingredient: ingredientLabel }));
        return false;
      }
      
      // Check for missing quantity used
      if (ing.usedQuantity <= 0) {
        toast.error(t('toasts.missingQuantityUsed', { ingredient: ingredientLabel }));
        return false;
      }
      
      // Check for missing package cost
      if (ing.packageCost <= 0) {
        toast.error(t('toasts.missingPackageCost', { ingredient: ingredientLabel }));
        return false;
      }
      
      // Check for missing package size
      if (ing.packageSize <= 0) {
        toast.error(t('toasts.missingPackageSize', { ingredient: ingredientLabel }));
        return false;
      }
    }

    return true;
  };

  // Handle Save (update existing recipe)
  const handleSave = () => {
    if (!currentRecipeId || !currentRecipeName) {
      // No current recipe, open Save As dialog
      setSaveAsDialogOpen(true);
      return;
    }

    // Validate before saving
    if (!validateRecipe()) {
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
      
      // Log event
      logEvent('recipe_save', {
        recipeId: currentRecipeId,
        recipeName: currentRecipeName,
        ingredientCount: ingredients.length,
        totalCost,
        servings,
        batchMultiplier,
        language: t('language'),
      });
    } catch (error) {
      toast.error(t('toasts.saveFailed'));
    }
  };

  // Handle Save As (create new recipe)
  const handleSaveAs = (name: string) => {
    // Validate before saving
    if (!validateRecipe()) {
      return;
    }

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
      
      // Log event
      logEvent('recipe_save_as', {
        recipeId: recipe.id,
        recipeName: name,
        ingredientCount: ingredients.length,
        totalCost,
        servings,
        batchMultiplier,
        language: t('language'),
      });
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
    
    // Log event
    logEvent('recipe_load', {
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredientCount: recipe.ingredients.length,
      language: t('language'),
    });
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
    const ingredientCount = ingredients.length;
    const hadCost = totalCost > 0;
    
    setIngredients([]);
    setServings(4);
    setBatchMultiplier(1);
    setCurrentRecipeId(null);
    setCurrentRecipeName('');
    toast.success(t('toasts.allCleared'));
    
    // Log event
    logEvent('clear_all', {
      ingredientCount,
      hadCalculatedCost: hadCost,
      totalCost,
    });
  };

  const handleLoadDialogOpen = () => {
    setLoadDialogOpen(true);
    logEvent('button_click', {
      buttonName: 'Load',
      savedRecipesCount: savedRecipes.length,
    });
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
    
    // Log event
    logEvent('export_csv', {
      recipeName,
      ingredientCount: ingredients.length,
      totalCost,
      language: t('language'),
    });
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
    
    // Log event
    logEvent('export_excel', {
      recipeName,
      ingredientCount: ingredients.length,
      totalCost,
      language: t('language'),
    });
  };

  const createShareMutation = trpc.sharing.create.useMutation();

  const handleShare = async () => {
    if (ingredients.length === 0) {
      toast.error(t('toasts.noIngredientsToShare') || 'Add ingredients before sharing');
      return;
    }

    const recipeName = currentRecipeName || t('dialogs.share.defaultName') || 'My Recipe';
    
    setIsGeneratingShare(true);
    setShareDialogOpen(true);
    setShareUrl(null);

    try {
      const result = await createShareMutation.mutateAsync({
        name: recipeName,
        ingredients,
        servings,
        batchMultiplier,
        totalCost,
      });

      const url = `${window.location.origin}/shared/${result.shareId}`;
      setShareUrl(url);
      
      // Log event
      logEvent('recipe_share', {
        recipeName,
        shareId: result.shareId,
        ingredientCount: ingredients.length,
        totalCost,
        language: t('language'),
      });
    } catch (error) {
      toast.error(t('toasts.shareFailed') || 'Failed to create share link');
      setShareDialogOpen(false);
    } finally {
      setIsGeneratingShare(false);
    }
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
            <div className="flex items-center gap-3">
              {isAuthenticated && user?.openId === import.meta.env.VITE_OWNER_OPEN_ID && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/analytics'}
                  className="hidden md:flex"
                >
                  Analytics
                </Button>
              )}
              <LanguageSelector />
            </div>
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
                <Button
                  onClick={loadExampleRecipe}
                  variant="outline"
                  className="shadow-soft"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('ingredients.tryExampleButton') || 'Try Example'}
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
                    {currentRecipeId && (
                      <DropdownMenuItem onClick={handleSave}>
                        {t('ingredients.saveRecipe', { name: currentRecipeName })}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)}>
                      {t('ingredients.saveAs')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleLoadDialogOpen}
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
                  onClick={handleShare}
                  variant="outline"
                  className="shadow-soft"
                  disabled={ingredients.length === 0}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('ingredients.shareButton') || 'Share'}
                </Button>
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
        <div className="container py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <Link href="/about">
                <a className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.about')}
                </a>
              </Link>
              <span className="text-border">•</span>
              <Link href="/contact">
                <a className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.contact')}
                </a>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t('footer.text')}
            </p>
          </div>
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

      {/* Share Recipe Dialog */}
      <ShareRecipeDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl}
        isGenerating={isGeneratingShare}
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
