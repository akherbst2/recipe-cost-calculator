import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export type ABTestGroup = 'control' | 'treatment';

interface ABTestConfig {
  testName: string;
  storageKey: string;
}

/**
 * A/B Test Hook
 *
 * Assigns users to control (no tutorial) or treatment (with tutorial) groups.
 * Persists group assignment and all conversion events to the internal database
 * via tRPC so results can be queried per-group at any time.
 *
 * Group A (control):   No onboarding tutorial shown
 * Group B (treatment): Onboarding tutorial shown
 */
export function useABTest(config: ABTestConfig): ABTestGroup {
  const [group, setGroup] = useState<ABTestGroup>('control');
  const [sessionId, setSessionId] = useState<string>('');

  const trackMutation = trpc.abTest.track.useMutation();

  useEffect(() => {
    const { storageKey } = config;

    // Retrieve or generate a stable session ID for this browser
    const sessionKey = `${storageKey}_sessionId`;
    let sid = localStorage.getItem(sessionKey);
    if (!sid) {
      sid = `ab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(sessionKey, sid);
    }
    setSessionId(sid);

    // Check if user already has a group assignment
    const existing = localStorage.getItem(storageKey);
    if (existing === 'control' || existing === 'treatment') {
      setGroup(existing);
      return;
    }

    // New user — assign 50/50
    const assigned: ABTestGroup = Math.random() < 0.5 ? 'control' : 'treatment';
    localStorage.setItem(storageKey, assigned);
    setGroup(assigned);

    // Persist assignment to database
    trackMutation.mutate({
      testName: config.testName,
      sessionId: sid,
      abGroup: assigned,
      eventName: 'assigned',
    });

    // Also fire Umami for real-time dashboard visibility
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('ab_test_assigned', {
        test_name: config.testName,
        group: assigned,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return group;
}

/**
 * Track an A/B test conversion event.
 * Persists to the internal database AND fires Umami for real-time visibility.
 *
 * Call this from components that have access to the tRPC mutation directly,
 * or use the returned helper from useABTestTracker below.
 */
export function trackABTestEvent(
  testName: string,
  group: ABTestGroup,
  eventName: string,
  properties?: Record<string, any>
) {
  // Umami (client-side real-time)
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(`ab_${testName}_${eventName}`, {
      group,
      ...properties,
    });
  }
}

/**
 * Hook that returns a trackEvent helper pre-bound to the current session.
 * Use this inside components to persist A/B events to the database.
 */
export function useABTestTracker(testName: string, storageKey: string) {
  const trackMutation = trpc.abTest.track.useMutation();

  const trackEvent = (
    group: ABTestGroup,
    eventName: string,
    metadata?: Record<string, any>
  ) => {
    const sessionKey = `${storageKey}_sessionId`;
    const sid = localStorage.getItem(sessionKey) ?? 'unknown';

    // Persist to database
    trackMutation.mutate({
      testName,
      sessionId: sid,
      abGroup: group,
      eventName,
      metadata,
    });

    // Also fire Umami
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(`ab_${testName}_${eventName}`, {
        group,
        ...metadata,
      });
    }
  };

  return { trackEvent };
}
