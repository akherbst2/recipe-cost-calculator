import { trpc } from '@/lib/trpc';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for logging events to the backend
 * Automatically generates and maintains a session ID for anonymous users
 */
export function useEventLogger() {
  const sessionIdRef = useRef<string | null>(null);
  const logMutation = trpc.events.log.useMutation();

  // Generate or retrieve session ID
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('eventSessionId');
    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('eventSessionId', newSessionId);
      sessionIdRef.current = newSessionId;
    }
  }, []);

  const logEvent = useCallback(
    (eventType: string, eventData: Record<string, any>) => {
      if (!sessionIdRef.current) return;

      // Fire and forget - don't block UI
      logMutation.mutate({
        eventType,
        sessionId: sessionIdRef.current,
        eventData,
      });
    },
    [logMutation]
  );

  return { logEvent };
}
