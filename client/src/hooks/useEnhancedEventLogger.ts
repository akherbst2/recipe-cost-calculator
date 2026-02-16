import { trpc } from '@/lib/trpc';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced event logger with advanced tracking capabilities
 * Includes field-level tracking, journey tracking, feature discovery, and frustration signals
 */
export function useEnhancedEventLogger() {
  const { i18n } = useTranslation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const journeyStepsRef = useRef<string[]>([]);
  const discoveredFeaturesRef = useRef<Set<string>>(new Set());
  const clickCountsRef = useRef<Map<string, { count: number; firstClick: number }>>(new Map());
  const logMutation = trpc.events.log.useMutation();

  // Detect device type and viewport
  const getDeviceInfo = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (width < 768) deviceType = 'mobile';
    else if (width < 1024) deviceType = 'tablet';
    else deviceType = 'desktop';

    return {
      deviceType,
      viewportWidth: width,
      viewportHeight: height,
      inputMethod: isTouchDevice ? 'touch' : 'mouse',
      orientation: width > height ? 'landscape' : 'portrait',
    };
  };

  // Generate or retrieve session ID
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('eventSessionId');
    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('eventSessionId', newSessionId);
      sessionIdRef.current = newSessionId;
      sessionStartTimeRef.current = Date.now();
    }
  }, []);

  const baseLog = useCallback(
    (eventType: string, eventData: Record<string, any>) => {
      if (!sessionIdRef.current) return;

      logMutation.mutate({
        eventType,
        sessionId: sessionIdRef.current,
        eventData: {
          ...eventData,
          language: i18n.language,
          sessionAge: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
        },
      });
    },
    [logMutation, i18n.language]
  );

  // 1. Field-level interaction tracking
  const logFieldFocus = useCallback(
    (fieldName: string, ingredientId?: string) => {
      baseLog('field_focus', {
        fieldName,
        ingredientId,
        timestamp: new Date().toISOString(),
      });
    },
    [baseLog]
  );

  const logFieldBlur = useCallback(
    (fieldName: string, hasValue: boolean, ingredientId?: string) => {
      baseLog('field_blur', {
        fieldName,
        hasValue,
        ingredientId,
        timestamp: new Date().toISOString(),
      });
    },
    [baseLog]
  );

  const logFieldComplete = useCallback(
    (fieldName: string, value: any, ingredientId?: string) => {
      baseLog('field_complete', {
        fieldName,
        valueType: typeof value,
        ingredientId,
        timestamp: new Date().toISOString(),
      });
    },
    [baseLog]
  );

  const logFieldError = useCallback(
    (fieldName: string, errorType: string, errorMessage: string, ingredientId?: string) => {
      baseLog('field_error', {
        fieldName,
        errorType,
        errorMessage,
        ingredientId,
        timestamp: new Date().toISOString(),
      });
    },
    [baseLog]
  );

  // 2. User journey path tracking
  const logJourneyStep = useCallback(
    (step: string) => {
      const previousStep = journeyStepsRef.current[journeyStepsRef.current.length - 1] || 'start';
      const timeFromPreviousStep = journeyStepsRef.current.length > 0 
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : 0;

      journeyStepsRef.current.push(step);

      baseLog('journey_step', {
        step,
        previousStep,
        timeFromPreviousStep,
        sessionDuration: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
        journeyPath: journeyStepsRef.current.join(' → '),
      });
    },
    [baseLog]
  );

  const logJourneyComplete = useCallback(() => {
    baseLog('journey_complete', {
      totalSteps: journeyStepsRef.current.length,
      journeyPath: journeyStepsRef.current.join(' → '),
      sessionDuration: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
    });
  }, [baseLog]);

  const logJourneyAbandon = useCallback(
    (lastAction: string) => {
      baseLog('journey_abandon', {
        lastAction,
        totalSteps: journeyStepsRef.current.length,
        journeyPath: journeyStepsRef.current.join(' → '),
        sessionDuration: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
      });
    },
    [baseLog]
  );

  // 3. Feature discovery & usage tracking
  const logFeatureDiscovered = useCallback(
    (featureName: string, discoveryMethod: string) => {
      if (discoveredFeaturesRef.current.has(featureName)) return;

      discoveredFeaturesRef.current.add(featureName);

      baseLog('feature_discovered', {
        featureName,
        discoveryMethod,
        sessionAge: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
      });
    },
    [baseLog]
  );

  const logFeatureUsed = useCallback(
    (featureName: string, featureData?: Record<string, any>) => {
      baseLog('feature_used', {
        featureName,
        ...featureData,
        wasDiscovered: discoveredFeaturesRef.current.has(featureName),
      });
    },
    [baseLog]
  );

  const logFeatureAbandoned = useCallback(
    (featureName: string, abandonReason?: string) => {
      baseLog('feature_abandoned', {
        featureName,
        abandonReason,
      });
    },
    [baseLog]
  );

  // 4. Unit conversion analytics
  const logUnitConversionAttempted = useCallback(
    (usedUnit: string, packageUnit: string, ingredientType?: string) => {
      baseLog('unit_conversion_attempted', {
        usedUnit,
        packageUnit,
        ingredientType,
        timestamp: new Date().toISOString(),
      });
    },
    [baseLog]
  );

  const logUnitConversionSuccess = useCallback(
    (usedUnit: string, packageUnit: string, conversionRatio?: number) => {
      baseLog('unit_conversion_success', {
        usedUnit,
        packageUnit,
        conversionRatio,
      });
    },
    [baseLog]
  );

  const logUnitConversionError = useCallback(
    (usedUnit: string, packageUnit: string, errorMessage: string) => {
      baseLog('unit_conversion_error', {
        usedUnit,
        packageUnit,
        errorMessage,
      });
    },
    [baseLog]
  );

  // 5. Time-on-task & hesitation tracking
  const logTimeToFirstIngredient = useCallback(
    (timeInSeconds: number) => {
      baseLog('time_to_first_ingredient', {
        timeInSeconds,
      });
    },
    [baseLog]
  );

  const logTimeToFirstCostCalculation = useCallback(
    (timeInSeconds: number) => {
      baseLog('time_to_cost_calculation', {
        timeInSeconds,
      });
    },
    [baseLog]
  );

  const logFieldHesitation = useCallback(
    (fieldName: string, hoverDuration: number, didClick: boolean) => {
      if (hoverDuration < 3) return; // Only log if hover >3 seconds

      baseLog('field_hesitation', {
        fieldName,
        hoverDuration,
        didClick,
        sessionAge: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
      });
    },
    [baseLog]
  );

  // 6. Error & frustration signals
  const logRapidClicks = useCallback(
    (buttonName: string, clickCount: number, timeWindow: number) => {
      if (clickCount < 3) return; // Only log if >3 clicks

      baseLog('rapid_clicks', {
        buttonName,
        clickCount,
        timeWindow,
        possibleFrustration: clickCount >= 4,
      });
    },
    [baseLog]
  );

  const logFormReset = useCallback(() => {
    baseLog('form_reset', {
      sessionAge: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
    });
  }, [baseLog]);

  const logBackButtonClick = useCallback(() => {
    baseLog('back_button_click', {
      sessionAge: Math.floor((Date.now() - sessionStartTimeRef.current) / 1000),
    });
  }, [baseLog]);

  // 7. Device-specific behavior (logged on session start)
  const logDeviceInfo = useCallback(() => {
    const deviceInfo = getDeviceInfo();
    baseLog('session_start', deviceInfo);
  }, [baseLog]);

  // Track button clicks for rapid click detection
  const trackButtonClick = useCallback(
    (buttonName: string) => {
      const now = Date.now();
      const existing = clickCountsRef.current.get(buttonName);

      if (existing && now - existing.firstClick < 2000) {
        // Within 2 second window
        const newCount = existing.count + 1;
        clickCountsRef.current.set(buttonName, { count: newCount, firstClick: existing.firstClick });

        if (newCount >= 3) {
          logRapidClicks(buttonName, newCount, (now - existing.firstClick) / 1000);
        }
      } else {
        // Reset window
        clickCountsRef.current.set(buttonName, { count: 1, firstClick: now });
      }
    },
    [logRapidClicks]
  );

  // Legacy compatibility - basic event logging
  const logEvent = useCallback(
    (eventType: string, eventData: Record<string, any>) => {
      baseLog(eventType, eventData);
    },
    [baseLog]
  );

  return {
    // Legacy
    logEvent,
    
    // Field-level tracking
    logFieldFocus,
    logFieldBlur,
    logFieldComplete,
    logFieldError,
    
    // Journey tracking
    logJourneyStep,
    logJourneyComplete,
    logJourneyAbandon,
    
    // Feature discovery
    logFeatureDiscovered,
    logFeatureUsed,
    logFeatureAbandoned,
    
    // Unit conversion
    logUnitConversionAttempted,
    logUnitConversionSuccess,
    logUnitConversionError,
    
    // Time tracking
    logTimeToFirstIngredient,
    logTimeToFirstCostCalculation,
    logFieldHesitation,
    
    // Frustration signals
    logRapidClicks,
    logFormReset,
    logBackButtonClick,
    trackButtonClick,
    
    // Device info
    logDeviceInfo,
  };
}
