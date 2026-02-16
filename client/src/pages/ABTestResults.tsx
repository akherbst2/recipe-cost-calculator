import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface ABTestMetrics {
  control: {
    totalUsers: number;
    firstIngredientRate: number;
    avgTimeToFirstIngredient: number;
    recipeSaveRate: number;
    avgIngredientsPerSession: number;
  };
  treatment: {
    totalUsers: number;
    tutorialCompletionRate: number;
    tutorialSkipRate: number;
    firstIngredientRate: number;
    avgTimeToFirstIngredient: number;
    recipeSaveRate: number;
    avgIngredientsPerSession: number;
  };
}

export default function ABTestResults() {
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch A/B test metrics from Umami analytics
    // This is a placeholder - in production, you'd query Umami API or your database
    const fetchMetrics = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Placeholder data - replace with real API call
        setMetrics({
          control: {
            totalUsers: 0,
            firstIngredientRate: 0,
            avgTimeToFirstIngredient: 0,
            recipeSaveRate: 0,
            avgIngredientsPerSession: 0,
          },
          treatment: {
            totalUsers: 0,
            tutorialCompletionRate: 0,
            tutorialSkipRate: 0,
            firstIngredientRate: 0,
            avgTimeToFirstIngredient: 0,
            recipeSaveRate: 0,
            avgIngredientsPerSession: 0,
          },
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch A/B test metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">A/B Test Results: Onboarding Tutorial</h1>
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">A/B Test Results: Onboarding Tutorial</h1>
          <p className="text-destructive">Failed to load metrics</p>
        </div>
      </div>
    );
  }

  const calculateLift = (treatment: number, control: number) => {
    if (control === 0) return 0;
    return ((treatment - control) / control) * 100;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">A/B Test Results</h1>
        <p className="text-xl text-muted-foreground mb-8">Onboarding Tutorial Impact Analysis</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Control Group */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Group A: Control</h2>
            <p className="text-sm text-muted-foreground mb-6">No onboarding tutorial shown</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{metrics.control.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Ingredient Rate</p>
                <p className="text-3xl font-bold">{(metrics.control.firstIngredientRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Time to First Ingredient</p>
                <p className="text-3xl font-bold">{metrics.control.avgTimeToFirstIngredient.toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipe Save Rate</p>
                <p className="text-3xl font-bold">{(metrics.control.recipeSaveRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Ingredients Per Session</p>
                <p className="text-3xl font-bold">{metrics.control.avgIngredientsPerSession.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          {/* Treatment Group */}
          <Card className="p-6 border-primary">
            <h2 className="text-2xl font-semibold mb-4">Group B: Treatment</h2>
            <p className="text-sm text-muted-foreground mb-6">Onboarding tutorial shown</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{metrics.treatment.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tutorial Completion Rate</p>
                <p className="text-3xl font-bold">{(metrics.treatment.tutorialCompletionRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Ingredient Rate</p>
                <p className="text-3xl font-bold">{(metrics.treatment.firstIngredientRate * 100).toFixed(1)}%</p>
                <span className={`text-sm ml-2 ${calculateLift(metrics.treatment.firstIngredientRate, metrics.control.firstIngredientRate) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateLift(metrics.treatment.firstIngredientRate, metrics.control.firstIngredientRate) > 0 ? '+' : ''}
                  {calculateLift(metrics.treatment.firstIngredientRate, metrics.control.firstIngredientRate).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Time to First Ingredient</p>
                <p className="text-3xl font-bold">{metrics.treatment.avgTimeToFirstIngredient.toFixed(1)}s</p>
                <span className={`text-sm ml-2 ${calculateLift(metrics.treatment.avgTimeToFirstIngredient, metrics.control.avgTimeToFirstIngredient) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateLift(metrics.treatment.avgTimeToFirstIngredient, metrics.control.avgTimeToFirstIngredient) > 0 ? '+' : ''}
                  {calculateLift(metrics.treatment.avgTimeToFirstIngredient, metrics.control.avgTimeToFirstIngredient).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipe Save Rate</p>
                <p className="text-3xl font-bold">{(metrics.treatment.recipeSaveRate * 100).toFixed(1)}%</p>
                <span className={`text-sm ml-2 ${calculateLift(metrics.treatment.recipeSaveRate, metrics.control.recipeSaveRate) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateLift(metrics.treatment.recipeSaveRate, metrics.control.recipeSaveRate) > 0 ? '+' : ''}
                  {calculateLift(metrics.treatment.recipeSaveRate, metrics.control.recipeSaveRate).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Ingredients Per Session</p>
                <p className="text-3xl font-bold">{metrics.treatment.avgIngredientsPerSession.toFixed(1)}</p>
                <span className={`text-sm ml-2 ${calculateLift(metrics.treatment.avgIngredientsPerSession, metrics.control.avgIngredientsPerSession) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateLift(metrics.treatment.avgIngredientsPerSession, metrics.control.avgIngredientsPerSession) > 0 ? '+' : ''}
                  {calculateLift(metrics.treatment.avgIngredientsPerSession, metrics.control.avgIngredientsPerSession).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">How to View Real Data</h2>
          <div className="space-y-4 text-sm">
            <p>
              This A/B test is tracking events in your Umami analytics dashboard. To view real results:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to your Umami analytics dashboard</li>
              <li>Navigate to "Events" section</li>
              <li>Filter by events starting with "ab_onboarding_tutorial_"</li>
              <li>Compare metrics between control and treatment groups</li>
            </ol>
            <p className="mt-4">
              <strong>Key events being tracked:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>ab_test_assigned</code> - User assigned to group</li>
              <li><code>ab_onboarding_tutorial_tutorial_shown</code> - Tutorial displayed (treatment only)</li>
              <li><code>ab_onboarding_tutorial_tutorial_completed</code> - Tutorial finished (treatment only)</li>
              <li><code>ab_onboarding_tutorial_tutorial_skipped</code> - Tutorial skipped (treatment only)</li>
              <li><code>ab_onboarding_tutorial_first_ingredient_added</code> - First ingredient added (both groups)</li>
              <li><code>ab_onboarding_tutorial_recipe_saved</code> - Recipe saved (both groups)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
