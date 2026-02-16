import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('onboarding.welcome.title', 'Welcome to Recipe Cost Calculator!'),
      description: t('onboarding.welcome.description', 'Let\'s take a quick tour to help you calculate recipe costs in seconds. This will only take 30 seconds.'),
      position: 'center',
    },
    {
      id: 'add_ingredient',
      title: t('onboarding.addIngredient.title', 'Step 1: Add an Ingredient'),
      description: t('onboarding.addIngredient.description', 'Click "Add Ingredient" to start. Each ingredient needs a name, quantity used, package cost, and package size.'),
      targetElement: '[data-onboarding="add-ingredient-button"]',
      position: 'bottom',
    },
    {
      id: 'fill_fields',
      title: t('onboarding.fillFields.title', 'Step 2: Fill in the Details'),
      description: t('onboarding.fillFields.description', 'Enter the ingredient name (e.g., "Butter"), how much you\'re using (e.g., "2 tbsp"), what you paid for the package ($3.99), and the package size (e.g., "1 lb").'),
      targetElement: '.ingredient-card',
      position: 'right',
    },
    {
      id: 'unit_conversion',
      title: t('onboarding.unitConversion.title', 'Step 3: Automatic Unit Conversion'),
      description: t('onboarding.unitConversion.description', 'Don\'t worry about matching units! We automatically convert between cups, ounces, grams, and more. Just enter what\'s on your package.'),
      targetElement: '.unit-selector',
      position: 'top',
    },
    {
      id: 'cost_calculation',
      title: t('onboarding.costCalculation.title', 'Step 4: See Your Cost'),
      description: t('onboarding.costCalculation.description', 'As you fill in the fields, we automatically calculate the cost for that ingredient. The total recipe cost appears on the right.'),
      targetElement: '.cost-summary',
      position: 'left',
    },
    {
      id: 'save_share',
      title: t('onboarding.saveShare.title', 'Step 5: Save & Share'),
      description: t('onboarding.saveShare.description', 'Save your recipe to load it later, or share it with others via a link. You can also export to CSV or Excel for your records.'),
      targetElement: '[data-onboarding="save-button"]',
      position: 'bottom',
    },
    {
      id: 'complete',
      title: t('onboarding.complete.title', 'You\'re All Set!'),
      description: t('onboarding.complete.description', 'Ready to calculate your first recipe cost? Click "Try Example" to see a sample recipe, or start adding your own ingredients.'),
      position: 'center',
    },
  ];

  const currentStepData = steps[currentStep];

  // Highlight target element
  useEffect(() => {
    if (currentStepData.targetElement) {
      // Try to find element (simplified - in production use better selector)
      const element = document.querySelector(currentStepData.targetElement) as HTMLElement;
      setHighlightedElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, currentStepData.targetElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[100]" onClick={handleSkip} />

      {/* Highlighted element spotlight */}
      {highlightedElement && (
        <div
          className="fixed z-[101] pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
          }}
        />
      )}

      {/* Tutorial card */}
      <Card
        className={`fixed z-[102] max-w-md p-6 shadow-2xl ${
          currentStepData.position === 'center'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : currentStepData.position === 'top'
            ? 'top-24 left-1/2 -translate-x-1/2'
            : currentStepData.position === 'bottom'
            ? 'bottom-24 left-1/2 -translate-x-1/2'
            : currentStepData.position === 'left'
            ? 'top-1/2 left-24 -translate-y-1/2'
            : 'top-1/2 right-24 -translate-y-1/2'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{t('onboarding.step', 'Step')} {currentStep + 1} {t('onboarding.of', 'of')} {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('onboarding.previous', 'Previous')}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="flex-1">
              {t('onboarding.next', 'Next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              {t('onboarding.getStarted', 'Get Started')}
            </Button>
          )}
        </div>

        {/* Skip button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {t('onboarding.skip', 'Skip tutorial')}
          </button>
        </div>
      </Card>
    </>
  );
}
