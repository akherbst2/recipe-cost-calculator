/* Design: Organic Modernism with Culinary Warmth
   Asymmetric layout, textured backgrounds, warm color palette, gentle animations */

import { Button } from '@/components/ui/button';
import CostSummary from '@/components/CostSummary';
import IngredientCard from '@/components/IngredientCard';
import { Ingredient } from '@/lib/types';
import { calculateIngredientCost, canConvert } from '@/lib/unitConversions';
import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [servings, setServings] = useState<number>(4);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);

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
              toast.error('Unit mismatch', {
                description: `Cannot convert ${updated.usedUnit} to ${updated.packageUnit}. Please use compatible units (e.g., both weight or both volume).`,
              });
              updated.calculatedCost = 0;
            } else {
              updated.calculatedCost = calculateIngredientCost(
                updated.usedQuantity,
                updated.usedUnit,
                updated.packageCost,
                updated.packageSize,
                updated.packageUnit
              );
            }
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

  // Add initial ingredient on mount
  useEffect(() => {
    if (ingredients.length === 0) {
      addIngredient();
    }
  }, []);

  return (
    <div className="min-h-screen texture-overlay">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border/50">
        <div className="container py-12 lg:py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
              Recipe Cost Calculator
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Calculate the true cost of your recipes with automatic unit conversions. 
              Perfect for home cooks, food bloggers, and small food businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Section - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">
                  Ingredients
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add all ingredients used in your recipe
                </p>
              </div>
              <Button
                onClick={addIngredient}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <div className="bg-card rounded-[1.25rem] p-12 text-center shadow-soft border border-border/50">
                <div className="max-w-sm mx-auto">
                  <div className="text-4xl mb-4">🥘</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No ingredients yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding your first ingredient to calculate recipe costs
                  </p>
                  <Button
                    onClick={addIngredient}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Ingredient
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
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-3">🍝</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Example: Pasta
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buy 1 lb pasta for $1.49, use 1/2 lb in recipe → App calculates <span className="font-semibold text-accent">$0.75</span>
              </p>
            </div>
            <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-3">🧅</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Example: Onions
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buy 6 onions for $1.69, use 1 onion → App calculates <span className="font-semibold text-accent">$0.28</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>
            Built for home cooks, food bloggers, and small food businesses. 
            Automatic unit conversions make recipe costing faster than pen and paper.
          </p>
        </div>
      </div>

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
