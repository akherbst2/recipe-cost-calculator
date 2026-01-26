import { Button } from '@/components/ui/button';
import CostSummary from '@/components/CostSummary';
import IngredientCard from '@/components/IngredientCard';
import { trpc } from '@/lib/trpc';
import { Ingredient } from '@/lib/types';
import { Home, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'wouter';

export default function SharedRecipe() {
  const { shareId } = useParams<{ shareId: string }>();
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [servings, setServings] = useState<number>(4);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [recipeName, setRecipeName] = useState<string>('');

  const { data, isLoading, error } = trpc.sharing.get.useQuery(
    { shareId: shareId || '' },
    { enabled: !!shareId }
  );

  useEffect(() => {
    if (data) {
      setIngredients(data.ingredients);
      setServings(data.servings);
      setBatchMultiplier(data.batchMultiplier);
      setRecipeName(data.name);
    }
  }, [data]);

  const totalCost = ingredients.reduce((sum, ing) => sum + ing.calculatedCost, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading') || 'Loading recipe...'}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('shared.notFound.title') || 'Recipe Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('shared.notFound.description') || 'This recipe link is invalid or has been removed.'}
          </p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              {t('shared.notFound.backHome') || 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border/50">
        <div className="container py-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
              {recipeName}
            </h1>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                {t('shared.createOwn') || 'Create Your Own'}
              </Button>
            </Link>
          </div>
          <p className="text-lg text-muted-foreground">
            {t('shared.subtitle') || 'Shared recipe - view only'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-1">
                {t('ingredients.title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {ingredients.length} {ingredients.length === 1 ? t('dialogs.load.ingredient') : t('dialogs.load.ingredients')}
              </p>
            </div>

            <div className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  onUpdate={() => {}} // Read-only
                  onDelete={() => {}} // Read-only
                  onDuplicate={() => {}} // Read-only
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="lg:col-span-1">
            <CostSummary
              totalCost={totalCost}
              servings={servings}
              batchMultiplier={batchMultiplier}
              onServingsChange={() => {}} // Read-only
              onBatchMultiplierChange={() => {}} // Read-only
            />
          </div>
        </div>
      </div>
    </div>
  );
}
