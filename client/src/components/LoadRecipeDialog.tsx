/**
 * Design: Organic Modernism with Culinary Warmth
 * - Warm earth tones and soft shadows
 * - Playfair Display for emphasis, Outfit for headings, Inter for body
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedRecipe } from '@/lib/types';
import { Calendar, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: SavedRecipe[];
  onLoad: (recipe: SavedRecipe) => void;
  onDelete: (id: string) => void;
  onDuplicate: (recipe: SavedRecipe) => void;
}

export default function LoadRecipeDialog({
  open,
  onOpenChange,
  recipes,
  onLoad,
  onDelete,
  onDuplicate,
}: LoadRecipeDialogProps) {
  const { t, i18n } = useTranslation();
  
  const handleLoad = (recipe: SavedRecipe) => {
    onLoad(recipe);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateTotalCost = (recipe: SavedRecipe) => {
    return recipe.ingredients.reduce((sum, ing) => sum + ing.calculatedCost, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t('dialogs.load.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.load.description')}
          </DialogDescription>
        </DialogHeader>

        {recipes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>{t('dialogs.load.noRecipes')}</p>
            <p className="text-sm mt-2">
              {t('dialogs.load.noRecipesHint')}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {recipes.map((recipe) => {
                const totalCost = calculateTotalCost(recipe);
                return (
                  <div
                    key={recipe.id}
                    className="group relative bg-accent/10 hover:bg-accent/20 rounded-lg p-4 border border-accent/20 transition-all cursor-pointer"
                    onClick={() => handleLoad(recipe)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-2 truncate">
                          {recipe.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>${(totalCost * recipe.batchMultiplier).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(recipe.savedAt)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {recipe.ingredients.length} {recipe.ingredients.length === 1 ? t('dialogs.load.ingredient') : t('dialogs.load.ingredients')} • {recipe.servings * recipe.batchMultiplier} {recipe.servings * recipe.batchMultiplier === 1 ? t('dialogs.load.serving') : t('dialogs.load.servings')}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(recipe);
                          }}
                          aria-label="Duplicate recipe"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(recipe.id);
                          }}
                          aria-label="Delete recipe"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
