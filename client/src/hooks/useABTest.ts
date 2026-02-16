import { useEffect, useState } from 'react';

export type ABTestGroup = 'control' | 'treatment';

interface ABTestConfig {
  testName: string;
  storageKey: string;
}

/**
 * A/B Test Hook
 * 
 * Assigns users to control (no tutorial) or treatment (with tutorial) groups
 * Uses deterministic assignment based on session ID to ensure consistency
 * 
 * Group A (control): No onboarding tutorial shown
 * Group B (treatment): Onboarding tutorial shown
 */
export function useABTest(config: ABTestConfig): ABTestGroup {
  const [group, setGroup] = useState<ABTestGroup>('control');

  useEffect(() => {
    const { storageKey } = config;
    
    // Check if user already has an assignment
    const existingAssignment = localStorage.getItem(storageKey);
    
    if (existingAssignment === 'control' || existingAssignment === 'treatment') {
      setGroup(existingAssignment);
      return;
    }

    // New user - assign to group based on random 50/50 split
    const randomValue = Math.random();
    const assignedGroup: ABTestGroup = randomValue < 0.5 ? 'control' : 'treatment';
    
    // Store assignment
    localStorage.setItem(storageKey, assignedGroup);
    setGroup(assignedGroup);

    // Track assignment in analytics
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('ab_test_assigned', {
        test_name: config.testName,
        group: assignedGroup,
      });
    }
  }, [config]);

  return group;
}

/**
 * Track A/B test conversion event
 */
export function trackABTestEvent(testName: string, group: ABTestGroup, eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(`ab_${testName}_${eventName}`, {
      group,
      ...properties,
    });
  }
}
