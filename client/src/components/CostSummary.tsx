/* Design: Organic Modernism - Prominent cost display with decorative elements
   Large readable numbers, warm gradient backgrounds, sticky positioning */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

interface CostSummaryProps {
  totalCost: number;
  servings: number;
  onServingsChange: (servings: number) => void;
}

export default function CostSummary({
  totalCost,
  servings,
  onServingsChange,
}: CostSummaryProps) {
  const [animatedTotal, setAnimatedTotal] = useState(totalCost);
  const [animatedPerServing, setAnimatedPerServing] = useState(
    servings > 0 ? totalCost / servings : 0
  );

  const costPerServing = servings > 0 ? totalCost / servings : 0;

  // Animate number changes
  useEffect(() => {
    const duration = 400;
    const steps = 20;
    const stepDuration = duration / steps;
    const totalDiff = totalCost - animatedTotal;
    const totalStep = totalDiff / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedTotal(totalCost);
        clearInterval(interval);
      } else {
        setAnimatedTotal((prev) => prev + totalStep);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalCost]);

  useEffect(() => {
    const duration = 400;
    const steps = 20;
    const stepDuration = duration / steps;
    const perServingDiff = costPerServing - animatedPerServing;
    const perServingStep = perServingDiff / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedPerServing(costPerServing);
        clearInterval(interval);
      } else {
        setAnimatedPerServing((prev) => prev + perServingStep);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [costPerServing]);

  return (
    <div className="lg:sticky lg:top-6 space-y-4">
      {/* Total Cost - Most Prominent */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 rounded-[1.5rem] p-8 shadow-soft-lg border border-primary/20 overflow-hidden">
        <div
          className="absolute -right-12 -bottom-12 w-48 h-48 opacity-30"
          style={{
            backgroundImage: 'url(/images/cost-badge-decoration.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="relative z-10">
          <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            Total Recipe Cost
          </div>
          <div className="text-6xl font-display font-bold text-primary mb-1">
            ${animatedTotal.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Sum of all ingredients
          </div>
        </div>
      </div>

      {/* Servings Input */}
      <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50">
        <Label htmlFor="servings" className="text-sm font-semibold text-foreground/80 mb-3 block">
          Number of Servings
        </Label>
        <Input
          id="servings"
          type="number"
          min="1"
          step="1"
          value={servings || ''}
          onChange={(e) => onServingsChange(parseInt(e.target.value) || 1)}
          placeholder="1"
          className="text-lg font-medium"
        />
      </div>

      {/* Cost Per Serving - Second Most Prominent */}
      <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-primary/10 rounded-[1.5rem] p-8 shadow-soft-lg border border-accent/20">
        <div className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">
          Cost Per Serving
        </div>
        <div className="text-5xl font-display font-bold text-accent mb-1">
          ${animatedPerServing.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">
          {servings > 0 ? `${totalCost.toFixed(2)} ÷ ${servings} servings` : 'Enter servings above'}
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          💡 <span className="font-semibold">Tip:</span> Add all your ingredients above to see automatic cost calculations with unit conversions.
        </p>
      </div>
    </div>
  );
}
