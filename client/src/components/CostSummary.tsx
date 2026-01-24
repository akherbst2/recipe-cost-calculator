/* Design: Organic Modernism - Prominent cost display with decorative elements
   Large readable numbers, warm gradient backgrounds, sticky positioning */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CostSummaryProps {
  totalCost: number;
  servings: number;
  batchMultiplier: number;
  onServingsChange: (servings: number) => void;
  onBatchMultiplierChange: (multiplier: number) => void;
}

export default function CostSummary({
  totalCost,
  servings,
  batchMultiplier,
  onServingsChange,
  onBatchMultiplierChange,
}: CostSummaryProps) {
  const { t } = useTranslation();
  const [animatedTotal, setAnimatedTotal] = useState(totalCost);
  const [animatedPerServing, setAnimatedPerServing] = useState(
    servings > 0 ? totalCost / servings : 0
  );

  const scaledTotalCost = totalCost * batchMultiplier;
  const totalServings = servings * batchMultiplier;
  const costPerServing = totalServings > 0 ? scaledTotalCost / totalServings : 0;

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
            {t('costSummary.totalCost')} {batchMultiplier > 1 ? t('costSummary.batchMultiplier', { batches: batchMultiplier }) : ''}
          </div>
          <div className="text-6xl font-display font-bold text-primary mb-1">
            ${(animatedTotal * batchMultiplier).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCost === 0 ? (
              <span className="italic">{t('costSummary.fillAllFields')}</span>
            ) : batchMultiplier > 1 ? (
              `${totalServings} ${t('dialogs.load.servings')} (${batchMultiplier} ${t('costSummary.batchesToMake').toLowerCase()})`
            ) : (
              t('costSummary.totalCostDesc')
            )}
          </div>
        </div>
      </div>

      {/* Servings Input */}
      <div className="bg-card rounded-[1.25rem] p-6 shadow-soft border border-border/50 space-y-4">
        <div>
          <Label htmlFor="servings" className="text-sm font-semibold text-foreground/80 mb-3 block">
            {t('costSummary.servingsPerRecipe')}
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
        <div>
          <Label htmlFor="batch-multiplier" className="text-sm font-semibold text-foreground/80 mb-3 block">
            {t('costSummary.batchesToMake')}
          </Label>
          <Input
            id="batch-multiplier"
            type="number"
            min="1"
            step="1"
            value={batchMultiplier || ''}
            onChange={(e) => onBatchMultiplierChange(parseInt(e.target.value) || 1)}
            placeholder="1"
            className="text-lg font-medium"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('costSummary.batchesDesc')}
          </p>
        </div>
      </div>

      {/* Cost Per Serving - Second Most Prominent */}
      <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-primary/10 rounded-[1.5rem] p-8 shadow-soft-lg border border-accent/20">
        <div className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">
          {t('costSummary.costPerServing')}
        </div>
        <div className="text-5xl font-display font-bold text-accent mb-1">
          ${animatedPerServing.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">
          {costPerServing === 0 ? (
            <span className="italic">{t('costSummary.fillAllFields')}</span>
          ) : totalServings > 0 ? (
            t('costSummary.costPerServingCalc', { cost: scaledTotalCost.toFixed(2), servings: totalServings })
          ) : (
            'Enter servings above'
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          {t('tips.tip')}
        </p>
      </div>
    </div>
  );
}
